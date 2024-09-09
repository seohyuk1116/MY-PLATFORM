<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card class="elevation-12">
          <v-toolbar color="primary" dark flat>
            <v-toolbar-title>회원가입</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-form @submit.prevent="register" ref="form">
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
                v-model="userName"
                label="이름"
                name="userName"
                prepend-icon="mdi-account"
                type="text"
                :rules="[v => !!v || '이름을 입력해주세요']"
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
              <v-text-field
                v-model="confirmPassword"
                label="비밀번호 확인"
                name="confirmPassword"
                prepend-icon="mdi-lock-check"
                type="password"
                :rules="[
                  v => !!v || '비밀번호 확인을 입력해주세요',
                  v => v === userPassword || '비밀번호가 일치하지 않습니다'
                ]"
                required
              ></v-text-field>
              <v-row>
                <v-col cols="4">
                  <v-select
                    v-model="birthYear"
                    :items="years"
                    label="년도"
                    prepend-icon="mdi-calendar"
                    :rules="[v => !!v || '년도를 선택해주세요']"
                    required
                  ></v-select>
                </v-col>
                <v-col cols="4">
                  <v-select
                    v-model="birthMonth"
                    :items="months"
                    label="월"
                    :rules="[v => !!v || '월을 선택해주세요']"
                    required
                  ></v-select>
                </v-col>
                <v-col cols="4">
                  <v-select
                    v-model="birthDay"
                    :items="days"
                    label="일"
                    :rules="[v => !!v || '일을 선택해주세요']"
                    required
                  ></v-select>
                </v-col>
              </v-row>
              <v-text-field
                v-model="userComment"
                label="자기소개"
                name="userComment"
                prepend-icon="mdi-comment"
                type="text"
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="secondary" text @click="goBack">돌아가기</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="register" :disabled="!isFormValid">회원가입</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import axios from 'axios';
import { registerUser } from '@/api/userApi';

export default {
  name: 'Register',
  data: () => ({
    uid: '',
    userName: '',
    userPassword: '',
    confirmPassword: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    userComment: '',
    years: Array.from({length: 2024 - 1972 + 1}, (_, i) => 2024 - i),
    months: Array.from({length: 12}, (_, i) => i + 1),
    days: Array.from({length: 31}, (_, i) => i + 1),
    errorMessage: '',
  }),
  computed: {
    isFormValid() {
      return this.uid && this.userName && this.userPassword && 
              this.confirmPassword && this.userPassword === this.confirmPassword &&
              this.birthYear && this.birthMonth && this.birthDay;
    },
    userBirthday() {
      return `${this.birthYear}.${this.birthMonth.toString().padStart(2, '0')}.${this.birthDay.toString().padStart(2, '0')}`;
    }
  },
  methods: {
    async register() {
      if (this.$refs.form.validate()) {
        try {
          const userData = {
            uid: this.uid,
            userName: this.userName,
            userPassword: this.userPassword,
            userBirthday: this.userBirthday,
            userComment: this.userComment,
          };
          
          console.log('User data before sending:', userData); // 로그 추가
          
          const response = await registerUser(userData);
          
          console.log('Registration response:', response); // 로그 추가
          
          if (response.success) {
            console.log('Registration successful:', response.message);
            this.$router.push('/login');
          } else {
            this.errorMessage = response.message || '회원가입에 실패했습니다.';
          }
        } catch (error) {
          console.error('Registration failed:', error);
          this.errorMessage = error.response && error.response.data ? error.response.data.message : '서버 오류가 발생했습니다. 나중에 다시 시도해주세요.';
        }
      }
    },
    goBack() {
      this.$router.push('/login');
    }
  },
};
</script>

<style scoped>
.v-card-actions {
  display: flex;
  justify-content: space-between;
}
</style>
