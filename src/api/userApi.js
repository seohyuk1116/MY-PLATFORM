import axios from 'axios';

const API_BASE_URL = 'http://localhost:8010'; // 백엔드 서버 주소 확인

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {  
    'Content-Type': 'application/json',
  },
});

export async function registerUser(userData) {
  try {
    console.log('Sending user data:', userData); // 로그 추가
    const response = await apiClient.post('/api/users/register', userData);
    console.log('Server response:', response.data); // 로그 추가
    return response.data;
  } catch (error) {
    console.error('Registration error:', error.response ? error.response.data : error.message); // 에러 로그 개선
    throw error;
  }
}

export async function loginUser(uid, userPassword) {
  try {
    const response = await apiClient.post('/api/users/login', { uid, userPassword });
    return response.data;
  } catch (error) {
    if (error.response) {
      // 서버가 응답을 반환했지만 2xx 범위를 벗어난 상태 코드
      return { success: false, message: error.response.data.message || '로그인에 실패했습니다.' };
    } else if (error.request) {
      // 요청이 이루어졌지만 응답을 받지 못함
      return { success: false, message: '서버에 연결할 수 없습니다. 나중에 다시 시도해주세요.' };
    } else {
      // 요청을 설정하는 중에 문제가 발생
      return { success: false, message: '요청을 보내는 중 오류가 발생했습니다.' };
    }
  }
}