<template>
  <div class="game-container">
    <div class="game-content">
      <h1 class="game-title">Doodle Jump</h1>
      <h3 class="score">
        Score: <span>{{ score.toFixed(1) }}</span>
      </h3>
      <div v-if="showHighScoreMessage" class="high-score-message">
        최고기록 갱신!
      </div>
      <div ref="grid" class="grid" :style="backgroundStyle">
        <div ref="doodler" class="doodler" :style="doodlerStyle"></div>
      </div>
      <div class="button-container">
        <v-btn class="game-button" href="/" color="primary">Main Menu</v-btn>
        <v-btn class="rank-button" @click="goToRank" color="secondary">Ranking</v-btn>
      </div>
    </div>
  </div>
</template>

<script>
import backgroundImage from '@/assets/doodle/background.png'
import doodlerImage from '@/assets/doodle/doodler-guy.png'
import platformImage from '@/assets/doodle/platform.png'
import { useRouter } from 'vue-router';
import rankApi from '@/api/scoreApi';

class Platform {
  constructor(newPlatBottom, grid) {
    this.left = Math.random() * 315
    this.bottom = newPlatBottom
    this.visual = document.createElement('div')

    const visual = this.visual
    visual.classList.add('platform')
    visual.style.left = this.left + 'px'
    visual.style.bottom = this.bottom + 'px'
    visual.style.width = '85px'
    visual.style.height = '15px'
    visual.style.backgroundImage = `url(${platformImage})`
    visual.style.backgroundSize = 'cover'
    visual.style.position = 'absolute'
    grid.appendChild(visual)
  }
}

