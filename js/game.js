const gameBoard = document.querySelector(".game-board");
const ball = document.querySelector(".ball");
const paddle = document.querySelector(".paddle");

const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");

let score = 0;
let lives = 3;

let ballX = 390;
let ballY = 410;

let ballSpeedX = 4;
let ballSpeedY = -4;

let paddleX = 340;

let gameStarted = false;