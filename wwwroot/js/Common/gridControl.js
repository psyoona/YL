class GridControl {
	// Private vairables

	// Public Const
	

	// Private const
	

	// Public event functions
	

	// Private event functions
	bindPagination(total, searchCriterias, searchFunction) {
		$('#pagination').children().remove();

		let totalPage = parseInt(total / searchCriterias.pageSize) + ((total % searchCriterias.pageSize) == 0 ? 0 : 1);

		let startPage = 0;
		let showToPage = 0;
		let leftPager = ``;
		let middlePager = ``;
		let rightPager = ``;

		if (searchCriterias.page % 10 == 0) {
			startPage = ((parseInt(searchCriterias.page / 10 - 1)) * 10) + 1;
		} else {
			startPage = (parseInt(searchCriterias.page / 10) * 10) + 1;
		}

		if (startPage + 9 > totalPage) {
			showToPage = totalPage;
		} else {
			showToPage = startPage + 9;
		}

		if (searchCriterias.page == 1) {
			leftPager = `<li class="page-item special-character disabled">
							<a class="page-link" aria-label="First">
								<span aria-hidden="true">&#60;&#60;</span>
							</a>
						</li>
						<li class="page-item special-character disabled">
							<a class="page-link" aria-label="Previous">
								<span aria-hidden="true">&#60;</span>
							</a>
						</li>`;
		} else {
			leftPager = `<li class="page-item special-character">
							<a class="page-link" aria-label="First" data-page="1">
								<span aria-hidden="true">&#60;&#60;</span>
							</a>
						</li>
						<li class="page-item special-character">
							<a class="page-link" aria-label="Previous" data-page="${Number(searchCriterias.page) - 1}">
								<span aria-hidden="true">&#60;</span>
							</a>
						</li>`;
		}

		if (!showToPage) {
			middlePager = `<li class="page-item disabled">
								<a class="page-link">1</a>
							</li>`;
		} else {
			for (let i = startPage; i <= showToPage; i++) {
				if (i == searchCriterias.page) {
					middlePager += `<li class="page-item active" aria-current="page">
									<a class="page-link">${i}</a>
								</li>`;
				} else {
					middlePager += `<li class="page-item">
									<a class="page-link">${i}</a>
								</li>`;
				}
			}
		}

		if (totalPage == searchCriterias.page || !totalPage) {
			rightPager = `<li class="page-item special-character disabled">
							<a class="page-link" aria-label="Next">
								<span aria-hidden="true">&#62;</span>
							</a>
						</li>
						<li class="page-item special-character disabled">
							<a class="page-link" aria-label="Last">
								<span aria-hidden="true">&#62;&#62;</span>
							</a>
						</li>`;
		} else {
			rightPager = `<li class="page-item special-character">
							<a class="page-link" aria-label="Next" data-page="${Number(searchCriterias.page) + 1}">
								<span aria-hidden="true">&#62;</span>
							</a>
						</li>
						<li class="page-item special-character">
							<a class="page-link" aria-label="Last" data-page="${totalPage}">
								<span aria-hidden="true">&#62;&#62;</span>
							</a>
						</li>`;
		}

		let pager = `${leftPager}${middlePager}${rightPager}`;

		$(pager).appendTo($('#pagination'));

		this.#bindPagerEvent(searchFunction, totalPage, searchCriterias.page);
	}

	#bindPagerEvent(searchFunction, totalPage, page) {
		$('.page-item:not(.special-character):not(.disabled)').click((e) => { this.#pageNumber_onClick(e, searchFunction, page); });
		$('.page-item.special-character:not(.disabled)').click((e) => { this.#pageChracter_onClick(e, searchFunction, totalPage); });
	}

	#pageNumber_onClick(e, searchFunction, page) {
		if (e.target.text == page) {
			return;
		}

		searchFunction(e.target.text);
	}

	#pageChracter_onClick(e, searchFunction, totalPage) {
		let targetPage = $(e.target).closest('a').data('page');

		if (!targetPage) {
			return;
		}

		if (targetPage > totalPage || targetPage < 1) {
			return;
		}

		searchFunction(targetPage);
	}

	// Private variables
	

	// Public functions
	clearGrid(gridList) {
		if (!gridList || !gridList.length) {
			$('#gridBody').children().remove();
		} else {
			for (var i = 0; i < gridList.length; i++) {
				gridList[i].children().remove();
			}
		}

		$('#pagination').children().remove();

		let pager = `<li class="page-item">
						<a class="page-link inactive">
							<i class="fas fa-angle-double-left"></i>
						</a>
					</li>
					<li class="page-item">
						<a class="page-link inactive">
							<i class="fas fa-angle-left"></i>
						</a>
					</li>
					<li class="page-item"><a class="page-link inactive">1</a></li>
					<li class="page-item">
						<a class="page-link inactive">
							<i class="fas fa-angle-right"></i>
						</a>
					</li>
					<li class="page-item">
						<a class="page-link inactive">
							<i class="fas fa-angle-double-right"></i>
						</a>
					</li>`;

		$(pager).appendTo($('#pagination'));
	}
};

let gridControl = new GridControl();