 
import { BasePongGame } from './BasePongGame'
import type { Direction, PlayerIndex } from './net/Transport'
import { WebSocketTransport } from './net/WebSocketTransport'
import { t } from '../languages/translation'
 
export class Online1v1Game extends BasePongGame {
  private static currentInstance: Online1v1Game | null = null
  private transport: WebSocketTransport
  private me: PlayerIndex = 0
  private pendingDir: Direction = 'none'
  private lastSentDir: Direction = 'none'
   
  private serverAuthoritative = true
  private gameId: string | null = null
  private pausedByIndex: PlayerIndex | null = null
  private navClickHandler?: (e: Event) => void

  constructor(opts?: { transport?: WebSocketTransport; roomId?: string; config?: { difficulty: 'easy'|'medium'|'hard'; scoreLimit: number }; meIndex?: PlayerIndex }) {
    super('gameCanvas')
    if (Online1v1Game.currentInstance) Online1v1Game.currentInstance.stop()
    Online1v1Game.currentInstance = this
     
    const difficulty = opts?.config?.difficulty ?? 'medium'
    const scoreLimit = opts?.config?.scoreLimit ?? 5
    this.initializeGameState(difficulty, scoreLimit)
    this.setupResetButton()
    this.transport = opts?.transport ?? new WebSocketTransport()
    if (opts?.roomId) {
      if (opts?.meIndex !== undefined) this.me = opts.meIndex
      this.attachTransportHandlers()
       
    } else {
      console.warn('[online-game] No roomId provided. Use createMatch/joinMatch flow to start an online 1v1 game.')
      this.showStatus('Create or Join a match to start Online 1v1') 
    }
    this.setTickRate(60)
    this.start()
    this.setupBackButton()
    this.setupNavInterceptors()
  }

  private attachTransportHandlers() {
   
    this.transport.onWaiting = () => this.showStatus('⏳ Waiting for opponent...')
    this.transport.onReady = ({ roomId, players }) => {
       
      const myId = this.transport.getId?.() ?? null
      const meIdx = players.find(p => p.id === myId)?.index
      if (meIdx !== undefined) this.me = meIdx
      this.gameId = roomId
    }
    this.transport.onGameState = (state: any) => {
      if (!this.serverAuthoritative) return
  if (this.game.gameEnded) return
      const wasCounting = this.game.isCountingDown
      this.game.ball.x = state.ball.x
      this.game.ball.y = state.ball.y
      this.game.paddleLeft.y = state.paddles[0].y
      this.game.paddleRight.y = state.paddles[1].y
      this.game.score.left = state.scores[0]
      this.game.score.right = state.scores[1]
      this.game.isCountingDown = !!state.isCountingDown
      this.game.countdownNumber = state.countdownNumber ?? this.game.countdownNumber
      this.game.gameEnded = !!state.gameEnded
      this.game.isPaused = !!state.isPaused
      this.pausedByIndex = state.pausedByIndex ?? null
      if (!wasCounting && this.game.isCountingDown) {
        this.game.countdownStartTime = Date.now()
        this.game.gameEnded = false
        this.game.winner = null
      }
    }
    this.transport.onGameStart = () => {
       
    }  
    this.transport.onGameEnd = (data) => {
      this.game.gameEnded = true
      this.game.winner = this.game.score.left > this.game.score.right ? (this.me===0?'You':'Opponent') : (this.me===1?'You':'Opponent')
      this.showWinnerMessage()
    }
    this.transport.onGameScore = (data: { scores: [number, number] }) => {
      this.game.score.left = data.scores[0]
      this.game.score.right = data.scores[1]
      this.updateScoreDisplay()
    }
    this.transport.onPausedChanged = (data: { isPaused: boolean; pausedByIndex: PlayerIndex | null }) => {
      this.game.isPaused = !!data.isPaused
      this.pausedByIndex = data.pausedByIndex ?? null
    }
    this.transport.onPlayerLeft = () => {
      if (this.game.gameEnded) {
         
        return
      }
  
      this.game.gameEnded = true
      this.game.winner = 'You'
      this.showWinnerMessage()
      this.pendingDir = 'none'
      this.lastSentDir = 'none'
      this.stop()
    }
  }