export default {
  name: 'DoodleJumpGame',
  data() {
    return {
      backgroundImage,
      doodlerImage,
      platformImage,
      grid: null,
      doodler: null,
      isGameOver: false,
      platformCount: 4,
      platforms: [],
      score: 0,
      doodlerLeftSpace: 50,
      startPoint: 150,
      doodlerBottomSpace: 150,
      upTimerId: null,
      downTimerId: null,
      isJumping: true,
      showHighScoreMessage: false,
      isMovingLeft: false,
      isMovingRight: false,
      moveSpeed: 5.5, // 초기 이동 속도
      platformSpeed: 4, // 초기 플랫폼 속도
      speedIncrement: 0.1, // 속도 증가량
      currentDirection: null,
      animationFrameId: null,
      gameTimer: null,
    }
  },
  mounted() {
    this.grid = this.$refs.grid
    this.doodler = this.$refs.doodler
    this.startGame()
  },
  computed: {
    backgroundStyle() {
      return { backgroundImage: `url(${this.backgroundImage})` }
    },
    doodlerStyle() {
      return {
        backgroundImage: `url(${this.doodlerImage})`,
        left: `${this.doodlerLeftSpace}px`,
        bottom: `${this.doodlerBottomSpace}px`
      }
    }
  },
  methods: {
    createPlatforms() {
      for(let i = 0; i < this.platformCount; i++) {
        let platGap = 600 / this.platformCount
        let newPlatBottom = 100 + i * platGap
        let newPlatform = new Platform(newPlatBottom, this.grid)
        this.platforms.push(newPlatform)
      }
    },
    movePlatforms() {
      if (this.doodlerBottomSpace > 200) {
        this.platforms.forEach((platform, index) => {
          platform.bottom -= this.platformSpeed
          let visual = platform.visual
          visual.style.bottom = platform.bottom + 'px'

          if(platform.bottom < 10) {
            let firstPlatform = this.platforms[0].visual
            this.grid.removeChild(firstPlatform)
            this.platforms.shift()
            let newPlatform = new Platform(600, this.grid)
            this.platforms.push(newPlatform)
          }
        })
      }
    },
    createDoodler() {
      this.doodlerLeftSpace = this.platforms[0].left
      this.doodler.style.left = this.doodlerLeftSpace + 'px'
      this.doodler.style.bottom = this.doodlerBottomSpace + 'px'
    },
    fall() {
      this.isJumping = false
      clearInterval(this.upTimerId)
      this.downTimerId = setInterval(() => {
        this.doodlerBottomSpace -= 5
        this.doodler.style.bottom = this.doodlerBottomSpace + 'px'
        if (this.doodlerBottomSpace <= 0) {
          this.gameOver()
        }
        this.platforms.forEach(platform => {
          if (
            (this.doodlerBottomSpace >= platform.bottom) &&
            (this.doodlerBottomSpace <= (platform.bottom + 15)) &&
            ((this.doodlerLeftSpace + 60) >= platform.left) && 
            (this.doodlerLeftSpace <= (platform.left + 85)) &&
            !this.isJumping
          ) {
            this.startPoint = this.doodlerBottomSpace
            this.jump()
            this.isJumping = true
          }
        })
      }, 20)
    },
    jump() {
      clearInterval(this.downTimerId)
      this.isJumping = true
      this.upTimerId = setInterval(() => {
        this.doodlerBottomSpace += 20
        this.doodler.style.bottom = this.doodlerBottomSpace + 'px'
        if (this.doodlerBottomSpace > (this.startPoint + 200)) {
          this.fall()
          this.isJumping = false
        }
      }, 30)
    },
    updateScore() {
      this.score += 0.1; // 0.1초마다 0.1씩 증가
      if (Math.floor(this.score) > Math.floor(this.score - 0.1)) {
        // 스코어가 정수로 변할 때마다 속도 증가
        this.moveSpeed += this.speedIncrement;
        this.platformSpeed += this.speedIncrement;
      }
    },
    async gameOver() {
      this.isGameOver = true;
      clearInterval(this.upTimerId);
      clearInterval(this.downTimerId);
      clearInterval(this.gameTimer); // 게임 타이머 정지
      this.updateScore(); // 최종 점수 업데이트
      
      // 두들 멈추기
      this.isMovingLeft = false;
      this.isMovingRight = false;
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      
      const user = JSON.parse(localStorage.getItem('user'));
      let isNewHighScore = false;

      if (user) {
        try {
          const scoreData = {
            uid: user.uid,
            gameName: 'jump_game',
            score: this.score.toFixed(1),
            scoreTime: new Date().toISOString()
          };
          console.log('Submitting score data:', scoreData);
          const response = await rankApi.submitScore(scoreData);
          isNewHighScore = response.newHighScore;
          this.showHighScoreMessage = isNewHighScore;
        } catch (error) {
          console.error('점수 등록 실패:', error);
        }
      }
      
      let message = `Game Over! 스코어: ${this.score.toFixed(1)}`;
      if (isNewHighScore) {
        message += '\n최고 기록 갱신!';
      }

      alert(message);
      location.reload();
    },
    startGame() {
      if (!this.isGameOver) {
        this.score = 0;
        this.moveSpeed = 5.5; // 초기 이동 속도 설정
        this.platformSpeed = 4; // 초기 플랫폼 속도 설정
        this.speedIncrement = 0.1; // 속도 증가량
        this.createPlatforms()
        this.createDoodler()
        setInterval(this.movePlatforms, 30)
        this.jump()
        document.addEventListener('keydown', this.handleKeyDown)
        document.addEventListener('keyup', this.handleKeyUp)
        
        // 게임 타이머 시작
        this.gameTimer = setInterval(() => {
          this.updateScore()
        }, 100) // 0.1초마다 업데이트
      }
    },
    goToRank() {
      this.$router.push({ name: 'Rank', params: { gameName: 'jump_game' } });
    },
    startMoving(direction) {
      this.currentDirection = direction;
      if (direction === 'left') {
        this.isMovingLeft = true;
        this.isMovingRight = false;
      } else if (direction === 'right') {
        this.isMovingRight = true;
        this.isMovingLeft = false;
      }
      if (!this.animationFrameId) {
        this.move();
      }
    },
    stopMoving(direction) {
      if (direction === this.currentDirection) {
        this.currentDirection = null;
        this.isMovingLeft = false;
        this.isMovingRight = false;
      }
    },
    move() {
      if (this.isMovingLeft && this.doodlerLeftSpace > 0) {
        this.doodlerLeftSpace = Math.max(0, this.doodlerLeftSpace - this.moveSpeed);
      }
      if (this.isMovingRight && this.doodlerLeftSpace < 340) {
        this.doodlerLeftSpace = Math.min(340, this.doodlerLeftSpace + this.moveSpeed);
      }
      this.doodler.style.left = `${this.doodlerLeftSpace}px`;

      if (this.isMovingLeft || this.isMovingRight) {
        this.animationFrameId = requestAnimationFrame(this.move);
      } else {
        this.animationFrameId = null;
      }
    },
    handleKeyDown(e) {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        this.startMoving('left');
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        this.startMoving('right');
      }
    },
    handleKeyUp(e) {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        this.stopMoving('left');
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        this.stopMoving('right');
      }
    },
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    clearInterval(this.upTimerId)
    clearInterval(this.downTimerId)
    clearInterval(this.gameTimer) // 컴포넌트 언마운트 시 게임 타이머 정지
  }
}
</script>

<style scoped>
.game-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f0f0;
}

.game-content {
  text-align: center;
}

.grid {
  width: 400px;
  height: 600px;
  background-size: cover;
  position: relative;
  font-size: 200px;
  text-align: center;
}

.doodler {
  width: 60px;
  height: 85px;
  background-size: contain; /* 변경: cover에서 contain으로 */
  background-repeat: no-repeat; /* 추가: 이미지 반복 방지 */
  background-position: center; /* 추가: 이미지를 중앙에 위치 */
  position: absolute;
}

.platform {
  width: 85px;
  height: 15px;
  background-size: cover;
  position: absolute;
}

.button-container {
  margin-top: 20px;
}

.high-score-message {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #4CAF50;
  color: white;
  padding: 10px;
  border-radius: 5px;
}
</style>