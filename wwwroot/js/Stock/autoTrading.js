// ============================================
// 자동매매 제어 (autoTrading.js)
// ============================================

class AutoTradingPage {
	constructor() {
		this.pollingTimer = null;
		this.lastLogHash = '';

		$('#btnStartTrader').on('click', () => $('#traderStartModal').fadeIn(200));
		$('#traderStartCancel').on('click', () => $('#traderStartModal').fadeOut(200));
		$('#traderStartConfirm').on('click', () => {
			$('#traderStartModal').fadeOut(200);
			this.start();
		});

		$('#btnStopTrader').on('click', () => $('#traderStopModal').fadeIn(200));
		$('#traderStopCancel').on('click', () => $('#traderStopModal').fadeOut(200));
		$('#traderStopConfirm').on('click', () => {
			$('#traderStopModal').fadeOut(200);
			this.stop();
		});

		$('#btnRefreshLogs').on('click', () => this.loadStatus());

		// 페이지 이탈 시 폴링 정리
		$(window).on('beforeunload.autoTrading', () => this.stopPolling());

		this.loadStatus();
		this.startPolling();
	}

	loadStatus() {
		webServer.getData('/Stock/GetTraderStatus', null, (response) => {
			this.updateUI(response);
		});
	}

	updateUI(status) {
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

		// 로그가 변경된 경우에만 DOM 업데이트
		const $console = $('#traderConsole');
		if (status.logs && status.logs.length > 0) {
			const newHash = status.logs[status.logs.length - 1] + status.logs.length;
			if (newHash === this.lastLogHash) return;
			this.lastLogHash = newHash;

			const el = $console[0];
			const wasAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 30;

			let logHtml = '';
			status.logs.forEach(line => {
				let cls = 'log-line';
				if (line.includes('[ERROR]')) cls += ' log-error';
				else if (line.includes('매수') || line.includes('시작')) cls += ' log-success';
				else if (line.includes('매도') || line.includes('중지') || line.includes('종료')) cls += ' log-warn';
				logHtml += `<div class="${cls}">${stockLayout.escapeHtml(line)}</div>`;
			});
			$console.html(logHtml);

			if (running && wasAtBottom) {
				$console.scrollTop(el.scrollHeight);
			}
		} else {
			this.lastLogHash = '';
			$console.html('<div class="console-empty">로그가 없습니다</div>');
		}
	}

	start() {
		$('#btnStartTrader').prop('disabled', true);
		webServer.getData('/Stock/StartTrader', null, () => this.loadStatus());
	}

	stop() {
		$('#btnStopTrader').prop('disabled', true);
		webServer.getData('/Stock/StopTrader', null, () => this.loadStatus());
	}

	startPolling() {
		this.stopPolling();
		this.pollingTimer = setInterval(() => this.loadStatus(), 10000);
	}

	stopPolling() {
		if (this.pollingTimer) {
			clearInterval(this.pollingTimer);
			this.pollingTimer = null;
		}
	}
}

let autoTradingPage;
$(function () { autoTradingPage = new AutoTradingPage(); });
