class LottoPage {
	constructor() {
		this.currentPage = 1;
		this.pageSize = 20;
		this.totalCount = 0;
		this.currentData = [];
		this.searchCriteria = {};

		this.initialize();
	}

	initialize() {
		this.bindEvents();
		this.loadLottoList(1);
		this.chart = null; // Chart.js instance
	}

	bindEvents() {
		// Sidebar toggle
		$('#sidebarToggle, #sidebarToggle2, .btn-toggle, .btn-toggle-white').on('click', () => this.toggleSidebar());
		$('#sidebarOverlay').on('click', () => this.toggleSidebar());
		
		// Search filter toggle
		$('#searchFilterToggle').on('click', () => this.toggleSearchFilter());
		
		// Menu items
		$('.menu-item').on('click', (e) => {
			const $item = $(e.currentTarget);
			if ($item.hasClass('has-submenu')) {
				this.toggleSubmenu($item);
			} else {
				this.switchMenu($item);
			}
		});
		
		// Submenu items
		$('.submenu-item').on('click', (e) => {
			e.stopPropagation();
			this.switchMenu($(e.currentTarget));
		});
		
		// Search functionality
		$('#searchButton').on('click', () => this.search());
		$('#resetButton').on('click', () => this.resetSearch());
		
		// Page size change
		$('#pageSizeSelect').on('change', (e) => this.changePageSize(parseInt($(e.target).val())));
		
		// Excel export
		$('#excelExportBtn').on('click', () => this.exportToExcel());
		
		// Generate numbers
		$('#generateButton').on('click', () => this.generateNumbers());
		
		// Strategy change
		$('#generateStrategy').on('change', (e) => this.onStrategyChange($(e.target).val()));
		
		// Calculator
		$('#calculateButton').on('click', () => this.calculateReward());
		
		// Chart type change
		$('#chartType').on('change', (e) => this.renderChart($(e.target).val()));
		
		// Enter key on search inputs
		$('.search-section input').on('keypress', (e) => {
			if (e.which === 13) {
				this.search();
			}
		});
	}

	toggleSubmenu($item) {
		const $submenu = $item.next('.submenu');
		const isOpen = $item.hasClass('open');
		
		// Close all submenus
		$('.menu-item.has-submenu').removeClass('open');
		$('.submenu').removeClass('open');
		
		// Toggle current submenu
		if (!isOpen) {
			$item.addClass('open');
			$submenu.addClass('open');
		}
	}

	toggleSidebar() {
		const isCollapsed = $('#sidebar').hasClass('collapsed');
		
		if (isCollapsed) {
			// 사이드바 열기
			$('#sidebar').removeClass('collapsed');
			$('#mainContent').removeClass('expanded');
			if (window.innerWidth <= 768) {
				$('#sidebarOverlay').addClass('active');
			}
		} else {
			// 사이드바 닫기
			$('#sidebar').addClass('collapsed');
			$('#mainContent').addClass('expanded');
			$('#sidebarOverlay').removeClass('active');
		}
	}

	toggleSearchFilter() {
		const $body = $('#searchFilterBody');
		const $icon = $('.toggle-icon');
		
		if ($body.is(':visible')) {
			$body.slideUp(300);
			$icon.removeClass('fa-chevron-up').addClass('fa-chevron-down');
		} else {
			$body.slideDown(300);
			$icon.removeClass('fa-chevron-down').addClass('fa-chevron-up');
		}
	}

	switchMenu($menuItem) {
		const menuType = $menuItem.data('menu');
		
		// Update active menu
		$('.menu-item').removeClass('active');
		$('.submenu-item').removeClass('active');
		
		if ($menuItem.hasClass('submenu-item')) {
			$menuItem.addClass('active');
		} else {
			$menuItem.addClass('active');
		}
		
		// Update page title
		const title = $menuItem.find('span').text();
		const icon = $menuItem.find('i').first().attr('class');
		$('.page-main-title').html(`<i class="${icon}"></i> ${title}`);
		
		// Show/hide pages
		$('.page-content').removeClass('active');
		$(`#${menuType}Page`).addClass('active');
		
		// Load data based on page type
		if (menuType === 'statistics') {
			setTimeout(() => {
				const chartType = $('#chartType').val();
				if (chartType) {
					this.renderChart(chartType);
				}
			}, 300);
		} else if (menuType === 'frequency') {
			// Load frequency data
			setTimeout(() => {
				if (typeof window.lottoDashboard !== 'undefined') {
					window.lottoDashboard.loadNumberFrequency();
					window.lottoDashboard.loadPositionFrequency();
				}
			}, 300);
		}
		
		// Close sidebar on mobile
		if (window.innerWidth < 768) {
			this.toggleSidebar();
		}
	}

