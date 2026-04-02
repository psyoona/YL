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
			this.showMessage('핸드폰 번호를 입력해주세요.', 'error');
			this.$phoneNumber.focus();
			return;
		}

		if (phoneNumber.length < 10 || phoneNumber.length > 11) {
			this.showMessage('올바른 핸드폰 번호를 입력해주세요.', 'error');
			this.$phoneNumber.focus();
			return;
		}

		if (!password) {
			this.showMessage('비밀번호를 입력해주세요.', 'error');
			this.$password.focus();
			return;
		}

		this.$btnLogin.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-2"></i>로그인 중...');

		webServer.getData(
			'/Album/Authenticate',
			{ phoneNumber: phoneNumber, password: password },
			(response) => {
				if (response.success) {
					this.showMessage(response.userName + '님 환영합니다!', 'success');
					setTimeout(() => { window.location.href = '/Album/Index'; }, 800);
				} else {
					this.showMessage('핸드폰 번호 또는 비밀번호가 일치하지 않습니다.', 'error');
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