const gameBoard = document.querySelector(".game-board");
const ball = document.querySelector(".ball");
const paddle = document.querySelector(".paddle");

const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");
const brickContainer = document.getElementById("brickContainer");
const winMessage = document.getElementById("winMessage");
const gameOverMessage = document.getElementById("gameOverMessage");
const finalScore = document.getElementById("finalScore");
let score = 0;
let lives = 3;
let gameWon = false;
let ballX = 390;
let ballY = 410;

let ballSpeedX = 4;
let ballSpeedY = -4;

let paddleX = 340;

let gameStarted = false;
const brickRows = 3;
const brickColumns = 8;

let bricks = [];
let currentLevel = 1;
let unlockStage = 0;
let levelReady = true;
let animationId = null;
const levelNotice = document.getElementById("levelNotice");
const levelElement = document.getElementById("level");
const levelButtons = document.querySelectorAll(".level-btn");
function createBricks() {
    for (let row = 0; row < brickRows; row++) {
        for (let col = 0; col < brickColumns; col++) {
            const brick = document.createElement("div");
            brick.classList.add("brick");
            brickContainer.appendChild(brick);
            bricks.push(brick);
        }
    }
}
createBricks();
gameBoard.addEventListener("mousemove", function(event) {
    const boardRect = gameBoard.getBoundingClientRect();
    let mouseX = event.clientX - boardRect.left;
    paddleX = mouseX - paddle.offsetWidth / 2;
    if (paddleX < 0) {
        paddleX = 0;
    }
    if (paddleX > gameBoard.clientWidth - paddle.offsetWidth) {
        paddleX = gameBoard.clientWidth - paddle.offsetWidth;
    }
    paddle.style.left = paddleX + "px";
});

const paddleSpeed = 20;

document.addEventListener("keydown", function(event) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
    }
    if (event.key === "ArrowLeft") {
        paddleX -= paddleSpeed;
    }
    if (event.key === "ArrowRight") {
        paddleX += paddleSpeed;
    }
    if (paddleX < 0) {
        paddleX = 0;
    }
    if (paddleX > gameBoard.clientWidth - paddle.offsetWidth) {
        paddleX = gameBoard.clientWidth - paddle.offsetWidth;
    }
    paddle.style.left = paddleX + "px";
});

function moveBall() {
    if (!gameStarted) {
        return;
    }
    ballX += ballSpeedX;
    ballY += ballSpeedY;
    checkWallCollision();
    checkPaddleCollision();
    checkBrickCollision();
    checkBallLost()
    checkWin();
    if (!gameStarted) {
        return;
    }
    ball.style.left = ballX + "px";
    ball.style.top = ballY + "px";

    animationId = requestAnimationFrame(moveBall);
}
document.addEventListener("keydown", function(event) {
    if (event.code === "Space") {
        event.preventDefault();
        if (!gameStarted && lives > 0 && !gameWon && levelReady) {
            gameStarted = true;
            moveBall();
        }
    }
    if (event.code === "KeyR") {
        if (gameWon || lives === 0) {
            restartGame();
        }
    }
});


