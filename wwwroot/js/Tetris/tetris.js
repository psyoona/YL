$(document).ready(() => {
	let tetris = new Tetris();
	tetris.init();

	// Event handling
	$(document).on('keydown', e => {
		if (tetris.gameText.attr('style') != 'display: flex;' && tetris.movable) {
			switch (e.key) {
				case "ArrowRight":
					tetris.moveBlock('left', 1);
					break;
				case "ArrowLeft":
					tetris.moveBlock('left', -1);
					break;
				case "ArrowDown":
					tetris.moveBlock('top', 1);
					break;
				case "ArrowUp":
					tetris.changeDirection();
					break;
				case " ":
					tetris.dropBlock();
					break;
				default:
					break;
			}
		}
	});

	tetris.restart.on('click', (e) => {
		location.reload();
	});

	tetris.left.on('click', (e) => {
		tetris.moveBlock('left', -1);
	});

	tetris.up.on('click', (e) => {
		tetris.changeDirection();
	});

	tetris.down.on('click', (e) => {
		tetris.moveBlock('top', 1);
	});

	tetris.right.on('click', (e) => {
		tetris.moveBlock('left', 1);
	});

	tetris.space.on('click', (e) => {
		tetris.dropBlock();
	});

	tetris.record.on('click', (e) => {
		let recorder = $('#recorder').val();

		if (!recorder) {
			console.log('이름을 입력하세요.');

			$('#recorder').on('focus');

			return;
		}

		$.ajax({
			url: $("#body").data('url') + '/Laboratory/InsertTetrisScore',
			type: 'Post',
			data: {
				name: recorder,
				score: tetris.score
			},
			success: function (response) {
				location.reload();
			},
			error: function (jqXHR, textStatus, errorThrown) {
				console.log(jqXHR);
				console.log(textStatus);
				console.log(errorThrown);
			}
		});
	});

	$('#start').on('click', (e) => {
		tetris.generateNewBlock();
		$(e.target).attr('disabled', 'disabled');
		$('#arrowButtons').removeClass('no-display');
		$('#start').remove();
	});
});

class Tetris {
	constructor() {
		// DOM
		this.playground = $('#playground > ul');
		this.gameText = $('#gameText');
		this.scoreDisplay = $('#score');
		this.restart = $('#restart');
		this.record = $('#record');
		this.left = $('#left');
		this.up = $('#up');
		this.down = $('#down');
		this.right = $('#right');
		this.space = $('#space');

		// Settings
		this.GAME_ROWS = 20;
		this.GAME_COLS = 10;

		// Variables
		this.score = 0;
		this.duration = 500;
		this.downInterval;
		this.tempMovingItem;
		this.gameEnd = false;
		this.movable = true;

		this.movingItem = {
			type: '',
			direction: 0,
			top: 0,
			left: 3
		};
	}

	// functions
	init = () => {
		$('#selectedMenu').text('Tetris');

		this.score = 0;
		this.gameEnd = false;
		this.scoreDisplay.text(this.score);

		this.initializeTempMovingItem();
		this.renderBoard();

		this.renderRanker();
	};

	renderBoard = () => {
		for (let i = 0; i < this.GAME_ROWS; i++) {
			this.prependNewLine();
		}
	};

	renderRanker = () => {
		//$.ajax({
		//	url: $("#body").data('url') + '/Laboratory/GetRankers',
		//	type: 'Post',
		//	data: null,
		//	success: function (response) {
		//		let rows = JSON.parse(response).Rankers;
		//		let resultRows = ``;

		//		for (var i = 0; i < rows.length; i++) {
		//			resultRows += `<tr>
		//								<td>${rows[i].Name}</td>
		//								<td>${rows[i].Score}</td>
		//							</tr>`;
		//		}

		//		$('#tetrisRanker').append(resultRows);
		//	},
		//	error: function (jqXHR, textStatus, errorThrown) {
		//		console.log(jqXHR);
		//		console.log(textStatus);
		//		console.log(errorThrown);
		//	}
		//});
	}

