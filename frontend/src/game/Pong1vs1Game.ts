 
import { BasePongGame } from "./BasePongGame"
import { t } from "../languages/translation"

class Pong1vs1Game extends BasePongGame {
  private static currentInstance: Pong1vs1Game | null = null
  constructor(difficulty: string, scoreLimit: number) {
    super("gameCanvas")
    if (!this.canvas) return

     
    if (Pong1vs1Game.currentInstance) {
      Pong1vs1Game.currentInstance.stop()
    }
    Pong1vs1Game.currentInstance = this

    this.initializeGameState(difficulty, scoreLimit)
    this.setupResetButton()
    this.start()
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

     
    if (["ArrowUp", "ArrowDown", "w", "s"].includes(key)) {
      e.preventDefault()
    }

     
    this.game.keys[key] = true
  }

  protected handleKeyUp(e: KeyboardEvent) {
    const gameCanvas = document.getElementById("gameCanvas")
    if (!gameCanvas || this.game.gameEnded) return

    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key

     
    if (["ArrowUp", "ArrowDown", "w", "s"].includes(key)) {
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
      })
    }
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
      this.game.winner = `${t('game.common.player')} 1`
      this.showWinnerMessage()
    } else if (this.game.score.right >= this.game.scoreLimit) {
      this.game.gameEnded = true
      this.game.winner = `${t('game.common.player')} 2`
      this.showWinnerMessage()
    }
  }

  private showWinnerMessage() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.ctx.fillStyle = "#00ff00"
    this.ctx.font = "bold 48px Arial"
    this.ctx.textAlign = "center"

    this.ctx.fillText("🏆 " + this.game.winner + ` ${t('game.common.wins')} 🏆`, this.canvas.width / 2, this.canvas.height / 2 - 20)

    this.ctx.fillStyle = "#ffffff"
    this.ctx.font = "24px Arial"
    this.ctx.fillText(`${t('game.common.reset')}`, this.canvas.width / 2, this.canvas.height / 2 + 40)
  }

  protected updateGame() {
     
    if (this.game.gameEnded || this.game.isPaused) return

     
    if (this.game.isCountingDown) {
      this.updateCountdown()
       
      return
    }

     
    this.movePaddles()

     
    this.game.ball.x += this.game.ball.dx
    this.game.ball.y += this.game.ball.dy

     
    this.checkBallBorderCollision()

     
    this.checkPaddleCollisions()

     
    this.checkScoring()
  }

  private movePaddles() {
    if (this.game.keys["w"] && this.game.paddleLeft.y > 0) {
      this.game.paddleLeft.y -= 7
    }
    if (this.game.keys["s"] && this.game.paddleLeft.y < this.canvas.height - this.game.paddleLeft.height) {
      this.game.paddleLeft.y += 7
    }

    if (this.game.keys["ArrowUp"] && this.game.paddleRight.y > 0) {
      this.game.paddleRight.y -= 7
    }
    if (this.game.keys["ArrowDown"] && this.game.paddleRight.y < this.canvas.height - this.game.paddleRight.height) {
      this.game.paddleRight.y += 7
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

export function initializeConfigurablePong(difficulty: string, scoreLimit: number) {
  new Pong1vs1Game(difficulty, scoreLimit)
}