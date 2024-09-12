<template>
  <div class="game-container">
    <h1>Snake Game</h1>
    <div class="score">Score: {{ score }}</div>
    <div v-if="showHighScoreMessage" class="high-score-message">
      최고기록 갱신!
    </div>
    <div class="grid" :style="gridStyle">
      <div 
        v-for="(cell, index) in cells" 
        :key="index" 
        :class="['cell', getCellClass(index)]"
      ></div>
    </div>
    <button @click="startGame" class="start-button">{{ gameActive ? 'Restart' : 'Start' }}</button>
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
const initialSpeed = 300;

const cells = ref(Array(gridSize * gridSize).fill(null));
const snake = ref([{ x: 7, y: 7 }]);
const direction = ref('right');
const food = ref({ x: 0, y: 0 });
const score = ref(0);
const gameInterval = ref(null);
const gameSpeed = ref(initialSpeed);
const showHighScoreMessage = ref(false);
const gameActive = ref(false);

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
  gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
  width: `${gridSize * cellSize}px`,
  height: `${gridSize * cellSize}px`,
}));

function initGame() {
  snake.value = [{ x: 7, y: 7 }];
  direction.value = 'right';
  score.value = 0;
  gameSpeed.value = initialSpeed;
  placeFood();
  gameActive.value = true;
}

function startGame() {
  if (gameInterval.value) clearInterval(gameInterval.value);
  initGame();
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
  if (!gameActive.value) return;

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
  gameActive.value = false;
  clearInterval(gameInterval.value);
  const user = JSON.parse(localStorage.getItem('user'));
  let isNewHighScore = false;

  if (user) {
    try {
      const scoreData = {
        uid: user.uid,
        gameName: 'snake_game',
        score: score.value.toString(),
        scoreTime: new Date().toISOString()
      };
      console.log('Submitting score data:', scoreData);
      const response = await rankApi.submitScore(scoreData);
      isNewHighScore = response.newHighScore;
      showHighScoreMessage.value = isNewHighScore;
    } catch (error) {
      console.error('점수 등록 실패:', error);
    }
  }

  let message = `Game Over! 스코어: ${score.value}`;
  if (isNewHighScore) {
    message += '\n최고 기록 갱신!';
  }

  alert(message);
  location.reload(); // 페이지 새로고침
}

function getCellClass(index) {
  const x = index % gridSize;
  const y = Math.floor(index / gridSize);
  const isEvenCell = (x + y) % 2 === 0;
  let cellClass = isEvenCell ? 'cell-light' : 'cell-dark';

  if (snake.value.some(segment => segment.x === x && segment.y === y)) {
    cellClass += ' snake';
  } else if (food.value.x === x && food.value.y === y) {
    cellClass += ' food';
  }

  return cellClass;
}

function handleKeydown(e) {
  if (!gameActive.value) return;
  
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
  background-color: #578a34; 
  min-height: 50vh; 
}

.grid {
  display: grid;
  border: 1px solid #999;
  margin: 20px 0;
  box-sizing: border-box;
}

.cell {
  width: 20px;
  height: 20px;
  box-sizing: border-box;
}

.cell-light {
  background-color: #aad751;
}

.cell-dark {
  background-color: #a2d149;
}

.snake {
  background-color: #4570e6; /* 뱀 색상 */
  border: none;
}

.food {
  background-color: #e7471d; /* 사과 색상 */
  border: none;
  /* border-radius: 50%; */
}

.score {
  font-size: 24px;
  margin-bottom: 10px;
  color: white; /* 점수 텍스트 색상을 흰색으로 변경 */
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

h1 {
  color: white; /* 제목 색상을 흰색으로 변경 */
}
</style>
