// ============================================
// 백테스트 (backtest.js)
// ============================================

$(function () {
	$('#btnRunBacktest').on('click', () => stockManager.runBacktest());
	$('#btnToggleBtLog').on('click', () => {
		$('#btLogBody').slideToggle(200);
		$('#btnToggleBtLog i').toggleClass('fa-chevron-down fa-chevron-up');
	});
});

StockManager.prototype.initBacktest = function () {
	if (!$('#btEndDate').val()) {
		const today = new Date();
		const sixMonthsAgo = new Date();
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
		$('#btEndDate').val(today.toISOString().split('T')[0]);
		$('#btStartDate').val(sixMonthsAgo.toISOString().split('T')[0]);
	}
};

StockManager.prototype.runBacktest = async function () {
	const startDate = $('#btStartDate').val();
	const endDate = $('#btEndDate').val();
	const capital = parseInt($('#btCapital').val()) || 10000000;

	if (!startDate || !endDate) {
		await this.showModal('시작일과 종료일을 입력해주세요.');
		return;
	}

	if (startDate >= endDate) {
		await this.showModal('종료일은 시작일 이후여야 합니다.');
		return;
	}

	$('#btnRunBacktest').prop('disabled', true);
	$('#backtestLoading').show();
	$('#backtestResults').hide();

	webServer.getData('/Stock/RunBacktest', { startDate, endDate, capital }, async (response) => {
		$('#btnRunBacktest').prop('disabled', false);
		$('#backtestLoading').hide();

		if (!response.success) {
			await this.showModal(response.msg || '백테스트 실행에 실패했습니다.');
			return;
		}

		this.displayBacktestResults(response);
	});
};

StockManager.prototype.displayBacktestResults = function (data) {
	$('#backtestResults').show();

	// 요약 지표
	const returnVal = data.totalReturn;
	const returnClass = returnVal > 0 ? 'profit-positive' : returnVal < 0 ? 'profit-negative' : '';
	$('#btTotalReturn').html(`<span class="${returnClass}">${returnVal > 0 ? '+' : ''}${returnVal}%</span>`);
	$('#btFinalCapital').text(Number(data.finalCapital).toLocaleString() + '원');
	$('#btWinRate').text(data.winRate + '%');
	$('#btTotalTrades').text(`${data.totalTrades}회 (${data.winningTrades}승 ${data.losingTrades}패)`);
	$('#btMDD').html(`<span class="profit-negative">-${data.maxDrawdownPercent}%</span>`);
	$('#btProfitFactor').text(data.profitFactor);
	$('#btAvgWin').html(`<span class="profit-positive">+${data.avgWinPercent}%</span>`);
	$('#btAvgLoss').html(`<span class="profit-negative">${data.avgLossPercent}%</span>`);

	// 거래 내역
	const trades = data.trades || [];
	let html = '';
	trades.forEach(t => {
		const plClass = t.profitLossPercent > 0 ? 'profit-positive' : t.profitLossPercent < 0 ? 'profit-negative' : '';
		const plText = t.profitLossPercent !== null ? `${t.profitLossPercent > 0 ? '+' : ''}${t.profitLossPercent}%` : '-';
		html += `<tr>
			<td data-label="종목">${stockManager.escapeHtml(t.stockCode)}</td>
			<td data-label="매수일">${t.buyDate || '-'}</td>
			<td data-label="매수가">${Number(t.buyPrice).toLocaleString()}</td>
			<td data-label="수량">${t.quantity}</td>
			<td data-label="매도일">${t.sellDate || '-'}</td>
			<td data-label="매도가">${t.sellPrice ? Number(t.sellPrice).toLocaleString() : '-'}</td>
			<td data-label="수익률"><span class="${plClass}">${plText}</span></td>
			<td data-label="사유" style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${stockManager.escapeHtml(t.sellReason || '-')}</td>
		</tr>`;
	});
	$('#btTradeTableBody').html(html);

	// 실행 로그
	const logs = data.log || [];
	let logHtml = '';
	logs.forEach(line => {
		let cls = 'log-line';
		if (line.includes('매도') || line.includes('손절')) cls += ' log-warn';
		else if (line.includes('매수')) cls += ' log-success';
		else if (line.includes('====') || line.includes('결과')) cls += ' log-success';
		logHtml += `<div class="${cls}">${stockManager.escapeHtml(line)}</div>`;
	});
	$('#btLogBody').html(logHtml);
};
