 
import { t } from "../languages/translation"
 

export abstract class BasePongGame {
  protected canvas: HTMLCanvasElement
  protected ctx: CanvasRenderingContext2D
  protected game: any
  protected keydownHandler!: (e: KeyboardEvent) => void
  protected keyupHandler!: (e: KeyboardEvent) => void
  protected observer!: MutationObserver
  protected rafId: number | null = null
  protected stopped = false
  
  protected fixedStepMs: number | null = null
  protected lastTimeMs: number | null = null
  protected accumulatorMs = 0

  protected speedConfig = {
    easy: { ballSpeed: 3, ballSpeedIncrement: 0.2 },
    medium: { ballSpeed: 5, ballSpeedIncrement: 0.3 },
    hard: { ballSpeed: 7, ballSpeedIncrement: 0.5 },
  }

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement
    if (!this.canvas) {
      throw new Error(`Canvas with id ${canvasId} not found`) 
    }
    this.ctx = this.canvas.getContext("2d")!
    this.setupEventListeners()
    this.setupObserver()
  }

  protected abstract initializeGameState(difficulty: string, scoreLimit: number, ...args: any[]): void
  protected abstract updateGame(): void
  protected abstract drawGame(): void
  protected abstract resetBall(): void
  protected abstract checkWinner(): void

  protected startCountdown() {
    this.game.isCountingDown = true
    this.game.countdownNumber = 3
    this.game.countdownStartTime = Date.now()
     
  }

  protected updateCountdown() {
    if (!this.game.isCountingDown) return

    const elapsed = Date.now() - this.game.countdownStartTime
    const secondsElapsed = Math.floor(elapsed / 1000)
    const expectedNumber = 3 - secondsElapsed

    if (expectedNumber > 0) {
      this.game.countdownNumber = expectedNumber
    } else {

      this.game.isCountingDown = false
       
    }
  }

  protected drawCountdown() {
    if (!this.game.isCountingDown) return

    this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    const elapsed = (Date.now() - this.game.countdownStartTime) % 1000
    const scale = 1 + ((1000 - elapsed) / 1000) * 0.5

    this.ctx.fillStyle = "#00ff00"
    this.ctx.font = `bold ${80 * scale}px Arial`
    this.ctx.textAlign = "center"
    this.ctx.strokeStyle = "#ffffff"
    this.ctx.lineWidth = 3

    const countText = this.game.countdownNumber.toString()

    this.ctx.strokeText(countText, this.canvas.width / 2, this.canvas.height / 2 + 20)
    this.ctx.fillText(countText, this.canvas.width / 2, this.canvas.height / 2 + 20)

    this.ctx.fillStyle = "#ffffff"
    this.ctx.font = "24px Arial"
    this.ctx.fillText(`${t('game.common.getReady')}`, this.canvas.width / 2, this.canvas.height / 2 - 60)
  }

  protected drawPauseMessage() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    this.ctx.fillStyle = "#00d4ff"
    this.ctx.font = "bold 48px Arial"
    this.ctx.textAlign = "center"
    this.ctx.fillText(`${t('game.common.gamePaused')}`, this.canvas.width / 2, this.canvas.height / 2 - 30)

    const time = Date.now()
    const opacity = 0.5 + 0.5 * Math.sin(time * 0.005)
    this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
    this.ctx.font = "24px Arial"
    this.ctx.fillText(`${t('game.common.resume')}`, this.canvas.width / 2, this.canvas.height / 2 + 30)
  }

  protected clearCanvas() {
    this.ctx.fillStyle = "#000"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
  }

  protected drawCenterLine() {
    this.ctx.setLineDash([5, 15])
    this.ctx.strokeStyle = "#333"
    this.ctx.lineWidth = 2
    this.ctx.beginPath()
    this.ctx.moveTo(this.canvas.width / 2, 0)
    this.ctx.lineTo(this.canvas.width / 2, this.canvas.height)
    this.ctx.stroke()
    this.ctx.setLineDash([])
  }

  protected checkBallBorderCollision() {
    const r = this.game.ball.size

    if (this.game.ball.y - r <= 0) {
      this.game.ball.y = r
      this.game.ball.dy = -this.game.ball.dy
    }

    if (this.game.ball.y + r >= this.canvas.height) {
      this.game.ball.y = this.canvas.height - r
      this.game.ball.dy = -this.game.ball.dy
    }
  }

  protected setupEventListeners() {
    this.keydownHandler = (e: KeyboardEvent) => this.handleKeyDown(e)
    this.keyupHandler = (e: KeyboardEvent) => this.handleKeyUp(e)

    window.addEventListener("keydown", this.keydownHandler)
    window.addEventListener("keyup", this.keyupHandler)
  }

  protected abstract handleKeyDown(e: KeyboardEvent): void
  protected abstract handleKeyUp(e: KeyboardEvent): void

  protected cleanupGameListeners() {
    window.removeEventListener("keydown", this.keydownHandler)
    window.removeEventListener("keyup", this.keyupHandler)
     
  }

  protected setupObserver() {
    this.observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          if (!this.canvas.isConnected) {
            this.stop()
          }
        }
      })
    })

    const playContent = document.getElementById("play-content")
    if (playContent) {
      this.observer.observe(playContent, { childList: true, subtree: true })
    } else {
      this.observer.observe(document.body, { childList: true, subtree: true })
    }

    window.addEventListener(
      "beforeunload",
      () => {
        this.stop()
      },
      { once: true },
    )
  }

  protected gameLoop() {
    if (this.stopped || !this.canvas.isConnected) {
      return
    }

    if (this.fixedStepMs && this.fixedStepMs > 0) {
      const now = performance.now()
      if (this.lastTimeMs == null) this.lastTimeMs = now
      let delta = now - this.lastTimeMs
      if (delta > 100) delta = 100 
      this.lastTimeMs = now
      this.accumulatorMs += delta

      while (this.accumulatorMs >= this.fixedStepMs) {
        this.updateGame()
        this.accumulatorMs -= this.fixedStepMs
      }

      this.drawGame()
    } else {
      this.updateGame()
      this.drawGame()
    }

    this.rafId = requestAnimationFrame(() => this.gameLoop())
  }

  public start() {
    this.stopped = false
    this.startCountdown()
    this.lastTimeMs = performance.now()
    this.accumulatorMs = 0
    this.gameLoop()
  }

  public setTickRate(tickRate: number | null) {
    if (!tickRate || tickRate <= 0) {
      this.fixedStepMs = null
    } else {
      this.fixedStepMs = 1000 / tickRate
    }
  }

  public startSynced(startAtMs: number) {
    this.stopped = false
    this.game.isCountingDown = true
    this.game.countdownNumber = 3
    this.game.countdownStartTime = startAtMs
    this.lastTimeMs = performance.now()
    this.accumulatorMs = 0
    this.gameLoop()
  }

  public stop() {
    if (this.stopped) return
    this.stopped = true
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId)
      this.rafId = null
    }
    this.cleanupGameListeners()
    if (this.observer) {
      try {
        this.observer.disconnect()
      } catch {}
    }
     
  }
}