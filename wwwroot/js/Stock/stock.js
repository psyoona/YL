class StockManager {
	constructor() {
		this.currentPage = 'stocks';
		this.deleteCallback = null;

		this.bindEvents();
		this.loadStocks();
	}

	// ============================================
	// 이벤트 바인딩
	// ============================================

	bindEvents() {
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

		// 종목 추가
		$('#btnAddStock').on('click', () => this.openStockModal());
		$('#stockModalCancel').on('click', () => this.closeStockModal());
		$('#stockModalConfirm').on('click', () => this.saveStock());

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
			logs: '거래 로그'
		};
		$('#pageTitle').text(titles[page]);

		switch (page) {
			case 'stocks': this.loadStocks(); break;
			case 'holdings': this.loadHoldings(); break;
			case 'orders': this.loadOrders(); break;
			case 'logs': this.loadTradeLogs(); break;
		}
	}

	// ============================================
	// 종목 관리
	// ============================================

	loadStocks() {
		webServer.getData('/Stock/GetStocks', null, (response) => {
			const stocks = response.stocks || [];
			$('#stockCount').text(`총 ${stocks.length}개 종목`);

			if (stocks.length === 0) {
				$('#stockTable').hide();
				$('#stockEmpty').show();
				return;
			}

			$('#stockEmpty').hide();
			$('#stockTable').show();

			let html = '';
			stocks.forEach(s => {
				const activeBadge = s.isActive
					? '<span class="badge badge-active">활성</span>'
					: '<span class="badge badge-inactive">비활성</span>';
				const watchBadge = s.isWatchList
					? '<span class="badge badge-watch">감시</span>'
					: '<span class="badge" style="opacity:0.4;">-</span>';

				html += `<tr>
					<td data-label="종목코드">${this.escapeHtml(s.stockCode)}</td>
					<td data-label="종목명">${this.escapeHtml(s.stockName)}</td>
					<td data-label="시장">${this.escapeHtml(s.marketType)}</td>
					<td data-label="상태">${activeBadge}</td>
					<td data-label="감시">${watchBadge}</td>
					<td data-label="관리">
						<div class="btn-action-group">
							<button class="btn-table-action edit" title="수정" onclick="stockManager.openStockModal('${this.escapeAttr(s.stockCode)}', '${this.escapeAttr(s.stockName)}', '${this.escapeAttr(s.marketType)}', ${s.isActive}, ${s.isWatchList})">
								<i class="fas fa-pen"></i>
							</button>
							<button class="btn-table-action delete" title="삭제" onclick="stockManager.confirmDeleteStock('${this.escapeAttr(s.stockCode)}', '${this.escapeAttr(s.stockName)}')">
								<i class="fas fa-trash"></i>
							</button>
						</div>
					</td>
				</tr>`;
			});

			$('#stockTableBody').html(html);
		});
	}

	openStockModal(stockCode, stockName, marketType, isActive, isWatchList) {
		if (stockCode) {
			$('#stockModalTitle').html('<i class="fas fa-edit me-2"></i>종목 수정');
			$('#modalStockCode').val(stockCode).prop('readonly', true);
			$('#modalStockName').val(stockName);
			$('#modalMarketType').val(marketType);
			$('#modalIsActive').prop('checked', isActive);
			$('#modalIsWatchList').prop('checked', isWatchList);
			$('#stockEditFields').show();
		} else {
			$('#stockModalTitle').html('<i class="fas fa-plus-circle me-2"></i>종목 추가');
			$('#modalStockCode').val('').prop('readonly', false);
			$('#modalStockName').val('');
			$('#modalMarketType').val('KOSPI');
			$('#modalIsActive').prop('checked', true);
			$('#modalIsWatchList').prop('checked', false);
			$('#stockEditFields').hide();
		}
		$('#stockModal').fadeIn(200);
		if (!stockCode) $('#modalStockCode').focus();
	}

	closeStockModal() {
		$('#stockModal').fadeOut(200);
	}

	saveStock() {
		const stockCode = $('#modalStockCode').val().trim();
		const stockName = $('#modalStockName').val().trim();
		const marketType = $('#modalMarketType').val();
		const isEditing = $('#modalStockCode').prop('readonly');

		if (!stockCode) {
			$('#modalStockCode').focus();
			return;
		}
		if (!stockName) {
			$('#modalStockName').focus();
			return;
		}

		if (isEditing) {
			const isActive = $('#modalIsActive').is(':checked');
			const isWatchList = $('#modalIsWatchList').is(':checked');

			webServer.getData('/Stock/UpdateStock', {
				stockCode, stockName, marketType, isActive, isWatchList
			}, (response) => {
				if (response.success) {
					this.closeStockModal();
					this.loadStocks();
				}
			});
		} else {
			webServer.getData('/Stock/CreateStock', {
				stockCode, stockName, marketType
			}, (response) => {
				if (response.success) {
					this.closeStockModal();
					this.loadStocks();
				}
			});
		}
	}

	confirmDeleteStock(stockCode, stockName) {
		$('#deleteMessage').text(`'${stockName}' (${stockCode}) 종목을 비활성화하시겠습니까?`);
		this.deleteCallback = () => {
			webServer.getData('/Stock/DeleteStock', { stockCode }, (response) => {
				if (response.success) {
					this.loadStocks();
				}
			});
		};
		$('#deleteModal').fadeIn(200);
	}

	// ============================================
	// 보유 종목
	// ============================================

	loadHoldings() {
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
	}

	// ============================================
	// 주문 내역
	// ============================================

	loadOrders() {
		webServer.getData('/Stock/GetOrders', null, (response) => {
			const orders = response.orders || [];
			$('#orderCount').text(`총 ${orders.length}건`);

			if (orders.length === 0) {
				$('#orderTable').hide();
				$('#orderEmpty').show();
				return;
			}

			$('#orderEmpty').hide();
			$('#orderTable').show();

			let html = '';
			orders.forEach(o => {
				const typeBadge = o.orderType === 'BUY'
					? '<span class="badge badge-buy">매수</span>'
					: '<span class="badge badge-sell">매도</span>';

				let statusBadge = '';
				switch (o.orderStatus) {
					case 'PENDING': statusBadge = '<span class="badge badge-pending">대기</span>'; break;
					case 'FILLED': statusBadge = '<span class="badge badge-filled">체결</span>'; break;
					case 'PARTIAL': statusBadge = '<span class="badge badge-pending">부분체결</span>'; break;
					case 'CANCELLED': statusBadge = '<span class="badge badge-cancelled">취소</span>'; break;
					case 'FAILED': statusBadge = '<span class="badge badge-failed">실패</span>'; break;
					default: statusBadge = `<span class="badge">${this.escapeHtml(o.orderStatus)}</span>`;
				}

				html += `<tr>
					<td data-label="주문번호">${this.escapeHtml(o.orderNo || '-')}</td>
					<td data-label="종목">${this.escapeHtml(o.stockName)} <small style="color:var(--text-muted)">${this.escapeHtml(o.stockCode)}</small></td>
					<td data-label="구분">${typeBadge}</td>
					<td data-label="주문가">${o.orderPrice.toLocaleString()}</td>
					<td data-label="주문수량">${o.orderQuantity.toLocaleString()}</td>
					<td data-label="체결수량">${o.filledQuantity.toLocaleString()}</td>
					<td data-label="상태">${statusBadge}</td>
					<td data-label="일시">${this.formatDate(o.createdAt)}</td>
				</tr>`;
			});

			$('#orderTableBody').html(html);
		});
	}

	// ============================================
	// 거래 로그
	// ============================================

	loadTradeLogs() {
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
					default: levelBadge = `<span class="badge">${this.escapeHtml(l.logLevel)}</span>`;
				}

				html += `<tr>
					<td data-label="레벨">${levelBadge}</td>
					<td data-label="메시지" style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${this.escapeHtml(l.message)}</td>
					<td data-label="종목코드">${this.escapeHtml(l.stockCode || '-')}</td>
					<td data-label="일시">${this.formatDate(l.createdAt)}</td>
				</tr>`;
			});

			$('#logTableBody').html(html);
		});
	}

	// ============================================
	// 삭제 모달
	// ============================================

	closeDeleteModal() {
		$('#deleteModal').fadeOut(200);
		this.deleteCallback = null;
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
