 
import { BasePongGame } from "./BasePongGame"
import { t } from "../languages/translation"

export class TournamentGame extends BasePongGame {
  private static currentInstance: TournamentGame | null = null
  private player1Name!: string
  private player2Name!: string
  private onGameEnd?: (winner: string) => void

  constructor(
    player1Name: string, 
    player2Name: string, 
    difficulty: string, 
    scoreLimit: number,
    onGameEnd?: (winner: string) => void
  ) {
    super("gameCanvas")
    if (!this.canvas) return

     
    this.player1Name = player1Name
    this.player2Name = player2Name
    this.onGameEnd = onGameEnd

     
    if (TournamentGame.currentInstance) {
      TournamentGame.currentInstance.stop()
    }
    TournamentGame.currentInstance = this

     
    ;(window as any).currentTournamentGame = this

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

     
    if (e.key.toLowerCase() === "p") {
      e.preventDefault()
      
       
      if (this.game.isCountingDown && !this.game.isPaused) {
         
        this.game.isCountingDown = false
        this.game.countdown = 3  
      }
      
      this.game.isPaused = !this.game.isPaused
      
      if (!this.game.isPaused) {
         
         
        this.startCountdown()
      } else {
         
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

  protected checkWinner() {
    if (this.game.score.left >= this.game.scoreLimit) {
      this.game.gameEnded = true
      this.game.winner = this.player1Name  
      this.showWinnerMessage()
       
      if (this.onGameEnd) {
        setTimeout(() => {
          this.onGameEnd!(this.player1Name)
        }, 2000)  
      }
    } else if (this.game.score.right >= this.game.scoreLimit) {
      this.game.gameEnded = true
      this.game.winner = this.player2Name  
      this.showWinnerMessage()
       
      if (this.onGameEnd) {
        setTimeout(() => {
          this.onGameEnd!(this.player2Name)
        }, 2000)  
      }
    }
  }

  private showWinnerMessage() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.ctx.fillStyle = "#00ff00"
    this.ctx.font = "bold 48px Arial"
    this.ctx.textAlign = "center"
     
    let winText = `${t('game.common.wins')}`
    if (`${this.game.winner}` == "You"){
      this.game.winner = `${t('game.you')}`
      winText = `${t('game.common.win')}`
    } else {
      this.game.winner = `${t('game.opponent')}`
    }
    this.ctx.fillText("🏆 " + this.game.winner + ` ${t('game.common.wins')} 🏆`, this.canvas.width / 2, this.canvas.height / 2 - 20)

    this.ctx.fillStyle = "#ffffff"
    this.ctx.font = "24px Arial"
    this.ctx.fillText(`${t('tournament.completed')}`, this.canvas.width / 2, this.canvas.height / 2 + 40)
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

  protected resetBall() {
    this.game.ball.x = this.canvas.width / 2
    this.game.ball.y = this.canvas.height / 2
    this.game.ball.dx = (Math.random() > 0.5 ? 1 : -1) * this.game.ball.baseSpeed
    this.game.ball.dy = (Math.random() - 0.5) * 6
    this.startCountdown()
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

  public stop() {
    super.stop()
     
    if ((window as any).currentTournamentGame === this) {
      (window as any).currentTournamentGame = null
    }
  }

   
  public getGameState() {
    return {
      gameEnded: this.game.gameEnded,
      winner: this.game.winner,
      score: this.game.score,
      player1Name: this.player1Name,
      player2Name: this.player2Name
    }
  }
}

 
export function initializeTournamentGame(
  player1Name: string,
  player2Name: string,
  difficulty: string,
  scoreLimit: number,
  onGameEnd?: (winner: string) => void
) {
  return new TournamentGame(player1Name, player2Name, difficulty, scoreLimit, onGameEnd)
}