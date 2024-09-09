<template>
  <div class="game-container">
    <h1>Snake Game</h1>
    <div class="score">Score: {{ score }}</div>
    <div v-if="showHighScoreMessage" class="high-score-message">
      최고기록 갱신!
    </div>
    <div class="grid" ref="gridRef">
      <div 
        v-for="(cell, index) in cells" 
        :key="index" 
        :class="getCellClass(index)"
      ></div>
    </div>
    <button @click="startGame" class="start-button">Start/Restart</button>
    <div class="button-container">
      <button @click="goBack" class="back-button">Main Menu</button>
      <button @click="goToRank" class="rank-button">랭킹 보기</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import rankApi from '@/api/scoreApi';

const router = useRouter();
const gridSize = 15;
const cellSize = 20;
const initialSpeed = 200;

const cells = ref(Array(gridSize * gridSize).fill(null));
const snake = ref([{ x: 7, y: 7 }]);
const direction = ref('right');
const food = ref({ x: 0, y: 0 });
const score = ref(0);
const gameInterval = ref(null);
const gameSpeed = ref(initialSpeed);
const showHighScoreMessage = ref(false);
const gridRef = ref(null);

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
  gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
}));

function initGame() {
  snake.value = [{ x: 7, y: 7 }];
  direction.value = 'right';
  score.value = 0;
  gameSpeed.value = initialSpeed;
  placeFood();
}

function startGame() {
  initGame();
  if (gameInterval.value) clearInterval(gameInterval.value);
  gameInterval.value = setInterval(gameLoop, gameSpeed.value);
}

function placeFood() {
  let newFood;
  do {
    newFood = {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize)
    };
  } while (snake.value.some(segment => segment.x === newFood.x && segment.y === newFood.y));
  food.value = newFood;
}

function gameLoop() {
  const head = { ...snake.value[0] };

  switch (direction.value) {
    case 'up': head.y--; break;
    case 'down': head.y++; break;
    case 'left': head.x--; break;
    case 'right': head.x++; break;
  }

  if (isCollision(head)) {
    gameOver();
    return;
  }

  snake.value.unshift(head);

  if (head.x === food.value.x && head.y === food.value.y) {
    score.value++;
    placeFood();
    increaseSpeed();
  } else {
    snake.value.pop();
  }
}

function isCollision(head) {
  return (
    head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize ||
    snake.value.some((segment, index) => index !== 0 && segment.x === head.x && segment.y === head.y)
  );
}

function increaseSpeed() {
  if (gameSpeed.value > 50) {
    gameSpeed.value -= 10;
    clearInterval(gameInterval.value);
    gameInterval.value = setInterval(gameLoop, gameSpeed.value);
  }
}

async function gameOver() {
  clearInterval(gameInterval.value);
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    try {
      const scoreData = {
        uid: user.uid,
        gameName: 'snake',
        score: score.value.toString()
      };
      const response = await rankApi.submitScore(scoreData);
      if (response.newHighScore) {
        showHighScoreMessage.value = true;
        setTimeout(() => {
          showHighScoreMessage.value = false;
        }, 3000);
      }
    } catch (error) {
      console.error('점수 등록 실패:', error);
    }
  }
}

function getCellClass(index) {
  const x = index % gridSize;
  const y = Math.floor(index / gridSize);
  if (snake.value.some(segment => segment.x === x && segment.y === y)) {
    return 'snake';
  }
  if (food.value.x === x && food.value.y === y) {
    return 'food';
  }
  return '';
}

function handleKeydown(e) {
  const key = e.key.toLowerCase();
  const newDirection = {
    arrowup: 'up', w: 'up',
    arrowdown: 'down', s: 'down',
    arrowleft: 'left', a: 'left',
    arrowright: 'right', d: 'right'
  }[key];

  if (newDirection && isValidDirection(newDirection)) {
    direction.value = newDirection;
  }
}

function isValidDirection(newDirection) {
  const opposites = { up: 'down', down: 'up', left: 'right', right: 'left' };
  return newDirection !== opposites[direction.value];
}

function goBack() {
  router.push('/');
}

function goToRank() {
  router.push({ name: 'Rank', params: { gameName: 'snake_game' } });
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
  startGame();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  if (gameInterval.value) clearInterval(gameInterval.value);
});
</script>

<style scoped>
.game-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.grid {
  display: grid;
  gap: 1px;
  background-color: #ccc;
  border: 1px solid #999;
  margin: 20px 0;
}

.grid div {
  width: 20px;
  height: 20px;
}

.snake {
  background-color: #4CAF50;
  border-radius: 4px;
}

.food {
  background-color: #F44336;
  border-radius: 50%;
}

.score {
  font-size: 24px;
  margin-bottom: 10px;
}

button {
  margin-top: 10px;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}

.button-container {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.high-score-message {
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: #4CAF50;
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-weight: bold;
}
</style>
