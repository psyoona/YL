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
					default: statusBadge = `<span class="badge">${stringUtility.escapeHtml(o.orderStatus)}</span>`;
				}

				html += `<tr>
					<td data-label="주문번호">${stringUtility.escapeHtml(o.orderNo || '-')}</td>
					<td data-label="종목">${stringUtility.escapeHtml(o.stockName)} <small style="color:var(--text-muted)">${stringUtility.escapeHtml(o.stockCode)}</small></td>
					<td data-label="구분">${typeBadge}</td>
					<td data-label="주문가">${o.orderPrice.toLocaleString()}</td>
					<td data-label="주문수량">${o.orderQuantity.toLocaleString()}</td>
					<td data-label="체결수량">${o.filledQuantity.toLocaleString()}</td>
					<td data-label="상태">${statusBadge}</td>
					<td data-label="일시">${format.formatDate(o.createdAt)}</td>
				</tr>`;
			});

			$('#orderTableBody').html(html);
		});
	}
}

let ordersPage;
$(function () { ordersPage = new OrdersPage(); });
