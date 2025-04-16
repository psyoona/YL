var UrlConversion = class {
	constructor() {
		this.init();
	}

	init() {
		$('#navbarNav ul li a').removeClass('active');
		$('#urlConverter').addClass('active');
		$('#selectedMenu').text('Url Converter');

		this.bindEvents();
	}

	bindEvents() {
		$('#plainText').on('input', (event) => this.plainText_onKeydown(event));
		$('#encodedUrl').on('input', (event) => this.encodedUrl_onKeydown(event));
		$('#decodedUrl').on('input', (event) => this.decodedUrl_onKeydown(event));
	}

	encodeURL(source) {
		let plainText = source.val();

		if (plainText) {
			let encoded = encodeURIComponent(plainText);
			$('#encodedUrl').val(encoded);
		} else {
			$('#encodedUrl').val('');
		}
	}

	decodeUrl(source) {
		let encodedText = source.val();

		if (encodedText) {
			try {
				let decoded = decodeURIComponent(encodedText);

				$('#decodedUrl').val(decoded);
			} catch (error) {
				console.log('Invalid encoded URL format.');
				$('#decodedUrl').val($('#plainText').val());
			}
		} else {
			$('#decodedUrl').val('');
		}
	}

	plainText_onKeydown(event) {
		this.encodeURL($('#plainText'));
		this.decodeUrl($('#plainText'));
	}

	encodedUrl_onKeydown(event) {
		this.decodeUrl($('#encodedUrl'));
		$('#plainText').val($('#decodedUrl').val());
	}

	decodedUrl_onKeydown(event) {
		this.encodeURL($('#decodedUrl'));
		$('#plainText').val($('#decodedUrl').val());
	}
}

var urlConversion = new UrlConversion;