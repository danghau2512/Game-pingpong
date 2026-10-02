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