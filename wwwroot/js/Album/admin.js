class AlbumAdmin {
	constructor() {
		this.initialize();
	}

	initialize() {
		this.bindEvents();
		this.loadRoles();
		this.loadUsers();
		this.loadAlbumAccess();
	}

	bindEvents() {
		// 역할 관리
		$('#newRoleName').on('keydown', (e) => { if (e.keyCode === 13) this.addRole(); });
		$('#btnAddRole').on('click', () => this.addRole());

		// 사용자 권한
		$('#btnAssignRole').on('click', () => this.assignUserRole());

		// 앨범 접근
		$('#btnAddAccess').on('click', () => this.addAlbumAccess());
	}

	// ============================================
	// 역할 관리
	// ============================================

	loadRoles() {
		$.ajax({
			url: '/Album/GetRoles',
			type: 'POST',
			dataType: 'json',
			success: (response) => {
				if (response.success) {
					this.renderRoles(response.roles);
					this.updateRoleSelects(response.roles);
				}
			}
		});
	}

	renderRoles(roles) {
		const $list = $('#roleList');
		$list.empty();

		if (roles.length === 0) {
			$list.html('<div class="empty-text">등록된 역할이 없습니다.</div>');
			return;
		}

		roles.forEach((role) => {
			const $item = $('<div>').addClass('data-item');
			const $info = $('<div>').addClass('item-info');
			$info.html('<span class="item-name">' + this.escapeHtml(role.roleName) + '</span>');

			const $actions = $('<div>').addClass('item-actions');

			if (role.roleName !== '시스템 마스터') {
				const $deleteBtn = $('<button>').addClass('btn-item-delete').html('<i class="fas fa-trash"></i>');
				$deleteBtn.on('click', () => {
					if (confirm('\'' + role.roleName + '\' 역할을 삭제하시겠습니까?\n관련된 사용자 역할과 앨범 접근 권한도 함께 삭제됩니다.')) {
						this.deleteRole(role.roleId);
					}
				});
				$actions.append($deleteBtn);
			} else {
				$actions.html('<span class="badge-system">시스템</span>');
			}

			$item.append($info).append($actions);
			$list.append($item);
		});
	}

	updateRoleSelects(roles) {
		$('#assignRoleSelect, #accessRoleSelect').each(function () {
			const $select = $(this);
			const val = $select.val();
			$select.empty().append('<option value="">역할 선택</option>');

			roles.forEach((role) => {
				$select.append('<option value="' + role.roleId + '">' + role.roleName + '</option>');
			});

			if (val) $select.val(val);
		});
	}

	addRole() {
		const roleName = $('#newRoleName').val().trim();

		if (!roleName) {
			alert('역할명을 입력해주세요.');
			return;
		}

		$.ajax({
			url: '/Album/AddRole',
			type: 'POST',
			data: { roleName: roleName },
			dataType: 'json',
			success: (response) => {
				if (response.success) {
					$('#newRoleName').val('');
					this.loadRoles();
				} else {
					alert(response.error || '역할 추가에 실패했습니다.');
				}
			}
		});
	}

	deleteRole(roleId) {
		$.ajax({
			url: '/Album/DeleteRole',
			type: 'POST',
			data: { roleId: roleId },
			dataType: 'json',
			success: (response) => {
				if (response.success) {
					this.loadRoles();
					this.loadUsers();
					this.loadAlbumAccess();
				} else {
					alert(response.error || '역할 삭제에 실패했습니다.');
				}
			}
		});
	}

	// ============================================
	// 사용자 권한 관리
	// ============================================

	loadUsers() {
		$.ajax({
			url: '/Album/GetUsers',
			type: 'POST',
			dataType: 'json',
			success: (response) => {
				if (response.success) {
					this.renderUserRoles(response.users, response.userRoles);
					this.updateUserSelect(response.users);
				}
			}
		});
	}

	renderUserRoles(users, userRoles) {
		const $list = $('#userRoleList');
		$list.empty();

		if (users.length === 0) {
			$list.html('<div class="empty-text">등록된 사용자가 없습니다.</div>');
			return;
		}

		users.forEach((user) => {
			const $userBlock = $('<div>').addClass('user-block');
			const $userHeader = $('<div>').addClass('user-block-header');
			$userHeader.html(
				'<span class="user-phone">' + this.escapeHtml(user.phoneNumber) + '</span>' +
				'<span class="user-name-badge">' + this.escapeHtml(user.userName) + '</span>'
			);
			$userBlock.append($userHeader);

			const roles = userRoles.filter((ur) => ur.phoneNumber === user.phoneNumber);

			if (roles.length > 0) {
				const $roleList = $('<div>').addClass('user-role-tags');

				roles.forEach((ur) => {
					const $tag = $('<span>').addClass('role-tag');
					$tag.html(
						this.escapeHtml(ur.roleName) +
						'<button class="tag-remove" title="역할 제거"><i class="fas fa-times"></i></button>'
					);
					$tag.find('.tag-remove').on('click', () => {
						if (confirm(user.userName + '에게서 \'' + ur.roleName + '\' 역할을 제거하시겠습니까?')) {
							this.removeUserRole(ur.userRoleId);
						}
					});
					$roleList.append($tag);
				});

				$userBlock.append($roleList);
			} else {
				$userBlock.append('<div class="no-roles">역할 없음</div>');
			}

			$list.append($userBlock);
		});
	}

	updateUserSelect(users) {
		const $select = $('#assignUserSelect');
		const val = $select.val();
		$select.empty().append('<option value="">사용자 선택</option>');

		users.forEach((user) => {
			$select.append('<option value="' + this.escapeHtml(user.phoneNumber) + '">' +
				this.escapeHtml(user.userName) + ' (' + this.escapeHtml(user.phoneNumber) + ')</option>');
		});

		if (val) $select.val(val);
	}

	assignUserRole() {
		const phoneNumber = $('#assignUserSelect').val();
		const roleId = $('#assignRoleSelect').val();

		if (!phoneNumber) {
			alert('사용자를 선택해주세요.');
			return;
		}
		if (!roleId) {
			alert('역할을 선택해주세요.');
			return;
		}

		$.ajax({
			url: '/Album/AssignUserRole',
			type: 'POST',
			data: { phoneNumber: phoneNumber, roleId: roleId },
			dataType: 'json',
			success: (response) => {
				if (response.success) {
					this.loadUsers();
				} else {
					alert(response.error || '역할 부여에 실패했습니다.');
				}
			}
		});
	}

	removeUserRole(userRoleId) {
		$.ajax({
			url: '/Album/RemoveUserRole',
			type: 'POST',
			data: { userRoleId: userRoleId },
			dataType: 'json',
			success: (response) => {
				if (response.success) {
					this.loadUsers();
				} else {
					alert(response.error || '역할 제거에 실패했습니다.');
				}
			}
		});
	}

	// ============================================
	// 앨범 접근 관리
	// ============================================

	loadAlbumAccess() {
		$.ajax({
			url: '/Album/GetAlbumAccess',
			type: 'POST',
			dataType: 'json',
			success: (response) => {
				if (response.success) {
					this.renderAlbumAccess(response.accessList);
					this.updateAlbumSelect(response.albums);
				}
			}
		});
	}

	renderAlbumAccess(accessList) {
		const $list = $('#albumAccessList');
		$list.empty();

		if (accessList.length === 0) {
			$list.html('<div class="empty-text">설정된 접근 권한이 없습니다. 모든 앨범이 공개 상태입니다.</div>');
			return;
		}

		// 앨범별로 그룹
		const grouped = {};
		accessList.forEach((item) => {
			if (!grouped[item.albumName]) {
				grouped[item.albumName] = [];
			}
			grouped[item.albumName].push(item);
		});

		Object.keys(grouped).sort().forEach((albumName) => {
			const $block = $('<div>').addClass('access-block');
			const $header = $('<div>').addClass('access-block-header');
			$header.html('<i class="fas fa-folder me-2"></i>' + this.escapeHtml(albumName));
			$block.append($header);

			const $tags = $('<div>').addClass('access-role-tags');

			grouped[albumName].forEach((item) => {
				const $tag = $('<span>').addClass('role-tag');
				$tag.html(
					this.escapeHtml(item.roleName) +
					'<button class="tag-remove" title="접근 권한 제거"><i class="fas fa-times"></i></button>'
				);
				$tag.find('.tag-remove').on('click', () => {
					if (confirm(albumName + ' 앨범에서 \'' + item.roleName + '\' 역할의 접근 권한을 제거하시겠습니까?')) {
						this.removeAlbumAccess(item.accessId);
					}
				});
				$tags.append($tag);
			});

			$block.append($tags);
			$list.append($block);
		});
	}

	updateAlbumSelect(albums) {
		const $select = $('#accessAlbumSelect');
		const val = $select.val();
		$select.empty().append('<option value="">앨범 선택</option>');

		albums.forEach((album) => {
			$select.append('<option value="' + this.escapeHtml(album.albumName) + '">' +
				this.escapeHtml(album.displayName) + ' (' + this.escapeHtml(album.albumName) + ')</option>');
		});

		if (val) $select.val(val);
	}

	addAlbumAccess() {
		const albumName = $('#accessAlbumSelect').val();
		const roleId = $('#accessRoleSelect').val();

		if (!albumName) {
			alert('앨범을 선택해주세요.');
			return;
		}
		if (!roleId) {
			alert('역할을 선택해주세요.');
			return;
		}

		$.ajax({
			url: '/Album/AddAlbumAccess',
			type: 'POST',
			data: { albumName: albumName, roleId: roleId },
			dataType: 'json',
			success: (response) => {
				if (response.success) {
					this.loadAlbumAccess();
				} else {
					alert(response.error || '접근 권한 추가에 실패했습니다.');
				}
			}
		});
	}

	removeAlbumAccess(accessId) {
		$.ajax({
			url: '/Album/RemoveAlbumAccess',
			type: 'POST',
			data: { accessId: accessId },
			dataType: 'json',
			success: (response) => {
				if (response.success) {
					this.loadAlbumAccess();
				} else {
					alert(response.error || '접근 권한 제거에 실패했습니다.');
				}
			}
		});
	}

	// ============================================
	// 유틸리티
	// ============================================

	escapeHtml(text) {
		const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
		return text.replace(/[&<>"']/g, (m) => map[m]);
	}
}

$(document).ready(() => {
	window.albumAdmin = new AlbumAdmin();
});
