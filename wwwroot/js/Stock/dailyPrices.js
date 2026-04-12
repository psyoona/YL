// ============================================
// 일봉 수집 (dailyPrices.js)
// ============================================

class DailyPricesPage {
	constructor() {
		$('#btnCollectDailyPrices').on('click', () => this.collectDailyPrices());

		this.init();
	}

	init() {
		if (!$('#collectEndDate').val()) {
			const today = new Date();
			const oneYearAgo = new Date();
			oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
			$('#collectEndDate').val(today.toISOString().split('T')[0]);
			$('#collectStartDate').val(oneYearAgo.toISOString().split('T')[0]);
		}
	}

	async collectDailyPrices() {
		const startDate = $('#collectStartDate').val();
		const endDate = $('#collectEndDate').val();

		if (!startDate || !endDate) {
			await stockLayout.showModal('시작일과 종료일을 입력해주세요.');
			return;
		}

		if (startDate >= endDate) {
			await stockLayout.showModal('종료일은 시작일 이후여야 합니다.');
			return;
		}

		const confirmed = await stockLayout.showModal(
			`${startDate} ~ ${endDate} 기간의 일봉 데이터를 수집합니다.`,
			{
				type: 'confirm',
				sub: '감시 종목 수에 따라 시간이 소요됩니다. 진행하시겠습니까?',
				confirmText: '수집 시작',
				icon: 'fas fa-database'
			}
		);
		if (!confirmed) return;

		$('#btnCollectDailyPrices').prop('disabled', true);
		$('#collectLoading').show();
		$('#collectResults').hide();

		webServer.getData('/Stock/CollectDailyPrices', { startDate, endDate }, (response) => {
			$('#btnCollectDailyPrices').prop('disabled', false);
			$('#collectLoading').hide();
			$('#collectResults').show();

			$('#collectTotalStocks').text(response.totalStocks ? response.totalStocks + '개' : '-');
			$('#collectTotalRecords').text(response.totalRecords ? response.totalRecords.toLocaleString() + '건' : '-');

			const msgClass = response.success ? 'collect-message-success' : 'collect-message-error';
			$('#collectMessage').html(`<div class="${msgClass}">${stockLayout.escapeHtml(response.msg || '')}</div>`);

			if (response.errors && response.errors.length > 0) {
				let errHtml = '<h4><i class="fas fa-exclamation-triangle me-1"></i>오류 목록</h4><ul>';
				response.errors.forEach(e => {
					errHtml += `<li>${stockLayout.escapeHtml(e)}</li>`;
				});
				errHtml += '</ul>';
				$('#collectErrors').html(errHtml).show();
			} else {
				$('#collectErrors').hide();
			}
		});
	}
}

let dailyPricesPage;
$(function () { dailyPricesPage = new DailyPricesPage(); });
