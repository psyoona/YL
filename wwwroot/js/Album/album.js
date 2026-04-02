$(document).ready(function () {
	// ============================================
	// 변수 선언
	// ============================================
	const $sidebar = $('#sidebar');
	const $sidebarOverlay = $('#sidebarOverlay');
	const $menuToggle = $('#menuToggle');
	const $sidebarClose = $('#sidebarClose');
	const $albumList = $('#albumList');
	const $photoGrid = $('#photoGrid');
	const $emptyState = $('#emptyState');
	const $loadingSpinner = $('#loadingSpinner');
	const $currentAlbumTitle = $('#currentAlbumTitle');
	const $photoCount = $('#photoCount');
	const $photoViewer = $('#photoViewer');
	const $viewerImage = $('#viewerImage');
	const $viewerTitle = $('#viewerTitle');
	const $viewerCounter = $('#viewerCounter');
	const $galleryContainer = $('#galleryContainer');
	const $topBarActions = $('#topBarActions');

	let currentAlbum = '';
	let currentPhotos = [];
	let currentPhotoIndex = 0;

	// 무한 스크롤
	const PAGE_SIZE = 12;
	let loadedCount = 0;
	let isLoadingMore = false;

	// 삭제 모드
	let deleteMode = false;
	let pendingDeletePhoto = null;

	// 앨범 삭제
	let pendingDeleteAlbum = null;

	const albumDisplayNames = {
		'yoogeon_50th': '유건이 50일'
	};

	// ============================================
	// 초기화
	// ============================================
	loadAlbumList();

	// ============================================
	// 사이드바 토글
	// ============================================
	$menuToggle.on('click', function () {
		$sidebar.addClass('open');
		$sidebarOverlay.addClass('active');
		$('body').css('overflow', 'hidden');
	});

	function closeSidebar() {
		$sidebar.removeClass('open');
		$sidebarOverlay.removeClass('active');
		$('body').css('overflow', '');
	}

	$sidebarClose.on('click', closeSidebar);
	$sidebarOverlay.on('click', closeSidebar);

	// ============================================
	// 앨범 목록
	// ============================================
	function loadAlbumList() {
		$.ajax({
			url: '/Album/GetAlbumList',
			type: 'POST',
			dataType: 'json',
			success: function (response) {
				if (response.albums && response.albums.length > 0) {
					renderAlbumList(response.albums);
				}
			}
		});
	}

	function renderAlbumList(albums) {
		$albumList.empty();

		albums.forEach(function (albumName) {
			const displayName = albumDisplayNames[albumName] || albumName;
			const $li = $('<li>');
			const $a = $('<a>').attr('data-album', albumName);

			let html = '<i class="fas fa-folder"></i>' +
				'<span class="album-name">' + escapeHtml(displayName) + '</span>';

			if (typeof isSystemMaster !== 'undefined' && isSystemMaster) {
				html += '<span class="album-delete-btn" data-album="' + escapeHtml(albumName) + '" title="앨범 삭제">' +
					'<i class="fas fa-times"></i></span>';
			}

			$a.html(html);

			$a.on('click', function (e) {
				if ($(e.target).closest('.album-delete-btn').length) {
					e.stopPropagation();
					showDeleteAlbumConfirm(albumName);
					return;
				}
				selectAlbum(albumName);
			});

			$li.append($a);
			$albumList.append($li);
		});
	}

	// ============================================
	// 앨범 선택
	// ============================================
	function selectAlbum(albumName) {
		if (currentAlbum === albumName) {
			closeSidebar();
			return;
		}

		currentAlbum = albumName;
		exitDeleteMode();

		$albumList.find('a').removeClass('active');
		$albumList.find('a[data-album="' + albumName + '"]').addClass('active');

		const displayName = albumDisplayNames[albumName] || albumName;
		$currentAlbumTitle.text(displayName);

		$topBarActions.show();
		closeSidebar();
		loadPhotos(albumName);
	}

	// ============================================
	// 사진 로드
	// ============================================
	function loadPhotos(albumName) {
		$emptyState.hide();
		$photoGrid.hide().empty();
		$loadingSpinner.show();
		$photoCount.text('');
		loadedCount = 0;

		$.ajax({
			url: '/Album/GetPhotoList',
			type: 'POST',
			data: { albumName: albumName },
			dataType: 'json',
			success: function (response) {
				$loadingSpinner.hide();

				if (response.photos && response.photos.length > 0) {
					currentPhotos = response.photos;
					$photoCount.text(response.photos.length + '장');
					$photoGrid.show();
					loadNextBatch();
				} else {
					$emptyState.find('h3').text('사진이 없습니다');
					$emptyState.find('p').html('업로드 버튼을 눌러<br>사진을 추가해보세요');
					$emptyState.show();
					$photoCount.text('0장');
					currentPhotos = [];
				}
			},
			error: function () {
				$loadingSpinner.hide();
				$emptyState.show();
			}
		});
	}

	// ============================================
	// 배치 로딩 (무한 스크롤)
	// ============================================
	function loadNextBatch() {
		if (isLoadingMore || loadedCount >= currentPhotos.length) return;

		isLoadingMore = true;
		const end = Math.min(loadedCount + PAGE_SIZE, currentPhotos.length);

		for (let i = loadedCount; i < end; i++) {
			appendPhotoCard(currentAlbum, currentPhotos[i], i);
		}

		loadedCount = end;
		isLoadingMore = false;
	}

	function appendPhotoCard(albumName, photo, index) {
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

		$card.on('click', function () {
			if (deleteMode) {
				showDeleteConfirm(photo, index);
			} else {
				openViewer(index);
			}
		});

		$photoGrid.append($card);
	}

	// 무한 스크롤
	$galleryContainer.on('scroll', function () {
		if (this.scrollTop + this.clientHeight >= this.scrollHeight - 300) {
			loadNextBatch();
		}
	});

	$(window).on('scroll', function () {
		if ($(window).scrollTop() + $(window).height() >= $(document).height() - 300) {
			loadNextBatch();
		}
	});

	// ============================================
	// 동기화 기능
	// ============================================
	$('#btnSync').on('click', function () {
		if (!currentAlbum) return;

		if (!confirm('디스크의 사진을 DB에 동기화합니다.\n기존에 등록되지 않은 사진이 추가됩니다.\n\n진행하시겠습니까?')) return;

		const $btn = $(this);
		$btn.prop('disabled', true).find('i').addClass('fa-spin');

		$.ajax({
			url: '/Album/SyncPhotos',
			type: 'POST',
			data: { albumName: currentAlbum },
			dataType: 'json',
			success: function (response) {
				$btn.prop('disabled', false).find('i').removeClass('fa-spin');

				if (response.success) {
					alert(response.count + '장의 사진이 동기화되었습니다.');
					loadPhotos(currentAlbum);
				} else {
					alert('동기화 실패: ' + (response.error || '알 수 없는 오류'));
				}
			},
			error: function () {
				$btn.prop('disabled', false).find('i').removeClass('fa-spin');
				alert('동기화 중 오류가 발생했습니다.');
			}
		});
	});

	// ============================================
	// 업로드 기능
	// ============================================
	$('#btnUpload').on('click', function () {
		if (!currentAlbum) return;
		$('#fileInput').click();
	});

	$('#fileInput').on('change', function () {
		const files = this.files;

		if (!files || files.length === 0) return;

		const formData = new FormData();
		formData.append('albumName', currentAlbum);

		for (let i = 0; i < files.length; i++) {
			formData.append('files', files[i]);
		}

		const $progress = $('#uploadProgress');
		const $bar = $('#uploadProgressBar');
		const $text = $('#uploadProgressText');

		$progress.show();
		$bar.css('width', '0%');
		$text.text('업로드 중...');

		$.ajax({
			url: '/Album/UploadPhotos',
			type: 'POST',
			data: formData,
			processData: false,
			contentType: false,
			xhr: function () {
				const xhr = new window.XMLHttpRequest();
				xhr.upload.addEventListener('progress', function (e) {
					if (e.lengthComputable) {
						const pct = Math.round((e.loaded / e.total) * 100);
						$bar.css('width', pct + '%');
						$text.text('업로드 중... ' + pct + '%');
					}
				});
				return xhr;
			},
			success: function (response) {
				$progress.hide();
				$('#fileInput').val('');

				if (response.success && response.photos) {
					loadPhotos(currentAlbum);
				} else {
					alert(response.error || '업로드에 실패했습니다.');
				}
			},
			error: function () {
				$progress.hide();
				$('#fileInput').val('');
				alert('업로드 중 오류가 발생했습니다.');
			}
		});
	});

	// ============================================
	// 사진 삭제 기능
	// ============================================
	$('#btnDeleteMode').on('click', function () {
		if (deleteMode) {
			exitDeleteMode();
		} else {
			enterDeleteMode();
		}
	});

	function enterDeleteMode() {
		deleteMode = true;
		$('#btnDeleteMode').addClass('active');
		$photoGrid.addClass('delete-mode');
	}

	function exitDeleteMode() {
		deleteMode = false;
		$('#btnDeleteMode').removeClass('active');
		$photoGrid.removeClass('delete-mode');
	}

	function showDeleteConfirm(photo, index) {
		pendingDeletePhoto = { photo: photo, index: index };
		$('#deleteConfirmModal').fadeIn(200);
	}

	$('#btnDeleteCancel').on('click', function () {
		$('#deleteConfirmModal').fadeOut(200);
		pendingDeletePhoto = null;
	});

	$('#btnDeleteConfirm').on('click', function () {
		if (!pendingDeletePhoto) return;

		const photo = pendingDeletePhoto.photo;
		const index = pendingDeletePhoto.index;

		$('#deleteConfirmModal').fadeOut(200);

		$.ajax({
			url: '/Album/DeletePhoto',
			type: 'POST',
			data: {
				albumName: currentAlbum,
				fileName: photo.fileName,
				photoId: photo.photoId
			},
			dataType: 'json',
			success: function (response) {
				if (response.success) {
					currentPhotos.splice(index, 1);
					$photoCount.text(currentPhotos.length + '장');

					$photoGrid.empty();
					loadedCount = 0;

					const batchEnd = Math.min(currentPhotos.length, loadedCount + PAGE_SIZE * 3);

					for (let i = 0; i < batchEnd; i++) {
						appendPhotoCard(currentAlbum, currentPhotos[i], i);
					}

					loadedCount = batchEnd;

					if (currentPhotos.length === 0) {
						$photoGrid.hide();
						$emptyState.find('h3').text('사진이 없습니다');
						$emptyState.find('p').html('업로드 버튼을 눌러<br>사진을 추가해보세요');
						$emptyState.show();
					}
				} else {
					alert(response.error || '삭제에 실패했습니다.');
				}
			}
		});

		pendingDeletePhoto = null;
	});

	// ============================================
	// 앨범 추가/삭제 (시스템 마스터)
	// ============================================
	$('#btnAddAlbum').on('click', function (e) {
		e.stopPropagation();
		$('#newAlbumName').val('');
		$('#createAlbumModal').fadeIn(200);
		setTimeout(function () { $('#newAlbumName').focus(); }, 250);
	});

	$('#btnCreateAlbumCancel').on('click', function () {
		$('#createAlbumModal').fadeOut(200);
	});

	$('#newAlbumName').on('keydown', function (e) {
		if (e.keyCode === 13) {
			$('#btnCreateAlbumConfirm').click();
		}
	});

	$('#btnCreateAlbumConfirm').on('click', function () {
		const albumName = $('#newAlbumName').val().trim();

		if (!albumName) {
			alert('앨범 이름을 입력해주세요.');
			return;
		}

		$.ajax({
			url: '/Album/CreateAlbum',
			type: 'POST',
			data: { albumName: albumName },
			dataType: 'json',
			success: function (response) {
				$('#createAlbumModal').fadeOut(200);

				if (response.success) {
					loadAlbumList();
				} else {
					alert(response.error || '앨범 생성에 실패했습니다.');
				}
			},
			error: function () {
				alert('앨범 생성 중 오류가 발생했습니다.');
			}
		});
	});

	function showDeleteAlbumConfirm(albumName) {
		pendingDeleteAlbum = albumName;
		$('#deleteAlbumName').text(albumName);
		$('#deleteAlbumModal').fadeIn(200);
	}

	$('#btnDeleteAlbumCancel').on('click', function () {
		$('#deleteAlbumModal').fadeOut(200);
		pendingDeleteAlbum = null;
	});

	$('#btnDeleteAlbumConfirm').on('click', function () {
		if (!pendingDeleteAlbum) return;

		const albumName = pendingDeleteAlbum;
		$('#deleteAlbumModal').fadeOut(200);

		$.ajax({
			url: '/Album/DeleteAlbum',
			type: 'POST',
			data: { albumName: albumName },
			dataType: 'json',
			success: function (response) {
				if (response.success) {
					if (currentAlbum === albumName) {
						currentAlbum = '';
						currentPhotos = [];
						$photoGrid.hide().empty();
						$emptyState.find('h3').text('앨범을 선택해주세요');
						$emptyState.find('p').html('좌측 메뉴에서 앨범을 선택하면<br>사진들이 여기에 표시됩니다');
						$emptyState.show();
						$currentAlbumTitle.text('앨범을 선택해주세요');
						$topBarActions.hide();
						$photoCount.text('');
					}
					loadAlbumList();
				} else {
					alert(response.error || '앨범 삭제에 실패했습니다.');
				}
			},
			error: function () {
				alert('앨범 삭제 중 오류가 발생했습니다.');
			}
		});

		pendingDeleteAlbum = null;
	});

	// ============================================
	// 사진 뷰어
	// ============================================
	function openViewer(index) {
		currentPhotoIndex = index;
		updateViewer();
		$photoViewer.fadeIn(200);
		$('body').css('overflow', 'hidden');
	}

	function closeViewer() {
		$photoViewer.fadeOut(200);
		$('body').css('overflow', '');
	}

	function updateViewer() {
		const photo = currentPhotos[currentPhotoIndex];
		const imageUrl = '/Album/GetPhoto?albumName=' + encodeURIComponent(currentAlbum) + '&fileName=' + encodeURIComponent(photo.fileName);

		$viewerImage.attr('src', imageUrl);
		$viewerTitle.text(photo.fileName);
		$viewerCounter.text((currentPhotoIndex + 1) + ' / ' + currentPhotos.length);
	}

	function navigateViewer(direction) {
		currentPhotoIndex += direction;

		if (currentPhotoIndex < 0) {
			currentPhotoIndex = currentPhotos.length - 1;
		} else if (currentPhotoIndex >= currentPhotos.length) {
			currentPhotoIndex = 0;
		}

		updateViewer();
	}

	$('#viewerClose').on('click', closeViewer);
	$('#viewerPrev').on('click', function () { navigateViewer(-1); });
	$('#viewerNext').on('click', function () { navigateViewer(1); });

	$photoViewer.on('click', function (e) {
		if ($(e.target).is('.viewer-body') || $(e.target).is('.viewer-image-container')) {
			closeViewer();
		}
	});

	$(document).on('keydown', function (e) {
		if ($photoViewer.is(':visible')) {
			switch (e.keyCode) {
				case 27: closeViewer(); break;
				case 37: navigateViewer(-1); break;
				case 39: navigateViewer(1); break;
			}
		} else if (e.keyCode === 27 && deleteMode) {
			exitDeleteMode();
		}
	});

	// 터치 스와이프
	let touchStartX = 0;

	$photoViewer.on('touchstart', function (e) {
		touchStartX = e.originalEvent.changedTouches[0].screenX;
	});

	$photoViewer.on('touchend', function (e) {
		const diff = touchStartX - e.originalEvent.changedTouches[0].screenX;

		if (Math.abs(diff) > 50) {
			navigateViewer(diff > 0 ? 1 : -1);
		}
	});

	// ============================================
	// 로그아웃
	// ============================================
	$('#btnLogout').on('click', function (e) {
		e.preventDefault();
		if (confirm('로그아웃 하시겠습니까?')) {
			window.location.href = '/Album/Logout';
		}
	});

	// ============================================
	// 유틸리티
	// ============================================
	function escapeHtml(text) {
		const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
		return text.replace(/[&<>"']/g, function (m) { return map[m]; });
	}
});
