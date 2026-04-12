// ============================================
// Stock Layout - 공통 (사이드바, 모달, 유틸리티)
// ============================================

class StockLayout {
	constructor() {
		this.deleteCallback = null;
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

		// 모바일에서 메뉴 클릭 시 사이드바 닫기
		$('.nav-item').on('click', () => this.closeSidebar());

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
	// 삭제 모달
	// ============================================

	openDeleteModal(message, callback) {
		$('#deleteMessage').text(message);
		this.deleteCallback = callback;
		$('#deleteModal').fadeIn(200);
	}

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

			const iconStyle = 'font-size:48px; margin-bottom:16px;';
			if (icon) {
				$icon.replaceWith(`<i id="commonModalIcon" class="${icon}" style="${iconStyle} color:var(--primary-light);"></i>`);
			} else if (type === 'confirm') {
				$icon.replaceWith(`<i id="commonModalIcon" class="fas fa-question-circle" style="${iconStyle} color:var(--primary-light);"></i>`);
			} else {
				$icon.replaceWith(`<i id="commonModalIcon" class="fas fa-exclamation-circle" style="${iconStyle} color:var(--accent);"></i>`);
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

let stockLayout;

$(function () {
	stockLayout = new StockLayout();
});
