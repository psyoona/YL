var ImageUtility = class ImageUtility {
	// Constructor
	constructor() {
	}

	// Public Const

	// Private Const

	// Public variables

	// Private variables

	// Public event functions

	// Private event functions

	// Public functions
	getResultImage(result) {
		let image = '<img src="../img/icon_x.png" alt="NG" />';

		if (result && result == 1) {
			image = '<img src="../img/icon_o.png" alt="OK" />';
		}

		return image;
	}

	getSuccessImage(result) {
		let image = '';

		if (result) {
			image = '<img src="../img/icon_o.png" alt="OK" />';
		}

		return image;
	}
	// Private functions

};

var imageUtility = new ImageUtility();