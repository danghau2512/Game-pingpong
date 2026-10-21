const gameBoard = document.querySelector(".game-board");
const ball = document.querySelector(".ball");
const paddle = document.querySelector(".paddle");

let growTime = 0;
let lastGrowTime = 0;
const growInterval = 5000;
const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");
const brickContainer = document.getElementById("brickContainer");
const winMessage = document.getElementById("winMessage");
const gameOverMessage = document.getElementById("gameOverMessage");
const finalScore = document.getElementById("finalScore");
const winTitle = document.getElementById("winTitle");
const growInfo =document.getElementById("growInfo");
const growSeconds = document.getElementById("growSeconds");
let score = 0;
let lives = 3;
let gameWon = false;
let ballX = 390;
let ballY = 410;

let ballSpeedX = 240;
let ballSpeedY = -240;

let paddleX = 340;

let gameStarted = false;
const brickRows = 3;
const brickColumns = 8;

let bricks = [];
let brickCells = [];
let currentLevel = 1;
let unlockStage = 0;
let levelReady = true;
let animationId = null;
let lastFrameTime = 0;
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

function moveBall(time) {
    if (!gameStarted) {
        return;
    }
    if (currentLevel === 3) {
        updateGrowTimer();
    }
    const deltaTime = Math.min((time - lastFrameTime) / 1000, 0.05);
    lastFrameTime = time;
    ballX += ballSpeedX * deltaTime;
    ballY += ballSpeedY* deltaTime;
    checkWallCollision();
    checkPaddleCollision();
    checkBrickCollision();
    checkWin();
    if (!gameStarted) {
        return;
    }
    checkBallLost()
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
            lastFrameTime = performance.now();
            animationId = requestAnimationFrame(moveBall);
            if (currentLevel === 3) {
                lastGrowTime = performance.now();
            }
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
                ballSpeedX = 120;
            }
            else {
                ballSpeedX = -120;
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
            if (currentLevel === 4) {
                if (brick.dataset.type === "stone") {
                    break;
                }
                if (brick.dataset.type === "bomb") {
                    const row = Number(brick.dataset.row);
                    const col = Number(brick.dataset.col);

                    destroyBrick(brick);
                    explodeBomb(row, col);
                    break;
                }
            }
            if (currentLevel === 5) {
                const col = Number(brick.dataset.col);
                destroyBrick(brick);
                applyGridGravity(col);

                break;
            }
            destroyBrick(brick);
            break;
        }
    }
}
function resetBall() {
    ballX = 390;
    ballY = 410;
    ballSpeedX = 240;
    ballSpeedY = -240;
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
        winTitle.textContent = "HOÀN THÀNH LEVEL " + currentLevel + "!";
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
    growTime = 0;
    lastGrowTime = 0;
    growSeconds.textContent = 5;
    growInfo.style.display = "none";
    scoreElement.textContent = score;
    updateLives();
    winMessage.style.display = "none";
    gameOverMessage.style.display = "none";
    brickContainer.innerHTML = "";
    bricks = [];
    brickCells = [];

    resetBall();

    if (level === 1) {
        levelReady = true;
        levelNotice.style.display = "none";
        createBricks();
    } else if (level === 2) {
        levelReady = true;
        levelNotice.style.display = "none";
        createLevel2Bricks();
    } else if (level === 3) {
        levelReady = true;
        levelNotice.style.display = "none";
        growInfo.style.display = "block";
        createLevel3Bricks();
    } else if (level === 4) {
        levelReady = true;
        levelNotice.style.display = "none";
        createLevel4Bricks();
    } else if (level === 5) {
        levelReady = true;
        levelNotice.style.display = "none";
        createLevel5Bricks();

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
//=========Level 3=========
function createLevel3Bricks() {
    const map = [
        "NNNNNNNN",
        "NN.NNN.N",
        "N.M.N.M."
    ];

    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
            const brick = document.createElement("div");
            brick.classList.add("brick");

            brick.dataset.row = row;
            brick.dataset.col = col;

            if (map[row][col] === "M") {
                brick.classList.add("mother-brick");
                brick.dataset.type = "mother";
                brick.innerHTML = '<i class="fa-solid fa-seedling"></i>';
            } else if (map[row][col] === ".") {
                brick.dataset.type = "empty";
                brick.style.visibility = "hidden";
            } else {
                brick.dataset.type = "normal";
            }

            brickContainer.appendChild(brick);
            brickCells.push(brick);

            if (brick.dataset.type !== "empty") {
                bricks.push(brick);
            }
        }
    }
}
function findEmptyCells(row, col) {
    const positions = [
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1]
    ];
    const emptyCells = [];
    for (let i = 0; i < positions.length; i++) {
        const r = positions[i][0];
        const c = positions[i][1];
        if (r < 0 || r >= brickRows || c < 0 || c >= brickColumns) {
            continue;
        }
        const index = r * brickColumns + c;
        const cell = brickCells[index];

        if (cell.dataset.type === "empty") {
            emptyCells.push(cell);
        }
    }
    return emptyCells;
}
function growBricks() {
    const totalBricks = bricks.length;
    for (let i = 0; i < totalBricks; i++) {
        const brick = bricks[i];
        if (brick.dataset.type === "mother") {
            const row = Number(brick.dataset.row);
            const col = Number(brick.dataset.col);
            const emptyCells = findEmptyCells(row, col);
            if (emptyCells.length > 0) {
                const randomIndex = Math.floor(Math.random() * emptyCells.length);
                const newBrick = emptyCells[randomIndex];
                newBrick.dataset.type = "child";
                newBrick.classList.add("child-brick");
                newBrick.style.visibility = "visible";
                bricks.push(newBrick);
            }
        }
    }
}
function updateGrowTimer() {
    const now = performance.now();
    growTime += now - lastGrowTime;
    lastGrowTime = now;
    if (growTime >= growInterval) {
        growTime = 0;
        growBricks();
    }
    growSeconds.textContent = Math.ceil((growInterval - growTime) / 1000);
}
//============LV4============
function createLevel4Bricks() {
    const map = [
        "NNNNNNNN",
        "NNBB.NSN",
        "NSSN.NNB"
    ];
    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
            const brick = document.createElement("div");
            brick.classList.add("brick");
            brick.dataset.row = row;
            brick.dataset.col = col;
            if (map[row][col] === "B") {
                brick.dataset.type = "bomb";
                brick.classList.add("bomb-brick");
                brick.innerHTML = '<i class="fa-solid fa-bomb"></i>';
            } else if (map[row][col] === "S") {
                brick.dataset.type = "stone";
                brick.classList.add("stone-brick");
                brick.innerHTML = '<i class="fa-solid fa-shield"></i>';
            } else if (map[row][col] === ".") {
                brick.dataset.type = "empty";
                brick.style.visibility = "hidden";
            } else {
                brick.dataset.type = "normal";
                brick.classList.add("level4-normal");
            }
            brickContainer.appendChild(brick);
            brickCells.push(brick);
            if (brick.dataset.type !== "empty") {
                bricks.push(brick);
            }
        }
    }
}
function destroyBrick(brick) {
    const index = bricks.indexOf(brick);
    if (index === -1) {
        return;
    }
    brick.style.visibility = "hidden";
    if (currentLevel === 3 || currentLevel === 4 || currentLevel === 5) {
        brick.dataset.type = "empty";
        brick.classList.remove("mother-brick", "child-brick", "bomb-brick", "stone-brick", "level4-normal", "cracked-brick","level5-normal");
        brick.innerHTML = "";
    }
    bricks.splice(index, 1);
    score += 10;
    scoreElement.textContent = score;
}
function explodeBomb(row, col) {
    showExplosion(row, col);
    for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
            if (r < 0 || r >= brickRows || c < 0 || c >= brickColumns) {
                continue;
            }
            if (r === row && c === col) {
                continue;
            }
            const index = r * brickColumns + c;
            const brick = brickCells[index];
            if (brick.dataset.type === "bomb") {
                destroyBrick(brick);
                explodeBomb(r, c);
            } else if (brick.dataset.type === "normal" || brick.dataset.type === "stone") {
                destroyBrick(brick);
            }

        }
    }
}
function showExplosion(row, col) {
    const index = row * brickColumns + col;
    const brick = brickCells[index];
    const brickRect = brick.getBoundingClientRect();
    const boardRect = gameBoard.getBoundingClientRect();
    const effect = document.createElement("div");
    effect.classList.add("bomb-explosion");
    effect.style.left = brickRect.left - boardRect.left + brickRect.width / 2 + "px";
    effect.style.top = brickRect.top - boardRect.top + brickRect.height / 2 + "px";
    gameBoard.appendChild(effect);
    setTimeout(function() {
        effect.remove();
        }, 350);
}
// =======LV5=======
function createLevel5Bricks() {
    const map = [
        "NNNCNNNN",
        "NCNNNNCN",
        "NNNNNNCN"
    ];
    for (let row = 0; row < map.length; row++) {
        for (let col = 0; col < map[row].length; col++) {
            const brick = document.createElement("div");
            brick.classList.add("brick");
            brick.dataset.row = row;
            brick.dataset.col = col;
            if (map[row][col] === "C") {
                brick.dataset.type = "cracked";
                brick.classList.add("cracked-brick");
                brick.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
            } else {
                brick.dataset.type = "normal";
                brick.classList.add("level5-normal");
            }
            brickContainer.appendChild(brick);
            brickCells.push(brick);
            bricks.push(brick);
        }
    }
}
function applyGridGravity(col) {
    let bottomRow = brickRows - 1;
    for (let row = brickRows - 1; row >= 0; row--) {
        const source = brickCells[row * brickColumns + col];
        if (source.dataset.type === "empty") {
            continue;
        }
        const target = brickCells[bottomRow * brickColumns + col];
        if (source !== target) {
            target.dataset.type = source.dataset.type;
            target.className = source.className;
            target.innerHTML = source.innerHTML;
            target.style.visibility = "visible";

            source.dataset.type = "empty";
            source.className = "brick";
            source.innerHTML = "";
            source.style.visibility = "hidden";
        }

        bottomRow--;
    }
    bricks = [];
    for (let i = 0; i < brickCells.length; i++) {
        if (brickCells[i].dataset.type !== "empty") {
            bricks.push(brickCells[i]);
        }
    }
}