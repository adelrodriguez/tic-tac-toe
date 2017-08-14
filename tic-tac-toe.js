$(document).ready(function(){

	var human = '';
	var computer = '';
	var originalBoard = [0, 1, 2, 3, 4, 5, 6, 7, 8];

	function init() {
		control.choose();
	}

	var board = {
		// create a copy of the board
		cells: originalBoard.slice(0),
		display: function() {
			$('#choose').fadeOut().remove();
			$('#board').fadeIn();
			control.setup();
		},
		// check for three of the same symbol in a row from the arguments specified by control.checkWinner
		check: function () {
			var count = 0;
		
			for (var i = 2; i < arguments.length; i++) {
				if (arguments[0][arguments[i]] === arguments[1]) {
					count++;
				}
			}

			return count === 3 ? true : false;
		},
		placePiece: function(cell, player) {
			$('#' + cell).html(player === 'human'? human : computer).addClass(player === 'human' ? 'player-selected' : 'computer-selected');
			board.cells[cell] = player;
			// turn off click event for the cell that was just played
			$('#' + cell).unbind();

			control.checkWinner(player);
		},
	};

	var opponent = {
		play: function() {
			// initialize minimax algorithm with the current board and depth of 0
			var move = opponent.strategy(board.cells, 'computer', 0);
			board.placePiece(move.index, 'computer');
		},
		// checks the board for empty cells by passing the current board and returns array of indexes
		emptyCells: function(currentBoard) {
			return currentBoard.filter(cell => cell != 'human' && cell != 'computer');
		},
		// function with a minimax algorithm to calculate the best possible move
		strategy: function(newBoard, player, depth) {
			depth++;

			var available = opponent.emptyCells(newBoard);

			switch (true) {
				case control.winConditions(newBoard, 'human'):
					return {score: depth - 10};
				case control.winConditions(newBoard, 'computer'):
					return {score: 10 - depth};
				case available.length === 0:
					return {score: 0};
			}			

			var moves = [];
			var bestMove = 0;

			for (var i = 0; i < available.length; i++) {
				var move = {};
				move.index = newBoard[available[i]];

				newBoard[available[i]] = player;

				// recursive call the minimax function
				move.score = opponent.strategy(newBoard, player === 'human' ? 'computer' : 'human', depth).score;
			
				// return board to original state
				newBoard[available[i]] = move.index;
				moves.push(move);
			}

			// find the index of the lowest value in the array
			if (player === 'human') {
				for (var i = 0; i < moves.length; i++) {
					if (moves[i].score < moves[bestMove].score) {
						bestMove = i;
					}
				}
			} else {
				for (var i = 0; i < moves.length; i++) {
					if (moves[i].score > moves[bestMove].score) {
						bestMove = i;
					}
				}
			}

			return moves[bestMove];
		}
	};

	var control = {
		// let player choose the piece to use during play
		choose: function() {
			$('span').click(function() {
				human = $(this).html();

				if($(this).hasClass('cross')) {
					computer = $('.circle').html();
				} else {
					computer = $('.cross').html();
				}

				board.display();
			});
		},
		// setup game event listeners
		setup: function() {
			$('.cell').click(function() {
				board.placePiece($(this).attr('id'), 'human');
				opponent.play();
			});
		},
		checkWinner: function(player) {
			if (control.winConditions(board.cells, player)) {
				// display message according to who won
				control.displayMessage(player);
			} else if (opponent.emptyCells(board.cells).length === 0) {
				// display message for a tie
				control.displayMessage('tie');
			}
		},
		// check for all possible winning conditions
		winConditions: function(currentBoard, currentPlayer) {
			switch (true) {
				// vertical
				case board.check(currentBoard, currentPlayer, 0, 1, 2):
				case board.check(currentBoard, currentPlayer, 3, 4, 5):
				case board.check(currentBoard, currentPlayer, 6, 7, 8):
				// horizontal
				case board.check(currentBoard, currentPlayer, 0, 3, 6):
				case board.check(currentBoard, currentPlayer, 1, 4, 7):
				case board.check(currentBoard, currentPlayer, 2, 5, 8):
				// across
				case board.check(currentBoard, currentPlayer, 0, 4, 8):
				case board.check(currentBoard, currentPlayer, 2, 4, 6):
					return true;
				default:
					return false;
			}
		},
		// display message according to result
		displayMessage: function(win) {
			var message = '';

			switch (win) {
				case 'human':
					message = "You win!";
					break;
				case 'computer':
					message = "You lose!";
					break;
				case 'tie':
					message = "Tied!";
					break;
			}

			$('#message').text(message).fadeIn(1000);
			$('#board').css("filter", "blur(5px)");

			$('#message').click(function() {
				control.reset();
			});
		},
		reset: function() {
			board.cells = originalBoard.slice(0);
			$('#board').css("filter", "");
			$('#message').fadeOut('fast');

			for (var i = 0; i < board.cells.length; i++) {
				$('#' + i).removeClass('player-selected computer-selected').html('').unbind();
			}
			
			board.display();
		}
	};

	// initialize game
	init();
});