  private showStatus(msg: string) {
    const playContent = document.getElementById('play-content')
    if (!playContent) return
    const existing = playContent.querySelector('.online-status') as HTMLElement
    const el = existing || document.createElement('div')
    el.className = 'online-status'
    el.textContent = msg
    if (!existing) playContent.appendChild(el)
  }

  private setupBackButton() {
    const btn = document.getElementById('btn-back')
    if (!btn) return
    const onClick = (e: Event) => {
      e.preventDefault()
      try {
        this.transport?.disconnect()
      } catch {}
      this.game.gameEnded = true
      this.stop()
      history.back()
    }
    btn.removeEventListener('click', onClick as any)
    btn.addEventListener('click', onClick, { once: true })
  }

  private setupNavInterceptors() {
    if (this.navClickHandler) return
    this.navClickHandler = (ev: Event) => {
      const e = ev as MouseEvent
      const target = e.target as HTMLElement
      if (!target) return
      const anchor = target.closest('a.nav-btn') as HTMLAnchorElement | null
      const logoutBtn = target.closest('#logout-btn') as HTMLButtonElement | null

      if (anchor && (anchor.getAttribute('href') === '/' || anchor.getAttribute('href') === '/profile')) {
        try { this.transport?.disconnect() } catch {}
        this.game.gameEnded = true
        this.stop()
        return
      }
      
      if (logoutBtn) {
        try { this.transport?.disconnect() } catch {}
        this.game.gameEnded = true
        this.stop()
        return
      }
    }
    
    document.addEventListener('click', this.navClickHandler, true)
  }

  private removeNavInterceptors() {
    if (this.navClickHandler) {
      document.removeEventListener('click', this.navClickHandler, true)
      this.navClickHandler = undefined
    }
  }

