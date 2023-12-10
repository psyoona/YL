class ChatGptService {
	// Constructor
	constructor() {
		this.#bindEvent();
	}

	// Private variables

	// Public variables

	// Private event functions
	#sendMessage_onClick(e) {
		let message = $('#message').val();
		let usingType = $('#usingType').val();
		let usingKey = $('#usingKey').val();

		if (usingType == '0') {
			alert('사용 타입을 선택하세요.');
			return;
		} else if (!usingKey) {
			alert('사용키를 입력하세요.');
			return;
		} else if (!message) {
			alert('메시지를 입력하세요.');
			return;
		}

		if ($('#chatArea').val()) {
			$('#chatArea').val($('#chatArea').val() + `\n나(Me): ${message}`);
		} else {
			$('#chatArea').val(`나(Me): ${message}`);
		}

		$('#message').val('');

		webServer.getData(
			'/Laboratory/RequestChatGpt',
			{
				usingType: usingType,
				usingKey: hex_sha512(usingKey),
				message: message
			},
			(response) => {
				if (response.result) {
					$('#chatArea').val($('#chatArea').val() + `\nGPT: ${response.result}`);

					var textarea = $('#chatArea')[0];
					textarea.scrollTop = textarea.scrollHeight;
				}
			}
		);
	}

	#message_onKeyup(e) {
		if (e.keyCode == 13) {
			this.#sendMessage_onClick();
		}
	}

	// Public event functions

	// Private functions
	#bindEvent() {
		$('#sendMessage').click((e) => { this.#sendMessage_onClick(e) });

		$('#message').keyup((e) => { this.#message_onKeyup(e) });
	}

	// Public functions
}

let chatGptService = new ChatGptService();