	search() {
		// Collect search criteria
		this.searchCriteria = {
			turn: $('#searchTurn').val() || null,
			number1: $('#searchNumber1').val() || null,
			number2: $('#searchNumber2').val() || null,
			number3: $('#searchNumber3').val() || null,
			number4: $('#searchNumber4').val() || null,
			number5: $('#searchNumber5').val() || null,
			number6: $('#searchNumber6').val() || null,
			bonus: $('#searchBonus').val() || null
		};
		
		this.loadLottoList(1);
	}

	resetSearch() {
		$('#searchTurn').val('');
		$('#searchNumber1').val('');
		$('#searchNumber2').val('');
		$('#searchNumber3').val('');
		$('#searchNumber4').val('');
		$('#searchNumber5').val('');
		$('#searchNumber6').val('');
		$('#searchBonus').val('');
		
		this.searchCriteria = {};
		this.loadLottoList(1);
	}

	changePageSize(newSize) {
		this.pageSize = newSize;
		this.loadLottoList(1); // Reset to first page
	}

	loadLottoList(pageNumber) {
		this.currentPage = pageNumber;
		
		// Build query string
		let queryParams = `pageNumber=${pageNumber}&pageSize=${this.pageSize}`;
		
		// Add search criteria to query
		Object.keys(this.searchCriteria).forEach(key => {
			if (this.searchCriteria[key]) {
				queryParams += `&${key}=${this.searchCriteria[key]}`;
			}
		});

		console.log('Loading lotto list with params:', queryParams);

		// Try using webServer if available, otherwise use $.ajax
		if (typeof webServer !== 'undefined' && webServer.getJson) {
			webServer.getJson(
				`/GetLottoList?${queryParams}`,
				null,
				(response) => {
					console.log('Response received:', response);
					this.totalCount = response.TOTAL_COUNT || 0;
					this.currentData = response.DATA || [];
					$('#totalCount').text(this.totalCount.toLocaleString());
					this.displayLottoTable(response.DATA);
					this.displayPagination();
				},
				(error) => {
					console.error('Error loading data:', error);
					alert('데이터를 불러오는데 실패했습니다.');
				}
			);
		} else {
			// Fallback to jQuery AJAX
			$.ajax({
				url: `/GetLottoList?${queryParams}`,
				method: 'GET',
				dataType: 'json',
				success: (response) => {
					console.log('Response received:', response);
					this.totalCount = response.TOTAL_COUNT || response.total_count || 0;
					this.currentData = response.DATA || response.data || [];
					$('#totalCount').text(this.totalCount.toLocaleString());
					this.displayLottoTable(this.currentData);
					this.displayPagination();
				},
				error: (xhr, status, error) => {
					console.error('Error loading data:', error);
					console.error('Status:', status);
					console.error('Response:', xhr.responseText);
					alert('데이터를 불러오는데 실패했습니다: ' + error);
					// Show empty state
					this.displayLottoTable([]);
				}
			});
		}
	}

