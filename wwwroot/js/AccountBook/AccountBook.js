class AccountBook {
	// Constructor
	constructor() {
		this.#getAccountMainData();
		this.#bindEvent();
	}

	// Private variables

	// Public variables

	// Private event functions

	// Public event functions

	// Private functions
	#getAccountMainData() {
		webServer.getData(
			'/Laboratory/GetAccountMainData',
			null,
			(response) => {
				if (response.result) {
					$('#accountNo').text(response.result.accountNo);
					$('#balance').text(format.addThousandComma(response.result.balance));
					let template = ``;

					for (var i = 0; i < response.result.accountHistoryList.length; i++) {
						let type = response.result.accountHistoryList[i].delta > 0 ? '<span class="text-primary">입금</span>' : '<span class="text-danger">출금</span>';
						let usingDate = response.result.accountHistoryList[i].usingDate;

						template += `<div class="history-unit">
										<span>${moment(usingDate).format('YYYY.MM.DD')}</span>
										<hr class="seperate-bar"/>
										<div class="position-relative" style="height: 30px;">
											<div class="position-absolute top-0 start-0">
												<span>${moment(usingDate).format('HH:mm:ss')}</span>
											</div>
											<div class="position-absolute top-0 end-0">
												<span>${type}</span>
											</div>
										</div>
										<div class="position-relative" style="height: 30px;">
											<div class="position-absolute top-0 start-0">
												<h5 class="fw-bold">${response.result.accountHistoryList[i].description}</h5>
											</div>
											<div class="position-absolute top-0 end-0">
												<span>${format.addThousandComma(response.result.accountHistoryList[i].delta)} 원</span>
											</div>
										</div>
										<div class="position-relative" style="height: 30px;">
											<div class="position-absolute top-0 end-0">
												<span>${format.addThousandComma(response.result.accountHistoryList[i].tempBalance)} 원</span>
											</div>
										</div>
									</div>`;

						if (i != response.result.accountHistoryList.length - 1) {
							template += '<hr />';
						}
					}

					$('#accountHistoryBody > div').append(template);
				}
			}
		);
	}

	#bindEvent() {
		
	}

	// Public functions
}

let accountBook = new AccountBook();