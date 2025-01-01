var BaseConversion = class {
	constructor() {
		this.decimalInput = $('#decimal');
		this.binaryInput = $('#binary');
		this.octalInput = $('#octal');
		this.hexadecimalInput = $('#hexadecimal');

		this.init();
	}

	init() {
		this.addEventListeners();
	}

	updateValues(fromBase, inputValue) {
		try {
			let decimalValue = parseInt(inputValue, fromBase);

			if (isNaN(decimalValue)) {
				throw new Error('Invalid input');
			}

			// Update other fields based on the decimal value
			if (fromBase !== 10) this.decimalInput.val(decimalValue.toString(10));
			if (fromBase !== 2) this.binaryInput.val(decimalValue.toString(2));
			if (fromBase !== 8) this.octalInput.val(decimalValue.toString(8));
			if (fromBase !== 16) this.hexadecimalInput.val(decimalValue.toString(16).toUpperCase());
		} catch {
			// Clear invalid values in other fields
			if (fromBase !== 10) this.decimalInput.val('');
			if (fromBase !== 2) this.binaryInput.val('');
			if (fromBase !== 8) this.octalInput.val('');
			if (fromBase !== 16) this.hexadecimalInput.val('');
		}
	}

	addKeydownEvent(inputElement, base) {
		let allowedKeys = {
			10: /[0-9]/,
			2: /[0-1]/,
			8: /[0-7]/,
			16: /[0-9A-Fa-f]/
		};

		inputElement.on('keydown', (event) => {
			let key = event.key;
			let regex = allowedKeys[base];

			if (['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'].includes(key)) {
				return;
			}

			if (!regex.test(key)) {
				event.preventDefault();
			}
		});

		inputElement.on('input', () => {
			let value = inputElement.val().trim();

			if (value !== '') {
				this.updateValues(base, value);
			} else {
				this.clearFields();
			}
		});
	}

	addEventListeners() {
		this.addKeydownEvent(this.decimalInput, 10);
		this.addKeydownEvent(this.binaryInput, 2);
		this.addKeydownEvent(this.octalInput, 8);
		this.addKeydownEvent(this.hexadecimalInput, 16);
	}

	clearFields() {
		this.decimalInput.val('');
		this.binaryInput.val('');
		this.octalInput.val('');
		this.hexadecimalInput.val('');
	}
}

var baseConversion = new BaseConversion;