  protected initializeGameState(difficulty: string, scoreLimit: number) {
    const config = this.speedConfig[difficulty as keyof typeof this.speedConfig] || this.speedConfig.medium
    this.game = {
      ball: { x: this.canvas.width / 2, y: this.canvas.height / 2, dx: config.ballSpeed, dy: 3, size: 10, baseSpeed: config.ballSpeed, speedIncrement: config.ballSpeedIncrement },
      paddleLeft: { x: 10, y: this.canvas.height / 2 - 40, width: 10, height: 80, dy: 0 },
      paddleRight: { x: this.canvas.width - 20, y: this.canvas.height / 2 - 40, width: 10, height: 80, dy: 0 },
      score: { left: 0, right: 0 },
      scoreLimit,
      keys: {} as { [k: string]: boolean },
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
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
    if ([ 'ArrowUp','ArrowDown','w','s'].includes(key)) e.preventDefault()
    if (e.key.toLowerCase() === 'p') {
      e.preventDefault()
    
      if (this.game.isCountingDown) {
    
        if (!(this.game.isPaused && this.pausedByIndex === this.me)) return
      }
    
      if (this.serverAuthoritative) {
        if (!this.game.isPaused) {
          this.transport.pauseGame()
          this.game.isPaused = true
          this.pausedByIndex = this.me
        } else {
          if (this.pausedByIndex === this.me) {
            this.transport.resumeGame()
          }
        }
  }
      return
    }
    if (!this.game.isPaused) {
      this.game.keys[key] = true
      this.updatePendingDir()
    }
  }

  protected handleKeyUp(e: KeyboardEvent) {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key
    if ([ 'ArrowUp','ArrowDown','w','s'].includes(key)) e.preventDefault()
    if (!this.game.isPaused) {
      this.game.keys[key] = false
      this.updatePendingDir()
    }
  }

  private updatePendingDir() {  
    const up = this.game.keys['w'] || this.game.keys['ArrowUp']
    const down = this.game.keys['s'] || this.game.keys['ArrowDown']
    this.pendingDir = up ? 'up' : down ? 'down' : 'none'
  }

  private setupResetButton() {
    if (this.serverAuthoritative) return
    const btn = document.getElementById('resetGame')
    if (!btn) return
    btn.addEventListener('click', () => {
      this.game.score = { left: 0, right: 0 }
      this.game.gameEnded = false
      this.game.winner = null
      this.game.isPaused = false
      this.updateScoreDisplay()
      this.startCountdown()
      this.resetBall()
    })
  }

  private updateScoreDisplay() {
    const leftScoreEl = document.getElementById('leftScore')
    const rightScoreEl = document.getElementById('rightScore')
    if (leftScoreEl && rightScoreEl) {
      leftScoreEl.textContent = this.game.score.left.toString()
      rightScoreEl.textContent = this.game.score.right.toString()
    }
  }

  protected resetBall() {
    this.game.ball.x = this.canvas.width / 2
    this.game.ball.y = this.canvas.height / 2
    const dir = ((this.game.score.left + this.game.score.right) % 2 === 0) ? 1 : -1
    this.game.ball.dx = dir * this.game.ball.baseSpeed
    this.game.ball.dy = 0
    this.startCountdown()
  }

  protected checkWinner() {
    if (this.game.score.left >= this.game.scoreLimit) {
      this.game.gameEnded = true
      this.game.winner = this.me === 0 ? 'You' : 'Opponent'
      this.showWinnerMessage()
    } else if (this.game.score.right >= this.game.scoreLimit) {
      this.game.gameEnded = true
      this.game.winner = this.me === 1 ? 'You' : 'Opponent'
      this.showWinnerMessage()
    }
  }

  private showWinnerMessage() {
    this.ctx.fillStyle = 'rgba(0,0,0,0.8)'
    this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height)
    this.ctx.fillStyle = '#00ff00'
    this.ctx.font = 'bold 48px Arial'
    this.ctx.textAlign = 'center'
    let winText = `${t('game.common.wins')}`
    if (`${this.game.winner}` == "You"){
      this.game.winner = `${t('game.you')}`
      winText = `${t('game.common.win')}`
    } else {
      this.game.winner = `${t('game.opponent')}`
    }
    this.ctx.fillText(`🏆 ${this.game.winner} ${winText} 🏆`, this.canvas.width/2, this.canvas.height/2-20)
    this.ctx.fillStyle = '#ffffff'
    this.ctx.font = '24px Arial'
    
    if (!this.serverAuthoritative) {
      this.ctx.fillText(`${t('game.common.reset')}`, this.canvas.width/2, this.canvas.height/2+40)
    } else {
      this.ctx.fillText(`${t('game.matchFinished')}`, this.canvas.width/2, this.canvas.height/2+40)
    }
  }

  protected updateGame() {
    if (this.game.gameEnded || this.game.isPaused) return
    if (this.game.isCountingDown) {
      return
    }
    
    if (this.pendingDir !== this.lastSentDir) {
      this.transport.sendAuthoritativeInput(this.pendingDir)
      this.lastSentDir = this.pendingDir
    }
  }

