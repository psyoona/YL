// ============================================
// Stock Manager - 코어 (네비게이션, 사이드바, 유틸리티)
// ============================================

class StockManager {
	constructor() {
		this.currentPage = 'stocks';
		this.deleteCallback = null;
		this.traderPollingTimer = null;

		this.bindCoreEvents();
	}

	// ============================================
	// 코어 이벤트 바인딩
	// ============================================

	bindCoreEvents() {
		// 사이드바 토글
		$('#menuToggle').on('click', () => this.openSidebar());
		$('#sidebarClose').on('click', () => this.closeSidebar());
		$('#sidebarOverlay').on('click', () => this.closeSidebar());

		// 네비게이션
		$('.nav-item').on('click', (e) => {
			e.preventDefault();
			const page = $(e.currentTarget).data('page');
			this.navigateTo(page);
		});

		// 로그아웃
		$('#btnLogout').on('click', (e) => {
			e.preventDefault();
			$('#logoutModal').fadeIn(200);
		});
		$('#logoutCancel').on('click', () => $('#logoutModal').fadeOut(200));
		$('#logoutConfirm').on('click', () => { window.location.href = '/Stock/Logout'; });

		// 삭제 모달
		$('#deleteModalCancel').on('click', () => this.closeDeleteModal());
		$('#deleteModalConfirm').on('click', () => {
			if (this.deleteCallback) {
				this.deleteCallback();
			}
			this.closeDeleteModal();
		});
	}

	// ============================================
	// 사이드바
	// ============================================

	openSidebar() {
		$('#sidebar').addClass('open');
		$('#sidebarOverlay').addClass('active');
	}

	closeSidebar() {
		$('#sidebar').removeClass('open');
		$('#sidebarOverlay').removeClass('active');
	}

	// ============================================
	// 네비게이션
	// ============================================

	navigateTo(page) {
		this.currentPage = page;
		this.closeSidebar();

		$('.nav-item').removeClass('active');
		$(`.nav-item[data-page="${page}"]`).addClass('active');

		$('.page-content').hide();
		$(`#page-${page}`).show();

		const titles = {
			stocks: '종목 관리',
			holdings: '보유 종목',
			orders: '주문 내역',
			logs: '거래 로그',
			trader: '자동매매 제어',
			backtest: '백테스트',
			collect: '일봉 수집',
			glossary: '용어 사전'
		};
		$('#pageTitle').text(titles[page]);

		// 자동매매 페이지 떠날 때 폴링 중지
		this.stopTraderPolling();

		switch (page) {
			case 'stocks': this.loadStocks(); break;
			case 'holdings': this.loadHoldings(); break;
			case 'orders': this.loadOrders(); break;
			case 'logs': this.loadTradeLogs(); break;
			case 'trader': this.loadTraderStatus(); this.startTraderPolling(); break;
			case 'backtest': this.initBacktest(); break;
			case 'collect': this.initCollect(); break;
			case 'glossary': this.initGlossary(); break;
		}
	}

	// ============================================
	// 삭제 모달
	// ============================================

	closeDeleteModal() {
		$('#deleteModal').fadeOut(200);
		this.deleteCallback = null;
	}

	// ============================================
	// 범용 모달
	// ============================================

	showModal(message, options = {}) {
		return new Promise((resolve) => {
			const { type = 'alert', icon = null, sub = null, confirmText = '확인', cancelText = '취소' } = options;
			const $modal = $('#commonModal');
			const $icon = $('#commonModalIcon');
			const $msg = $('#commonModalMessage');
			const $sub = $('#commonModalSub');
			const $cancel = $('#commonModalCancel');
			const $confirm = $('#commonModalConfirm');

			// 아이콘 설정
			if (icon) {
				$icon.attr('class', icon).css('color', '');
			} else if (type === 'confirm') {
				$icon.attr('class', 'fas fa-question-circle').css({ fontSize: '48px', color: 'var(--primary-light)' });
			} else {
				$icon.attr('class', 'fas fa-exclamation-circle').css({ fontSize: '48px', color: 'var(--accent)' });
			}

			$msg.text(message);

			if (sub) {
				$sub.text(sub).show();
			} else {
				$sub.hide();
			}

			$confirm.text(confirmText);
			$cancel.text(cancelText);

			if (type === 'confirm') {
				$cancel.show();
				$confirm.attr('class', 'btn-modal-confirm');
			} else {
				$cancel.hide();
				$confirm.attr('class', 'btn-modal-confirm');
			}

			// 이벤트 바인딩 (한 번만)
			$confirm.off('click').on('click', () => { $modal.fadeOut(200); resolve(true); });
			$cancel.off('click').on('click', () => { $modal.fadeOut(200); resolve(false); });

			$modal.fadeIn(200);
		});
	}

	// ============================================
	// 유틸리티
	// ============================================

	escapeHtml(str) {
		if (!str) return '';
		const div = document.createElement('div');
		div.textContent = str;
		return div.innerHTML;
	}

	escapeAttr(str) {
		if (!str) return '';
		return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
	}

	formatDate(dateStr) {
		if (!dateStr) return '-';
		const d = new Date(dateStr);
		const pad = n => String(n).padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
	}
}

let stockManager = new StockManager();

// 모든 defer 스크립트 로드 후 초기 페이지 로딩
$(function () {
	stockManager.loadStocks();
});
