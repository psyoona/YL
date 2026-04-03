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
		$('#btnAddRole').on('click', () => this.addRole_onClick());
		$('#btnAssignRole').on('click', () => this.assignUserRole_onClick());
		$('#btnAddAccess').on('click', () => this.addAlbumAccess_onClick());

		$('#newRoleName').on('keydown', (e) => this.newRoleName_onKeyDown(e));
	}

	loadRoles() {
		webServer.getData(
			'/Album/GetRoles',
			null,
			(response) => {
				this.renderRoles(response.roles);
				this.updateRoleSelects(response.roles);
			}
		);
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
			$info.html('<span class="item-name">' + stringUtility.escapeHtml(role.roleName) + '</span>');

			const $actions = $('<div>').addClass('item-actions');

			if (role.roleName !== '시스템 마스터') {
				const $deleteBtn = $('<button>').addClass('btn-item-delete').html('<i class="fas fa-trash"></i>');
				$deleteBtn.on('click', () => {
					localeHelper.showConfirmMessage(
						'\'' + role.roleName + '\'' + localeHelper.getMessage('C_CONFIRM_DELETE_ROLE'),
						() => this.deleteRole(role.roleId)
					);
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

	addRole_onClick() {
		const roleName = $('#newRoleName').val().trim();

		if (!roleName) {
			localeHelper.showAlert('C_ROLE_NAME_REQUIRED');
			return;
		}

		webServer.getData(
			'/Album/AddRole',
			{ roleName: roleName },
			(response) => {
				$('#newRoleName').val('');
				this.loadRoles();
			}
		);
	}

	deleteRole(roleId) {
		webServer.getData(
			'/Album/DeleteRole',
			{ roleId: roleId },
			(response) => {
				this.loadRoles();
				this.loadUsers();
				this.loadAlbumAccess();
			}
		);
	}

	loadUsers() {
		webServer.getData(
			'/Album/GetUsers',
			null,
			(response) => {
				this.renderUserRoles(response.users, response.userRoles);
				this.updateUserSelect(response.users);
			}
		);
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
				'<span class="user-phone">' + stringUtility.escapeHtml(user.phoneNumber) + '</span>' +
				'<span class="user-name-badge">' + stringUtility.escapeHtml(user.userName) + '</span>'
			);
			$userBlock.append($userHeader);

			const roles = userRoles.filter((ur) => ur.phoneNumber === user.phoneNumber);

			if (roles.length > 0) {
				const $roleList = $('<div>').addClass('user-role-tags');

				roles.forEach((ur) => {
					const $tag = $('<span>').addClass('role-tag');
					$tag.html(
						stringUtility.escapeHtml(ur.roleName) +
						'<button class="tag-remove" title="역할 제거"><i class="fas fa-times"></i></button>'
					);
					$tag.find('.tag-remove').on('click', () => {
						localeHelper.showConfirmMessage(
							user.userName + ' - \'' + ur.roleName + '\' ' + localeHelper.getMessage('C_CONFIRM_REMOVE_USER_ROLE'),
							() => this.removeUserRole(ur.userRoleId)
						);
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
			$select.append('<option value="' + stringUtility.escapeHtml(user.phoneNumber) + '">' +
				stringUtility.escapeHtml(user.userName) + ' (' + stringUtility.escapeHtml(user.phoneNumber) + ')</option>');
		});

		if (val) $select.val(val);
	}

	assignUserRole_onClick() {
		const phoneNumber = $('#assignUserSelect').val();
		const roleId = $('#assignRoleSelect').val();

		if (!phoneNumber) {
			localeHelper.showAlert('C_SELECT_USER');
			return;
		}
		if (!roleId) {
			localeHelper.showAlert('C_SELECT_ROLE');
			return;
		}

		webServer.getData(
			'/Album/AssignUserRole',
			{ phoneNumber: phoneNumber, roleId: roleId },
			(response) => {
				this.loadUsers();
			}
		);
	}

	removeUserRole(userRoleId) {
		webServer.getData(
			'/Album/RemoveUserRole',
			{ userRoleId: userRoleId },
			(response) => {
				this.loadUsers();
			}
		);
	}

	loadAlbumAccess() {
		webServer.getData(
			'/Album/GetAlbumAccess',
			null,
			(response) => {
				this.renderAlbumAccess(response.accessList);
				this.updateAlbumSelect(response.albums);
			}
		);
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
			$header.html('<i class="fas fa-folder me-2"></i>' + stringUtility.escapeHtml(albumName));
			$block.append($header);

			const $tags = $('<div>').addClass('access-role-tags');

			grouped[albumName].forEach((item) => {
				const $tag = $('<span>').addClass('role-tag');
				$tag.html(
					stringUtility.escapeHtml(item.roleName) +
					'<button class="tag-remove" title="접근 권한 제거"><i class="fas fa-times"></i></button>'
				);
				$tag.find('.tag-remove').on('click', () => {
					localeHelper.showConfirmMessage(
						albumName + ' - \'' + item.roleName + '\' ' + localeHelper.getMessage('C_CONFIRM_REMOVE_ALBUM_ACCESS'),
						() => this.removeAlbumAccess(item.accessId)
					);
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
			$select.append('<option value="' + stringUtility.escapeHtml(album.albumName) + '">' +
				stringUtility.escapeHtml(album.displayName) + ' (' + stringUtility.escapeHtml(album.albumName) + ')</option>');
		});

		if (val) {
			$select.val(val);
		}
	}

	newRoleName_onKeyDown(event) {
		if (event.keyCode === 13) {
			this.addRole_onClick();
		}
	}

	addAlbumAccess_onClick() {
		const albumName = $('#accessAlbumSelect').val();
		const roleId = $('#accessRoleSelect').val();

		if (!albumName) {
			localeHelper.showAlert('C_SELECT_ALBUM');
			return;
		}
		if (!roleId) {
			localeHelper.showAlert('C_SELECT_ROLE');
			return;
		}

		webServer.getData(
			'/Album/AddAlbumAccess',
			{ albumName: albumName, roleId: roleId },
			(response) => {
				this.loadAlbumAccess();
			}
		);
	}

	removeAlbumAccess(accessId) {
		webServer.getData(
			'/Album/RemoveAlbumAccess',
			{ accessId: accessId },
			(response) => {
				this.loadAlbumAccess();
			}
		);
	}
}

window.albumAdmin = new AlbumAdmin();
