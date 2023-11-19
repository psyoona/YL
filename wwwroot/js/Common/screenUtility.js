class ScreenUtility {
	// Constructor
	constructor() {
	}

	// Public variables
	forceExecute = false;

	// Private variables
	#clickedConfirm = false;
	#clickedCancel = false;

	// Public Const
	KEY_CODE = {
		ENTER: 13
	};

	// Private const

	// Private functions

	// Public event functions
	enter_onKeyup(e, callback) {
		if (e.keyCode == this.KEY_CODE.ENTER) {
			if (callback) {
				callback();
			}
		}
	}

	// Private event functions

	// Public functions
	changeContents(html) {
		$('#contents').children().remove();
		this.hideContents();
		$(html).appendTo('#contents');
	}

	hideContents() {
		$('#contents').addClass('no-display');
	}

	showContents() {
		$('#contents').removeClass('no-display');
	}

	bindText() {
		let bindTargets = $('span[data-language-code]');

		for (var i = 0; i < bindTargets.length; i++) {
			let description = messageUtility.getDescription(bindTargets.eq(i).data('language-code'));

			bindTargets.eq(i).text(description);
		}

		bindTargets = $('label[data-language-code');

		for (var i = 0; i < bindTargets.length; i++) {
			let description = messageUtility.getDescription(bindTargets.eq(i).data('language-code'));

			bindTargets.eq(i).text(description);
		}

		bindTargets = $('input[data-language-code');

		for (var i = 0; i < bindTargets.length; i++) {
			let description = messageUtility.getDescription(bindTargets.eq(i).data('language-code'));

			bindTargets.eq(i).attr('placeholder', description);
		}

		bindTargets = $('select[data-language-code');

		for (var i = 0; i < bindTargets.length; i++) {
			let description = messageUtility.getDescription(bindTargets.eq(i).data('language-code'));

			bindTargets.eq(i).attr('title', description);
		}
	}

	showDialog(options) {
		$('#showModal').off('hidden');
		$('#infoFooter').children().remove();

		$('#modalBody').text(options.message);

		let footer = ``;

		if (options.type == messageUtility.TYPES.QUESTION) {
			// L0004: 확인, L0005: 취소
			footer = `<button id="infoCancel" type="button" class="col-12 col-sm-auto btn btn-sm btn-secondary sub_bt3 m-1">
							<span data-language-code="L1195"></span>
						</button>
						<button id="infoConfirm" type="button" class="col-12 col-sm-auto btn btn-sm btn-primary sub_bt3 m-1">
							<span data-language-code="L1194"></span>
						</button>`;
		} else if (options.type == messageUtility.TYPES.INFORMATION) {
			footer = `<button id="infoConfirm" type="button" class="col-12 col-sm-auto btn btn-sm btn-primary sub_bt3 m-1">
							<span data-language-code="L1194"></span>
						</button>`;
		}

		$(footer).appendTo($('#infoFooter'));
		this.bindText();

		// Binding event
		$('#infoConfirm').click((e) => {
			this.#clickedConfirm = true;
			this.hideModal();

			if (options.confirmCallback) {
				options.confirmCallback();
			}
		});

		$('#infoCancel').click((e) => {
			if (options.cancelCallback) {
				options.cancelCallback();
			}

			this.#clickedCancel = true;
			this.hideModal();
		});

		$('#showModal').on('hidden.bs.modal', (e) => {
			if (options.type == messageUtility.TYPES.QUESTION) {
				if (this.#clickedCancel && options.cancelCallback) {
					options.cancelCallback();
				}
			} else {
				if (this.#clickedConfirm && options.confirmCallback) {
					options.confirmCallback();
				}
			}

			this.#clickedConfirm = false;
			this.#clickedCancel = false;
		});

		this.showModal();
	}

	showModal() {
		$('#showModal').modal('show');
		$('#showModal').focus();
	}

	hideModal() {
		$('#showModal').modal('hide');
	}

	showLoading() {
		$('#loadingSpinner').show();
	}

	hideLoading() {
		$('#loadingSpinner').hide();
	}

	activeFirstMenuEffect(target) {
		target.parent().parent().children().removeClass('hw_main_menu_active');
		target.parent().addClass('hw_main_menu_active');
	}

	activeSecondMenuEffect(target) {
		$('.second-menu').removeClass('active_color1');
		$('.second-menu').addClass('hw_menu_ex_s_color');

		target.closest('a').removeClass('hw_menu_ex_s_color');
		target.closest('a').addClass('active_color1');
	}

	inactiveFirstMenuEffect() {
		$('#topMenuWrapper div.hw_main_menu_active').removeClass('hw_main_menu_active');
	}

	inactiveSecondMenuEffect() {
		$('.second-menu').addClass('hw_menu_ex_s_color');
		$('.second-menu').removeClass('active_color1');
	}
};

let screenUtility = new ScreenUtility();