import axios from 'axios';

const API_BASE_URL = 'http://localhost:8010'; // 백엔드 서버 주소 확인

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default {
  async getUserScores(uid) {
    try {
      console.log(`Fetching scores for user: ${uid}`); // 로그 추가
      const response = await apiClient.get(`/api/scores/user/${uid}`);
      console.log('Received user scores:', response.data); // 로그 추가
      return response.data;
    } catch (error) {
      console.error('사용자 점수 가져오기 실패:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  async submitScore(scoreData) {
    try {
      console.log('Submitting score:', scoreData); // 로그 추가
      const response = await apiClient.post('/api/scores/submit', scoreData);
      console.log('Score submission response:', response.data); // 로그 추가
      return response.data;
    } catch (error) {
      console.error('점수 등록 실패:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  async fetchGameRankings(gameName) {
    try {
      console.log(`Fetching rankings for game: ${gameName}`);
      const response = await apiClient.get(`/api/scores/rankings/${gameName}`);
      console.log('Received game rankings:', response.data);
      return response.data;
    } catch (error) {
      console.error('게임 랭킹 가져오기 실패:', error.response ? error.response.data : error.message);
      throw error;
    }
  }
};