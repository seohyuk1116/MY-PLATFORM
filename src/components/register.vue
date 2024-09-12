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
              <v-row align="center">
                <v-col cols="9">
                  <v-text-field
                    ref="uid"
                    v-model="uid"
                    label="아이디"
                    name="uid"
                    prepend-icon="mdi-account"
                    type="text"
                    :rules="uidRules"
                    required
                    @keydown.enter="focusNextField('userName')"
                    @input="resetUidCheck"
                  ></v-text-field>
                </v-col>
                <v-col cols="3" class="d-flex flex-column align-center">
                  <v-btn @click="checkDuplicate('uid')" :disabled="!uid">중복 확인</v-btn>
                  <v-icon v-if="isUidChecked && !uidErrorMessage" color="green" class="mt-2">mdi-check-circle</v-icon>
                </v-col>
              </v-row>

              <v-row align="center">
                <v-col cols="9">
                  <v-text-field
                    ref="userName"
                    v-model="userName"
                    label="이름"
                    name="userName"
                    prepend-icon="mdi-account"
                    type="text"
                    :rules="userNameRules"
                    required
                    @keydown.enter="focusNextField('userPassword')"
                    @input="resetUserNameCheck"
                  ></v-text-field>
                </v-col>
                <v-col cols="3" class="d-flex flex-column align-center">
                  <v-btn @click="checkDuplicate('userName')" :disabled="!userName">중복 확인</v-btn>
                  <v-icon v-if="isUserNameChecked && !userNameErrorMessage" color="green" class="mt-2">mdi-check-circle</v-icon>
                </v-col>
              </v-row>

              <v-row align="center">
                <v-col cols="9">
                  <v-text-field
                    ref="userPassword"
                    v-model="userPassword"
                    :type="showPassword ? 'text' : 'password'"
                    label="비밀번호"
                    name="userPassword"
                    prepend-icon="mdi-lock"
                    :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="showPassword = !showPassword"
                    :rules="[v => !!v || '비밀번호를 입력해주세요']"
                    required
                    @keydown.enter="focusNextField('confirmPassword')"
                  ></v-text-field>
                </v-col>
                <v-col cols="3">
                  <!-- 암호화 여부를 묻는 체크박스 제거 -->
                  <!--
                  <v-switch
                    v-model="encryptPassword"
                    label="암호화"
                    color="primary"
                    :disabled="!userPassword"
                  ></v-switch>
                  -->
                </v-col>
              </v-row>

              <v-alert
                type="warning"
                dense
                text
                class="mb-3"
              >
                주의: 비밀번호를 잊어버리면 찾을 수 없습니다. 안전한 곳에 기록해두세요.
              </v-alert>

              <v-text-field
                ref="confirmPassword"
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
                @keydown.enter="focusNextField('birthYear')"
              ></v-text-field>

              <v-row>
                <v-col cols="4">
                  <v-select
                    ref="birthYear"
                    v-model="birthYear"
                    :items="years"
                    label="년도"
                    prepend-icon="mdi-calendar"
                    :rules="[v => !!v || '년도를 선택해주세요']"
                    required
                    @change="focusNextField('birthMonth')"
                  ></v-select>
                </v-col>
                <v-col cols="4">
                  <v-select
                    ref="birthMonth"
                    v-model="birthMonth"
                    :items="months"
                    label="월"
                    :rules="[v => !!v || '월을 선택해주세요']"
                    required
                    @change="focusNextField('birthDay')"
                  ></v-select>
                </v-col>
                <v-col cols="4">
                  <v-select
                    ref="birthDay"
                    v-model="birthDay"
                    :items="days"
                    label="일"
                    :rules="[v => !!v || '일을 선택해주세요']"
                    required
                    @change="focusNextField('userComment')"
                  ></v-select>
                </v-col>
              </v-row>

              <v-text-field
                ref="userComment"
                v-model="userComment"
                label="자기소개"
                name="userComment"
                prepend-icon="mdi-comment"
                type="text"
                @keydown.enter="register"
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
import { registerUser, checkDuplicate } from '@/api/userApi';

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
    showPassword: false,
    // encryptPassword: true,
    isUidChecked: false,
    isUserNameChecked: false,
    uidRules: [
      v => !!v || '아이디를 입력해주세요',
      v => (v && v.length >= 4) || '아이디는 4자 이상이어야 합니다',
    ],
    userNameRules: [
      v => !!v || '이름을 입력해주세요',
      v => (v && v.length >= 2) || '이름은 2자 이상이어야 합니다',
    ],
    uidErrorMessage: '',
    userNameErrorMessage: '',
  }),
  computed: {
    isFormValid() {
      return this.uid && this.userName && this.userPassword && 
              this.confirmPassword && this.userPassword === this.confirmPassword &&
              this.birthYear && this.birthMonth && this.birthDay &&
              this.isUidChecked && !this.uidErrorMessage &&
              this.isUserNameChecked && !this.userNameErrorMessage;
    },
    userBirthday() {
      return `${this.birthYear}.${this.birthMonth.toString().padStart(2, '0')}.${this.birthDay.toString().padStart(2, '0')}`;
    }
  },
  methods: {
    focusNextField(fieldName) {
      this.$nextTick(() => {
        const field = this.$refs[fieldName];
        if (field) {
          if (field.$el) {
            const input = field.$el.querySelector('input');
            if (input) input.focus();
          } else if (field.focus) {
            field.focus();
          }
        }
      });
    },

    async checkDuplicate(field) {
      try {
        const value = field === 'uid' ? this.uid : this.userName;
        const response = await checkDuplicate(field, value);
        
        if (field === 'uid') {
          this.isUidChecked = true;
          if (response.isDuplicate) {
            this.uidErrorMessage = '중복된 아이디입니다.';
            this.uidRules = [
              ...this.uidRules.slice(0, 2),
              () => !response.isDuplicate || this.uidErrorMessage
            ];
          } else {
            this.uidErrorMessage = '';
            this.uidRules = [
              ...this.uidRules.slice(0, 2),
              () => true
            ];
          }
        } else if (field === 'userName') {
          this.isUserNameChecked = true;
          if (response.isDuplicate) {
            this.userNameErrorMessage = '중복된 이름입니다.';
            this.userNameRules = [
              ...this.userNameRules.slice(0, 2),
              () => !response.isDuplicate || this.userNameErrorMessage
            ];
          } else {
            this.userNameErrorMessage = '';
            this.userNameRules = [
              ...this.userNameRules.slice(0, 2),
              () => true
            ];
          }
        }
        this.$refs.form.validate();
      } catch (error) {
        console.error(`Duplicate check failed for ${field}:`, error);
        if (field === 'uid') {
          this.uidErrorMessage = '중복 확인 중 오류가 발생했습니다.';
        } else {
          this.userNameErrorMessage = '중복 확인 중 오류가 발생했습니다.';
        }
      }
    },

    resetUidCheck() {
      this.isUidChecked = false;
      this.uidErrorMessage = '';
      this.uidRules = this.uidRules.slice(0, 2);
    },

    resetUserNameCheck() {
      this.isUserNameChecked = false;
      this.userNameErrorMessage = '';
      this.userNameRules = this.userNameRules.slice(0, 2);
    },

    async register() {
      if (this.$refs.form.validate()) {
        if (!this.isUidChecked || !this.isUserNameChecked) {
          alert('아이디와 이름의 중복을 확인해 주세요.');
          return;
        }
        
        try {
          const userData = {
            uid: this.uid,
            userName: this.userName,
            userPassword: this.userPassword,
            userBirthday: this.userBirthday,
            userComment: this.userComment,
            // encryptPassword: this.encryptPassword,
          };
          
          console.log('User data before sending:', userData);
          
          const response = await registerUser(userData);
          
          console.log('Registration response:', response);
          
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
  watch: {
    uid() {
      this.resetUidCheck();
    },
    userName() {
      this.resetUserNameCheck();
    },
  },
};
</script>

<style scoped>
.v-card-actions {
  display: flex;
  justify-content: space-between;
}
</style>
