document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('[data-cell]');
    const gameInfo = document.getElementById('game-info');
    const singlePlayerButton = document.getElementById('singlePlayer');
    const twoPlayerButton = document.getElementById('twoPlayer');
    const playerOneScoreEl = document.getElementById('playerOneScore');
    const playerTwoScoreEl = document.getElementById('playerTwoScore');
    const machineScoreEl = document.getElementById('machineScore');
    const gameOverModal = document.getElementById('gameOverModal');
    const winnerMessage = document.getElementById('winnerMessage');
    const playAgainButton = document.getElementById('playAgain');
    let circleTurn;
    let isSinglePlayer = false;
    let playerOneScore = 0;
    let playerTwoScore = 0;
    let currentMode = '';
    let currentPlayer = 'X'; // Starting player

    singlePlayerButton.addEventListener('click', () => {
        startGame(true);
        currentMode = 'singlePlayer';
        document.getElementById('singlePlayerScoreboard').style.display = 'block';
        document.getElementById('twoPlayerScoreboard').style.display = 'none';
    });

    twoPlayerButton.addEventListener('click', () => {
        startGame(false);
        currentMode = 'twoPlayer';
        document.getElementById('twoPlayerScoreboard').style.display = 'block';
        document.getElementById('singlePlayerScoreboard').style.display = 'none';
        // Reset circleTurn to false for two-player mode
        circleTurn = false;
    });

    playAgainButton.addEventListener('click', () => {
        gameOverModal.style.display = 'none';
        startGame(isSinglePlayer);
    });

    function startGame(singlePlayer) {
        isSinglePlayer = singlePlayer;
        circleTurn = false;
        cells.forEach(cell => {
            cell.classList.remove('circle', 'x');
            cell.removeEventListener('click', handleClick);
            cell.addEventListener('click', handleClick, { once: true });
        });
        setBoardHoverClass();
        gameInfo.textContent = "Player X's turn";
    }

    function handleClick(e) {
        const cell = e.target;
        const currentClass = circleTurn ? 'circle' : 'x';
        placeMark(cell, currentClass);
        if (checkWin(currentClass)) {
            endGame(false, currentClass);
        } else if (isDraw()) {
            endGame(true);
        } else {
            swapTurns();
            setBoardHoverClass();
            if (isSinglePlayer && circleTurn) {
                aiMove(); // This should not be called in two-player mode
            }
        }
    }

    function endGame(draw, winnerClass = null) {
        console.log("End Game Called:", draw, winnerClass);
        if (draw) {
            winnerMessage.textContent = 'Draw!';
        } else {
            const winner = winnerClass === 'x' ? "Player X" : "Player O";
            winnerMessage.textContent = `${winner} Wins!`;
            if (winnerClass === 'x') {
                updateScore('playerOne');
            } else {
                updateScore('machine');
            }
            updateScores();
        }
        gameOverModal.style.display = 'block';
        cells.forEach(cell => {
            cell.removeEventListener('click', handleClick);
        });
    }

    function updateScores() {
        playerOneScoreEl.textContent = `Player 1: ${playerOneScore}`;
        playerTwoScoreEl.textContent = `Player 2: ${playerTwoScore}`;
        machineScoreEl.textContent = `Machine: ${playerTwoScore}`;
    }

    function updateScore(player) {
        console.log(`Updating score for ${player}`);
        if (currentMode === 'singlePlayer') {
            if (player === 'playerOne') {
                let scoreElement = document.getElementById('singlePlayerOneScore');
                let score = parseInt(scoreElement.textContent.split(': ')[1]);
                scoreElement.textContent = 'Player 1: ' + (score + 1);
            } else if (player === 'machine') {
                let scoreElement = document.getElementById('machineScore');
                let score = parseInt(scoreElement.textContent.split(': ')[1]);
                scoreElement.textContent = 'Machine: ' + (score + 1);
            }
        } else if (currentMode === 'twoPlayer') {
            if (player === 'playerOne') {
                let scoreElement = document.getElementById('playerOneScore');
                let score = parseInt(scoreElement.textContent.split(': ')[1]);
                scoreElement.textContent = 'Player 1: ' + (score + 1);
            } else if (player === 'playerTwo') {
                let scoreElement = document.getElementById('playerTwoScore');
                let score = parseInt(scoreElement.textContent.split(': ')[1]);
                scoreElement.textContent = 'Player 2: ' + (score + 1);
            }
        }
    }

    function aiMove() {
        let bestMove;
        const currentClass = 'circle'; // Assuming AI is always 'O'

        // Check if AI can win in the next move
        bestMove = findBestMove(currentClass);
        if (bestMove !== -1) {
            cells[bestMove].click();
            return;
        }

        // Check if player can win in the next move and block them
        bestMove = findBestMove('x'); // Assuming player is always 'X'
        if (bestMove !== -1) {
            cells[bestMove].click();
            return;
        }

        // Otherwise, pick a random cell (fallback)
        const availableCells = Array.from(cells).filter(cell => !cell.classList.contains('x') && !cell.classList.contains('circle'));
        const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
        if (randomCell) {
            randomCell.click();
        }
    }

    function findBestMove(playerClass) {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];

        for (let combination of winningCombinations) {
            const cellValues = combination.map(index => cells[index].classList.contains(playerClass));
            if (cellValues.filter(v => v).length === 2) { // Check if two cells are already filled with 'playerClass'
                const emptyIndex = cellValues.indexOf(false);
                if (!cells[combination[emptyIndex]].classList.contains('x') && !cells[combination[emptyIndex]].classList.contains('circle')) {
                    return combination[emptyIndex]; // Return the index of the empty cell that completes the line
                }
            }
        }
        return -1; // No strategic move found
    }

    function isDraw() {
        return [...cells].every(cell => {
            return cell.classList.contains('x') || cell.classList.contains('circle');
        });
    }

    function placeMark(cell, currentClass) {
        cell.classList.add(currentClass);
    }

    function swapTurns() {
        console.log("Before swap:", circleTurn);
        circleTurn = !circleTurn;
        console.log("After swap:", circleTurn);
        gameInfo.textContent = `${circleTurn ? "Player O's" : "Player X's"} turn`;
    }

    function setBoardHoverClass() {
        board.classList.remove('circle', 'x');
        if (circleTurn) {
            board.classList.add('circle');
        } else {
            board.classList.add('x');
        }
    }

    function checkWin(currentClass) {
        const winningCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        return winningCombinations.some(combination => {
            return combination.every(index => {
                return cells[index].classList.contains(currentClass);
            });
        });
    }
});

