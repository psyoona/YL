class AlbumLogin {
	constructor() {
		this.$phoneNumber = $('#phoneNumber');
		this.$password = $('#password');
		this.$btnLogin = $('#btnLogin');
		this.$loginMessage = $('#loginMessage');

		this.bindEvents();
		this.$phoneNumber.focus();
	}

	bindEvents() {
		this.$phoneNumber.on('input', (e) => {
			e.target.value = e.target.value.replace(/[^0-9]/g, '');
		});

		this.$btnLogin.on('click', () => this.doLogin());

		this.$phoneNumber.on('keydown', (e) => {
			if (e.keyCode === 13) {
				this.$password.focus();
			}
		});

		this.$password.on('keydown', (e) => {
			if (e.keyCode === 13) {
				this.doLogin();
			}
		});
	}

	doLogin() {
		const phoneNumber = this.$phoneNumber.val().trim();
		const password = this.$password.val().trim();

		if (!phoneNumber) {
			this.showMessage(localeHelper.getMessage('C_PHONE_REQUIRED'), 'error');
			this.$phoneNumber.focus();
			return;
		}

		if (phoneNumber.length < 10 || phoneNumber.length > 11) {
			this.showMessage(localeHelper.getMessage('C_PHONE_INVALID'), 'error');
			this.$phoneNumber.focus();
			return;
		}

		if (!password) {
			this.showMessage(localeHelper.getMessage('C_PASSWORD_REQUIRED'), 'error');
			this.$password.focus();
			return;
		}

		this.$btnLogin.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-2"></i>로그인 중...');

		webServer.getData(
			'/Album/Authenticate',
			{ phoneNumber: phoneNumber, password: password },
			(response) => {
				if (response.success) {
					this.showMessage(response.userName + localeHelper.getMessage('C_LOGIN_SUCCESS'), 'success');
					setTimeout(() => { window.location.href = '/Album/Index'; }, 800);
				} else {
					this.showMessage(localeHelper.getMessage('C_LOGIN_FAILED'), 'error');
					this.$btnLogin.prop('disabled', false).html('<i class="fas fa-sign-in-alt me-2"></i>로그인');
				}
			}
		);
	}

	showMessage(message, type) {
		this.$loginMessage
			.removeClass('error success')
			.addClass(type)
			.text(message)
			.fadeIn(200);
	}
}

window.albumLogin = new AlbumLogin();
