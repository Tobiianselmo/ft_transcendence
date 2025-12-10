 
import { BasePongGame } from "./BasePongGame"
import { t } from "../languages/translation"
class Pong1vsAIGame extends BasePongGame {
  private static currentInstance: Pong1vsAIGame | null = null
  private aiState!: {
    targetY: number
    reactionDelay: number
    lastReactionTime: number
    errorMargin: number
    isMovingUp: boolean
    isMovingDown: boolean
    difficultyModifier: number
  }

  constructor(difficulty: string, scoreLimit: number) {
    super("gameCanvas")
    if (!this.canvas) return

     
    if (Pong1vsAIGame.currentInstance) {
      Pong1vsAIGame.currentInstance.stop()
    }
    Pong1vsAIGame.currentInstance = this

    this.initializeAIState(difficulty)
    this.initializeGameState(difficulty, scoreLimit)
    this.setupResetButton()
    this.start()
  }

  private initializeAIState(difficulty: string) {
     
    const aiConfig = {
      easy: { reactionDelay: 300, errorMargin: 0.20, difficultyModifier: 0.7 },
      medium: { reactionDelay: 200, errorMargin: 0.15, difficultyModifier: 0.85 },
      hard: { reactionDelay: 100, errorMargin: 0.10, difficultyModifier: 1.0 },
    }

    const config = aiConfig[difficulty as keyof typeof aiConfig] || aiConfig.medium

    this.aiState = {
      targetY: this.canvas.height / 2,
      reactionDelay: config.reactionDelay,
      lastReactionTime: 0,
      errorMargin: config.errorMargin,
      isMovingUp: false,
      isMovingDown: false,
      difficultyModifier: config.difficultyModifier,
    }
  }

  protected initializeGameState(difficulty: string, scoreLimit: number) {
    const config = this.speedConfig[difficulty as keyof typeof this.speedConfig] || this.speedConfig.medium

     
    this.game = {
      ball: {
        x: this.canvas.width / 2,
        y: this.canvas.height / 2,
        dx: config.ballSpeed,
        dy: 3,
        size: 10,
        baseSpeed: config.ballSpeed,
        speedIncrement: config.ballSpeedIncrement,
      },
      paddleLeft: {
        x: 10,
        y: this.canvas.height / 2 - 40,
        width: 10,
        height: 80,
        dy: 0,
      },
      paddleRight: {
        x: this.canvas.width - 20,
        y: this.canvas.height / 2 - 40,
        width: 10,
        height: 80,
        dy: 0,
      },
      score: { left: 0, right: 0 },
      scoreLimit: scoreLimit,
      keys: {} as { [key: string]: boolean },
      gameEnded: false,
      winner: null as string | null,
      isPaused: false,
      isCountingDown: false,
      countdownNumber: 3,
      countdownStartTime: 0,
    }

    this.updateScoreDisplay()
  }

  protected handleKeyDown(e: KeyboardEvent) {
    const gameCanvas = document.getElementById("gameCanvas")
    if (!gameCanvas || this.game.gameEnded) return

     
    if (e.key.toLowerCase() === "p" && !this.game.isCountingDown) {
      e.preventDefault()
      this.game.isPaused = !this.game.isPaused
      if (!this.game.isPaused) {
        this.startCountdown()
      }
       
      return
    }

    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key

     
    if (["w", "s"].includes(key)) {
      e.preventDefault()
    }

     
    this.game.keys[key] = true
  }

  protected handleKeyUp(e: KeyboardEvent) {
    const gameCanvas = document.getElementById("gameCanvas")
    if (!gameCanvas || this.game.gameEnded) return

    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key

     
    if (["w", "s"].includes(key)) {
      e.preventDefault()
    }

     
    this.game.keys[key] = false
  }

