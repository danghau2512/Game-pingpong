const gameBoard = document.querySelector(".game-board");
const ball = document.querySelector(".ball");
const paddle = document.querySelector(".paddle");

const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");
const brickContainer = document.getElementById("brickContainer");
let score = 0;
let lives = 3;

let ballX = 390;
let ballY = 410;

let ballSpeedX = 4;
let ballSpeedY = -4;

let paddleX = 340;

let gameStarted = false;
const brickRows = 3;
const brickColumns = 8;

let bricks = [];

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
// Sự kiện chuột cho thanh trượt
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

// Sự kiện bàn phím cho thanh trượt
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
    ball.style.left = ballX + "px";
    ball.style.top = ballY + "px";

    requestAnimationFrame(moveBall);
}
document.addEventListener("keydown", function(event) {
    if (event.code === "Space" && !gameStarted) {
        event.preventDefault();
        gameStarted = true;
        moveBall();
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
        ballSpeedY *= -1;
    }
}