	displayLottoTable(lottoList) {
		let html = '';
		
		if (!lottoList || lottoList.length === 0) {
			html = '<tr><td colspan="12" class="text-center py-4">조회된 데이터가 없습니다.</td></tr>';
		} else {
			lottoList.forEach(lotto => {
				html += `
					<tr>
						<td class="text-center"><strong>${lotto.TURN}</strong></td>
						<td class="text-center">${lotto.DATE || '-'}</td>
						<td class="text-center">${this.createNumberBall(lotto.NUMBER1)}</td>
						<td class="text-center">${this.createNumberBall(lotto.NUMBER2)}</td>
						<td class="text-center">${this.createNumberBall(lotto.NUMBER3)}</td>
						<td class="text-center">${this.createNumberBall(lotto.NUMBER4)}</td>
						<td class="text-center">${this.createNumberBall(lotto.NUMBER5)}</td>
						<td class="text-center">${this.createNumberBall(lotto.NUMBER6)}</td>
						<td class="text-center">${this.createNumberBall(lotto.NUMBERBONUS, true)}</td>
						<td class="text-end">${this.formatNumber(lotto.REWARD1)}</td>
						<td class="text-end">${this.formatNumber(lotto.REWARD2)}</td>
						<td class="text-end">${this.formatNumber(lotto.REWARD3)}</td>
					</tr>
				`;
			});
		}
		
		$('#lottoTableBody').html(html);
	}

	createNumberBall(number, isBonus = false) {
		const colorClass = this.getNumberColor(number);
		const bonusClass = isBonus ? 'bonus' : '';
		return `<span class="lotto-ball ${colorClass} ${bonusClass}">${number}</span>`;
	}

	getNumberColor(number) {
		if (number <= 10) return 'yellow';
		if (number <= 20) return 'blue';
		if (number <= 30) return 'red';
		if (number <= 40) return 'gray';
		return 'green';
	}

	displayPagination() {
		const totalPages = Math.ceil(this.totalCount / this.pageSize);
		let html = '';

		if (totalPages === 0) {
			$('#pagination').html('');
			return;
		}

		// First button
		if (this.currentPage > 1) {
			html += `<li class="page-item"><a class="page-link" href="#" onclick="lottoPage.loadLottoList(1); return false;"><i class="fas fa-angle-double-left"></i></a></li>`;
		}

		// Previous button
		if (this.currentPage > 1) {
			html += `<li class="page-item"><a class="page-link" href="#" onclick="lottoPage.loadLottoList(${this.currentPage - 1}); return false;"><i class="fas fa-chevron-left"></i></a></li>`;
		}

		// Page numbers
		const startPage = Math.max(1, this.currentPage - 2);
		const endPage = Math.min(totalPages, this.currentPage + 2);

		if (startPage > 1) {
			html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
		}

		for (let i = startPage; i <= endPage; i++) {
			const activeClass = i === this.currentPage ? 'active' : '';
			html += `<li class="page-item ${activeClass}"><a class="page-link" href="#" onclick="lottoPage.loadLottoList(${i}); return false;">${i}</a></li>`;
		}

		if (endPage < totalPages) {
			html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
		}

		// Next button
		if (this.currentPage < totalPages) {
			html += `<li class="page-item"><a class="page-link" href="#" onclick="lottoPage.loadLottoList(${this.currentPage + 1}); return false;"><i class="fas fa-chevron-right"></i></a></li>`;
		}

		// Last button
		if (this.currentPage < totalPages) {
			html += `<li class="page-item"><a class="page-link" href="#" onclick="lottoPage.loadLottoList(${totalPages}); return false;"><i class="fas fa-angle-double-right"></i></a></li>`;
		}

		$('#pagination').html(html);
	}

	exportToExcel() {
		if (!this.currentData || this.currentData.length === 0) {
			alert('다운로드할 데이터가 없습니다.');
			return;
		}

		// Create CSV content with proper comma delimiter
		let csvContent = '\uFEFF'; // UTF-8 BOM
		csvContent += '회차,추첨일,번호1,번호2,번호3,번호4,번호5,번호6,보너스,1등상금,2등상금,3등상금\n';
		
		this.currentData.forEach(lotto => {
			// Wrap large numbers in quotes to keep them as text in Excel
			const reward1 = lotto.REWARD1 ? `"${lotto.REWARD1}"` : '""';
			const reward2 = lotto.REWARD2 ? `"${lotto.REWARD2}"` : '""';
			const reward3 = lotto.REWARD3 ? `"${lotto.REWARD3}"` : '""';
			const date = lotto.DATE ? `"${lotto.DATE}"` : '""';
			
			csvContent += `${lotto.TURN},${date},${lotto.NUMBER1},${lotto.NUMBER2},${lotto.NUMBER3},${lotto.NUMBER4},${lotto.NUMBER5},${lotto.NUMBER6},${lotto.NUMBERBONUS},${reward1},${reward2},${reward3}\n`;
		});

		// Create blob and download
		const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
		const fileName = `로또당첨번호_${new Date().getTime()}.csv`;
		
		if (typeof saveAs === 'function') {
			saveAs(blob, fileName);
		} else {
			// Fallback for browsers that don't support FileSaver
			const link = document.createElement('a');
			if (link.download !== undefined) {
				const url = URL.createObjectURL(blob);
				link.setAttribute('href', url);
				link.setAttribute('download', fileName);
				link.style.visibility = 'hidden';
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
			}
		}
	}

