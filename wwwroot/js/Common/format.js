class Format {
	// Private vairables

	// Public Const

	// Private const
	DEFAULT_DATE = 'YYYY-MM-DD';
	DEFAULT_DATETIME = 'YYYY-MM-DD HH:mm:ss';
	DEFAULT_TIME = 'HH:mm:ss';

	// Public event functions
	

	// Private event functions
	

	// Private variables
	

	// Public functions
	addThousandComma(number) {
		if (!number) {
			return 0;
		}

		return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
	}
	formatDate(dateStr) {
		if (!dateStr) return '-';
		const d = new Date(dateStr);
		const pad = n => String(n).padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
	}};

let format = new Format();