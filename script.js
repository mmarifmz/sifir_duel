// Using Umbrella JS for DOM manipulation
const $u = u; // Assign Umbrella's 'u' to '$u' to avoid conflicts

let player1Name, player2Name;
let currentPlayer = 1;
let playerPositions = { 1: 0, 2: 0 };
let playerPoints = { 1: 0, 2: 0 };
let timerInterval;
let startTime;
let totalTurns = 10; // Default number of turns
let currentTurn = 1;

$u('#startGameBtn').on('click', startGame);
$u('#rollDiceBtn').on('click', rollDice);
$u('#submitAnswerBtn').on('click', submitAnswer);

$u('#backToStartBtn').on('click', closeModalAndResetGame); // Resets and goes back to start
$u('.btn-close').on('click', closeModal); // Only closes the modal
$u('#winningModal').on('hidden.bs.modal', closeModal); // Only closes the modal, use this to handle the modal being closed via clicking outside the modal area

function startGame() {
    player1Name = $u('#player1').first().value.trim();
    player2Name = $u('#player2').first().value.trim();
    totalTurns = parseInt($u('#turns').first().value);

    if (player1Name === '' || player2Name === '') {
        alert('Please enter both players\' names.');
        return;
    }

    $u('#player1Points').text(`${player1Name}: 0 points`);
    $u('#player2Points').text(`${player2Name}: 0 points`);

    document.getElementById('nameInput').style.display = 'none';
    document.getElementById('gamePlay').style.display = 'block';
    document.getElementById('winnerMessage').style.display = 'none';
    document.getElementById('fireworksCanvas').style.display = 'none';
    document.getElementById('backToStartBtn').style.display = 'none';

    updateGameStatus(`${player1Name}'s turn. Roll the dice.`);
    $u('#turnDisplay').text(`Current Turn: ${player1Name}`);
    enableRollDiceButton();
    disableSubmitAnswerButton();
}

function rollDice() {
    const die1 = Math.floor(Math.random() * 11) + 1;
    const die2 = Math.floor(Math.random() * 11) + 1;

    const multiplicand = die1;
    const multiplier = die2;

    updateGameStatus(`You rolled: ${multiplicand} × ${multiplier}`);
    $u('#answer').first().value = '';

    // Remove this line: clearInterval(timer);
    startTurnTimer();

    disableRollDiceButton();
    enableSubmitAnswerButton();
}

function startTurnTimer() {
    clearInterval(timerInterval); // Ensure any existing timer is cleared before starting a new one
    startTime = Date.now();
    updateTimerDisplay();
    timerInterval = setInterval(updateTimerDisplay, 10); // Update every 10ms for smooth display
}

function updateTimerDisplay() {
    const elapsedTime = (Date.now() - startTime) / 1000; // Convert to seconds
    const timeLeft = Math.max(10 - elapsedTime, 0);
    $u('#timerDisplay').text(`Turn Timer: ${timeLeft.toFixed(3)} seconds`);
    
    if (timeLeft <= 0) {
        clearInterval(timerInterval);
        endTurnDueToTimeout();
    }
}

function submitAnswer() {
    clearInterval(timerInterval);

    const answer = parseInt($u('#answer').first().value.trim());
    const gameStatusText = $u('#gameStatus').text();
    const [, , multiplicand, , multiplier] = gameStatusText.split(' ');
    const product = parseInt(multiplicand) * parseInt(multiplier);

    // Ensure elapsedTime calculation is done before using it
    const elapsedTime = (Date.now() - startTime) / 1000; // Time taken in seconds
    

    if (answer === product) {
        let pointsEarned = Math.max(10 - elapsedTime, 0).toFixed(3);
        playerPoints[currentPlayer] += parseFloat(pointsEarned);
        updateGameStatus(`Correct! ${currentPlayer === 1 ? player1Name : player2Name} earns ${pointsEarned} points.`);
    } else {
        updateGameStatus(`Incorrect! The correct answer is ${product}.`);
    }

    // Logging history
    const question = `${multiplicand} × ${multiplier}`;
    logHistory(question, answer === product ? answer : 'Incorrect', elapsedTime); // Pass 'Incorrect' if the answer was wrong

    updatePointsDisplay();
    prepareForNextPlayer();
}

function updatePointsDisplay() {
    $u('#player1Points').text(`${player1Name}: ${playerPoints[1].toFixed(3)} points`);
    $u('#player2Points').text(`${player2Name}: ${playerPoints[2].toFixed(3)} points`);
}

