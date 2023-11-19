class BrowserUtility {
	// Constructor
	constructor() {
	}

	// Public Const

	// Private Const

	// Public variables

	// Private variables
	#browserId = '';

	// Public event functions

	// Private event functions

	// Public functions
	getBrowserName() {
		let userAgent = navigator.userAgent;
		let browserName = 'other';

		if (userAgent.match(/chrome|chromium|crios/i)) {
			browserName = 'chrome';
		} else if (userAgent.match(/firefox|fxios/i)) {
			browserName = 'firefox';
		} else if (userAgent.match(/safari/i)) {
			browserName = 'safari';
		} else if (userAgent.match(/opr\//i)) {
			browserName = 'opera';
		} else if (userAgent.match(/edg/i)) {
			browserName = 'edge';
		}

		return browserName;
	}

	generateBrowserId() {
		this.#browserId = browserUtility.getBrowserName() + stringUtility.generateRandomNumber(10);
	}

	getBrowserId() {
		return this.#browserId;
	}

	// Private functions

};

let browserUtility = new BrowserUtility();