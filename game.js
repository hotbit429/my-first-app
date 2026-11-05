const canvas = document.querySelector("#game");
const context = canvas.getContext("2d");
const coinCount = document.querySelector("#coin-count");
const gameMessage = document.querySelector("#game-message");
const messageKicker = gameMessage.querySelector(".message-kicker");
const messageTitle = gameMessage.querySelector("strong");
const messageDetail = gameMessage.querySelector("span:not(.message-kicker)");
const gameStatus = document.querySelector("#game-status");
const startButton = document.querySelector("#start-button");
const restartButton = document.querySelector("#restart-button");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const WORLD_WIDTH = 2700;
const GRAVITY = 0.62;
const MOVE_SPEED = 4.3;
const JUMP_SPEED = -12.8;

const platforms = [
  { x: 0, y: 460, width: 620, height: 100 },
  { x: 730, y: 460, width: 600, height: 100 },
  { x: 1450, y: 460, width: 500, height: 100 },
  { x: 2070, y: 460, width: 630, height: 100 },
  { x: 250, y: 365, width: 145, height: 18 },
  { x: 500, y: 300, width: 145, height: 18 },
  { x: 865, y: 375, width: 165, height: 18 },
  { x: 1110, y: 315, width: 150, height: 18 },
  { x: 1510, y: 365, width: 155, height: 18 },
  { x: 1760, y: 295, width: 145, height: 18 },
  { x: 2150, y: 370, width: 165, height: 18 },
  { x: 2420, y: 305, width: 155, height: 18 },
];

const coinSpots = [
  { x: 305, y: 325 },
  { x: 552, y: 260 },
  { x: 790, y: 415 },
  { x: 915, y: 335 },
  { x: 1165, y: 275 },
  { x: 1570, y: 325 },
  { x: 1815, y: 255 },
  { x: 2480, y: 265 },
];

const player = {
  x: 64,
  y: 400,
  width: 34,
  height: 48,
  velocityX: 0,
  velocityY: 0,
  grounded: false,
};

let coins = [];
let cameraX = 0;
let collected = 0;
let playing = false;
let jumpWasDown = false;
let animationFrame = 0;
const pressedKeys = new Set();

function resetGame() {
  player.x = 64;
  player.y = 400;
  player.velocityX = 0;
  player.velocityY = 0;
  player.grounded = false;
  coins = coinSpots.map((coin) => ({ ...coin, collected: false }));
  cameraX = 0;
  collected = 0;
  playing = true;
  jumpWasDown = false;
  coinCount.textContent = "0";
  gameStatus.textContent = "← → / A D で移動　・　Space / ↑ でジャンプ";
  gameMessage.classList.add("is-hidden");
}

function setMessage(kicker, title, detail, buttonText) {
  messageKicker.textContent = kicker;
  messageTitle.textContent = title;
  messageDetail.textContent = detail;
  startButton.textContent = buttonText;
  gameMessage.classList.remove("is-hidden");
}

function endGame(won) {
  playing = false;
  if (won) {
    setMessage("LEVEL CLEAR", "ゴール！", `コインを ${collected} 枚集めたよ。おめでとう！`, "もう一度遊ぶ");
    gameStatus.textContent = "クリア！もう一度プレイしてベストスコアを目指そう。";
  } else {
    setMessage("TRY AGAIN", "もう一回！", `集めたコインは ${collected} 枚。あきらめずに挑戦しよう。`, "リトライ");
    gameStatus.textContent = "落ちてしまった！リトライして再挑戦しよう。";
  }
}

function isJumpDown() {
  return pressedKeys.has("jump") || pressedKeys.has("ArrowUp") || pressedKeys.has("w") || pressedKeys.has(" ");
}

