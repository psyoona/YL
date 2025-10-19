class LottoDashboard {
    constructor() {
        this.initialize();
    }

    initialize() {
        this.loadDashboardData();
    }

    loadDashboardData() {
        this.loadStats();
        this.loadNumberFrequency();
        this.loadPositionFrequency();
        this.loadRecentWinners();
    }

    loadStats() {
        $.ajax({
            url: '/GetDashboardStats',
            method: 'GET',
            dataType: 'json',
            success: (response) => {
                const stats = response.DATA;
                $('#totalTurns').text(this.formatNumber(stats.TOTAL_TURNS));
                
                $('#maxReward').text(this.formatCurrency(stats.MAX_REWARD));
                const labelText = stats.MAX_REWARD_TURN ? `최고 1등 상금 (${stats.MAX_REWARD_TURN}회)` : '최고 1등 상금';
                $('#maxRewardLabel').text(labelText);
                
                $('#avgReward').text(this.formatCurrency(Math.round(stats.AVG_REWARD)));
                $('#latestDate').text(stats.LATEST_DATE || '-');
            },
            error: (error) => {
                console.error('통계 로딩 실패:', error);
            }
        });
    }

    loadNumberFrequency() {
        $.ajax({
            url: '/GetNumberFrequency',
            method: 'GET',
            dataType: 'json',
            success: (response) => {
                const frequency = response.DATA;
                this.displayNumberFrequency(frequency);
            },
            error: (error) => {
                console.error('번호 빈도 로딩 실패:', error);
            }
        });
    }

    loadRecentWinners() {
        $.ajax({
            url: '/GetRecentWinners?count=10',
            method: 'GET',
            dataType: 'json',
            success: (response) => {
                const recent = response.DATA;
                this.displayRecentWinners(recent);
            },
            error: (error) => {
                console.error('최근 당첨번호 로딩 실패:', error);
            }
        });
    }

    loadPositionFrequency() {
        $.ajax({
            url: '/GetPositionFrequency',
            method: 'GET',
            dataType: 'json',
            success: (response) => {
                const positions = response.DATA;
                this.displayPositionFrequency(positions);
            },
            error: (error) => {
                console.error('자리별 빈도 로딩 실패:', error);
            }
        });
    }

    displayNumberFrequency(frequency) {
        let html = '';
        const maxFreq = frequency[0]?.FREQUENCY || 1;

        frequency.forEach((item, index) => {
            const percentage = (item.FREQUENCY / maxFreq) * 100;
            const colorClass = this.getNumberColor(item.NUMBER);
            
            html += `
                <div class="frequency-item">
                    <div class="frequency-rank">#${index + 1}</div>
                    <span class="lotto-ball ${colorClass}">${item.NUMBER}</span>
                    <div class="frequency-bar-container">
                        <div class="frequency-bar" style="width: ${percentage}%"></div>
                        <span class="frequency-count">${item.FREQUENCY}회</span>
                    </div>
                </div>
            `;
        });

        $('#numberFrequency').html(html);
    }

    displayRecentWinners(winners) {
        let html = '';

        winners.forEach((lotto) => {
            html += `
                <div class="recent-winner-item">
                    <div class="winner-turn">
                        <strong>${lotto.TURN}회</strong>
                        <span class="winner-date">${lotto.DATE}</span>
                    </div>
                    <div class="winner-numbers">
                        ${this.createNumberBall(lotto.NUMBER1)}
                        ${this.createNumberBall(lotto.NUMBER2)}
                        ${this.createNumberBall(lotto.NUMBER3)}
                        ${this.createNumberBall(lotto.NUMBER4)}
                        ${this.createNumberBall(lotto.NUMBER5)}
                        ${this.createNumberBall(lotto.NUMBER6)}
                        <span class="bonus-divider">+</span>
                        ${this.createNumberBall(lotto.NUMBERBONUS, true)}
                    </div>
                    <div class="winner-reward">
                        <i class="fas fa-trophy"></i> ${this.formatCurrency(lotto.REWARD1)}
                    </div>
                </div>
            `;
        });

        $('#recentWinners').html(html);
    }

    displayPositionFrequency(positions) {
        let html = '';

        positions.forEach((pos) => {
            html += `
                <div class="position-card">
                    <div class="position-header">
                        <i class="fas fa-sort-numeric-down"></i>
                        <span>${pos.POSITION}번째 자리</span>
                    </div>
                    <div class="position-numbers">
                        ${pos.TOP_NUMBERS.map((item, idx) => {
                            const colorClass = this.getNumberColor(item.NUMBER);
                            return `
                                <div class="position-item">
                                    <span class="position-rank">#${idx + 1}</span>
                                    <span class="lotto-ball ${colorClass}">${item.NUMBER}</span>
                                    <span class="position-freq">${item.FREQUENCY}회</span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        });

        $('#positionFrequency').html(html);
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

    formatNumber(num) {
        if (!num) return '0';
        return num.toLocaleString('ko-KR');
    }

    formatCurrency(amount) {
        if (!amount) return '0원';
        return amount.toLocaleString('ko-KR') + '원';
    }
}

// Initialize dashboard immediately when script loads
$(document).ready(() => {
    if (typeof lottoDashboard === 'undefined') {
        window.lottoDashboard = new LottoDashboard();
    }
});
