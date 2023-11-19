class EncryptionTool {
	// Constructor
	constructor() {
		this.#bindEvent();
	}

	// Private variables

	// Public variables

	// Private event functions
	#encryptButton_onClick(e) {
		console.log('encrypt!');

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