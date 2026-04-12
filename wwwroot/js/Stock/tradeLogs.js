// ============================================
// 거래 로그 (tradeLogs.js)
// ============================================

class TradeLogsPage {
	constructor() {
		this.load();
	}

	load() {
		webServer.getData('/Stock/GetTradeLogs', null, (response) => {
			const logs = response.logs || [];
			$('#logCount').text(`최근 ${logs.length}건`);

			if (logs.length === 0) {
				$('#logTable').hide();
				$('#logEmpty').show();
				return;
			}

			$('#logEmpty').hide();
			$('#logTable').show();

			let html = '';
			logs.forEach(l => {
				let levelBadge = '';
				switch (l.logLevel) {
					case 'INFO': levelBadge = '<span class="badge badge-info">INFO</span>'; break;
					case 'WARN': levelBadge = '<span class="badge badge-warn">WARN</span>'; break;
					case 'ERROR': levelBadge = '<span class="badge badge-error">ERROR</span>'; break;
					default: levelBadge = `<span class="badge">${stockLayout.escapeHtml(l.logLevel)}</span>`;
				}

				html += `<tr>
					<td data-label="레벨">${levelBadge}</td>
					<td data-label="메시지" style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${stockLayout.escapeHtml(l.message)}</td>
					<td data-label="종목코드">${stockLayout.escapeHtml(l.stockCode || '-')}</td>
					<td data-label="일시">${stockLayout.formatDate(l.createdAt)}</td>
				</tr>`;
			});

			$('#logTableBody').html(html);
		});
	}
}

let tradeLogsPage;
$(function () { tradeLogsPage = new TradeLogsPage(); });
