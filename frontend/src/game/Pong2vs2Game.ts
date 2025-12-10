 
import { BasePongGame } from "./BasePongGame"
import { t } from "../languages/translation"

class Pong2vs2Game extends BasePongGame {
  private static currentInstance: Pong2vs2Game | null = null
  constructor(difficulty: string, scoreLimit: number, team1Name: string, team2Name: string) {
    super("gameCanvas2vs2")
    if (!this.canvas) return

     
    if (Pong2vs2Game.currentInstance) {
      Pong2vs2Game.currentInstance.stop()
    }
    Pong2vs2Game.currentInstance = this
    
    this.initializeGameState(difficulty, scoreLimit, team1Name, team2Name)
    this.setupResetButton()
    this.start()
  }

  protected initializeGameState(difficulty: string, scoreLimit: number, team1Name: string, team2Name: string) {
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
       
      paddleLeft1: {
        x: 10,
        y: this.canvas.height / 4 - 30,
        width: 10,
        height: 60,
        dy: 0,
      },
      paddleLeft2: {
        x: 10,
        y: (this.canvas.height * 3) / 4 - 30,
        width: 10,
        height: 60,
        dy: 0,
      },
       
      paddleRight1: {
        x: this.canvas.width - 20,
        y: this.canvas.height / 4 - 30,
        width: 10,
        height: 60,
        dy: 0,
      },
      paddleRight2: {
        x: this.canvas.width - 20,
        y: (this.canvas.height * 3) / 4 - 30,
        width: 10,
        height: 60,
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
      teamNames: { left: team1Name, right: team2Name },
    }

    this.updateScoreDisplay()
  }

  protected handleKeyDown(e: KeyboardEvent) {
    const gameCanvas = document.getElementById("gameCanvas2vs2")
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

     
    if (["ArrowUp", "ArrowDown", "w", "s", "t", "g", "8", "5"].includes(key)) {
      e.preventDefault()
    }

     
    this.game.keys[key] = true
  }

  protected handleKeyUp(e: KeyboardEvent) {
    const gameCanvas = document.getElementById("gameCanvas2vs2")
    if (!gameCanvas || this.game.gameEnded) return

    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key

     
    if (["ArrowUp", "ArrowDown", "w", "s", "t", "g", "8", "5"].includes(key)) {
      e.preventDefault()
    }

     
    this.game.keys[key] = false
  }

  private setupResetButton() {
    const resetBtn = document.getElementById("reset2vs2Game")
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
    const leftScoreEl = document.getElementById("leftTeamScore")
    const rightScoreEl = document.getElementById("rightTeamScore")
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
      this.game.winner = this.game.teamNames.left
      this.showWinnerMessage()
    } else if (this.game.score.right >= this.game.scoreLimit) {
      this.game.gameEnded = true
      this.game.winner = this.game.teamNames.right
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
     
    if (this.game.keys["w"] && this.game.paddleLeft1.y > 0) {
      this.game.paddleLeft1.y -= 7
    }
    if (this.game.keys["s"] && this.game.paddleLeft1.y < this.canvas.height - this.game.paddleLeft1.height) {
      this.game.paddleLeft1.y += 7
    }

     
    if (this.game.keys["t"] && this.game.paddleLeft2.y > 0) {
      this.game.paddleLeft2.y -= 7
    }
    if (this.game.keys["g"] && this.game.paddleLeft2.y < this.canvas.height - this.game.paddleLeft2.height) {
      this.game.paddleLeft2.y += 7
    }

     
    if (this.game.keys["ArrowUp"] && this.game.paddleRight1.y > 0) {
      this.game.paddleRight1.y -= 7
    }
    if (this.game.keys["ArrowDown"] && this.game.paddleRight1.y < this.canvas.height - this.game.paddleRight1.height) {
      this.game.paddleRight1.y += 7
    }

     
    if (this.game.keys["8"] && this.game.paddleRight2.y > 0) {
      this.game.paddleRight2.y -= 7
    }
    if (this.game.keys["5"] && this.game.paddleRight2.y < this.canvas.height - this.game.paddleRight2.height) {
      this.game.paddleRight2.y += 7
    }
  }

