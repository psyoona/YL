// ============================================
// 용어 사전 (glossary.js)
// ============================================

class GlossaryPage {
	constructor() {
		$('#glossarySearch').on('input', (e) => {
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
	}
}

let glossaryPage;
$(function () { glossaryPage = new GlossaryPage(); });