	async generateNumbers() {
		const count = parseInt($('#generateCount').val());
		const strategy = $('#generateStrategy').val();
		const allSets = [];
		
		// Generate all number sets based on strategy
		for (let i = 0; i < count; i++) {
			const numbers = await this.generateNumbersByStrategy(strategy);
			allSets.push({ index: i + 1, numbers: numbers });
		}
		
		// Display immediately with loading state
		let html = '';
		for (const set of allSets) {
			html += `
				<div class="number-set" data-set-index="${set.index}">
					<div class="number-set-header">세트 ${set.index} <span class="strategy-badge">${this.getStrategyName(strategy)}</span></div>
					<div class="number-set-balls">
						${set.numbers.map(num => this.createNumberBall(num)).join('')}
					</div>
					<div class="number-history">
						<i class="fas fa-spinner fa-spin"></i> 당첨 내역 확인 중...
					</div>
				</div>
			`;
		}
		$('#generatedNumbers').html(html);
		
		// Load history for each number set
		for (const set of allSets) {
			await this.checkNumberCombination(set.index, set.numbers);
		}
	}

	async generateNumbersByStrategy(strategy) {
		switch(strategy) {
			case 'hot':
				return await this.generateHotNumbers();
			case 'cold':
				return await this.generateColdNumbers();
			case 'balanced':
				return this.generateBalancedNumbers();
			case 'exclude':
				return this.generateWithExclusion();
			default:
				return this.generateRandomNumbers();
		}
	}

	async generateHotNumbers() {
		// Get frequency data
		const response = await $.ajax({
			url: '/GetNumberFrequency',
			method: 'GET',
			dataType: 'json'
		});
		
		const frequency = response.DATA || [];
		const topNumbers = frequency.slice(0, 20).map(item => item.NUMBER);
		
		// Select 6 random numbers from top 20
		const numbers = [];
		while (numbers.length < 6) {
			const num = topNumbers[Math.floor(Math.random() * topNumbers.length)];
			if (!numbers.includes(num)) {
				numbers.push(num);
			}
		}
		return numbers.sort((a, b) => a - b);
	}

	async generateColdNumbers() {
		// Get frequency data
		const response = await $.ajax({
			url: '/GetNumberFrequency',
			method: 'GET',
			dataType: 'json'
		});
		
		const frequency = response.DATA || [];
		const allNumbers = Array.from({length: 45}, (_, i) => i + 1);
		const hotNumbers = frequency.slice(0, 20).map(item => item.NUMBER);
		const coldNumbers = allNumbers.filter(num => !hotNumbers.includes(num));
		
		// Select 6 random numbers from cold numbers
		const numbers = [];
		while (numbers.length < 6) {
			const num = coldNumbers[Math.floor(Math.random() * coldNumbers.length)];
			if (!numbers.includes(num)) {
				numbers.push(num);
			}
		}
		return numbers.sort((a, b) => a - b);
	}

	generateBalancedNumbers() {
		const numbers = [];
		// Ensure balanced odd/even (3:3)
		const oddNumbers = Array.from({length: 23}, (_, i) => i * 2 + 1).filter(n => n <= 45);
		const evenNumbers = Array.from({length: 22}, (_, i) => (i + 1) * 2).filter(n => n <= 45);
		
		// Pick 3 odd, 3 even
		while (numbers.length < 3) {
			const num = oddNumbers[Math.floor(Math.random() * oddNumbers.length)];
			if (!numbers.includes(num)) {
				numbers.push(num);
			}
		}
		
		while (numbers.length < 6) {
			const num = evenNumbers[Math.floor(Math.random() * evenNumbers.length)];
			if (!numbers.includes(num)) {
				numbers.push(num);
			}
		}
		
		return numbers.sort((a, b) => a - b);
	}

