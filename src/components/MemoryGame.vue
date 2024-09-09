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
            <v-col v-for="(card, index) in cardArray" :key="index" cols="auto">
              <v-img
                :src="card.src"
                :alt="'Card image ' + index"
                class="card"
                @click="flipCard(index)"
              />
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
  { name: 'frown', img: frownImage, src: blankImage },
  { name: 'frown', img: frownImage, src: blankImage },
  { name: 'happy', img: happyImage, src: blankImage },
  { name: 'happy', img: happyImage, src: blankImage },
  { name: 'heartsmile', img: heartsmileImage, src: blankImage },
  { name: 'heartsmile', img: heartsmileImage, src: blankImage },
  { name: 'laugh', img: laughImage, src: blankImage },
  { name: 'laugh', img: laughImage, src: blankImage },
  { name: 'meh', img: mehImage, src: blankImage },
  { name: 'meh', img: mehImage, src: blankImage },
  { name: 'sad', img: sadImage, src: blankImage },
  { name: 'sad', img: sadImage, src: blankImage },
  { name: 'smiling', img: smilingImage, src: blankImage },
  { name: 'smiling', img: smilingImage, src: blankImage },
  { name: 'wow', img: wowImage, src: blankImage },
  { name: 'wow', img: wowImage, src: blankImage },
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
    cardArray.value[optionOneId].src = whiteImage;
    cardArray.value[optionTwoId].src = whiteImage;
    cardsWon.value.push(cardsChosen.value);
    score.value += 10; // 매치 성공 시 10점 추가
  } else {
    setTimeout(() => {
      cardArray.value[optionOneId].src = blankImage;
      cardArray.value[optionTwoId].src = blankImage;
    }, 400);
    score.value -= 1; // 매치 실패 시 1점 감소
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
  if (user) {
    try {
      const scoreData = {
        uid: user.uid,
        gameName: 'memory_game',
        score: score.value.toString() // score를 문자열로 변환
      };
      console.log('Submitting score data:', scoreData); // 로그 추가
      const response = await scoreApi.submitScore(scoreData);
      if (response.newHighScore) {
        alert(`새로운 최고 점수: ${score.value} 점`);
      }
    } catch (error) {
      console.error('점수 등록 실패:', error);
    }
  }

  router.push({ name: 'Rank', params: { gameName: 'memory_game' } });
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
    card.src = blankImage;
  });
};

const flipCard = (index) => {
  if (
    !cardsClickable.value ||
    cardArray.value[index].src === whiteImage ||
    cardsChosenId.value.includes(index)
  )
    return;

  cardArray.value[index].src = cardArray.value[index].img;
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
/* 전체 페이지 기본 스타일 설정 */
html,
body {
  height: 100%;
  margin: 0;
  font-family: Arial, sans-serif;
  background-color: #f4f4f4;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

/* 게임 페이지 컨테이너 스타일 */
.game-container {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
  border-radius: 10px;
  /* 그림자 크기 증가 */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

/* 제목 스타일 */
.game-title {
  font-size: 2.5em;
  margin-bottom: 5px;
  color: #333;
}

/* 점수 스타일 */
.score {
  font-size: 1.5em;
  margin-bottom: 20px;
  color: #555;
}

/* 난이도 텍스트 스타일 */
.difficulty-normal {
  font-size: 2em;
  color: sandybrown;
}

/* 그리드 스타일 */
.grid {
  display: grid;
  grid-template-columns: repeat(4, 100px);
  gap: 10px;
  justify-content: center;
  margin: 20px auto;
}

/* 카드 스타일 */
.card {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border: 1px solid #ddd;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s, opacity 0.5s;
  opacity: 1;
  /* 각진 부분을 둥글게 */
  border-radius: 10px;
}

/* 카드 클릭 시 애니메이션 효과 */
.card:active {
  transform: scale(0.95); /* 클릭 시 약간 줄어드는 효과 */
}

.card.flipped {
  transform: rotateY(180deg);
  opacity: 0;
}

.card.match {
  border-color: #4caf50;
  box-shadow: 0 4px 10px rgba(0, 255, 0, 0.5);
  border-radius: 10px; /* 매치된 카드도 둥글게 */
}

/* 타이머 스타일 */
.timer {
  font-size: 1.5em;
  margin-bottom: 20px;
  color: #555;
}

/* 메인 메뉴 버튼 스타일 */
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

/* 버튼 클릭 시 애니메이션 효과 */
.back-button:active {
  transform: scale(0.95); /* 클릭 시 약간 줄어드는 효과 */
}

.back-button:hover {
  background-color: #0056b3;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.button-container {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 20px;
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
  margin-left: 10px;
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
