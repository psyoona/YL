class WebServer {
	// Private vairables
	#waiting = false;
	#keepLoading = false;

	// Public Const

	// Private const

	// Public event functions

	// Private event functions

	// Private variables

	// Public functions
	getData(url, parameters, successCallback, ajaxOptions) {
		if (this.#waiting) {
			if (ajaxOptions && !ajaxOptions.forceRequest) {
				let options = {
					message: messageUtility.getMessage('L1026'),
					type: messageUtility.TYPES.INFORMATION
				}

				screenUtility.showDialog(options);

				return;
			}
		}

		if (parameters) {
			delete parameters.hashedValue;

			parameters.hashedValue = hex_sha512(stringUtility.customStringify(parameters));
		} else {
			parameters = {
				hashedValue : hex_sha512('NO_PARAMETER')
			}
		}

		$.ajax({
			url: url,
			dataType: 'JSON',
			data: parameters,
			type: 'POST',
			beforeSend: () => {
				this.#beforeSend();
			},
			success: (response) => {
				this.#successGetData(response, successCallback);
			},
			complete: () => {
				this.#completeAjax();
			},
			error: (jqXHR) => {
				this.#errorAjax(jqXHR, url);
			}
		});
	}

	getHtml(url, parameters, successCallback) {
		dpdi.lastHtmlUrl = url;

		$.ajax({
			url: url,
			dataType: 'HTML',
			data: parameters,
			type: 'GET',
			beforeSend: () => {
				this.#beforeSend();
			},
			success: (response) => {
				this.#successGetHtml(response, successCallback);
			},
			complete: () => {
				// Initialze에서 로딩 스피너 없애는 로직 필요, 혹은 getData 호출 시 필요없음.
			},
			error: (jqXHR) => {
				this.#errorAjax(jqXHR, url);
			}
		});
	}

	// Private functions
	#successGetHtml(response, successCallback) {
		if (response) {
			if (stringUtility.isJsonString(response)) {
				response = JSON.parse(response);
			}

			if (response && (response.messageCode || response.message)) {
				var message = response.message ? response.message : messageUtility.getMessage(response.messageCode);

				let options = {
					message: message,
					type: messageUtility.TYPES.INFORMATION
				};

				if (response.message == messageUtility.getMessage(messageUtility.SERVER_MESSAGE.EXPIRED_SESSION) ||
					response.message == messageUtility.getMessage(messageUtility.SERVER_MESSAGE.PUBLISHED_NEW_VERSION) ||
					response.message == messageUtility.getMessage(messageUtility.SERVER_MESSAGE.DUPLICATE_LOGIN)) {
					options.confirmCallback = () => {
						location.href = 'Logout';
					};
				}

				screenUtility.showDialog(options);
				screenUtility.hideLoading();

				return;
			}

			if (successCallback) {
				successCallback(response);
			}
		} else {
			if (successCallback) {
				successCallback();
			}
		}
	}

	#successGetData(response, successCallback) {
		if (response) {
			if (response && (response.code || response.messageCode || response.message)) {
				let message = '';

				if (response.message) {
					message = response.message;
				} else if (response.code && window.localeHelper) {
					message = localeHelper.getMessage(String(response.code));
				} else if (window.messageUtility) {
					message = messageUtility.getMessage(response.messageCode);
				}

				if (window.localeHelper) {
					localeHelper.showAlertMessage(message);
				} else if (window.messageUtility) {
					let options = {
						message: message,
						type: messageUtility.TYPES.INFORMATION
					};

					if (response.message == messageUtility.getMessage(messageUtility.SERVER_MESSAGE.EXPIRED_SESSION) ||
						response.message == messageUtility.getMessage(messageUtility.SERVER_MESSAGE.PUBLISHED_NEW_VERSION) ||
						response.message == messageUtility.getMessage(messageUtility.SERVER_MESSAGE.DUPLICATE_LOGIN)) {
						options.confirmCallback = () => {
							location.href = 'Logout';
						};
					}

					if (response.message == messageUtility.getMessage(messageUtility.SERVER_MESSAGE.NOT_MATCH_HASH_VALUE)) {
						location.href = `Error/${messageUtility.SERVER_MESSAGE.NOT_MATCH_HASH_VALUE}`;

						return;
					}

					screenUtility.showDialog(options);
				} else if (window.stockLayout) {
					stockLayout.showModal(message);
				} else {
					alert(message);
				}

				return;
			}

			if (successCallback) {
				successCallback(response);
			}
		} else {
			if (successCallback) {
				successCallback();
			}
		}
	}

	#beforeSend() {
		screenUtility.showLoading();
		this.#waiting = true;
	}

	#completeAjax() {
		this.#waiting = false;

		if (!this.#keepLoading) {
			screenUtility.hideLoading();
		}
	}

	#errorAjax(jqXHR, url) {
		if (jqXHR.status == 404) {
			let options = {
				message: messageUtility.getMessage('L1025'),
				type: messageUtility.TYPES.INFORMATION
			};

			screenUtility.showDialog(options);

			return;
		}
	}
};

let webServer = new WebServer();