function prepareForNextPlayer() {
    clearInterval(timerInterval); // Add this line
    if (currentTurn >= totalTurns) {
        endGame();
    } else {
        currentTurn++;
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        $u('#turnDisplay').text(`Current Turn: ${currentPlayer === 1 ? player1Name : player2Name}`);
        enableRollDiceButton();
        disableSubmitAnswerButton();
    }
}

function endTurnDueToTimeout() {
    clearInterval(timerInterval);
    updateGameStatus(`Time's up! No points awarded.`);
    prepareForNextPlayer();
}

function endGame() {
    let winner = playerPoints[1] > playerPoints[2] ? player1Name : playerPoints[2] > playerPoints[1] ? player2Name : 'It\'s a tie!';
    $u('#winnerMessage').text(`Congratulations! ${winner} wins with ${Math.max(playerPoints[1], playerPoints[2]).toFixed(3)} points.`);
    disableAllButtons();
    showModal();
    startFireworks();
}

function showModal() {
    const modal = new bootstrap.Modal(document.getElementById('winningModal'));
    modal.show();
}

function closeModalAndResetGame() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('winningModal'));
    if (modal) {
        modal.hide();
    }
    backToStart();  // Resets the game when modal is closed
}

function closeModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('winningModal'));
    if (modal) {
        modal.hide();
    }
}

$u(document.body).on('keyup', function(e) {
    if (e.keyCode == 32) { // Spacebar key code
        if (!$u('#rollDiceBtn').first().disabled) {
            rollDice();
            setTimeout(() => $u('#answer').first().focus(), 100);
        } else if (!$u('#submitAnswerBtn').first().disabled) {
            submitAnswer();
        }
    }
});

function disableAllButtons() {
    disableRollDiceButton();
    disableSubmitAnswerButton();
    document.getElementById('backToStartBtn').style.display = 'block';
}

function enableRollDiceButton() {
    $u('#rollDiceBtn').first().disabled = false;
}

function disableRollDiceButton() {
    $u('#rollDiceBtn').first().disabled = true;
}

function enableSubmitAnswerButton() {
    $u('#submitAnswerBtn').first().disabled = false;
}

function disableSubmitAnswerButton() {
    $u('#submitAnswerBtn').first().disabled = true;
}

function backToStart() {
    // Ensure no fireworks are running
    stopFireworks();

    // Reset game setup
    document.getElementById('nameInput').style.display = 'block';
    document.getElementById('gamePlay').style.display = 'none';
    resetGame();
}

function updateGameStatus(message) {
    $u('#gameStatus').text(message);
}

function resetGame() {
    currentPlayer = 1;
    playerPositions = { 1: 0, 2: 0 };
    playerPoints = { 1: 0, 2: 0 };
    clearInterval(timerInterval);
    currentTurn = 1;
    $u('#player1').first().value = '';
    $u('#player2').first().value = '';
    $u('#turns').first().value = '10'; // Default turns
    document.getElementById('winnerMessage').style.display = 'none';
    document.getElementById('fireworksCanvas').style.display = 'none';
    document.getElementById('rollDiceBtn').style.display = 'block';
    document.getElementById('submitAnswerBtn').style.display = 'block';
    document.getElementById('timerDisplay').style.display = 'block';
    document.getElementById('backToStartBtn').style.display = 'none';
}

function startFireworks() {
    console.log("Starting fireworks...");  // Check if this logs when expected
    const canvas = document.getElementById('fireworksCanvas');
    if (!canvas) {
        console.error("Fireworks canvas not found!");
        return;
    }
    const ctx = canvas.getContext('2d');
    // Assuming you have a valid Fireworks function or library
    const fireworks = new Fireworks(canvas, ctx);
    fireworks.start();
}

function stopFireworks() {
    if (fireworks) {
        fireworks.stop();
    }
}

function backToStart() {
    document.getElementById('nameInput').style.display = 'block';
    document.getElementById('gamePlay').style.display = 'none';
    stopFireworks();
    resetGame();
}

function logHistory(question, answer, time) {
    const historyItem = document.createElement('li');
    historyItem.textContent = `${currentPlayer === 1 ? player1Name : player2Name}: ${question} = ${answer}, Time: ${time.toFixed(3)}s`;
    document.getElementById('historyList').appendChild(historyItem);
}