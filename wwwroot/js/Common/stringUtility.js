class StringUtility {
	// Constructor
	constructor() {
	}

	// Private vairables

	// Public Const
	

	// Private const

	// Private functions

	// Public event functions
	

	// Private event functions
	

	// Private variables
	

	// Public functions
	changeSpecialCharacterToEmpty(target) {
		if (!(event.keyCode >= 37 && event.keyCode <= 40)) {
			let inputVal = $(target).val();
			$(target).val(inputVal.replace(/[^a-z0-9]/gi, ''));
		}
	}

	isJsonString(value) {
		try {
			var json = JSON.parse(value);
			return (typeof json === 'object');
		} catch (e) {
			return false;
		}
	}

	generateRandomNumber(count) {
		let randomNumber = '';

		for (let i = 0; i < count; i++) {
			randomNumber += Math.floor(Math.random() * 10);
		}

		return randomNumber;
	}

	convertTimeFormat(seconds) {
		let hour = parseInt(seconds / 3600);
		let minute = parseInt((seconds % 3600) / 60);
		let second = seconds % 60;

		return `${this.fillZero(hour, 2)}:${this.fillZero(minute, 2)}:${this.fillZero(second, 2)}`;
	}

	fillZero(text, length) {
		text = '00' + text;

		return text.substring(text.length-length);
	}

	preventXss(input) {
		return input.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
	}

	customStringify(parameters) {
		let undefinedCount = 0;
		let jsonString = '{';

		for (let i = 0; i < Object.keys(parameters).length; i++) {
			if (Object.keys(parameters)[i] == 'uploadFiles' ||
				parameters[Object.keys(parameters)[i]] == undefined) {
				undefinedCount++;
				continue;
			}

			jsonString += `"${Object.keys(parameters)[i]}":"${parameters[Object.keys(parameters)[i]].toString().replace(/\n/g, '')}"`;

			if (i != Object.keys(parameters).length - 1) {
				jsonString += ',';
			}
		}

		jsonString += '}';

		if (undefinedCount == Object.keys(parameters).length) {
			jsonString = 'NO_PARAMETER';
		}

		return jsonString;
	}
};

var stringUtility = new StringUtility();