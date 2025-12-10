 
import type { Direction, PlayerIndex, RelayReadyPayload, Transport } from './Transport'
import { t } from '../../languages/translation'
type Socket = any

function ensureSocketIOScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).io) return resolve()
    const existing = document.querySelector('script[data-socketio-client]') as HTMLScriptElement | null
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Failed to load socket.io client'))) 
      return
    }
    const s = document.createElement('script')
    s.src = '/socket.io/socket.io.js'
    s.async = true
    s.setAttribute('data-socketio-client', 'true')
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load socket.io client'))
    document.head.appendChild(s)
  })
}

export class WebSocketTransport implements Transport {
  private socket: Socket | null = null
  private id: string | null = null
  private lastStartData: { roomId: string; startTime: number; config?: { difficulty: 'easy'|'medium'|'hard'; scoreLimit: number } } | null = null

  onWaiting?: () => void
  onReady?: (payload: RelayReadyPayload) => void
  onStart?: (data: { roomId: string; startTime: number; config?: { difficulty: 'easy'|'medium'|'hard'; scoreLimit: number } }) => void
  onPlayerLeft?: (data: { id: string }) => void
  onDisconnect?: () => void
  onLatency?: (data: { rtt: number; offset: number }) => void
  onCreated?: (data: { roomId: string; config: { difficulty: 'easy'|'medium'|'hard'; scoreLimit: number } }) => void
  onJoinError?: (data: { message: string }) => void
  
  onGameStart?: (data: { players: Array<{ name: string; index: PlayerIndex }> }) => void
  onGameState?: (state: any) => void
  onGameEnd?: (data: { scores: [number, number] }) => void
  onGameScore?: (data: { scores: [number, number] }) => void
  
  onPausedChanged?: (data: { isPaused: boolean; pausedByIndex: PlayerIndex | null }) => void

  async connect(): Promise<void> {
    if (this.socket?.connected) return

    await ensureSocketIOScript()
    const io = (window as any).io as (url?: string, opts?: any) => Socket

    this.socket = io('/', {
      path: '/socket.io/',
      withCredentials: true,
      autoConnect: true,
      query: { type: 'game' },
    })

    return new Promise((resolve, reject) => {
      if (!this.socket) return reject(new Error('No socket'))

      this.socket.on('connect', () => {
        this.id = this.socket!.id
        resolve()
      })

      this.socket.on('connect_error', (err: any) => {
        reject(err)
      })

      this.socket.on('relay:waiting', () => this.onWaiting && this.onWaiting())
      this.socket.on('relay:ready', (payload: RelayReadyPayload) => this.onReady && this.onReady(payload))
      this.socket.on('relay:start', (data: { roomId: string; startTime: number; config?: { difficulty: 'easy'|'medium'|'hard'; scoreLimit: number } }) => {
        this.lastStartData = data
        this.onStart && this.onStart(data)
      })
      this.socket.on('relay:player_left', (data: { id: string }) => this.onPlayerLeft && this.onPlayerLeft(data))
      this.socket.on('relay:created', (data: { roomId: string; config: { difficulty: 'easy'|'medium'|'hard'; scoreLimit: number } }) => this.onCreated && this.onCreated(data))
      this.socket.on('relay:join_error', (data: { message: string }) => {
        if (data.message === 'Room not found') {
          data.message = `${t('game.onlineGame.roomNotFound')}`
        } else if (data.message === 'Room full') {
          data.message = `${t('game.onlineGame.roomFull')}`
        } else {
          data.message = "Need translation in WebSocketTransport.ts";
        }
        this.onJoinError && this.onJoinError(data)
      })
      this.socket.on('relay:pong', (data: { clientTs: number; serverTs: number }) => {
        const now = Date.now()
        const rtt = now - data.clientTs
        const offset = data.serverTs - (data.clientTs + rtt / 2)
        this.onLatency && this.onLatency({ rtt, offset })
      })

      this.socket.on('disconnect', () => this.onDisconnect && this.onDisconnect())
    
      this.socket.on('game:start', (data: { players: Array<{ name: string; index: PlayerIndex }> }) => this.onGameStart && this.onGameStart(data))
      this.socket.on('game:state', (state: any) => this.onGameState && this.onGameState(state))
      this.socket.on('game:paused', (data: { isPaused: boolean; pausedByIndex: PlayerIndex | null }) => this.onPausedChanged && this.onPausedChanged(data))
      this.socket.on('game:player_left', (data: { name?: string }) => this.onPlayerLeft && this.onPlayerLeft({ id: '' }))
      this.socket.on('game:end', (data: { scores: [number, number] }) => this.onGameEnd && this.onGameEnd(data))
      this.socket.on('game:score', (data: { scores: [number, number] }) => this.onGameScore && this.onGameScore(data))

      const pingInterval = setInterval(() => {
        try { this.ping() } catch {}
      }, 2000)

      this.socket.on('disconnect', () => clearInterval(pingInterval))
    })
  }

  disconnect(): void {
    this.socket?.disconnect()
    this.socket = null
    this.id = null
  }

  getId(): string | null {
    return this.id
  }

  getLastStart(): { roomId: string; startTime: number; config?: { difficulty: 'easy'|'medium'|'hard'; scoreLimit: number } } | null { return this.lastStartData }

  joinRandom1v1(): void {
  console.warn('[transport] joinRandom1v1 is deprecated')
  }

  leaveQueue(): void {
    this.socket?.emit('relay:leave_queue')
  }

  createMatch(config: { difficulty: 'easy'|'medium'|'hard'; scoreLimit: number }): void {
    this.socket?.emit('relay:create_match', config)
  }

  joinMatch(roomId: string): void {
    this.socket?.emit('relay:join_match', { roomId })
  }

  ping(): void {
    this.socket?.emit('relay:ping', Date.now())
  }

  sendAuthoritativeInput(dir: Direction): void {
    this.socket?.emit('player:input', { direction: dir })
  }

  resetAuthoritativeGame(gameId: string): void {
    this.socket?.emit('game:reset', { gameId })
  }

  pauseGame(): void {
    this.socket?.emit('game:pause')
  }

  resumeGame(): void {
    this.socket?.emit('game:resume')
  }
}