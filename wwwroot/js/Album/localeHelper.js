class LocaleHelper {
	constructor() {
		this.messages = {};
		this.locale = (navigator.language || 'ko').substring(0, 2);
	}

	async load() {
		try {
			const response = await fetch('/locales/' + this.locale + '.json');

			if (response.ok) {
				this.messages = await response.json();
				this.applyButtonLabels();
				return;
			}
		} catch (e) { }

		try {
			const fallback = await fetch('/locales/ko.json');

			if (fallback.ok) {
				this.messages = await fallback.json();
				this.applyButtonLabels();
			}
		} catch (e) { }
	}

	applyButtonLabels() {
		$('#albumDialogConfirm').text(this.getMessage('C_CONFIRM'));
		$('#albumDialogCancel').text(this.getMessage('C_CANCEL'));
	}

	getMessage(key) {
		return this.messages[key] || key;
	}

	showAlert(messageKey) {
		const message = this.getMessage(messageKey);
		this.showAlertMessage(message);
	}

	showAlertMessage(message) {
		$('#albumDialogMessage').text(message);
		$('#albumDialogCancel').hide();
		$('#albumDialogConfirm').off('click').on('click', () => $('#albumDialog').fadeOut(200));
		$('#albumDialog').fadeIn(200);
	}

	showConfirm(messageKey, confirmCallback) {
		const message = this.getMessage(messageKey);
		this.showConfirmMessage(message, confirmCallback);
	}

	showConfirmMessage(message, confirmCallback) {
		$('#albumDialogMessage').text(message);
		$('#albumDialogCancel').show();
		$('#albumDialogCancel').off('click').on('click', () => $('#albumDialog').fadeOut(200));
		$('#albumDialogConfirm').off('click').on('click', () => {
			$('#albumDialog').fadeOut(200);
			if (confirmCallback) confirmCallback();
		});
		$('#albumDialog').fadeIn(200);
	}
}

window.localeHelper = new LocaleHelper();
localeHelper.load();
