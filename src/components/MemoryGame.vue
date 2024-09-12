<template>
  <v-container class="game-container">
    <v-row justify="center">
      <v-col cols="12" class="text-center">
        <h1 class="game-title">Memory Card Game</h1>
        <h3 class="score">
          Score: <span>{{ score }}</span>
        </h3>
        <div v-if="showHighScoreMessage" class="high-score-message">
          최고기록 갱신!
        </div>
        <v-container fluid>
          <v-row class="grid" align="center" justify="center">
            <v-col v-for="(card, index) in cardArray" :key="index" cols="auto" class="pa-0">
              <div class="card-container" @click="flipCard(index)">
                <div class="card" :class="{ 'flipped': card.flipped }">
                  <div class="card-face card-front">
                    <v-img :src="blankImage" :alt="'Card back'" width="100" height="100" cover />
                  </div>
                  <div class="card-face card-back">
                    <v-img :src="card.img" :alt="'Card image ' + index" width="100" height="100" cover />
                  </div>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-container>
        <div class="button-container">
          <v-btn class="back-button" href="/" color="primary">Main Menu</v-btn>
          <button @click="goToRank" class="rank-button">랭킹 보기</button>
        </div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import scoreApi from '@/api/scoreApi';

import frownImage from '@/assets/memory/frown.png';
import happyImage from '@/assets/memory/happy.png';
import heartsmileImage from '@/assets/memory/heartsmile.png';
import laughImage from '@/assets/memory/laugh.png';
import mehImage from '@/assets/memory/meh.png';
import sadImage from '@/assets/memory/sad.png';
import smilingImage from '@/assets/memory/smiling.png';
import wowImage from '@/assets/memory/wow.png';
import blankImage from '@/assets/memory/blank.png';
import whiteImage from '@/assets/memory/white.png';

const cardArray = ref([
  { name: 'frown', img: frownImage, flipped: false },
  { name: 'frown', img: frownImage, flipped: false },
  { name: 'happy', img: happyImage, flipped: false },
  { name: 'happy', img: happyImage, flipped: false },
  { name: 'heartsmile', img: heartsmileImage, flipped: false },
  { name: 'heartsmile', img: heartsmileImage, flipped: false },
  { name: 'laugh', img: laughImage, flipped: false },
  { name: 'laugh', img: laughImage, flipped: false },
  { name: 'meh', img: mehImage, flipped: false },
  { name: 'meh', img: mehImage, flipped: false },
  { name: 'sad', img: sadImage, flipped: false },
  { name: 'sad', img: sadImage, flipped: false },
  { name: 'smiling', img: smilingImage, flipped: false },
  { name: 'smiling', img: smilingImage, flipped: false },
  { name: 'wow', img: wowImage, flipped: false },
  { name: 'wow', img: wowImage, flipped: false },
]);

let cardsChosen = ref([]);
let cardsChosenId = ref([]);
const cardsWon = ref([]);
const cardsClickable = ref(true);
const score = ref(0);
const showHighScoreMessage = ref(false);

const router = useRouter();

const shuffleCards = () => {
  cardArray.value.sort(() => 0.5 - Math.random());
};

const createBoard = () => {
  shuffleCards();
};

const checkForMatch = () => {
  const optionOneId = cardsChosenId.value[0];
  const optionTwoId = cardsChosenId.value[1];

  if (cardsChosen.value[0] === cardsChosen.value[1]) {
    cardArray.value[optionOneId].flipped = true;
    cardArray.value[optionTwoId].flipped = true;
    cardsWon.value.push(cardsChosen.value);
    score.value += 10;
  } else {
    setTimeout(() => {
      cardArray.value[optionOneId].flipped = false;
      cardArray.value[optionTwoId].flipped = false;
    }, 400);
    score.value -= 1;
  }

  setTimeout(() => {
    cardsChosen.value = [];
    cardsChosenId.value = [];
    cardsClickable.value = true;
  }, 600);

  if (cardsWon.value.length === cardArray.value.length / 2) {
    gameOver();
  }
};

const gameOver = async () => {
  const user = JSON.parse(localStorage.getItem('user'));
  let isNewHighScore = false;

  if (user) {
    try {
      const scoreData = {
        uid: user.uid,
        gameName: 'memory_game',
        score: score.value.toString(),
        scoreTime: new Date().toISOString()
      };
      console.log('Submitting score data:', scoreData);
      const response = await scoreApi.submitScore(scoreData);
      isNewHighScore = response.newHighScore;
      showHighScoreMessage.value = isNewHighScore;
    } catch (error) {
      console.error('점수 등록 실패:', error);
    }
  }

  let message = `Game Clear! 스코어: ${score.value}`;
  if (isNewHighScore) {
    message += '\n최고 기록 갱신!';
  }

  alert(message);
  location.reload();
};

const goToRank = () => {
  router.push({ name: 'Rank', params: { gameName: 'memory_game' } });
};

const resetGame = () => {
  score.value = 0;
  cardsWon.value = [];
  cardsChosen.value = [];
  cardsChosenId.value = [];
  cardsClickable.value = true;
  shuffleCards();
  cardArray.value.forEach(card => {
    card.flipped = false;
  });
};

const flipCard = (index) => {
  if (
    !cardsClickable.value ||
    cardArray.value[index].flipped ||
    cardsChosenId.value.includes(index)
  )
    return;

  cardArray.value[index].flipped = true;
  cardsChosen.value.push(cardArray.value[index].name);
  cardsChosenId.value.push(index);

  if (cardsChosen.value.length === 2) {
    cardsClickable.value = false;
    setTimeout(checkForMatch, 500);
  }
};

onMounted(() => {
  createBoard();
});
</script>

<style scoped>
.game-container {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.game-title {
  font-size: 2.5em;
  margin-bottom: 5px;
  color: #333;
}

.score {
  font-size: 1.5em;
  margin-bottom: 20px;
  color: #555;
}

.grid {
  display: grid;
  grid-template-columns: repeat(4, 100px);
  gap: 10px;
  justify-content: center;
  margin: 20px auto;
}

.card-container {
  perspective: 1000px;
  width: 100px;
  height: 100px;
  cursor: pointer;
}

.card {
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  position: relative;
}

.card.flipped {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

.card-front {
  background-color: #f1f1f1;
}

.card-back {
  transform: rotateY(180deg);
  background-color: white;
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
}

.back-button {
  display: inline-block;
  margin-bottom: 20px;
  padding: 10px 20px;
  font-size: 16px;
  color: #fff;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  text-decoration: none;
  text-align: center;
  transition: background-color 0.3s, box-shadow 0.3s, transform 0.2s;
}

.back-button:active {
  transform: scale(0.95);
}

.back-button:hover {
  background-color: #0056b3;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.rank-button {
  display: inline-block;
  padding: 10px 20px;
  font-size: 16px;
  color: #fff;
  background-color: #28a745;
  border: none;
  border-radius: 5px;
  text-decoration: none;
  text-align: center;
  transition: background-color 0.3s, box-shadow 0.3s, transform 0.2s;
}

.rank-button:hover {
  background-color: #218838;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.rank-button:active {
  transform: scale(0.95);
}

.high-score-message {
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  background-color: #4CAF50;
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-weight: bold;
}
</style>
