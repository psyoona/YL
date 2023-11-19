class SelectControl {
	// Private vairables

	// Public Const
	

	// Private const
	

	// Public event functions
	

	// Private event functions
	

	// Private variables
	

	// Public functions
	clearSelectList(targets) {
		for (var i = 0; i < targets.length; i++) {
			$(targets[i]).find('[data-tokens]').remove()
			$(targets[i]).selectpicker('destroy');
			$(targets[i]).selectpicker({ liveSearch: true });
		}
	}

	setSelectList(dataList, target, valueName, textName, noLiveSearch) {
		target.find('[data-tokens]').remove();
		target.selectpicker('destroy');
		target.selectpicker({ liveSearch: !noLiveSearch });

		if (dataList) {
			for (var i = 0; i < dataList.length; i++) {
				target.append(`<option data-tokens="${dataList[i][valueName]}">${dataList[i][textName]}</option>`);
			}

			target.selectpicker('refresh');
		}
	}

	getSelectedToken(target) {
		let selectedToken = null;
		let selectedOptions = target.find('option:selected');

		if (selectedOptions && selectedOptions.length) {
			selectedToken = selectedOptions.eq(0).data('tokens');
		}

		return selectedToken;
	}

	getSelectedTokens(target) {
		let selectedTokens = [];
		let selectedOptions = target.find('option:selected');

		if (selectedOptions && selectedOptions.length) {
			for (var i = 0; i < selectedOptions.length; i++) {
				selectedTokens.push(selectedOptions.eq(i).data('tokens'));
			}
		}

		return selectedTokens;
	}

	getSelectedValue(target) {
		let selectedValue = [];
		let selectedOptions = target.find('option:selected');

		if (selectedOptions && selectedOptions.length) {
			selectedValue = selectedOptions.eq(0).val();
		}

		return selectedValue;
	}

	getSelectedValues(target) {
		let selectedValues = [];
		let selectedOptions = target.find('option:selected');

		if (selectedOptions && selectedOptions.length) {
			for (var i = 0; i < selectedOptions.length; i++) {
				selectedValues.push(selectedOptions.eq(i).val());
			}
		}

		return selectedValues;
	}

	selectItem(target, token) {
		let value = target.find('[data-tokens="' + token + '"]').val();

		target.selectpicker('val', value);
	}
};

let selectControl = new SelectControl();