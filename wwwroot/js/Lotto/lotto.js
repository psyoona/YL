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
    }

    bindEvents() {
        // Sidebar toggle
        $('#sidebarToggle, #sidebarToggle2, .btn-toggle').on('click', () => this.toggleSidebar());
        $('#sidebarOverlay').on('click', () => this.toggleSidebar());
        
        // Menu items
        $('.menu-item').on('click', (e) => this.switchMenu($(e.currentTarget)));
        
        // Search functionality
        $('#searchButton').on('click', () => this.search());
        $('#resetButton').on('click', () => this.resetSearch());
        
        // Excel export
        $('#excelExportBtn').on('click', () => this.exportToExcel());
        
        // Generate numbers
        $('#generateButton').on('click', () => this.generateNumbers());
        
        // Enter key on search inputs
        $('.search-section input').on('keypress', (e) => {
            if (e.which === 13) {
                this.search();
            }
        });
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

    switchMenu($menuItem) {
        const menuType = $menuItem.data('menu');
        
        // Update active menu
        $('.menu-item').removeClass('active');
        $menuItem.addClass('active');
        
        // Update page title
        const title = $menuItem.find('span').text();
        $('.page-title').html(`<i class="${$menuItem.find('i').attr('class')}"></i> ${title}`);
        
        // Show/hide pages
        $('.page-content').removeClass('active');
        $(`#${menuType}Page`).addClass('active');
        
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

        // Create CSV content
        let csvContent = '\uFEFF'; // UTF-8 BOM
        csvContent += '회차,추첨일,번호1,번호2,번호3,번호4,번호5,번호6,보너스,1등상금,2등상금,3등상금\n';
        
        this.currentData.forEach(lotto => {
            csvContent += `${lotto.TURN},${lotto.DATE || ''},${lotto.NUMBER1},${lotto.NUMBER2},${lotto.NUMBER3},${lotto.NUMBER4},${lotto.NUMBER5},${lotto.NUMBER6},${lotto.NUMBERBONUS},${lotto.REWARD1},${lotto.REWARD2},${lotto.REWARD3}\n`;
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

    generateNumbers() {
        const count = parseInt($('#generateCount').val());
        let html = '';
        
        for (let i = 0; i < count; i++) {
            const numbers = this.generateRandomNumbers();
            html += `
                <div class="number-set">
                    <div class="number-set-header">세트 ${i + 1}</div>
                    <div class="number-set-balls">
                        ${numbers.map(num => this.createNumberBall(num)).join('')}
                    </div>
                </div>
            `;
        }
        
        $('#generatedNumbers').html(html);
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
        return num.toLocaleString('ko-KR') + '원';
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(amount);
    }
}

let lottoPage;
$(document).ready(() => {
    lottoPage = new LottoPage();
});
