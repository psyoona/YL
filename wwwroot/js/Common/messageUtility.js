class MessageUtility {
	// Public Const
	TYPES = {
		INFORMATION: 'information',
		QUESTION: 'question'
	};

	SERVER_MESSAGE = {
		EXPIRED_SESSION: 'L1163',
		PUBLISHED_NEW_VERSION: 'L1279',
		DUPLICATE_LOGIN: 'L1330',
		NOT_MATCH_HASH_VALUE: 'L1323'
	};

	// Private Const

	// Public variables

	// Private variables
	#languageCodes = {};
	#defaultLanguageCodes = {};

	// Public event functions

	// Private event functions

	// Public functions
	getMessage(languageCode, optReplaceText) {
		let result = this.getDescription(languageCode);

		if (optReplaceText) {
			result = result.replace('{0}', optReplaceText);
		}

		return result;
	}

	getDescription(currentLanguageCode) {
		let languageInformation = this.#languageCodes.find(languageCode => languageCode.code == currentLanguageCode);
		let description = '';

		if (languageInformation) {
			description = languageInformation.description;
		} else {
			description = this.#defaultLanguageCodes.find(languageCode => languageCode.code == currentLanguageCode).description;
		}

		return description;
	}

	setLanguageData(currentLanguageList, defaultLanguageList) {
		this.#languageCodes = currentLanguageList;
		this.#defaultLanguageCodes = defaultLanguageList;
	}

	// Private functions
};

let messageUtility = new MessageUtility();