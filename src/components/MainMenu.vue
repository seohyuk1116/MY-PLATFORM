<template>
  <v-container v-if="isLoggedIn" class="main-menu-container" fluid>
    <v-row class="main-title-row" justify="center">
      <v-col cols="12" class="text-center">
        <h1 class="main-title">Welcome to the Game Hub</h1>
      </v-col>
    </v-row>

    <v-row class="user-scores" justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card>
          <v-card-title>Your Game Scores</v-card-title>
          <v-card-text>
            <v-list>
              <v-list-item v-for="(score, game) in userScores" :key="game">
                <v-list-item-content>
                  <v-list-item-title>{{ getGameTitle(game) }}: {{ score }}</v-list-item-title>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row class="button-row" justify="center" align="center">
      <v-col
        v-for="(game, index) in games"
        :key="index"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card class="game-card" @click="navigateTo(game.path)" raised>
          <v-img :src="game.icon" class="game-icon" contain></v-img>
          <v-card-title class="text-center">{{ game.title }}</v-card-title>
        </v-card>
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
        { path: '/memory-game', icon: memoryIcon, title: 'Play Memory Game' },
        { path: '/snake-game', icon: snakeIcon, title: 'Play Snake Game' },
        { path: '/flappy-bird-game', icon: flappyBirdIcon, title: 'Play Flappy Bird' },
        { path: '/doodle-jump-game', icon: doodleJumpIcon, title: 'Play Doodle Jump' },
      ],
      userScores: null,
    };
  },
  computed: {
    isLoggedIn() {
      return !!localStorage.getItem('user');
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
      this.$router.push('/login');
    },
    getGameTitle(game) {
      const gameTitles = {
        memory_game_score: 'Memory Game',
        snake_game_score: 'Snake Game',
        bird_game_score: 'Flappy Bird',
        jump_game_score: 'Doodle Jump'
      };
      return gameTitles[game] || game;
    },
    async fetchUserScores() {
      if (this.isLoggedIn) {
        const user = JSON.parse(localStorage.getItem('user'));
        try {
          const scores = await rankApi.getUserScores(user.uid);
          this.userScores = scores;
          localStorage.setItem('userScores', JSON.stringify(scores));
        } catch (error) {
          console.error('Failed to fetch user scores:', error);
        }
      }
    },
    goToRank() {
      this.$router.push({ name: 'Rank' });
    }
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
  background: linear-gradient(
      135deg,
      rgba(168, 208, 230, 0.8),
      rgba(208, 244, 222, 0.8)
    ),
    url('@/assets/background-pattern.png'); /* Add background pattern image */
  background-size: cover; /* Cover the entire container */
  background-position: center; /* Center the background image */
  padding: 20px;
  overflow: hidden; /* Ensures that overflowing content is hidden */
}

.main-title {
  font-size: 2.5em;
  color: #333;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2); /* Adds a subtle shadow to the text */
  white-space: nowrap; /* Prevents text from wrapping */
  overflow: hidden; /* Hides overflowed text */
  text-overflow: ellipsis; /* Adds an ellipsis (...) for overflowed text */
  text-align: center; /* Centers the text */
}

.button-row {
  display: flex;
  flex-wrap: wrap; /* Allow cards to wrap to the next line */
  justify-content: center; /* Center cards horizontally */
  gap: 16px; /* Spacing between cards */
}

.v-col {
  flex: 1 1 auto; /* Adjust columns to fit available space */
  max-width: 300px; /* Increase the maximum width of each card */
}

.game-card {
  cursor: pointer;
  transition: box-shadow 0.3s;
  background: rgba(
    255,
    255,
    255,
    0.9
  ); /* Semi-transparent background for cards */
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  box-sizing: border-box;
}

.game-card:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.game-icon {
  border-radius: 10px;
  width: 100%; /* Ensure the image fits the card width */
  max-width: 200px; /* Limit the maximum width of the image */
  height: auto; /* Maintain aspect ratio */
}

.text-center {
  text-align: center;
}

.user-actions {
  position: absolute;
  top: 10px;
  right: 10px;
}

.user-scores {
  margin-bottom: 20px;
}
</style>