  private checkPaddleCollisions() {
    const r = this.game.ball.size
    if (
      this.game.ball.dx < 0 &&
      this.game.ball.x - r <= this.game.paddleLeft.x + this.game.paddleLeft.width &&
      this.game.ball.y + r >= this.game.paddleLeft.y &&
      this.game.ball.y - r <= this.game.paddleLeft.y + this.game.paddleLeft.height
    ) {
      this.game.ball.x = this.game.paddleLeft.x + this.game.paddleLeft.width + r
      this.game.ball.dx = -this.game.ball.dx
      const hitPos = (this.game.ball.y - (this.game.paddleLeft.y + this.game.paddleLeft.height/2)) / (this.game.paddleLeft.height/2)
      this.game.ball.dy = hitPos * 5
      this.game.ball.dx += this.game.ball.dx > 0 ? this.game.ball.speedIncrement : -this.game.ball.speedIncrement
    }
    if (
      this.game.ball.dx > 0 &&
      this.game.ball.x + r >= this.game.paddleRight.x &&
      this.game.ball.y + r >= this.game.paddleRight.y &&
      this.game.ball.y - r <= this.game.paddleRight.y + this.game.paddleRight.height
    ) {
      this.game.ball.x = this.game.paddleRight.x - r
      this.game.ball.dx = -this.game.ball.dx
      const hitPos = (this.game.ball.y - (this.game.paddleRight.y + this.game.paddleRight.height/2)) / (this.game.paddleRight.height/2)
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
    this.ctx.fillStyle = '#00d4ff'
    this.ctx.fillRect(this.game.paddleLeft.x, this.game.paddleLeft.y, this.game.paddleLeft.width, this.game.paddleLeft.height)
    this.ctx.fillRect(this.game.paddleRight.x, this.game.paddleRight.y, this.game.paddleRight.width, this.game.paddleRight.height)
    this.ctx.fillStyle = '#ffffff'
    this.ctx.beginPath()
    this.ctx.arc(this.game.ball.x, this.game.ball.y, this.game.ball.size, 0, Math.PI * 2)
    this.ctx.fill()
    if (this.game.isPaused) {
      if (this.serverAuthoritative) {
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)'
        this.ctx.fillRect(0,0,this.canvas.width,this.canvas.height)
        this.ctx.fillStyle = '#00d4ff'
        this.ctx.font = 'bold 48px Arial'
        this.ctx.textAlign = 'center'
        this.ctx.fillText(`${t('game.common.gamePaused')}`, this.canvas.width / 2, this.canvas.height / 2 - 30)
        this.ctx.font = '24px Arial'
        if (this.pausedByIndex === this.me) {
          this.ctx.fillStyle = '#ffffff'
          this.ctx.fillText(`${t('game.common.resume')}`, this.canvas.width / 2, this.canvas.height / 2 + 30)
        } else {
          this.ctx.fillStyle = '#ffcc00'
          this.ctx.fillText(`${t('game.waiting')}`, this.canvas.width / 2, this.canvas.height / 2 + 30)
        }
      } else {
        this.drawPauseMessage()
      }
    }
    if (this.game.isCountingDown) this.drawCountdown()
  }

  public stop() {
    this.removeNavInterceptors()
    super.stop()
  }
}

export function startOnline1v1Client() {
  const playContent = document.getElementById('play-content')
  if (!playContent) return
  playContent.innerHTML = `
    <div class="local-game-container">
      <div class="game-header-simple">
        <div class="game-info-no-bg">
          <div class="score-display"><span id="leftScore">0</span> - <span id="rightScore">0</span></div>
        </div>
        <div class="game-controls">
          <span>${t('game.controls')}: W/S or ↑/↓ | ${t('game.common.pause')}: P</span>
        </div>
      </div>
      <canvas id="gameCanvas" width="800" height="400"></canvas>
      <div class="game-footer">
        <button id="btn-back" class="btn-back" type="button">${t('common.back')}</button>
        </div>
        <div class="online-status">${t('game.online')}</div>
        </div>
        `
}

export function startOnline1v1WithTransport(transport: WebSocketTransport, ctx: { roomId: string; config?: { difficulty: 'easy'|'medium'|'hard'; scoreLimit: number }; meIndex?: PlayerIndex }) {
  const playContent = document.getElementById('play-content')
  if (!playContent) return
  if (!document.getElementById('gameCanvas')) {
    playContent.innerHTML = `
      <div class="local-game-container">
        <div class="game-header-simple">
          <div class="game-info-no-bg">
            <div class="score-display"><span id="leftScore">0</span> - <span id="rightScore">0</span></div>
          </div>
          <div class="game-controls">
            <span>${t('game.controls')}: W/S or ↑/↓ | ${t('game.common.pause')}: P</span>
          </div>
        </div>
        <canvas id="gameCanvas" width="800" height="400"></canvas>
        <div class="game-footer">
          <button id="btn-back" class="btn-back" type="button">${t('common.back')}</button>
        </div>
      </div>
    `
  }

  const game = new Online1v1Game({ transport, roomId: ctx.roomId, config: ctx.config, meIndex: ctx.meIndex })
  if (ctx.meIndex !== undefined && ctx.config) {
    try {
      ;(game as any).game.scoreLimit = ctx.config.scoreLimit
      ;(game as any).initializeGameState(ctx.config.difficulty, ctx.config.scoreLimit)
    } catch (e) {
      console.warn('[online-game] No se pudo configurar el juego en join:', e)
    }
  }
}