function update() {
  if (!playing) return;

  const movingLeft = pressedKeys.has("left") || pressedKeys.has("ArrowLeft") || pressedKeys.has("a");
  const movingRight = pressedKeys.has("right") || pressedKeys.has("ArrowRight") || pressedKeys.has("d");
  const jumpDown = isJumpDown();

  player.velocityX = (Number(movingRight) - Number(movingLeft)) * MOVE_SPEED;
  if (jumpDown && !jumpWasDown && player.grounded) {
    player.velocityY = JUMP_SPEED;
    player.grounded = false;
  }
  jumpWasDown = jumpDown;

  const previousX = player.x;
  player.x += player.velocityX;
  for (const platform of platforms) {
    const overlapsY = player.y + player.height > platform.y && player.y < platform.y + platform.height;
    const overlapsX = player.x + player.width > platform.x && player.x < platform.x + platform.width;
    if (!overlapsX || !overlapsY) continue;
    if (player.velocityX > 0) player.x = platform.x - player.width;
    if (player.velocityX < 0) player.x = platform.x + platform.width;
  }
  player.x = Math.max(0, Math.min(WORLD_WIDTH - player.width, player.x));
  if (player.x === previousX && player.velocityX !== 0) player.velocityX = 0;

  const previousY = player.y;
  player.velocityY = Math.min(player.velocityY + GRAVITY, 16);
  player.y += player.velocityY;
  player.grounded = false;
  for (const platform of platforms) {
    const overlapsX = player.x + player.width > platform.x && player.x < platform.x + platform.width;
    const overlapsY = player.y + player.height > platform.y && player.y < platform.y + platform.height;
    if (!overlapsX || !overlapsY) continue;

    if (player.velocityY > 0 && previousY + player.height <= platform.y + 8) {
      player.y = platform.y - player.height;
      player.velocityY = 0;
      player.grounded = true;
    } else if (player.velocityY < 0 && previousY >= platform.y + platform.height - 4) {
      player.y = platform.y + platform.height;
      player.velocityY = 0;
    }
  }

  for (const coin of coins) {
    if (coin.collected) continue;
    const dx = player.x + player.width / 2 - coin.x;
    const dy = player.y + player.height / 2 - coin.y;
    if (dx * dx + dy * dy < 30 * 30) {
      coin.collected = true;
      collected += 1;
      coinCount.textContent = String(collected);
    }
  }

  if (player.y > HEIGHT + 140) {
    endGame(false);
    return;
  }
  if (player.x + player.width >= WORLD_WIDTH - 75) endGame(true);

  cameraX = Math.max(0, Math.min(WORLD_WIDTH - WIDTH, player.x - WIDTH * 0.36));
}

function drawBackground() {
  const sky = context.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, "#020815");
  sky.addColorStop(0.35, "#0b1730");
  sky.addColorStop(0.72, "#1b2e5b");
  sky.addColorStop(1, "#0d0f1d");
  context.fillStyle = sky;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  context.fillStyle = "rgba(255, 255, 255, 0.9)";
  context.beginPath();
  context.arc(WIDTH - 150, 86, 34, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "rgba(82, 240, 255, 0.28)";
  for (let i = 0; i < 40; i += 1) {
    const x = ((i * 71 - cameraX * 0.32) % (WIDTH + 160)) - 25;
    const y = 30 + (i % 9) * 24;
    context.fillRect(x, y, 2, 2);
  }

  context.fillStyle = "rgba(122, 242, 255, 0.38)";
  for (const cloud of [
    { x: 150, y: 104, scale: 1 },
    { x: 460, y: 150, scale: 0.75 },
    { x: 800, y: 88, scale: 0.9 },
  ]) {
    const x = ((cloud.x - cameraX * 0.18) % (WIDTH + 180) + WIDTH + 180) % (WIDTH + 180) - 70;
    context.beginPath();
    context.ellipse(x, cloud.y, 38 * cloud.scale, 15 * cloud.scale, 0, 0, Math.PI * 2);
    context.ellipse(x - 22 * cloud.scale, cloud.y + 4, 22 * cloud.scale, 11 * cloud.scale, 0, 0, Math.PI * 2);
    context.ellipse(x + 22 * cloud.scale, cloud.y + 4, 25 * cloud.scale, 11 * cloud.scale, 0, 0, Math.PI * 2);
    context.fill();
  }

  context.fillStyle = "#171c2d";
  context.beginPath();
  context.moveTo(0, 430);
  for (let x = 0; x <= WIDTH + 120; x += 85) {
    context.lineTo(x, 365 + Math.sin((x + cameraX * 0.15) * 0.016) * 26);
  }
  context.lineTo(WIDTH, HEIGHT);
  context.lineTo(0, HEIGHT);
  context.closePath();
  context.fill();
}

