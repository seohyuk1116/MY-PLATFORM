document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.grid')
  const doodler = document.createElement('div')
  let isGameOver = false
  let speed = 3
  let platformCount = 7
  let platforms = []
  let score = 0
  let doodlerLeftSpace = 50
  let startPoint = 150
  let doodlerBottomSpace = startPoint
  const gravity = 0.9
  let upTimerId
  let downTimerId
  let isJumping = true
  let isGoingLeft = false
  let isGoingRight = false
  let leftTimerId
  let rightTimerId
  let isMovingLeft = false;
  let isMovingRight = false;
  let moveInterval;

  class Platform {
    constructor(newPlatBottom) {
      this.left = Math.random() * 315
      this.bottom = newPlatBottom
      this.visual = document.createElement('div')

      const visual = this.visual
      visual.classList.add('platform')
      visual.style.left = this.left + 'px'
      visual.style.bottom = this.bottom + 'px'
      grid.appendChild(visual)
    }
  }

  function createPlatforms() {
    for(let i =0; i < platformCount; i++) {
      let platGap = 600 / platformCount
      let newPlatBottom = 100 + i * platGap
      let newPlatform = new Platform (newPlatBottom)
      platforms.push(newPlatform)
      console.log(platforms)
    }
  }

  function movePlatforms() {
    if (doodlerBottomSpace > 200) {
        platforms.forEach(platform => {
          platform.bottom -= 4
          let visual = platform.visual
          visual.style.bottom = platform.bottom + 'px'

          if(platform.bottom < 10) {
            let firstPlatform = platforms[0].visual
            firstPlatform.classList.remove('platform')
            platforms.shift()
            console.log(platforms)
            score++
            var newPlatform = new Platform(600)
            platforms.push(newPlatform)
          }
      }) 
    }
    
  }

  function createDoodler() {
    grid.appendChild(doodler)
    doodler.classList.add('doodler')
    doodlerLeftSpace = platforms[0].left
    doodler.style.left = doodlerLeftSpace + 'px'
    doodler.style.bottom = doodlerBottomSpace + 'px'
  }

function fall() {
  isJumping = false
    clearInterval(upTimerId)
    downTimerId = setInterval(function () {
      doodlerBottomSpace -= 5
      doodler.style.bottom = doodlerBottomSpace + 'px'
      if (doodlerBottomSpace <= 0) {
        gameOver()
      }
      platforms.forEach(platform => {
        if (
          (doodlerBottomSpace >= platform.bottom) &&
          (doodlerBottomSpace <= (platform.bottom + 15)) &&
          ((doodlerLeftSpace + 60) >= platform.left) && 
          (doodlerLeftSpace <= (platform.left + 85)) &&
          !isJumping
          ) {
            console.log('tick')
            startPoint = doodlerBottomSpace
            jump()
            console.log('start', startPoint)
            isJumping = true
          }
      })

    },20)
}

  function jump() {
    clearInterval(downTimerId)
    isJumping = true
    upTimerId = setInterval(function () {
      console.log(startPoint)
      console.log('1', doodlerBottomSpace)
      doodlerBottomSpace += 20
      doodler.style.bottom = doodlerBottomSpace + 'px'
      console.log('2',doodlerBottomSpace)
      console.log('s',startPoint)
      if (doodlerBottomSpace > (startPoint + 200)) {
        fall()
        isJumping = false
      }
    },30)
  }

  function moveLeft() {
    if (doodlerLeftSpace >= 5) {
        doodlerLeftSpace -= 5;
        doodler.style.left = doodlerLeftSpace + 'px';
    }
  }

  function moveRight() {
    if (doodlerLeftSpace <= 308) {
        doodlerLeftSpace += 5;
        doodler.style.left = doodlerLeftSpace + 'px';
    }
  }

  function startMoving() {
    if (!moveInterval) {
      moveInterval = setInterval(() => {
        if (isMovingLeft) moveLeft();
        if (isMovingRight) moveRight();
      }, 20);
    }
  }

  function stopMoving() {
    clearInterval(moveInterval);
    moveInterval = null;
  }

  function control(e) {
    if (e.type === 'keydown') {
      if (e.key === 'a' || e.key === 'A') {
        isMovingLeft = true;
        isMovingRight = false;
      } else if (e.key === 'd' || e.key === 'D') {
        isMovingRight = true;
        isMovingLeft = false;
      } else if (e.key === 'w' || e.key === 'W') {
        if (!isJumping) {
          jump();
        }
      }
      startMoving();
    } else if (e.type === 'keyup') {
      if (e.key === 'a' || e.key === 'A') {
        isMovingLeft = false;
      } else if (e.key === 'd' || e.key === 'D') {
        isMovingRight = false;
      }
      if (!isMovingLeft && !isMovingRight) {
        stopMoving();
      }
    }
  }

  function gameOver() {
    isGameOver = true
    while (grid.firstChild) {
      console.log('remove')
      grid.removeChild(grid.firstChild)
    }
    grid.innerHTML = score
    clearInterval(upTimerId)
    clearInterval(downTimerId)
    clearInterval(leftTimerId)
    clearInterval(rightTimerId)
  }

  function start() {
    if (!isGameOver) {
      createPlatforms()
      createDoodler()
      setInterval(movePlatforms,30)
      jump(startPoint)
      document.addEventListener('keydown', control)
      document.addEventListener('keyup', control)
    } 
  }
  start()
})