	generateWithExclusion() {
		const excludeInput = $('#excludeNumbers').val();
		const excludeNumbers = excludeInput ? 
			excludeInput.split(',').map(n => parseInt(n.trim())).filter(n => n >= 1 && n <= 45) : 
			[];
		
		const availableNumbers = Array.from({length: 45}, (_, i) => i + 1)
			.filter(n => !excludeNumbers.includes(n));
		
		const numbers = [];
		while (numbers.length < 6 && availableNumbers.length > 0) {
			const index = Math.floor(Math.random() * availableNumbers.length);
			numbers.push(availableNumbers[index]);
			availableNumbers.splice(index, 1);
		}
		
		return numbers.sort((a, b) => a - b);
	}

	getStrategyName(strategy) {
		const names = {
			'random': '랜덤',
			'hot': '인기번호',
			'cold': '비인기번호',
			'balanced': '균형',
			'exclude': '제외'
		};
		return names[strategy] || '랜덤';
	}

	onStrategyChange(strategy) {
		if (strategy === 'exclude') {
			$('#excludeNumbersDiv').show();
		} else {
			$('#excludeNumbersDiv').hide();
		}
	}

	async checkNumberCombination(setIndex, numbers) {
		const $historyDiv = $(`.number-set[data-set-index="${setIndex}"] .number-history`);
		
		try {
			const result = await this.getCombinationHistory(numbers);
			
			if (result.HAS_MATCH) {
				// Found match!
				const matches = result.MATCHED_TURNS;
				const highestRank = result.RANK;
				
				// Get rank icon and color
				const rankInfo = this.getRankInfo(highestRank);
				
				let historyHtml = `<div class="match-found rank-${rankInfo.class}">`;
				historyHtml += `<div class="match-header">
					<i class="${rankInfo.icon}"></i> 
					<span>이 번호 조합은 <strong>${highestRank}</strong>에 당첨된 적이 있습니다!</span>
				</div>`;
				
				matches.forEach(match => {
					const matchRankInfo = this.getRankInfo(match.RANK);
					historyHtml += `
						<div class="match-item">
							<span class="match-rank rank-badge-${matchRankInfo.class}">${match.RANK}</span>
							<span class="match-turn">${match.TURN}회</span>
							<span class="match-date">(${match.DATE})</span>
							<span class="match-reward">${this.formatNumber(match.REWARD)}</span>
						</div>
					`;
				});
				historyHtml += '</div>';
				$historyDiv.html(historyHtml);
			} else {
				// No match found
				$historyDiv.html(`
					<div class="no-history">
						<i class="fas fa-info-circle"></i> 이전에 당첨된 적 없는 번호 조합입니다.
					</div>
				`);
			}
		} catch (error) {
			console.error('당첨 내역 조회 실패:', error);
			$historyDiv.html(`
				<div class="history-error">
					<i class="fas fa-exclamation-triangle"></i> 당첨 내역을 불러올 수 없습니다.
				</div>
			`);
		}
	}

	getRankInfo(rank) {
		const rankMap = {
			'1등': { icon: 'fas fa-crown', class: 'first' },
			'2등': { icon: 'fas fa-medal', class: 'second' },
			'3등': { icon: 'fas fa-trophy', class: 'third' }
		};
		return rankMap[rank] || { icon: 'fas fa-trophy', class: 'default' };
	}

	getCombinationHistory(numbers) {
		return new Promise((resolve, reject) => {
			$.ajax({
				url: '/CheckNumberCombination',
				method: 'POST',
				contentType: 'application/json',
				data: JSON.stringify(numbers),
				dataType: 'json',
				success: (response) => {
					resolve(response.DATA || { HAS_MATCH: false, MATCHED_TURNS: [] });
				},
				error: (error) => {
					console.error('번호 조합 조회 실패:', error);
					reject(error);
				}
			});
		});
	}

