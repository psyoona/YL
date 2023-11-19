class EncryptionTool {
	// Constructor
	constructor() {
		this.#bindEvent();
	}

	// Private variables

	// Public variables

	// Private event functions
	#encryptButton_onClick(e) {
		if ($('#encryptType').val() == '0') {
			alert('암호화 타입을 선택하세요');
			return;
		} else if (!$('#plainText').val()) {
			alert('평문을 입력하세요.');
			return;
		}

		webServer.getData(
			'/Laboratory/EncryptString',
			{
				plainText: $('#plainText').val(),
				encryptType: 'AES256',
				encryptKey: $('#encryptKey').val()
			},
			(response) => {
				if (response.result) {
					$('#encryptResult').val(response.result);
				}
			}
		);
	}

	#decryptButton_onClick(e) {
		console.log('decrypt!');
	}

	// Public event functions

	// Private functions
	#bindEvent() {
		$('#encryptButton').click((e) => { this.#encryptButton_onClick(e) });
		$('#decryptButton').click((e) => { this.#decryptButton_onClick(e) });

		const tooltipTriggerList = $('[data-bs-toggle="tooltip"]');
		const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
	}

	// Public functions
}

let encryption = new EncryptionTool();