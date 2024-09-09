<template>
  <div class="rank-container">
    <div class="game-tabs">
      <button 
        v-for="game in games" 
        :key="game.name" 
        @click="selectGame(game.name)"
        :class="{ active: selectedGame === game.name }"
        class="game-tab"
      >
        {{ game.title }}
      </button>
    </div>

    <div v-if="isLoading">로딩 중...</div>
    
    <div v-else-if="error">{{ error }}</div>
    
    <div v-else>
      <h2>{{ getGameTitle(selectedGame) }} 랭킹</h2>
      <table class="rank-table">
        <thead>
          <tr>
            <th>순위</th>
            <th>이름</th>
            <th>점수{{ selectedGame === 'memory_game' || selectedGame === 'jump_game' ? ' (초)' : '' }}</th>
            <th>날짜</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="rank in rankings" :key="rank.id">
            <td>{{ rank.rank }}</td>
            <td>{{ rank.userName }}</td>
            <td>{{ formatScore(rank.score, selectedGame) }}</td>
            <td>{{ formatDate(rank.date) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <button @click="goBack" class="back-button">메인 메뉴로 돌아가기</button>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import scoreApi from '@/api/scoreApi';

export default {
  name: 'Rank',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const rankings = ref([]);
    const isLoading = ref(true);
    const error = ref(null);
    const selectedGame = ref(route.params.gameName || 'memory_game');

    const games = [
      { name: 'memory_game', title: '메모리 게임' },
      { name: 'snake_game', title: '스네이크 게임' },
      { name: 'jump_game', title: '두들 점프 게임' },
      { name: 'bird_game', title: '플래피 버드 게임' }
    ];

    const fetchRankings = async () => {
      isLoading.value = true;
      error.value = null;
      try {
        const response = await scoreApi.fetchGameRankings(selectedGame.value);
        rankings.value = response;
      } catch (err) {
        error.value = '랭킹을 불러오는 데 실패했습니다.';
        console.error(err);
      } finally {
        isLoading.value = false;
      }
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleString();
    };

    const formatScore = (score, gameName) => {
      if (gameName === 'memory_game' || gameName === 'jump_game') {
        return score ? `${parseFloat(score).toFixed(1)}초` : 'N/A';
      }
      return score || 'N/A';
    };

    const selectGame = (gameName) => {
      selectedGame.value = gameName;
      router.push({ name: 'Rank', params: { gameName: gameName } });
    };

    const getGameTitle = (gameName) => {
      const game = games.find(g => g.name === gameName);
      return game ? game.title : '';
    };

    const goBack = () => {
      router.push('/');
    };

    onMounted(fetchRankings);

    watch(() => route.params.gameName, (newGameName) => {
      if (newGameName) {
        selectedGame.value = newGameName;
        fetchRankings();
      }
    });

    return {
      rankings,
      isLoading,
      error,
      formatDate,
      formatScore,
      goBack,
      games,
      selectedGame,
      selectGame,
      getGameTitle
    };
  }
};
</script>

<style scoped>
.rank-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.game-tabs {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.game-tab {
  padding: 10px 20px;
  background-color: #f0f0f0;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.game-tab.active {
  background-color: #4CAF50;
  color: white;
}

.rank-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.rank-table th, .rank-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.rank-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.back-button {
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  cursor: pointer;
  margin-top: 10px;
}

.back-button:hover {
  background-color: #45a049;
}
</style>