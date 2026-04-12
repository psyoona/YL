// ============================================
// 종목 관리 (stocks.js)
// ============================================

$(function () {
	$('#btnAddStock').on('click', () => stockManager.openStockModal());
	$('#stockModalCancel').on('click', () => stockManager.closeStockModal());
	$('#stockModalConfirm').on('click', () => stockManager.saveStock());
});

StockManager.prototype.loadStocks = function () {
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
};

StockManager.prototype.openStockModal = function (stockCode, stockName, marketType, isActive, isWatchList) {
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
};

StockManager.prototype.closeStockModal = function () {
	$('#stockModal').fadeOut(200);
};

StockManager.prototype.saveStock = function () {
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
};

StockManager.prototype.confirmDeleteStock = function (stockCode, stockName) {
	$('#deleteMessage').text(`'${stockName}' (${stockCode}) 종목을 비활성화하시겠습니까?`);
	this.deleteCallback = () => {
		webServer.getData('/Stock/DeleteStock', { stockCode }, (response) => {
			if (response.success) {
				this.loadStocks();
			}
		});
	};
	$('#deleteModal').fadeIn(200);
};
