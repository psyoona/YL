class WebServer {
	// Private vairables
	#waiting = false;
	#keepLoading = false;

	// Public Const

	// Private const

	// Public event functions

	// Private event functions
	bindKeyEvent(e) {
		if (e.keyCode == screenUtility.KEY_CODE.ENTER) {
			if ($('#showModal').hasClass('show')) {
				//screenUtility.hideModal();
			}
		}
	}

	// Private variables

	// Public functions
	insertAccessLog(accessType, description) {
		return new Promise((resolve, reject) => {
			let parameters = {
				accessType: accessType,
				description: description
			};

			this.#keepLoading = true;

			this.getData(
				'Common/InsertAccessLog',
				parameters,
				(response) => {
					if (response) {
						this.#keepLoading = false;
						resolve(response);
					}
			});
		});
		
	}

	uploadFiles(url, parameters, successCallback, ajaxOptions) {
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

			parameters.append('hashedValue', hex_sha512(stringUtility.customStringify(Object.fromEntries(parameters))));
		} else {
			parameters = {
				hashedValue: hex_sha512('NO_PARAMETER')
			}
		}

		$.ajax({
			url: url,
			dataType: 'JSON',
			data: parameters,
			enctype: 'multipart/form-data',
			processData: false,
			contentType: false,
			type: 'POST',
			beforeSend: () => {
				this.#beforeSend();
			},
			success: (response) => {
				this.#successUploadFiles(response, successCallback);
			},
			complete: () => {
				this.#completeAjax();
			},
			error: (jqXHR) => {
				this.#errorAjax(jqXHR, url);
			}
		});
	}

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

	downloadFile(url, parameters) {
		if (this.#waiting) {
			let options = {
				message: this.getMessage(1001),
				type: messageUtility.TYPES.INFORMATION
			}

			screenUtility.showDialog(options);

			return;
		}

		if (parameters) {
			delete parameters.hashedValue;

			parameters.hashedValue = hex_sha512(stringUtility.customStringify(parameters));
		} else {
			parameters = {
				hashedValue: hex_sha512('NO_PARAMETER')
			}
		}

		$.ajax({
			url: url,
			data: parameters,
			type: 'POST',
			cache: false,
			beforeSend: () => {
				this.#beforeSend();
			},
			success: (response) => {
				this.#successDownloadFile(response, parameters);
			},
			complete: () => {
				this.#completeAjax();
			},
			error: (jqXHR) => {
				this.#errorAjax(jqXHR, url);
			}
		});
	}

	downloadExcel(title, dataJsonArray) {
		let columnCodeArray = [];
		let wb = XLSX.utils.book_new();
		let arrJSON = JSON.parse(JSON.stringify(dataJsonArray));

		// 열순서 및 시트화
		let ws = XLSX.utils.json_to_sheet(arrJSON, { header: columnCodeArray });

		// 엑셀파일정보
		wb.Props = {
			Title: title,
			Subject: 'Excel',
			Author: 'Digital PDI',
			Manager: 'Digital PDI',
			LastAuthor: 'Digital PDI',
			Company: 'GIT AUTO',
			CreatedDate: new Date()
		};

		// 엑셀 첫번째 시트네임
		wb.SheetNames.push(title);

		// 시트에 데이터를 연결
		wb.Sheets[title] = ws;

		// Download
		saveAs(new Blob([
			this.#excelDataToArrayBuffer(XLSX.write(
				wb,
				{
					bookType: 'xlsx',
					type: 'binary'
				}
			))
		], {
			type: 'application/octet-stream'
		}), title + '.xlsx');
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

	#successUploadFiles(response, successCallback) {
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
			if (response && (response.messageCode || response.message)) {
				let message = response.message ? response.message : messageUtility.getMessage(response.messageCode);

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

	#successDownloadFile(response, parameters) {
		if (response && (response.messageCode || response.message)) {
			let message = response.message ? response.message : messageUtility.getMessage(response.messageCode);

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

			return;
		}

		let blob = this.#base64ToBlob(response);
		let URL = window.URL || window.webkitURL;
		let downloadUrl = URL.createObjectURL(blob);

		let a = document.createElement('a');

		if (a.download === undefined) {
			window.location.href = downloadUrl;
		} else {
			a.id = 'apkResource';
			a.href = downloadUrl;
			a.download = parameters.downloadFileName;

			document.body.appendChild(a);

			if (parameters.showDialog) {
				let options = {
					message: messageUtility.getMessage('L1271'),
					type: messageUtility.TYPES.QUESTION,
					confirmCallback: () => {
						$('#apkResource')[0].click();
					}
				};

				screenUtility.showDialog(options);
			} else {
				$('#apkResource')[0].click();
				$('#apkResource').remove();
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

	#excelDataToArrayBuffer(excelData) {
		// Convert excelData to arrayBuffer
		let arrayBuffer = new ArrayBuffer(excelData.length);

		// Create uint8array as viewer
		let uInt8Array = new Uint8Array(arrayBuffer);

		// Convert to octet
		for (let i = 0; i < excelData.length; i++) {
			uInt8Array[i] = excelData.charCodeAt(i) & 0xFF;
		}

		return arrayBuffer;
	}

	#base64ToBlob(base64String) {
		let binaryString = window.atob(base64String);
		let binaryLen = binaryString.length;
		let arrayBuffer = new ArrayBuffer(binaryLen);
		let uInt8Array = new Uint8Array(arrayBuffer);

		for (let i = 0; i < binaryLen; i++) {
			uInt8Array[i] = binaryString.charCodeAt(i);
		}

		let blob = new Blob([arrayBuffer]);
		blob.lastModifiedDate = new Date();

		return blob;
	}

	// Initialize
	constructor() {
		$(document).keyup((e) => this.bindKeyEvent(e));
	}
};

let webServer = new WebServer();