  private setupResetButton() {
    const resetBtn = document.getElementById("resetGame")
    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.game.score = { left: 0, right: 0 }
        this.game.gameEnded = false
        this.game.winner = null
        this.game.isPaused = false
        this.updateScoreDisplay()
        this.startCountdown()
        this.resetBall()
        this.resetAI()
      })
    }
  }

  private resetAI() {
    this.aiState.targetY = this.canvas.height / 2
    this.aiState.lastReactionTime = 0
    this.aiState.isMovingUp = false
    this.aiState.isMovingDown = false
  }

  private updateScoreDisplay() {
    const leftScoreEl = document.getElementById("leftScore")
    const rightScoreEl = document.getElementById("rightScore")
    if (leftScoreEl && rightScoreEl) {
      leftScoreEl.textContent = this.game.score.left.toString()
      rightScoreEl.textContent = this.game.score.right.toString()
    }
  }

  protected resetBall() {
    this.game.ball.x = this.canvas.width / 2
    this.game.ball.y = this.canvas.height / 2
    this.game.ball.dx = (Math.random() > 0.5 ? 1 : -1) * this.game.ball.baseSpeed
    this.game.ball.dy = (Math.random() - 0.5) * 6

    this.startCountdown()
  }

  protected checkWinner() {
    if (this.game.score.left >= this.game.scoreLimit) {
      this.game.gameEnded = true
      this.game.winner = "Player"
      this.showWinnerMessage()
    } else if (this.game.score.right >= this.game.scoreLimit) {
      this.game.gameEnded = true
      this.game.winner = "AI"
      this.showWinnerMessage()
    }
  }

  private showWinnerMessage() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    const winnerEmoji = this.game.winner === "Player" ? "🏆" : "🤖"
    const winnerColor = this.game.winner === "Player" ? "#00ff00" : "#ff6b6b"

    this.ctx.fillStyle = winnerColor
    this.ctx.font = "bold 48px Arial"
    this.ctx.textAlign = "center"
    this.ctx.fillText(`${winnerEmoji} ${this.game.winner} ${t('game.common.wins')} ${winnerEmoji}`, this.canvas.width / 2, this.canvas.height / 2 - 20)

    this.ctx.fillStyle = "#ffffff"
    this.ctx.font = "24px Arial"
    this.ctx.fillText(`${t('game.common.reset')}`, this.canvas.width / 2, this.canvas.height / 2 + 40)
  }

  private updateAI() {
    const currentTime = Date.now()
    
     
    if (this.game.ball.dx > 0) {
       
      if (currentTime - this.aiState.lastReactionTime > this.aiState.reactionDelay) {
        this.aiState.lastReactionTime = currentTime
        
         
        const perfectTargetY = this.game.ball.y - this.game.paddleRight.height / 2
        const errorRange = this.canvas.height * this.aiState.errorMargin
        const randomError = (Math.random() - 0.5) * errorRange * 2
        
         
        this.aiState.targetY = perfectTargetY + (randomError * (1 - this.aiState.difficultyModifier))
        
         
        this.aiState.targetY = Math.max(0, Math.min(this.canvas.height - this.game.paddleRight.height, this.aiState.targetY))
      }
    } else {
       
      const centerY = this.canvas.height / 2 - this.game.paddleRight.height / 2
      const distanceToCenter = centerY - this.game.paddleRight.y
      
      if (Math.abs(distanceToCenter) > 5) {
        this.aiState.targetY = this.game.paddleRight.y + (distanceToCenter * 0.02)  
      }
    }

     
    const currentPaddleCenter = this.game.paddleRight.y + this.game.paddleRight.height / 2
    const targetPaddleCenter = this.aiState.targetY + this.game.paddleRight.height / 2
    const distance = targetPaddleCenter - currentPaddleCenter
    
     
    const deadZone = 15
    
    if (Math.abs(distance) > deadZone) {
      if (distance < 0) {
        this.aiState.isMovingUp = true
        this.aiState.isMovingDown = false
      } else {
        this.aiState.isMovingUp = false
        this.aiState.isMovingDown = true
      }
    } else {
       
      this.aiState.isMovingUp = false
      this.aiState.isMovingDown = false
    }
  }

  private moveAIPaddle() {
     
    const baseSpeed = 6
    const speedVariation = Math.random() * 2 - 1  
    const aiSpeed = Math.max(4, baseSpeed + speedVariation) * this.aiState.difficultyModifier

    if (this.aiState.isMovingUp && this.game.paddleRight.y > 0) {
      this.game.paddleRight.y -= aiSpeed
      if (this.game.paddleRight.y < 0) {
        this.game.paddleRight.y = 0
      }
    }
    
    if (this.aiState.isMovingDown && this.game.paddleRight.y < this.canvas.height - this.game.paddleRight.height) {
      this.game.paddleRight.y += aiSpeed
      if (this.game.paddleRight.y > this.canvas.height - this.game.paddleRight.height) {
        this.game.paddleRight.y = this.canvas.height - this.game.paddleRight.height
      }
    }
  }

  protected updateGame() {
    if (this.game.gameEnded || this.game.isPaused) return

     
    if (this.game.isCountingDown) {
      this.updateCountdown()
       
      return
    }

     
    this.movePlayerPaddle()
    
     
    this.updateAI()
    this.moveAIPaddle()

     
    this.game.ball.x += this.game.ball.dx
    this.game.ball.y += this.game.ball.dy

     
    this.checkBallBorderCollision()

     
    this.checkPaddleCollisions()

     
    this.checkScoring()
  }

  private movePlayerPaddle() {
     
    if (this.game.keys["w"] && this.game.paddleLeft.y > 0) {
      this.game.paddleLeft.y -= 7
    }
    if (this.game.keys["s"] && this.game.paddleLeft.y < this.canvas.height - this.game.paddleLeft.height) {
      this.game.paddleLeft.y += 7
    }
  }

  private checkPaddleCollisions() {
    const r = this.game.ball.size

     
    if (
      this.game.ball.dx < 0 &&
      this.game.ball.x - r <= this.game.paddleLeft.x + this.game.paddleLeft.width &&
      this.game.ball.x >= this.game.paddleLeft.x &&
      this.game.ball.y + r >= this.game.paddleLeft.y &&
      this.game.ball.y - r <= this.game.paddleLeft.y + this.game.paddleLeft.height
    ) {
      this.game.ball.x = this.game.paddleLeft.x + this.game.paddleLeft.width + r
      this.game.ball.dx = -this.game.ball.dx
      const hitPos =
        (this.game.ball.y - (this.game.paddleLeft.y + this.game.paddleLeft.height / 2)) /
        (this.game.paddleLeft.height / 2)
      this.game.ball.dy = hitPos * 5

       
      this.game.ball.dx += this.game.ball.dx > 0 ? this.game.ball.speedIncrement : -this.game.ball.speedIncrement
    }

     
    if (
      this.game.ball.dx > 0 &&
      this.game.ball.x + r >= this.game.paddleRight.x &&
      this.game.ball.x <= this.game.paddleRight.x + this.game.paddleRight.width &&
      this.game.ball.y + r >= this.game.paddleRight.y &&
      this.game.ball.y - r <= this.game.paddleRight.y + this.game.paddleRight.height
    ) {
      this.game.ball.x = this.game.paddleRight.x - r
      this.game.ball.dx = -this.game.ball.dx
      const hitPos =
        (this.game.ball.y - (this.game.paddleRight.y + this.game.paddleRight.height / 2)) /
        (this.game.paddleRight.height / 2)
      this.game.ball.dy = hitPos * 5

       
      this.game.ball.dx += this.game.ball.dx > 0 ? this.game.ball.speedIncrement : -this.game.ball.speedIncrement
    }
  }

  private checkScoring() {
    if (this.game.ball.x < 0) {
      this.game.score.right++
      this.updateScoreDisplay()
      this.checkWinner()
      if (!this.game.gameEnded) this.resetBall()
    } else if (this.game.ball.x > this.canvas.width) {
      this.game.score.left++
      this.updateScoreDisplay()
      this.checkWinner()
      if (!this.game.gameEnded) this.resetBall()
    }
  }

  protected drawGame() {
    if (this.game.gameEnded) return

     
    this.clearCanvas()
    this.drawCenterLine()

     
    this.ctx.fillStyle = "#00d4ff"
    this.ctx.fillRect(
      this.game.paddleLeft.x,
      this.game.paddleLeft.y,
      this.game.paddleLeft.width,
      this.game.paddleLeft.height,
    )
    
     
    this.ctx.fillStyle = "#ff6b6b"
    this.ctx.fillRect(
      this.game.paddleRight.x,
      this.game.paddleRight.y,
      this.game.paddleRight.width,
      this.game.paddleRight.height,
    )

     
    this.ctx.fillStyle = "#ffffff"
    this.ctx.beginPath()
    this.ctx.arc(this.game.ball.x, this.game.ball.y, this.game.ball.size, 0, Math.PI * 2)
    this.ctx.fill()

     
    if (this.game.isPaused) {
      this.drawPauseMessage()
    }

     
    if (this.game.isCountingDown) {
      this.drawCountdown()
    }
  }
}

export function initializeAIPong(difficulty: string, scoreLimit: number) {
  new Pong1vsAIGame(difficulty, scoreLimit)
}