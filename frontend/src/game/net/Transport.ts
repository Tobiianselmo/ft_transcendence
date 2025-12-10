 

export type Direction = 'up' | 'down' | 'none'

export type PlayerIndex = 0 | 1

export interface RelayReadyPayload {
  roomId: string
  players: Array<{ id: string; name: string; index: PlayerIndex }>
}

export interface TransportEvents {
  onWaiting?: () => void
  onReady?: (payload: RelayReadyPayload) => void
  onStart?: (data: { roomId: string; startTime: number; config?: { difficulty: 'easy'|'medium'|'hard'; scoreLimit: number } }) => void
  onPlayerLeft?: (data: { id: string }) => void
  onDisconnect?: () => void
  onLatency?: (data: { rtt: number; offset: number }) => void
   
  onGameStart?: (data: { players: Array<{ name: string; index: PlayerIndex }> }) => void
  onGameState?: (state: any) => void
  onGameEnd?: (data: { scores: [number, number] }) => void
  onGameScore?: (data: { scores: [number, number] }) => void
  onPausedChanged?: (data: { isPaused: boolean; pausedByIndex: PlayerIndex | null }) => void
}

export interface Transport extends TransportEvents {
  connect(): Promise<void>
  disconnect(): void
  getId(): string | null
  joinRandom1v1(): void
  leaveQueue(): void
  createMatch(config: { difficulty: 'easy'|'medium'|'hard'; scoreLimit: number }): void
  joinMatch(roomId: string): void
  ping(): void
   
  sendAuthoritativeInput(dir: Direction): void
  resetAuthoritativeGame(gameId: string): void
  pauseGame(): void
  resumeGame(): void
}