	generateRandomNumbers() {
		const numbers = [];
		while (numbers.length < 6) {
			const num = Math.floor(Math.random() * 45) + 1;
			if (!numbers.includes(num)) {
				numbers.push(num);
			}
		}
		return numbers.sort((a, b) => a - b);
	}

	formatNumber(num) {
		if (!num) return '-';
		return num.toLocaleString('ko-KR') + ' 원';
	}

	formatCurrency(amount) {
		return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
	}

	// 당첨금 계산기
	async calculateReward() {
		const gameCount = parseInt($('#calcGameCount').val());
		const pricePerGame = parseInt($('#calcPricePerGame').val());
		const matchCount = $('#calcMatchCount').val();
		
		const totalInvestment = gameCount * pricePerGame;
		
		// Get average rewards
		const response = await $.ajax({
			url: '/GetAverageRewards',
			method: 'GET',
			dataType: 'json'
		});
		
		const avgRewards = response.DATA;
		let avgReward = 0;
		let rankName = '';
		let probability = 0;
		
		switch(matchCount) {
			case '6':
				avgReward = avgRewards.AVG_REWARD_1;
				rankName = '1등';
				probability = 1 / 8145060;
				break;
			case '5b':
				avgReward = avgRewards.AVG_REWARD_2;
				rankName = '2등';
				probability = 6 / 8145060;
				break;
			case '5':
				avgReward = avgRewards.AVG_REWARD_3;
				rankName = '3등';
				probability = 210 / 8145060;
				break;
			case '4':
				avgReward = 50000;
				rankName = '4등';
				probability = 9765 / 8145060;
				break;
			case '3':
				avgReward = 5000;
				rankName = '5등';
				probability = 142100 / 8145060;
				break;
		}
		
		const expectedValue = avgReward * probability * gameCount;
		const roi = ((expectedValue - totalInvestment) / totalInvestment * 100).toFixed(2);
		const winProbability = (probability * 100 * gameCount).toFixed(8);
		
		let html = `
			<div class="calculator-summary">
				<div class="calc-row">
					<span class="calc-label">총 투자금액:</span>
					<span class="calc-value">${this.formatNumber(totalInvestment)}</span>
				</div>
				<div class="calc-row">
					<span class="calc-label">선택 등수:</span>
					<span class="calc-value highlight-rank">${rankName}</span>
				</div>
				<div class="calc-row">
					<span class="calc-label">평균 당첨금:</span>
					<span class="calc-value">${this.formatNumber(Math.round(avgReward))}</span>
				</div>
				<div class="calc-row">
					<span class="calc-label">당첨 확률:</span>
					<span class="calc-value">1 / ${(1/probability).toLocaleString('ko-KR', {maximumFractionDigits: 0})}</span>
				</div>
				<div class="calc-row">
					<span class="calc-label">${gameCount}게임 당첨 확률:</span>
					<span class="calc-value">${winProbability}%</span>
				</div>
				<div class="calc-row">
					<span class="calc-label">기대값:</span>
					<span class="calc-value">${this.formatNumber(Math.round(expectedValue))}</span>
				</div>
				<div class="calc-row highlight">
					<span class="calc-label">예상 수익률 (ROI):</span>
					<span class="calc-value ${roi >= 0 ? 'positive' : 'negative'}">${roi}%</span>
				</div>
			</div>
			<div class="calc-notice">
				<i class="fas fa-info-circle"></i> 이 계산은 통계적 기대값이며, 실제 당첨을 보장하지 않습니다.
			</div>
		`;
		
		$('#calculatorResult').html(html).slideDown(300);
	}

	// 차트 렌더링
	async renderChart(chartType) {
		let data = null;
		
		switch(chartType) {
			case 'oddEven':
				data = await this.getOddEvenData();
				this.renderOddEvenChart(data);
				break;
			case 'range':
				data = await this.getRangeData();
				this.renderRangeChart(data);
				break;
			case 'sum':
				data = await this.getSumData();
				this.renderSumChart(data);
				break;
		}
	}

