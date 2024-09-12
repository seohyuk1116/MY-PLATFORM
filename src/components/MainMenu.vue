<template>
  <v-container v-if="isLoggedIn" class="main-menu-container" fluid>
    <v-row class="main-title-row" justify="center">
      <v-col cols="12" class="text-center">
        <h1 class="main-title">Welcome to the Game Hub</h1>
      </v-col>
    </v-row>

    <v-row class="user-info" justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="user-card">
          <v-card-title class="user-card-title">
            <v-icon left>mdi-account</v-icon>
            {{ currentUser.userName }}의 최고 점수
          </v-card-title>
          <v-card-text>
            <v-row v-if="userScores">
              <v-col v-for="(score, game) in filteredUserScores" :key="game" cols="6" sm="3">
                <div class="score-item">
                  <div class="score-title">{{ getGameTitle(game) }}</div>
                  <div class="score-value">{{ formatScore(score, game) }}</div>
                </div>
              </v-col>
            </v-row>
            <v-row v-else>
              <v-col cols="12" class="text-center">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="button-row" justify="center" align="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-row>
          <v-col
            v-for="(game, index) in games"
            :key="index"
            cols="6"
            sm="6"
            class="d-flex justify-center align-center"
          >
            <v-card class="game-card" @click="navigateTo(game.path)" raised>
              <v-img :src="game.icon" class="game-icon" contain></v-img>
              <v-card-title class="text-center">{{ game.title }}</v-card-title>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <v-row justify="center" class="mt-4">
      <v-col cols="12" sm="6" md="4">
        <v-btn block color="secondary" @click="goToRank">전체 랭킹 보기</v-btn>
      </v-col>
    </v-row>

    <v-row class="user-actions" justify="end">
      <v-col cols="auto">
        <v-btn text color="primary" @click="logout">로그아웃</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import memoryIcon from '@/assets/memory-icon.png';
import snakeIcon from '@/assets/snake-icon.png';
import flappyBirdIcon from '@/assets/flappy-bird-icon.gif';
import doodleJumpIcon from '@/assets/doodle-jump-icon.png';
import rankApi from '@/api/scoreApi';

export default {
  name: 'MainMenu',
  data() {
    return {
      games: [
        { path: '/memory-game', icon: memoryIcon, title: 'Memory Game' },
        { path: '/snake-game', icon: snakeIcon, title: 'Snake Game' },
        { path: '/flappy-bird-game', icon: flappyBirdIcon, title: 'Flappy Bird' },
        { path: '/doodle-jump-game', icon: doodleJumpIcon, title: 'Doodle Jump' },
      ],
      userScores: null,
      currentUser: null,
    };
  },
  computed: {
    isLoggedIn() {
      return !!this.currentUser;
    },
    filteredUserScores() {
      if (!this.userScores) return null;
      return {
        memoryGameScore: this.userScores.memoryGameScore,
        snakeGameScore: this.userScores.snakeGameScore,
        birdGameScore: this.userScores.birdGameScore,
        jumpGameScore: this.userScores.jumpGameScore
      };
    }
  },
  methods: {
    navigateTo(path) {
      this.$router.push(path);
    },
    logout() {
      localStorage.removeItem('user');
      localStorage.removeItem('userScores');
      this.userScores = null;
      this.currentUser = null;
      this.$router.push('/login');
    },
    getGameTitle(game) {
      const gameTitles = {
        memoryGameScore: 'Memory Game',
        snakeGameScore: 'Snake Game',
        birdGameScore: 'Flappy Bird',
        jumpGameScore: 'Doodle Jump'
      };
      return gameTitles[game] || game;
    },
    formatScore(score, game) {
      if (game === 'memoryGameScore' || game === 'jumpGameScore') {
        return score ? `${parseFloat(score).toFixed(1)}점` : 'N/A';
      }
      return score || 'N/A';
    },
    async fetchUserScores() {
      try {
        if (!this.currentUser) {
          console.warn('No user logged in');
          return;
        }
        console.log('Fetching scores for user:', this.currentUser.uid);
        const scores = await rankApi.getUserScores(this.currentUser.uid);
        console.log('Received scores:', scores);
        this.userScores = scores;
      } catch (error) {
        console.error('Failed to fetch user scores:', error);
        // 에러 처리 (예: 사용자에게 알림 표시)
      }
    },
    goToRank() {
      this.$router.push({ name: 'Rank' });
    },
    loadUserFromLocalStorage() {
      const userJson = localStorage.getItem('user');
      if (userJson) {
        this.currentUser = JSON.parse(userJson);
      }
    }
  },
  created() {
    this.loadUserFromLocalStorage();
  },
  mounted() {
    if (!this.isLoggedIn) {
      this.$router.push('/login');
    } else {
      this.fetchUserScores();
    }
  }
};
</script>

<style scoped>
.main-menu-container {
  background: linear-gradient(135deg, #e0f7fa, #b2ebf2);
  background-size: cover;
  background-position: center;
  padding: 40px 20px;
  min-height: 95vh;  
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.main-title {
  font-size: 3em;
  color: #006064;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px;
  font-weight: bold;
  letter-spacing: 1px;
}

.user-scores {
  margin-bottom: 40px;
}

.v-card {
  border-radius: 20px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.v-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.v-card-title {
  background-color: #4dd0e1;
  color: white;
  font-weight: bold;
  padding: 20px;
}

.v-list-item {
  transition: background-color 0.3s ease;
}

.v-list-item:hover {
  background-color: #e0f7fa;
}

.button-row {
  margin-bottom: 40px;
}

.game-card {
  width: 100%;
  max-width: 250px;
  aspect-ratio: 1 / 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.game-card:hover {
  transform: translateY(-10px) scale(1.05);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.game-icon {
  width: 60%;
  height: 60%;
  object-fit: contain;
}

.v-card-title {
  font-size: 1.2em;
  font-weight: bold;
  color: #006064;
  padding: 15px;
  text-align: center;
}

.user-actions {
  position: absolute;
  top: 20px;
  right: 20px;
}

.v-btn {
  border-radius: 30px;
  text-transform: none;
  font-weight: bold;
  letter-spacing: 1px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.v-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

@media (max-width: 600px) {
  .main-title {
    font-size: 2em;
  }

  .game-card {
    max-width: 100%;
  }
}
</style>
