// ============================================
// 용어 사전 (glossary.js)
// ============================================

StockManager.prototype.initGlossary = function () {
	$('#glossarySearch').off('input').on('input', (e) => {
		const query = e.target.value.toLowerCase().trim();
		$('.glossary-card').each(function () {
			const text = $(this).text().toLowerCase();
			$(this).toggle(query === '' || text.includes(query));
		});
		$('.glossary-category').each(function () {
			const hasVisible = $(this).find('.glossary-card:visible').length > 0;
			$(this).toggle(hasVisible);
		});
	});
};
