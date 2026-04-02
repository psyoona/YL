class AlbumPage {
	constructor() {
		// DOM 요소
		this.$sidebar = $('#sidebar');
		this.$sidebarOverlay = $('#sidebarOverlay');
		this.$albumList = $('#albumList');
		this.$photoGrid = $('#photoGrid');
		this.$emptyState = $('#emptyState');
		this.$loadingSpinner = $('#loadingSpinner');
		this.$currentAlbumTitle = $('#currentAlbumTitle');
		this.$photoCount = $('#photoCount');
		this.$photoViewer = $('#photoViewer');
		this.$viewerImage = $('#viewerImage');
		this.$viewerTitle = $('#viewerTitle');
		this.$viewerCounter = $('#viewerCounter');
		this.$galleryContainer = $('#galleryContainer');
		this.$topBarActions = $('#topBarActions');

		// 상태
		this.currentAlbum = '';
		this.currentAlbumDisplayName = '';
		this.currentPhotos = [];
		this.currentPhotoIndex = 0;
		this.albums = [];

		// 무한 스크롤
		this.PAGE_SIZE = 12;
		this.loadedCount = 0;
		this.isLoadingMore = false;

		// 삭제 모드
		this.deleteMode = false;
		this.pendingDeletePhoto = null;
		this.pendingDeleteAlbum = null;

		// 터치
		this.touchStartX = 0;

		this.initialize();
	}

	initialize() {
		this.bindEvents();
		this.loadAlbumList();
	}

	// ============================================
	// 이벤트 바인딩
	// ============================================

	bindEvents() {
		// 사이드바
		$('#menuToggle').on('click', () => this.openSidebar());
		$('#sidebarClose').on('click', () => this.closeSidebar());
		this.$sidebarOverlay.on('click', () => this.closeSidebar());

		// 업로드/삭제
		$('#btnUpload').on('click', () => this.triggerUpload());
		$('#fileInput').on('change', (e) => this.uploadFiles(e.target.files));
		$('#btnDeleteMode').on('click', () => this.toggleDeleteMode());

		// 사진 삭제 모달
		$('#btnDeleteCancel').on('click', () => this.closeDeleteConfirm());
		$('#btnDeleteConfirm').on('click', () => this.confirmDeletePhoto());

		// 앨범 추가
		$('#btnAddAlbum').on('click', (e) => this.showCreateAlbumModal(e));
		$('#btnCreateAlbumCancel').on('click', () => $('#createAlbumModal').fadeOut(200));
		$('#btnCreateAlbumConfirm').on('click', () => this.createAlbum());
		$('#newAlbumName').on('keydown', (e) => { if (e.keyCode === 13) this.createAlbum(); });

		// 앨범 삭제 모달
		$('#btnDeleteAlbumCancel').on('click', () => { $('#deleteAlbumModal').fadeOut(200); this.pendingDeleteAlbum = null; });
		$('#btnDeleteAlbumConfirm').on('click', () => this.confirmDeleteAlbum());

		// 뷰어
		$('#viewerClose').on('click', () => this.closeViewer());
		$('#viewerPrev').on('click', () => this.navigateViewer(-1));
		$('#viewerNext').on('click', () => this.navigateViewer(1));
		this.$photoViewer.on('click', (e) => {
			if ($(e.target).is('.viewer-body') || $(e.target).is('.viewer-image-container')) {
				this.closeViewer();
			}
		});

		// 키보드
		$(document).on('keydown', (e) => this.handleKeydown(e));

		// 터치 스와이프
		this.$photoViewer.on('touchstart', (e) => { this.touchStartX = e.originalEvent.changedTouches[0].screenX; });
		this.$photoViewer.on('touchend', (e) => {
			const diff = this.touchStartX - e.originalEvent.changedTouches[0].screenX;
			if (Math.abs(diff) > 50) {
				this.navigateViewer(diff > 0 ? 1 : -1);
			}
		});

		// 무한 스크롤
		this.$galleryContainer.on('scroll', () => {
			if (this.$galleryContainer[0].scrollTop + this.$galleryContainer[0].clientHeight >= this.$galleryContainer[0].scrollHeight - 300) {
				this.loadNextBatch();
			}
		});
		$(window).on('scroll', () => {
			if ($(window).scrollTop() + $(window).height() >= $(document).height() - 300) {
				this.loadNextBatch();
			}
		});

		// 로그아웃
		$('#btnLogout').on('click', (e) => { e.preventDefault(); $('#logoutConfirmModal').fadeIn(200); });
		$('#btnLogoutCancel').on('click', () => $('#logoutConfirmModal').fadeOut(200));
		$('#btnLogoutConfirm').on('click', () => { window.location.href = '/Album/Logout'; });
		$('#logoutConfirmModal').on('click', (e) => { if (e.target === e.currentTarget) $('#logoutConfirmModal').fadeOut(200); });
	}

	// ============================================
	// 사이드바
	// ============================================

	openSidebar() {
		this.$sidebar.addClass('open');
		this.$sidebarOverlay.addClass('active');
		$('body').css('overflow', 'hidden');
	}

	closeSidebar() {
		this.$sidebar.removeClass('open');
		this.$sidebarOverlay.removeClass('active');
		$('body').css('overflow', '');
	}

	// ============================================
	// 앨범 목록
	// ============================================

	loadAlbumList() {
		webServer.getData(
			'/Album/GetAlbumList',
			null,
			(response) => {
				if (response.albums && response.albums.length > 0) {
					this.albums = response.albums;
					this.renderAlbumList();
				}
			}
		);
	}

	renderAlbumList() {
		this.$albumList.empty();

		this.albums.forEach((album) => {
			const $li = $('<li>');
			const $a = $('<a>').attr('data-album', album.albumName);

			let html = '<i class="fas fa-folder"></i>' +
				'<span class="album-name">' + stringUtility.escapeHtml(album.displayName) + '</span>';

			if (typeof isSystemMaster !== 'undefined' && isSystemMaster) {
				html += '<span class="album-delete-btn" data-album="' + stringUtility.escapeHtml(album.albumName) + '" title="앨범 삭제">' +
					'<i class="fas fa-times"></i></span>';
			}

			$a.html(html);

			$a.on('click', (e) => {
				if ($(e.target).closest('.album-delete-btn').length) {
					e.stopPropagation();
					this.showDeleteAlbumConfirm(album.albumName, album.displayName);
					return;
				}
				this.selectAlbum(album.albumName, album.displayName);
			});

			$li.append($a);
			this.$albumList.append($li);
		});
	}

	// ============================================
	// 앨범 선택
	// ============================================

	selectAlbum(albumName, displayName) {
		if (this.currentAlbum === albumName) {
			this.closeSidebar();
			return;
		}

		this.currentAlbum = albumName;
		this.currentAlbumDisplayName = displayName;
		this.exitDeleteMode();

		this.$albumList.find('a').removeClass('active');
		this.$albumList.find('a[data-album="' + albumName + '"]').addClass('active');

		this.$currentAlbumTitle.text(displayName);
		this.$topBarActions.show();
		this.closeSidebar();
		this.loadPhotos(albumName);
	}

	// ============================================
	// 사진 로드
	// ============================================

	loadPhotos(albumName) {
		this.$emptyState.hide();
		this.$photoGrid.hide().empty();
		this.$loadingSpinner.show();
		this.$photoCount.text('');
		this.loadedCount = 0;

		webServer.getData(
			'/Album/GetPhotoList',
			{ albumName: albumName },
			(response) => {
				this.$loadingSpinner.hide();

				if (response.photos && response.photos.length > 0) {
					this.currentPhotos = response.photos;
					this.$photoCount.text(response.photos.length + '장');
					this.$photoGrid.show();
					this.loadNextBatch();
				} else {
					this.$emptyState.find('h3').text('사진이 없습니다');
					this.$emptyState.find('p').html('업로드 버튼을 눌러<br>사진을 추가해보세요');
					this.$emptyState.show();
					this.$photoCount.text('0장');
					this.currentPhotos = [];
				}
			}
		);
	}

	// ============================================
	// 배치 로딩 (무한 스크롤)
	// ============================================

	loadNextBatch() {
		if (this.isLoadingMore || this.loadedCount >= this.currentPhotos.length) return;

		this.isLoadingMore = true;
		const end = Math.min(this.loadedCount + this.PAGE_SIZE, this.currentPhotos.length);

		for (let i = this.loadedCount; i < end; i++) {
			this.appendPhotoCard(this.currentAlbum, this.currentPhotos[i], i);
		}

		this.loadedCount = end;
		this.isLoadingMore = false;
	}

	appendPhotoCard(albumName, photo, index) {
		const thumbUrl = '/Album/GetThumbnail?albumName=' + encodeURIComponent(albumName) + '&fileName=' + encodeURIComponent(photo.fileName);

		const $card = $('<div>').addClass('photo-card').attr('data-index', index);

		if (photo.width > 0 && photo.height > 0) {
			$card.css('aspect-ratio', photo.width + ' / ' + photo.height);
		}

		const $img = $('<img>')
			.attr('loading', 'lazy')
			.attr('alt', photo.fileName)
			.attr('src', thumbUrl);

		const $overlay = $('<div>').addClass('photo-overlay');
		const $name = $('<div>').addClass('photo-name').text(photo.fileName);
		$overlay.append($name);

		const $deleteIcon = $('<div>').addClass('photo-delete-icon').html('<i class="fas fa-times-circle"></i>');

		$card.append($img).append($overlay).append($deleteIcon);

		$card.on('click', () => {
			if (this.deleteMode) {
				this.showDeleteConfirm(photo, index);
			} else {
				this.openViewer(index);
			}
		});

		this.$photoGrid.append($card);
	}

	// ============================================
	// 업로드
	// ============================================

	triggerUpload() {
		if (!this.currentAlbum) return;
		$('#fileInput').click();
	}

	uploadFiles(files) {
		if (!files || files.length === 0) return;

		const formData = new FormData();
		formData.append('albumName', this.currentAlbum);

		for (let i = 0; i < files.length; i++) {
			formData.append('files', files[i]);
		}

		webServer.uploadFiles(
			'/Album/UploadPhotos',
			formData,
			(response) => {
				$('#fileInput').val('');

				if (response.success && response.photos) {
					this.loadPhotos(this.currentAlbum);
				} else {
					alert(response.error || '업로드에 실패했습니다.');
				}
			}
		);
	}

	// ============================================
	// 사진 삭제
	// ============================================

	toggleDeleteMode() {
		if (this.deleteMode) {
			this.exitDeleteMode();
		} else {
			this.enterDeleteMode();
		}
	}

	enterDeleteMode() {
		this.deleteMode = true;
		$('#btnDeleteMode').addClass('active');
		this.$photoGrid.addClass('delete-mode');
	}

	exitDeleteMode() {
		this.deleteMode = false;
		$('#btnDeleteMode').removeClass('active');
		this.$photoGrid.removeClass('delete-mode');
	}

	showDeleteConfirm(photo, index) {
		this.pendingDeletePhoto = { photo: photo, index: index };
		$('#deleteConfirmModal').fadeIn(200);
	}

	closeDeleteConfirm() {
		$('#deleteConfirmModal').fadeOut(200);
		this.pendingDeletePhoto = null;
	}

	confirmDeletePhoto() {
		if (!this.pendingDeletePhoto) return;

		const photo = this.pendingDeletePhoto.photo;
		const index = this.pendingDeletePhoto.index;

		$('#deleteConfirmModal').fadeOut(200);

		webServer.getData(
			'/Album/DeletePhoto',
			{
				albumName: this.currentAlbum,
				fileName: photo.fileName,
				photoId: photo.photoId
			},
			(response) => {
				if (response.success) {
					this.currentPhotos.splice(index, 1);
					this.$photoCount.text(this.currentPhotos.length + '장');

					this.$photoGrid.empty();
					this.loadedCount = 0;

					const batchEnd = Math.min(this.currentPhotos.length, this.PAGE_SIZE * 3);

					for (let i = 0; i < batchEnd; i++) {
						this.appendPhotoCard(this.currentAlbum, this.currentPhotos[i], i);
					}

					this.loadedCount = batchEnd;

					if (this.currentPhotos.length === 0) {
						this.$photoGrid.hide();
						this.$emptyState.find('h3').text('사진이 없습니다');
						this.$emptyState.find('p').html('업로드 버튼을 눌러<br>사진을 추가해보세요');
						this.$emptyState.show();
					}
				} else {
					alert(response.error || '삭제에 실패했습니다.');
				}
			}
		);

		this.pendingDeletePhoto = null;
	}

	// ============================================
	// 앨범 추가/삭제 (시스템 마스터)
	// ============================================

	showCreateAlbumModal(e) {
		e.stopPropagation();
		$('#newAlbumName').val('');
		$('#newAlbumDisplayName').val('');
		$('#createAlbumModal').fadeIn(200);
		setTimeout(() => { $('#newAlbumName').focus(); }, 250);
	}

	createAlbum() {
		const albumName = $('#newAlbumName').val().trim();
		const displayName = $('#newAlbumDisplayName').val().trim();

		if (!albumName) {
			alert('앨범 폴더명을 입력해주세요.');
			return;
		}

		if (!displayName) {
			alert('앨범 표시명을 입력해주세요.');
			return;
		}

		webServer.getData(
			'/Album/CreateAlbum',
			{ albumName: albumName, displayName: displayName },
			(response) => {
				$('#createAlbumModal').fadeOut(200);

				if (response.success) {
					this.loadAlbumList();
				} else {
					alert(response.error || '앨범 생성에 실패했습니다.');
				}
			}
		);
	}

	showDeleteAlbumConfirm(albumName, displayName) {
		this.pendingDeleteAlbum = albumName;
		$('#deleteAlbumName').text(displayName || albumName);
		$('#deleteAlbumModal').fadeIn(200);
	}

	confirmDeleteAlbum() {
		if (!this.pendingDeleteAlbum) return;

		const albumName = this.pendingDeleteAlbum;
		$('#deleteAlbumModal').fadeOut(200);

		webServer.getData(
			'/Album/DeleteAlbum',
			{ albumName: albumName },
			(response) => {
				if (response.success) {
					if (this.currentAlbum === albumName) {
						this.currentAlbum = '';
						this.currentPhotos = [];
						this.$photoGrid.hide().empty();
						this.$emptyState.find('h3').text('앨범을 선택해주세요');
						this.$emptyState.find('p').html('좌측 메뉴에서 앨범을 선택하면<br>사진들이 여기에 표시됩니다');
						this.$emptyState.show();
						this.$currentAlbumTitle.text('앨범을 선택해주세요');
						this.$topBarActions.hide();
						this.$photoCount.text('');
					}
					this.loadAlbumList();
				} else {
					alert(response.error || '앨범 삭제에 실패했습니다.');
				}
			}
		);

		this.pendingDeleteAlbum = null;
	}

	// ============================================
	// 사진 뷰어
	// ============================================

	openViewer(index) {
		this.currentPhotoIndex = index;
		this.updateViewer();
		this.$photoViewer.fadeIn(200);
		$('body').css('overflow', 'hidden');
	}

	closeViewer() {
		this.$photoViewer.fadeOut(200);
		$('body').css('overflow', '');
	}

	updateViewer() {
		const photo = this.currentPhotos[this.currentPhotoIndex];
		const imageUrl = '/Album/GetPhoto?albumName=' + encodeURIComponent(this.currentAlbum) + '&fileName=' + encodeURIComponent(photo.fileName);

		this.$viewerImage.attr('src', imageUrl);
		this.$viewerTitle.text(photo.fileName);
		this.$viewerCounter.text((this.currentPhotoIndex + 1) + ' / ' + this.currentPhotos.length);
	}

	navigateViewer(direction) {
		this.currentPhotoIndex += direction;

		if (this.currentPhotoIndex < 0) {
			this.currentPhotoIndex = this.currentPhotos.length - 1;
		} else if (this.currentPhotoIndex >= this.currentPhotos.length) {
			this.currentPhotoIndex = 0;
		}

		this.updateViewer();
	}

	// ============================================
	// 키보드
	// ============================================

	handleKeydown(e) {
		if (this.$photoViewer.is(':visible')) {
			switch (e.keyCode) {
				case 27: this.closeViewer(); break;
				case 37: this.navigateViewer(-1); break;
				case 39: this.navigateViewer(1); break;
			}
		} else if (e.keyCode === 27 && this.deleteMode) {
			this.exitDeleteMode();
		}
	}

}

window.albumPage = new AlbumPage();