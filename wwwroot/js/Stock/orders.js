// ============================================
// 주문 내역 (orders.js)
// ============================================

class OrdersPage {
	constructor() {
		this.load();
	}

	load() {
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
				const money = value => value === null || value === undefined
					? '-'
					: Number(value).toLocaleString();
				const typeBadge = o.orderType === 'BUY'
					? '<span class="badge badge-buy">매수</span>'
					: '<span class="badge badge-sell">매도</span>';

				let statusBadge = '';
				switch (o.orderStatus) {
					case 'PENDING': statusBadge = '<span class="badge badge-pending">대기</span>'; break;
					case 'ACCEPTED': statusBadge = '<span class="badge badge-pending">접수</span>'; break;
					case 'FILLED': statusBadge = '<span class="badge badge-filled">체결</span>'; break;
					case 'PARTIAL': statusBadge = '<span class="badge badge-pending">부분체결</span>'; break;
					case 'CANCELLED': statusBadge = '<span class="badge badge-cancelled">취소</span>'; break;
					case 'FAILED': statusBadge = '<span class="badge badge-failed">실패</span>'; break;
					default: statusBadge = `<span class="badge">${stringUtility.escapeHtml(o.orderStatus)}</span>`;
				}

				const tradingCost = Number(o.estimatedCommission || 0) + Number(o.estimatedTax || 0);
				const netProfit = o.netRealizedProfit;
				const profitClass = netProfit > 0
					? 'profit-positive'
					: netProfit < 0 ? 'profit-negative' : '';
				const profitText = netProfit === null || netProfit === undefined
					? '-'
					: `${netProfit > 0 ? '+' : ''}${money(netProfit)}`;
				const reconciliationNote = stringUtility.escapeHtml(o.reconciliationNote || '-');
				const reconciledAt = o.lastReconciledAt ? format.formatDate(o.lastReconciledAt) : '-';

				html += `<tr>
					<td data-label="주문번호">${stringUtility.escapeHtml(o.orderNo || '-')}</td>
					<td data-label="종목">${stringUtility.escapeHtml(o.stockName)} <small style="color:var(--text-muted)">${stringUtility.escapeHtml(o.stockCode)}</small></td>
					<td data-label="구분">${typeBadge}</td>
					<td data-label="주문가">${money(o.orderPrice)}</td>
					<td data-label="주문수량">${money(o.orderQuantity)}</td>
					<td data-label="체결수량">${money(o.filledQuantity)}</td>
					<td data-label="평균체결가">${money(o.filledPrice)}</td>
					<td data-label="상태">${statusBadge}</td>
					<td data-label="예상비용">${money(tradingCost)}</td>
					<td data-label="순실현손익" class="${profitClass}">${profitText}</td>
					<td data-label="최종대사" title="${reconciliationNote}">${reconciledAt}</td>
					<td data-label="일시">${format.formatDate(o.createdAt)}</td>
				</tr>`;
			});

			$('#orderTableBody').html(html);
		});
	}
}

let ordersPage;
$(function () { ordersPage = new OrdersPage(); });