	prependNewLine = () => {
		let li = $('<li class="tetris-row"></li>'); // document.createElement('li');
		let ul = $('<ul class="tetris-column"></ul>');

		for (var j = 0; j < this.GAME_COLS; j++) {
			let matrix = $('<li class="tetris-matrix"></li>');
			ul.prepend(matrix);
		}

		li.prepend(ul);
		this.playground.prepend(li);
	};

	renderBlocks = (moveType) => {
		let { type, direction, top, left } = this.tempMovingItem;
		let movingBlocks = $('li.tetris-matrix.moving').toArray();

		movingBlocks.forEach(moving => {
			$(moving).removeClass([type, 'moving']);
		});

		BLOCKS[type][direction].some(block => {
			let x = block[0] + left;
			let y = block[1] + top;
			let target = this.playground.find(`li.tetris-row:eq(${y}) > ul > li.tetris-matrix:eq(${x})`);

			if (!this.gameEnd) {
				if ((x >= 0 && x < this.GAME_COLS) && (y >= 0 && y < this.GAME_ROWS) && !target.hasClass('seized')) {
					$(target).addClass([type, 'moving']);
				} else {
					this.initializeTempMovingItem();

					setTimeout(() => {
						this.playground.find('li:first-child > ul.tetris-column:first-child > li').each((index, element) => {
							if ($(element).hasClass('seized')) {
								this.gameEnd = true;
							}
						});

						if (this.gameEnd) {
							clearInterval(this.downInterval);
							this.showGameOverText();
							this.gameEnd = true;

							return true;
						} else {
							this.renderBlocks();
						}

						if (moveType == 'top') {
							this.seizeBlock();
							this.movable = true;
						}
					});

					return true;
				}
			}
		});

		this.setMovingItem(left, top, direction);
	};

	setMovingItem = (left, top, direction) => {
		this.movingItem.left = left;
		this.movingItem.top = top;
		this.movingItem.direction = direction;
	};

	initializeTempMovingItem = () => {
		this.tempMovingItem = { ...this.movingItem };
	};

	showGameOverText = () => {
		this.gameText.attr('style', 'display: flex;');
	};

	seizeBlock = () => {
		let movingBlocks = $('li.tetris-matrix.moving').toArray();

		movingBlocks.forEach(moving => {
			$(moving).removeClass('moving');
			$(moving).addClass('seized');
		});

		this.checkMatch();
	};

	checkMatch = () => {
		let childNodes = this.playground[0].childNodes;
		childNodes.forEach(child => {
			let matched = true;

			child.children[0].childNodes.forEach(li => {
				if (!$(li).hasClass('seized')) {
					matched = false;
				}
			});

			if (matched) {
				child.remove();
				this.prependNewLine();
				this.score += 10;
				this.scoreDisplay.text(this.score);

				if (this.duration > 100) {
					this.duration = 500 - (this.score*2);
				}
			}
		});

		this.generateNewBlock();
	};

	generateNewBlock = () => {
		clearInterval(this.downInterval);

		this.downInterval = setInterval(() => {
			if (this.gameEnd) {
				clearInterval(this.downInterval);
			}

			this.moveBlock('top', 1);
		}, this.duration);

		let blockArray = Object.entries(BLOCKS);
		let randomIndex = Math.floor(Math.random() * blockArray.length);

		this.movingItem.type = blockArray[randomIndex][0];
		this.setMovingItem(3, 0, 0);
		this.initializeTempMovingItem();
		this.renderBlocks();
	};

	moveBlock = (moveType, amount) => {
		this.tempMovingItem[moveType] += amount;
		this.renderBlocks(moveType);
	};

	changeDirection = () => {
		this.tempMovingItem.direction == 3 ? this.tempMovingItem.direction = 0 : this.tempMovingItem.direction++;
		this.renderBlocks();
	};

	dropBlock = () => {
		clearInterval(this.downInterval);
		this.movable = false;

		this.downInterval = setInterval(() => {
			if (this.gameEnd) {
				clearInterval(this.downInterval);
			}

			this.moveBlock('top', 1);
		}, 10);
	};
};