function checkWallCollision() {
    if (ballX <= 0) {
        ballX = 0;
        ballSpeedX *= -1;
    }
    if (ballX + ball.offsetWidth >= gameBoard.clientWidth) {
        ballX = gameBoard.clientWidth - ball.offsetWidth;
        ballSpeedX *= -1;
    }
    if (ballY <= 0) {
        ballY = 0;
        ballSpeedY *= -1;
    }
}
function checkPaddleCollision() {
    const ballRight = ballX + ball.offsetWidth;
    const ballBottom = ballY + ball.offsetHeight;
    const paddleRight = paddleX + paddle.offsetWidth;
    const paddleTop = paddle.offsetTop;
    if (ballSpeedY > 0 && ballBottom >= paddleTop && ballY <= paddleTop + paddle.offsetHeight && ballRight >= paddleX && ballX <= paddleRight) {
        ballY = paddleTop - ball.offsetHeight;
        ballSpeedY = -Math.abs(ballSpeedY);
        const ballCenter = ballX + ball.offsetWidth / 2;
        const paddleWidth = paddle.offsetWidth;
        if (ballCenter < paddleX + paddleWidth / 3) {
            ballSpeedX = -Math.abs(ballSpeedX);
        }
        else if (ballCenter > paddleX + paddleWidth * 2 / 3) {
            ballSpeedX = Math.abs(ballSpeedX);
        }
        else {
            if (ballSpeedX > 0) {
                ballSpeedX = 2;
            }
            else {
                ballSpeedX = -2;
            }
        }
    }
}
function checkBrickCollision() {
    const ballRight = ballX + ball.offsetWidth;
    const ballBottom = ballY + ball.offsetHeight;
    for (let i = 0; i < bricks.length; i++) {
        const brick = bricks[i];
        const brickLeft = brick.offsetLeft;
        const brickTop = brick.offsetTop;
        const brickRight = brickLeft + brick.offsetWidth;
        const brickBottom = brickTop + brick.offsetHeight;
        if (ballRight >= brickLeft && ballX <= brickRight && ballBottom >= brickTop && ballY <= brickBottom) {
            const overlapLeft = ballRight - brickLeft;
            const overlapRight = brickRight - ballX;
            const overlapTop = ballBottom - brickTop;
            const overlapBottom = brickBottom - ballY;
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
            if (minOverlap === overlapLeft) {
                ballX = brickLeft - ball.offsetWidth;
                ballSpeedX = -Math.abs(ballSpeedX);
            } else if (minOverlap === overlapRight) {
                ballX = brickRight;
                ballSpeedX = Math.abs(ballSpeedX);
            } else if (minOverlap === overlapTop) {
                ballY = brickTop - ball.offsetHeight;
                ballSpeedY = -Math.abs(ballSpeedY);
            } else {
                ballY = brickBottom;
                ballSpeedY = Math.abs(ballSpeedY);
            }
            if (currentLevel === 2) {
                const brickType = brick.dataset.type;
                if (brickType === "normal" && unlockStage < 2) {
                    break;
                }
                if (brickType === "lock" && unlockStage === 0) {
                    break;
                }
                if (brickType === "key") {
                    unlockStage = 1;
                    const lockBrick = document.querySelector(".lock-brick");

                    if (lockBrick) {
                        lockBrick.classList.add("unlocked");
                        lockBrick.innerHTML = '<i class="fa-solid fa-lock-open"></i>';
                    }
                } else if (brickType === "lock") {
                    unlockStage = 2;
                    const normalBricks = document.querySelectorAll(".normal-brick");
                    normalBricks.forEach(function(brick) {
                        brick.classList.add("unlocked");
                    });
                }
            }
            brick.style.visibility = "hidden";
            bricks.splice(i, 1);
            score += 10;
            scoreElement.textContent = score;
            break;
        }
    }
}
function resetBall() {
    ballX = 390;
    ballY = 410;
    ballSpeedX = 4;
    ballSpeedY = -4;
    paddleX = 340;
    ball.style.left = ballX + "px";
    ball.style.top = ballY + "px";
    paddle.style.left = paddleX + "px";
}
function checkBallLost() {
    if (ballY + ball.offsetHeight >= gameBoard.clientHeight) {
        lives--;
        updateLives();
        if (lives === 0) {
            livesElement.textContent = "0";
        }
        gameStarted = false;
        if (lives === 0) {
            finalScore.textContent = score;
            gameOverMessage.style.display = "block";
        }else{
            resetBall();

        }
    }
}
function updateLives() {
    if (lives > 0) {
        livesElement.innerHTML = '<i class="fa-solid fa-heart"></i> '.repeat(lives);
    } else {
        livesElement.textContent = "0";
    }
}
function checkWin() {
    if (bricks.length === 0 && !gameWon) {
        gameWon = true;
        gameStarted = false;

        winMessage.style.display = "block";
    }
}
function restartGame() {
    loadLevel(currentLevel);
}
function loadLevel(level) {
    gameStarted = false;
    cancelAnimationFrame(animationId);
    currentLevel = level;
    levelElement.textContent = currentLevel;
    for (let i = 0; i < levelButtons.length; i++) {
        if (i + 1 === level) {
            levelButtons[i].classList.add("active");
        } else {
            levelButtons[i].classList.remove("active");
        }
    }
    score = 0;
    lives = 3;
    gameWon = false;
    unlockStage = 0;

    scoreElement.textContent = score;
    updateLives();
    winMessage.style.display = "none";
    gameOverMessage.style.display = "none";
    brickContainer.innerHTML = "";
    bricks = [];

    resetBall();

    if (level === 1) {
        levelReady = true;
        levelNotice.style.display = "none";
        createBricks();
    } else if (level === 2) {
        levelReady = true;
        levelNotice.style.display = "none";
        createLevel2Bricks();
    } else {
        levelReady = false;
        levelNotice.textContent = "Level " + level + " đang được phát triển";
        levelNotice.style.display = "block";
    }
}
// =====LEVEL 2==========
function createLevel2Bricks() {
    for (let row = 0; row < brickRows; row++) {
        for (let col = 0; col < brickColumns; col++) {
            const brick = document.createElement("div");
            brick.classList.add("brick");

            if (row === 2 && col === 2) {
                brick.classList.add("key-brick");
                brick.dataset.type = "key";
                brick.innerHTML = '<i class="fa-solid fa-key"></i>';
            } else if (row === 2 && col === 5) {
                brick.classList.add("lock-brick");
                brick.dataset.type = "lock";
                brick.innerHTML = '<i class="fa-solid fa-lock"></i>';
            } else {
                brick.classList.add("normal-brick");
                brick.dataset.type = "normal";
            }

            brickContainer.appendChild(brick);
            bricks.push(brick);
        }
    }
}