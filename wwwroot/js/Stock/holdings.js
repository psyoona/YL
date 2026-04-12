// ============================================
// 보유 종목 (holdings.js)
// ============================================

StockManager.prototype.loadHoldings = function () {
	webServer.getData('/Stock/GetHoldings', null, (response) => {
		const holdings = response.holdings || [];
		$('#holdingCount').text(`총 ${holdings.length}개 보유`);

		if (holdings.length === 0) {
			$('#holdingTable').hide();
			$('#holdingEmpty').show();
			return;
		}

		$('#holdingEmpty').hide();
		$('#holdingTable').show();

		let html = '';
		holdings.forEach(h => {
			const rate = h.profitLossRate;
			let rateClass = 'profit-zero';
			let rateText = '-';
			if (rate !== null && rate !== undefined) {
				if (rate > 0) { rateClass = 'profit-positive'; rateText = `+${rate.toFixed(2)}%`; }
				else if (rate < 0) { rateClass = 'profit-negative'; rateText = `${rate.toFixed(2)}%`; }
				else { rateText = '0.00%'; }
			}

			html += `<tr>
				<td data-label="종목코드">${this.escapeHtml(h.stockCode)}</td>
				<td data-label="종목명">${this.escapeHtml(h.stockName)}</td>
				<td data-label="수량">${h.quantity.toLocaleString()}</td>
				<td data-label="평균단가">${h.avgBuyPrice.toLocaleString()}</td>
				<td data-label="현재가">${h.currentPrice ? h.currentPrice.toLocaleString() : '-'}</td>
				<td data-label="수익률"><span class="${rateClass}">${rateText}</span></td>
			</tr>`;
		});

		$('#holdingTableBody').html(html);
	});
};
