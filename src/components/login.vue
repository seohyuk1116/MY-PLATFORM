<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>로그인</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="login" ref="form">
              <v-text-field
                v-model="uid"
                label="아이디"
                name="uid"
                prepend-icon="mdi-account"
                type="text"
                :rules="[v => !!v || '아이디를 입력해주세요']"
                required
              ></v-text-field>
              <v-text-field
                v-model="userPassword"
                label="비밀번호"
                name="userPassword"
                prepend-icon="mdi-lock"
                type="password"
                :rules="[v => !!v || '비밀번호를 입력해주세요']"
                required
              ></v-text-field>
            </v-form>
            <v-alert v-if="errorMessage" type="error" dense>
              {{ errorMessage }}
            </v-alert>
          </v-card-text>
          
          <v-card-actions>
            <v-btn text color="secondary" @click="$router.push('/register')">회원가입</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="login" :disabled="!isFormValid">로그인</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { loginUser } from '@/api/userApi';
import rankApi from '@/api/scoreApi';

export default {
  name: 'Login',
  data: () => ({
    uid: '',
    userPassword: '',
    errorMessage: '',
  }),
  computed: {
    isFormValid() {
      return this.uid && this.userPassword;
    },
  },
  methods: {
    async login() {
      if (this.$refs.form.validate()) {
        try {
          const response = await loginUser(this.uid, this.userPassword);
          if (response.success) {
            console.log('Login successful:', response.user);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            // 사용자 점수 가져오기
            try {
              const userScores = await rankApi.getUserScores(this.uid);
              localStorage.setItem('userScores', JSON.stringify({
                memoryGameScore: userScores.memoryGameScore,
                snakeGameScore: userScores.snakeGameScore,
                jumpGameScore: userScores.jumpGameScore,
                birdGameScore: userScores.birdGameScore
              }));
            } catch (error) {
              console.error('Failed to fetch user scores:', error);
            }
            
            this.$router.push('/');
          } else {
            this.errorMessage = response.message;
          }
        } catch (error) {
          console.error('Login failed:', error);
          this.errorMessage = '로그인 중 오류가 발생했습니다. 나중에 다시 시도해주세요.';
        }
      }
    },
  },
};
</script>
