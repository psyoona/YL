var ReactionTimeGame = class ReactionTimeGame {
	constructor() {
		$('#selectedMenu').text('Reaction Time Game');

		this.#bindEvent();
	}

	//private variables
	#startTime = null;
	#endTime = null;
	#timeout = null;

	#bindEvent() {
		$('#gameArea').on('click', function () {
			let gameArea = $(this);
			let message = $('#message');

			if (gameArea.hasClass('waiting')) {
				gameArea.removeClass('waiting').addClass('ready');
				message.text('초록색으로 바뀌면 클릭!');

				encryption.#timeout = setTimeout(function () {
					gameArea.removeClass('ready').addClass('go');
					message.text('지금 클릭!');
					encryption.#startTime = new Date();
				}, Math.random() * 2000 + 2000);

			} else if (gameArea.hasClass('ready')) {
				clearTimeout(encryption.#timeout);
				gameArea.removeClass('ready').addClass('waiting');
				message.text('너무 빨랐어요! 다시 시도');

			} else if (gameArea.hasClass('go')) {
				encryption.#endTime = new Date();
				const reactionTime = encryption.#endTime - encryption.#startTime;
				gameArea.removeClass('go').addClass('waiting');
				message.text(`👏 반응 속도: ${reactionTime}ms`);
			}
		});
	}
}

let encryption = new ReactionTimeGame();