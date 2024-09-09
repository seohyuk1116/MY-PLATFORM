<template>
  <div class="game-container">
    <div class="game-content">
      <h1 class="game-title">Doodle Jump</h1>
      <h3 class="score">
        Score: <span>{{ score.toFixed(1) }}</span> seconds
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
    visual.style.zIndex = '10'
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
      platformCount: 5,
      platforms: [],
      score: 0,
      showHighScoreMessage: false,
      gameTimer: null,
      platformSpeed: 4,
      doodlerSpeed: 4,
      speedIncrement: 0.01,
      doodlerLeftSpace: 50,
      startPoint: 150,
      doodlerBottomSpace: 150,
      upTimerId: null,
      downTimerId: null,
      isJumping: true,
      isGoingLeft: false,
      isGoingRight: false,
      leftTimerId: null,
      rightTimerId: null,
      movePlatformsTimerId: null,
    }
  },
  mounted() {
    this.grid = this.$refs.grid
    this.doodler = this.$refs.doodler
    this.start()
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
        this.platforms.forEach((platform) => {
          platform.bottom -= this.platformSpeed
          let visual = platform.visual
          visual.style.bottom = platform.bottom + 'px'

          if (platform.bottom < 10) {
            let firstPlatform = this.platforms[0].visual
            this.grid.removeChild(firstPlatform)
            this.platforms.shift()
            this.score += 1
            let newPlatform = new Platform(600, this.grid)
            this.platforms.push(newPlatform)
          }
        })
      }
    },
    jump() {
      clearInterval(this.downTimerId)
      this.isJumping = true
      this.upTimerId = setInterval(() => {
        this.doodlerBottomSpace += 20
        this.doodler.style.bottom = `${this.doodlerBottomSpace}px`
        if (this.doodlerBottomSpace > 350) {
          this.fall()
        }
      }, 30)
    },
    fall() {
      clearInterval(this.upTimerId)
      this.isJumping = false
      this.downTimerId = setInterval(() => {
        this.doodlerBottomSpace -= 5
        this.doodler.style.bottom = `${this.doodlerBottomSpace}px`
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
          }
        })
      }, 20)
    },
    moveLeft() {
      if (this.isGoingRight) {
        clearInterval(this.rightTimerId)
        this.isGoingRight = false
      }
      this.isGoingLeft = true
      this.leftTimerId = setInterval(() => {
        if (this.doodlerLeftSpace >= 0) {
          this.doodlerLeftSpace -= 5
          this.doodler.style.left = `${this.doodlerLeftSpace}px`
        } else this.moveRight()
      }, 20)
    },
    moveRight() {
      if (this.isGoingLeft) {
        clearInterval(this.leftTimerId)
        this.isGoingLeft = false
      }
      this.isGoingRight = true
      this.rightTimerId = setInterval(() => {
        if (this.doodlerLeftSpace <= 340) {
          this.doodlerLeftSpace += 5
          this.doodler.style.left = `${this.doodlerLeftSpace}px`
        } else this.moveLeft()
      }, 20)
    },
    moveStraight() {
      this.isGoingLeft = false
      this.isGoingRight = false
      clearInterval(this.leftTimerId)
      clearInterval(this.rightTimerId)
    },
    control(e) {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        this.moveLeft()
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        this.moveRight()
      } else if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        this.moveStraight()
      }
    },
    async gameOver() {
      console.log('Game Over')
      this.isGameOver = true
      clearInterval(this.upTimerId)
      clearInterval(this.downTimerId)
      clearInterval(this.leftTimerId)
      clearInterval(this.rightTimerId)
      clearInterval(this.movePlatformsTimerId)
      clearInterval(this.gameTimer)

      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        try {
          const response = await rankApi.submitScore({
            uid: user.uid,
            gameName: 'doodle_jump',
            score: this.score.toFixed(1)
          });
          
          if (response.newHighScore) {
            this.showHighScoreMessage = true
            setTimeout(() => {
              this.showHighScoreMessage = false
            }, 3000)
          }
        } catch (error) {
          console.error('점수 등록 실패:', error);
        }
      }
    },
    start() {
      if (!this.isGameOver) {
        this.createPlatforms()
        this.doodlerLeftSpace = this.platforms[0].left
        this.jump()
        this.movePlatformsTimerId = setInterval(() => {
          this.movePlatforms()
        }, 30)
        this.gameTimer = setInterval(() => {
          this.score += 0.1
          this.platformSpeed += this.speedIncrement
          this.doodlerSpeed += this.speedIncrement
        }, 100)
        document.addEventListener('keydown', this.control)
      }
    },
    goToRank() {
      this.$router.push({ name: 'Rank', params: { gameName: 'jump_game' } });
    },
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.control)
    clearInterval(this.upTimerId)
    clearInterval(this.downTimerId)
    clearInterval(this.leftTimerId)
    clearInterval(this.rightTimerId)
    clearInterval(this.movePlatformsTimerId)
    clearInterval(this.gameTimer)
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