	async getOddEvenData() {
		const response = await $.ajax({
			url: '/GetOddEvenAnalysis',
			method: 'GET',
			dataType: 'json'
		});
		return response.DATA.DATA;
	}

	async getRangeData() {
		const response = await $.ajax({
			url: '/GetRangeDistribution',
			method: 'GET',
			dataType: 'json'
		});
		return response.DATA.DATA;
	}

	async getSumData() {
		const response = await $.ajax({
			url: '/GetSumDistribution',
			method: 'GET',
			dataType: 'json'
		});
		return response.DATA.DATA;
	}

	renderOddEvenChart(data) {
		const ctx = document.getElementById('statisticsChart');
		if (this.chart) {
			this.chart.destroy();
		}
		
		const labels = data.map(d => d.TURN + '회').reverse();
		const oddData = data.map(d => d.ODD_COUNT).reverse();
		const evenData = data.map(d => d.EVEN_COUNT).reverse();
		
		this.chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: labels,
				datasets: [
					{
						label: '홀수',
						data: oddData,
						borderColor: 'rgb(255, 99, 132)',
						backgroundColor: 'rgba(255, 99, 132, 0.2)',
						tension: 0.1
					},
					{
						label: '짝수',
						data: evenData,
						borderColor: 'rgb(54, 162, 235)',
						backgroundColor: 'rgba(54, 162, 235, 0.2)',
						tension: 0.1
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					title: {
						display: true,
						text: '홀짝 비율 분석 (최근 100회)'
					},
					legend: {
						position: 'top',
					}
				},
				scales: {
					y: {
						beginAtZero: true,
						max: 6,
						ticks: {
							stepSize: 1
						}
					}
				}
			}
		});
	}

	renderRangeChart(data) {
		const ctx = document.getElementById('statisticsChart');
		if (this.chart) {
			this.chart.destroy();
		}
		
		const labels = data.map(d => d.TURN + '회').reverse();
		
		this.chart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: labels,
				datasets: [
					{
						label: '1-10',
						data: data.map(d => d.RANGE_1_10).reverse(),
						backgroundColor: 'rgba(255, 206, 86, 0.7)'
					},
					{
						label: '11-20',
						data: data.map(d => d.RANGE_11_20).reverse(),
						backgroundColor: 'rgba(54, 162, 235, 0.7)'
					},
					{
						label: '21-30',
						data: data.map(d => d.RANGE_21_30).reverse(),
						backgroundColor: 'rgba(255, 99, 132, 0.7)'
					},
					{
						label: '31-40',
						data: data.map(d => d.RANGE_31_40).reverse(),
						backgroundColor: 'rgba(153, 102, 255, 0.7)'
					},
					{
						label: '41-45',
						data: data.map(d => d.RANGE_41_45).reverse(),
						backgroundColor: 'rgba(75, 192, 192, 0.7)'
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					title: {
						display: true,
						text: '구간별 번호 분포 (최근 100회)'
					},
					legend: {
						position: 'top',
					}
				},
				scales: {
					x: {
						stacked: true,
					},
					y: {
						stacked: true,
						beginAtZero: true,
						max: 6
					}
				}
			}
		});
	}

	renderSumChart(data) {
		const ctx = document.getElementById('statisticsChart');
		if (this.chart) {
			this.chart.destroy();
		}
		
		const labels = data.map(d => d.TURN + '회').reverse();
		const sums = data.map(d => d.SUM).reverse();
		
		this.chart = new Chart(ctx, {
			type: 'line',
			data: {
				labels: labels,
				datasets: [{
					label: '번호 합계',
					data: sums,
					borderColor: 'rgb(102, 126, 234)',
					backgroundColor: 'rgba(102, 126, 234, 0.2)',
					tension: 0.1
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					title: {
						display: true,
						text: '당첨 번호 합계 분포 (최근 100회)'
					},
					legend: {
						position: 'top',
					}
				},
				scales: {
					y: {
						beginAtZero: false,
						min: 21,
						max: 255
					}
				}
			}
		});
	}
}

let lottoPage;
$(document).ready(() => {
	lottoPage = new LottoPage();
});
