class NumberGuessingGame {
	constructor() {
		$('#selectedMenu').text('Number Guessing Game');
		this.difficulty = 50;
		this.targetNumber = Math.floor(Math.random() * this.difficulty) + 1;
		this.attempts = 0;
		this.isGameOver = false;
		this.#bindEvents();
	}

	#bindEvents() {
		$('#guessButton').on('click', () => {
			this.#makeGuess();
		});

		$('#guessInput').on('keypress', (e) => {
			if (e.key === 'Enter') {
				this.#makeGuess();
			}
		});

		$('#difficultySelect').on('change', (e) => {
			this.difficulty = parseInt(e.target.value, 10);
			this.targetNumber = Math.floor(Math.random() * this.difficulty) + 1;
			this.attempts = 0;
			this.isGameOver = false;
			$('#result').text('');
		});
	}

	#makeGuess() {
		if (this.isGameOver) return;

		const guess = parseInt($('#guessInput').val(), 10);
		if (isNaN(guess) || guess < 1 || guess > this.difficulty) {
			$('#result').text(`다음 숫자 사이의 값을 입력하세요. 1 ~ ${this.difficulty}.`);
			return;
		}

		this.attempts++;
		if (guess === this.targetNumber) {
			this.isGameOver = true;
			$('#result').text(`정답! ${this.attempts} 회만에 맞췄어요.`);
			this.#updateBestScore();
		} else if (guess < this.targetNumber) {
			$('#result').text('너무 낮아요. 다시 시도해보세요.');
		} else {
			$('#result').text('너무 높아요. 다시 시도해보세요.');
		}
	}

	#updateBestScore() {
		const bestScore = localStorage.getItem('bestScore') || Infinity;
		if (this.attempts < bestScore) {
			localStorage.setItem('bestScore', this.attempts);
			$('#bestScoreValue').text(this.attempts);
		}
	}
}

let numberGuessingGame = new NumberGuessingGame();
