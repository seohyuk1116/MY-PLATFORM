<template>
  <v-container class="game-container" fluid>
    <h2 class="game-title">Flappy Bird</h2>
    <h3 class="score">Score: {{ score }}</h3>
    <div v-if="showHighScoreMessage" class="high-score-message">
      최고기록 갱신!
    </div>
    <canvas ref="gameCanvas" width="288" height="512"></canvas>
    <div class="button-container">
      <v-btn class="game-button" href="/" color="primary">Main Menu</v-btn>
      <button @click="goToRank" class="rank-button">랭킹 보기</button>
    </div>
  </v-container>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import rankApi from '@/api/scoreApi';

export default {
  name: 'FlappyBirdGame',
  setup() {
    const router = useRouter();
    const gameCanvas = ref(null);
    const score = ref(0);
    const showHighScoreMessage = ref(false);
    let gameLoop = null;

    const startGame = () => {
      // 게임 로직 구현
      // 이 부분에 Flappy Bird 게임 로직을 구현해야 합니다.
      // 점수가 올라갈 때마다 score.value를 증가시키세요.
    };

    const gameOver = async () => {
      cancelAnimationFrame(animationFrame.value);
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        try {
          const scoreData = {
            uid: user.uid,
            gameName: 'flappy_bird',
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
    };

    const goToRank = () => {
      router.push({ name: 'Rank', params: { gameName: 'bird_game' } });
    };

    onMounted(() => {
      startGame();
    });

    onUnmounted(() => {
      clearInterval(gameLoop);
    });

    return {
      gameCanvas,
      score,
      showHighScoreMessage,
      goToRank
    };
  }
};
</script>

<style scoped>
.game-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.game-title {
  font-size: 2em;
  color: #333;
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
