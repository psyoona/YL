// ============================================
// 자동매매 제어 (trader.js)
// ============================================

$(function () {
	$('#btnStartTrader').on('click', () => $('#traderStartModal').fadeIn(200));
	$('#traderStartCancel').on('click', () => $('#traderStartModal').fadeOut(200));
	$('#traderStartConfirm').on('click', () => {
		$('#traderStartModal').fadeOut(200);
		stockManager.startTrader();
	});

	$('#btnStopTrader').on('click', () => $('#traderStopModal').fadeIn(200));
	$('#traderStopCancel').on('click', () => $('#traderStopModal').fadeOut(200));
	$('#traderStopConfirm').on('click', () => {
		$('#traderStopModal').fadeOut(200);
		stockManager.stopTrader();
	});

	$('#btnRefreshLogs').on('click', () => stockManager.loadTraderStatus());
});

StockManager.prototype.loadTraderStatus = function () {
	webServer.getData('/Stock/GetTraderStatus', null, (response) => {
		this.updateTraderUI(response);
	});
};

StockManager.prototype.updateTraderUI = function (status) {
	const running = status.isRunning;
	const $card = $('#traderStatusCard');
	const $dot = $('#statusDot');
	const $text = $('#statusText');

	if (running) {
		$card.removeClass('stopped').addClass('running');
		$dot.removeClass('dot-stopped').addClass('dot-running');
		$text.text('실행 중');
		$('#btnStartTrader').prop('disabled', true);
		$('#btnStopTrader').prop('disabled', false);
	} else {
		$card.removeClass('running').addClass('stopped');
		$dot.removeClass('dot-running').addClass('dot-stopped');
		$text.text('중지됨');
		$('#btnStartTrader').prop('disabled', false);
		$('#btnStopTrader').prop('disabled', true);
	}

	$('#traderPid').text(status.pid || '-');
	$('#traderStartedAt').text(status.startedAt || '-');
	$('#traderUptime').text(status.uptime || '-');
	$('#traderExePath').text(status.exePath || '-');

	// 콘솔 로그 업데이트
	const $console = $('#traderConsole');
	if (status.logs && status.logs.length > 0) {
		const el = $console[0];
		const wasAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 30;

		let logHtml = '';
		status.logs.forEach(line => {
			let cls = 'log-line';
			if (line.includes('[ERROR]')) cls += ' log-error';
			else if (line.includes('매수') || line.includes('시작')) cls += ' log-success';
			else if (line.includes('매도') || line.includes('중지') || line.includes('종료')) cls += ' log-warn';
			logHtml += `<div class="${cls}">${stockManager.escapeHtml(line)}</div>`;
		});
		$console.html(logHtml);

		if (running && wasAtBottom) {
			$console.scrollTop(el.scrollHeight);
		}
	} else {
		$console.html('<div class="console-empty">로그가 없습니다</div>');
	}
};

StockManager.prototype.startTrader = function () {
	$('#btnStartTrader').prop('disabled', true);
	webServer.getData('/Stock/StartTrader', null, (response) => {
		this.loadTraderStatus();
	});
};

StockManager.prototype.stopTrader = function () {
	$('#btnStopTrader').prop('disabled', true);
	webServer.getData('/Stock/StopTrader', null, (response) => {
		this.loadTraderStatus();
	});
};

StockManager.prototype.startTraderPolling = function () {
	this.stopTraderPolling();
	this.traderPollingTimer = setInterval(() => {
		this.loadTraderStatus();
	}, 5000);
};

StockManager.prototype.stopTraderPolling = function () {
	if (this.traderPollingTimer) {
		clearInterval(this.traderPollingTimer);
		this.traderPollingTimer = null;
	}
};
