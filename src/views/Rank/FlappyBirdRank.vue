<template>
  <div class="rank-container">
    <h1>플래피 버드 게임 랭킹</h1>
    
    <div v-if="isLoading">로딩 중...</div>
    
    <div v-else-if="error">{{ error }}</div>
    
    <div v-else>
      <table class="rank-table">
        <thead>
          <tr>
            <th>순위</th>
            <th>이름</th>
            <th>점수</th>
            <th>날짜</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(rank, index) in rankings" :key="rank.id">
            <td>{{ index + 1 }}</td>
            <td>{{ rank.userName }}</td>
            <td>{{ rank.birdGame || 'N/A' }}</td>
            <td>{{ formatDate(rank.date) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <button @click="goBack" class="back-button">게임으로 돌아가기</button>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import scoreApi from '@/api/scoreApi';

export default {
  name: 'FlappyBirdRank',
  setup() {
    const router = useRouter();
    const rankings = ref([]);
    const isLoading = ref(true);
    const error = ref(null);

    const fetchRankings = async () => {
      try {
        isLoading.value = true;
        const response = await scoreApi.fetchGameRankings('bird_game');
        rankings.value = response.map((rank, index) => ({
          ...rank,
          rank: index + 1,
          score: rank.birdGameScore
        }));
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

    const goBack = () => {
      router.push('/flappy-bird-game');
    };

    onMounted(fetchRankings);

    return {
      rankings,
      isLoading,
      error,
      formatDate,
      goBack
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