function drawPlatforms() {
  for (const platform of platforms) {
    const x = platform.x - cameraX;
    if (x + platform.width < -5 || x > WIDTH + 5) continue;

    context.fillStyle = "#1b2237";
    context.fillRect(x, platform.y, platform.width, platform.height);
    context.fillStyle = "#5ef2ff";
    context.fillRect(x, platform.y, platform.width, 9);
    context.fillStyle = "#96f7ff";
    context.fillRect(x, platform.y, platform.width, 3);

    if (platform.height > 30) {
      context.fillStyle = "rgba(94, 242, 255, 0.2)";
      for (let tileX = x + 12; tileX < x + platform.width; tileX += 34) {
        context.fillRect(tileX, platform.y + 24, 12, 4);
        context.fillRect(tileX - 10, platform.y + 48, 17, 4);
      }
    }
  }
}

function drawCoins() {
  for (const coin of coins) {
    if (coin.collected) continue;
    const x = coin.x - cameraX;
    if (x < -20 || x > WIDTH + 20) continue;
    const wobble = Math.sin(animationFrame * 0.08 + coin.x) * 2;
    context.fillStyle = "#ffd166";
    context.beginPath();
    context.arc(x, coin.y + wobble, 11, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#fff2a6";
    context.lineWidth = 3;
    context.beginPath();
    context.arc(x, coin.y + wobble, 6, 0, Math.PI * 2);
    context.stroke();
  }
}

function drawPlayer() {
  const x = player.x - cameraX;
  const y = player.y;

  context.fillStyle = "#0d1320";
  context.fillRect(x + 3, y + 8, player.width - 6, player.height - 8);

  context.fillStyle = "#64f0ff";
  context.fillRect(x + 6, y, player.width - 12, 24);

  context.fillStyle = "#d35cff";
  context.fillRect(x + 3, y + 20, player.width - 6, 18);

  context.fillStyle = "#0d1320";
  context.fillRect(x + 7, y + 39, 8, 9);
  context.fillRect(x + 21, y + 39, 8, 9);

  context.fillStyle = "#f4f9ff";
  context.fillRect(x + 8, y + 5, 6, 5);
  context.fillRect(x + 20, y + 5, 6, 5);
  context.fillStyle = "#ff7edb";
  context.fillRect(x + 14, y + 8, 6, 4);
}

function drawGoal() {
  const x = WORLD_WIDTH - 80 - cameraX;
  context.fillStyle = "#ebf3ff";
  context.fillRect(x, 355, 5, 105);
  context.fillStyle = "#ff4db8";
  context.beginPath();
  context.moveTo(x + 5, 358);
  context.lineTo(x + 60, 373);
  context.lineTo(x + 5, 390);
  context.closePath();
  context.fill();
}

function draw() {
  drawBackground();
  drawPlatforms();
  drawCoins();
  drawGoal();
  drawPlayer();
  animationFrame += 1;
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

function handleKeyDown(event) {
  const key = event.key.toLowerCase();
  if (["arrowleft", "arrowright", "arrowup", " "].includes(key)) event.preventDefault();
  if (["arrowleft", "a"].includes(key)) pressedKeys.add("left");
  if (["arrowright", "d"].includes(key)) pressedKeys.add("right");
  if (["arrowup", "w", " "].includes(key)) pressedKeys.add(key === "arrowup" ? "ArrowUp" : key);
}

function handleKeyUp(event) {
  const key = event.key.toLowerCase();
  if (["arrowleft", "a"].includes(key)) pressedKeys.delete("left");
  if (["arrowright", "d"].includes(key)) pressedKeys.delete("right");
  if (["arrowup", "w", " "].includes(key)) pressedKeys.delete(key === "arrowup" ? "ArrowUp" : key);
}

document.addEventListener("keydown", handleKeyDown);
document.addEventListener("keyup", handleKeyUp);
window.addEventListener("blur", () => pressedKeys.clear());
startButton.addEventListener("click", resetGame);
restartButton.addEventListener("click", resetGame);

for (const button of document.querySelectorAll(".control-button")) {
  const key = button.dataset.key;
  const release = () => pressedKeys.delete(key);
  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    button.setPointerCapture(event.pointerId);
    pressedKeys.add(key);
  });
  button.addEventListener("pointerup", release);
  button.addEventListener("pointercancel", release);
  button.addEventListener("lostpointercapture", release);
}

resetGame();
playing = false;
setMessage("READY?", "冒険をはじめよう", "コインを集めて、旗を目指そう！", "ゲームスタート");
gameLoop();
