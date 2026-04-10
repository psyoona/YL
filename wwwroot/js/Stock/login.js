class StockLogin {
	constructor() {
		this.$loginId = $('#loginId');
		this.$password = $('#password');
		this.$btnLogin = $('#btnLogin');
		this.$loginMessage = $('#loginMessage');

		this.bindEvents();
		this.$loginId.focus();
	}

	bindEvents() {
		this.$btnLogin.on('click', () => this.doLogin());

		this.$loginId.on('keydown', (e) => {
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
		const loginId = this.$loginId.val().trim();
		const password = this.$password.val().trim();

		if (!loginId) {
			this.showMessage('아이디를 입력해주세요.', 'error');
			this.$loginId.focus();
			return;
		}

		if (!password) {
			this.showMessage('비밀번호를 입력해주세요.', 'error');
			this.$password.focus();
			return;
		}

		this.$btnLogin.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-2"></i>로그인 중...');

		webServer.getData(
			'/Stock/Authenticate',
			{ loginId: loginId, password: password },
			(response) => {
				if (response.success) {
					this.showMessage(response.userName + '님 환영합니다!', 'success');
					setTimeout(() => { window.location.href = '/Stock/Index'; }, 800);
				} else {
					this.showMessage('아이디 또는 비밀번호가 일치하지 않습니다.', 'error');
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

window.stockLogin = new StockLogin();