  private checkPaddleCollisions() {
    const r = this.game.ball.size
     
     
    if (
      this.game.ball.dx < 0 &&
      this.game.ball.x - r <= this.game.paddleLeft1.x + this.game.paddleLeft1.width &&
      this.game.ball.x >= this.game.paddleLeft1.x &&
      this.game.ball.y + r >= this.game.paddleLeft1.y &&
      this.game.ball.y - r <= this.game.paddleLeft1.y + this.game.paddleLeft1.height
    ) {
      this.game.ball.x = this.game.paddleLeft1.x + this.game.paddleLeft1.width + r
      this.game.ball.dx = -this.game.ball.dx
      const hitPos =
        (this.game.ball.y - (this.game.paddleLeft1.y + this.game.paddleLeft1.height / 2)) /
        (this.game.paddleLeft1.height / 2)
      this.game.ball.dy = hitPos * 5

       
      this.game.ball.dx += this.game.ball.dx > 0 ? this.game.ball.speedIncrement : -this.game.ball.speedIncrement
    }

     
    if (
      this.game.ball.dx < 0 &&
      this.game.ball.x - r <= this.game.paddleLeft2.x + this.game.paddleLeft2.width &&
      this.game.ball.x >= this.game.paddleLeft2.x &&
      this.game.ball.y + r >= this.game.paddleLeft2.y &&
      this.game.ball.y - r <= this.game.paddleLeft2.y + this.game.paddleLeft2.height
    ) {
      this.game.ball.x = this.game.paddleLeft2.x + this.game.paddleLeft2.width + r
      this.game.ball.dx = -this.game.ball.dx
      const hitPos =
        (this.game.ball.y - (this.game.paddleLeft2.y + this.game.paddleLeft2.height / 2)) /
        (this.game.paddleLeft2.height / 2)
      this.game.ball.dy = hitPos * 5

       
      this.game.ball.dx += this.game.ball.dx > 0 ? this.game.ball.speedIncrement : -this.game.ball.speedIncrement
    }

     
     
    if (
      this.game.ball.dx > 0 &&
      this.game.ball.x + r >= this.game.paddleRight1.x &&
      this.game.ball.x <= this.game.paddleRight1.x + this.game.paddleRight1.width &&
      this.game.ball.y + r >= this.game.paddleRight1.y &&
      this.game.ball.y - r <= this.game.paddleRight1.y + this.game.paddleRight1.height
    ) {
      this.game.ball.x = this.game.paddleRight1.x - r
      this.game.ball.dx = -this.game.ball.dx
      const hitPos =
        (this.game.ball.y - (this.game.paddleRight1.y + this.game.paddleRight1.height / 2)) /
        (this.game.paddleRight1.height / 2)
      this.game.ball.dy = hitPos * 5

       
      this.game.ball.dx += this.game.ball.dx > 0 ? this.game.ball.speedIncrement : -this.game.ball.speedIncrement
    }

     
    if (
      this.game.ball.dx > 0 &&
      this.game.ball.x + r >= this.game.paddleRight2.x &&
      this.game.ball.x <= this.game.paddleRight2.x + this.game.paddleRight2.width &&
      this.game.ball.y + r >= this.game.paddleRight2.y &&
      this.game.ball.y - r <= this.game.paddleRight2.y + this.game.paddleRight2.height
    ) {
      this.game.ball.x = this.game.paddleRight2.x - r
      this.game.ball.dx = -this.game.ball.dx
      const hitPos =
        (this.game.ball.y - (this.game.paddleRight2.y + this.game.paddleRight2.height / 2)) /
        (this.game.paddleRight2.height / 2)
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
      this.game.paddleLeft1.x,
      this.game.paddleLeft1.y,
      this.game.paddleLeft1.width,
      this.game.paddleLeft1.height,
    )
     
    this.ctx.fillStyle = "#0a1b6cff"
    this.ctx.fillRect(
      this.game.paddleLeft2.x,
      this.game.paddleLeft2.y,
      this.game.paddleLeft2.width,
      this.game.paddleLeft2.height,
    )

     
     
    this.ctx.fillStyle = "#ff0000ff"
    this.ctx.fillRect(
      this.game.paddleRight1.x,
      this.game.paddleRight1.y,
      this.game.paddleRight1.width,
      this.game.paddleRight1.height,
    )
     
    this.ctx.fillStyle = "#5e0000ff"
    this.ctx.fillRect(
      this.game.paddleRight2.x,
      this.game.paddleRight2.y,
      this.game.paddleRight2.width,
      this.game.paddleRight2.height,
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

export function initializeConfigurable2vs2Pong(
  difficulty: string,
  scoreLimit: number,
  team1Name: string,
  team2Name: string,
) {
  new Pong2vs2Game(difficulty, scoreLimit, team1Name, team2Name)
}