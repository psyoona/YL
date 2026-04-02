$(document).ready(function () {
	const $phoneNumber = $('#phoneNumber');
	const $password = $('#password');
	const $btnLogin = $('#btnLogin');
	const $loginMessage = $('#loginMessage');

	// 핸드폰 번호 입력 시 숫자만 허용
	$phoneNumber.on('input', function () {
		this.value = this.value.replace(/[^0-9]/g, '');
	});

	// 로그인 버튼 클릭
	$btnLogin.on('click', function () {
		doLogin();
	});

	// Enter 키 이벤트
	$phoneNumber.on('keydown', function (e) {
		if (e.keyCode === 13) {
			$password.focus();
		}
	});

	$password.on('keydown', function (e) {
		if (e.keyCode === 13) {
			doLogin();
		}
	});

	function doLogin() {
		const phoneNumber = $phoneNumber.val().trim();
		const password = $password.val().trim();

		// 유효성 검사
		if (!phoneNumber) {
			showMessage('핸드폰 번호를 입력해주세요.', 'error');
			$phoneNumber.focus();
			return;
		}

		if (phoneNumber.length < 10 || phoneNumber.length > 11) {
			showMessage('올바른 핸드폰 번호를 입력해주세요.', 'error');
			$phoneNumber.focus();
			return;
		}

		if (!password) {
			showMessage('비밀번호를 입력해주세요.', 'error');
			$password.focus();
			return;
		}

		// 로그인 요청
		$btnLogin.prop('disabled', true).html('<i class="fas fa-spinner fa-spin me-2"></i>로그인 중...');

		$.ajax({
			url: '/Album/Authenticate',
			type: 'POST',
			data: {
				phoneNumber: phoneNumber,
				password: password
			},
			dataType: 'json',
			success: function (response) {
				if (response.success) {
					showMessage(response.userName + '님 환영합니다!', 'success');

					setTimeout(function () {
						window.location.href = '/Album/Index';
					}, 800);
				} else {
					showMessage('핸드폰 번호 또는 비밀번호가 일치하지 않습니다.', 'error');
					$btnLogin.prop('disabled', false).html('<i class="fas fa-sign-in-alt me-2"></i>로그인');
				}
			},
			error: function () {
				showMessage('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
				$btnLogin.prop('disabled', false).html('<i class="fas fa-sign-in-alt me-2"></i>로그인');
			}
		});
	}

	function showMessage(message, type) {
		$loginMessage
			.removeClass('error success')
			.addClass(type)
			.text(message)
			.fadeIn(200);
	}

	// 페이지 로드 시 핸드폰 번호 입력란에 포커스
	$phoneNumber.focus();
});
