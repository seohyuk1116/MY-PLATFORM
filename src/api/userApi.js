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
    /*
    // 먼저 사용자의 비밀번호 인코딩 여부를 확인합니다.
    const checkResponse = await apiClient.get(`/api/users/check-password-encoding`, {
      params: { uid }
    });
    
    const isEncoded = checkResponse.data.isEncoded;
    
    // 로그인 요청을 보냅니다.
    const response = await apiClient.post('/api/users/login', { 
      uid, 
      userPassword,
      isEncoded // 백엔드에 인코딩 여부를 전달합니다.
    });
    */
    // 새로운 로그인 요청 코드
    const response = await apiClient.post('/api/users/login', { 
      uid, 
      userPassword
    });
    
    return response.data;
  } catch (error) {
    if (error.response) {
      return { success: false, message: error.response.data.message || '로그인에 실패했습니다.' };
    } else if (error.request) {
      return { success: false, message: '서버에 연결할 수 없습니다. 나중에 다시 시도해주세요.' };
    } else {
      return { success: false, message: '요청을 보내는 중 오류가 발생했습니다.' };
    }
  }
}

export async function checkDuplicate(field, value) {
  try {
    const response = await apiClient.get(`/api/users/check-duplicate`, {
      params: { field, value }
    });
    return response.data;
  } catch (error) {
    console.error(`Error checking duplicate ${field}:`, error);
    throw error;
  }
}

/*
// 비밀번호 인코딩 확인 함수 제거
export async function checkPasswordEncoding(uid) {
  try {
    const response = await apiClient.get(`/api/users/check-password-encoding`, {
      params: { uid }
    });
    return response.data.isEncoded;
  } catch (error) {
    console.error('Error checking password encoding:', error);
    throw error;
  }
}
*/