 

export interface GameState {
  ball: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
  };
  paddles: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  scores: [number, number];
  canvasWidth: number;
  canvasHeight: number;
  isCountingDown: boolean;
  countdownNumber: number;
  gameEnded: boolean;
  isPaused: boolean;
  pausedByIndex: 0 | 1 | null;
}

export interface PlayerInput {
  direction: 'up' | 'down' | 'none';
}

type Difficulty = 'easy'|'medium'|'hard';

export class GameModel {
  private state: GameState;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private readonly updateInterval = 1000 / 60;  
  private initialBallSpeed = 6;
  private paddleSpeed = 6;
  private scoreLimit = 3;
   
  private ballSpeedIncrement = 0.3;
  private playerDirs: ('up'|'down'|'none')[] = ['none','none'];
  private countdownStartMs: number = 0;
  private countdownFrom: number = 3;
  
  constructor(opts?: { width?: number; height?: number; difficulty?: Difficulty; scoreLimit?: number }) {
    const width = opts?.width ?? 800;
    const height = opts?.height ?? 400;
    const diff = opts?.difficulty ?? 'medium';
    this.applyDifficulty(diff);
    this.scoreLimit = Math.max(1, Math.min(21, opts?.scoreLimit ?? 3));
     
    this.state = {
      ball: {
        x: width / 2,
        y: height / 2,
        vx: (Math.random() > 0.5 ? 1 : -1) * this.initialBallSpeed,
        vy: (Math.random() * 2 - 1) * (this.initialBallSpeed / 2),
        size: 10
      },
      paddles: [
        { x: 10, y: height / 2 - 40, width: 10, height: 80 },
        { x: width - 20, y: height / 2 - 40, width: 10, height: 80 }
      ],
      scores: [0, 0],
      canvasWidth: width,
      canvasHeight: height,
      isCountingDown: true,
      countdownNumber: this.countdownFrom,
      gameEnded: false,
  isPaused: false,
  pausedByIndex: null,
    };
    this.countdownStartMs = Date.now();
  }

   
  start() {
    if (this.intervalId) return;
    
    this.intervalId = setInterval(() => {
      this.update();
    }, this.updateInterval);
  }

   
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

   
  private update() {
   
  if (this.state.isPaused) return;

   
  if (this.state.isCountingDown) {
      const elapsed = Math.floor((Date.now() - this.countdownStartMs) / 1000);
      const remaining = this.countdownFrom - elapsed;
      this.state.countdownNumber = Math.max(0, remaining);
      if (remaining <= 0) {
        this.state.isCountingDown = false;
      }
       
      return;
    }
     
    this.state.ball.x += this.state.ball.vx;
    this.state.ball.y += this.state.ball.vy;
    
     
    const r = this.state.ball.size;
    if (this.state.ball.y - r <= 0) {
      this.state.ball.y = r;
      this.state.ball.vy = -this.state.ball.vy;
    } else if (this.state.ball.y + r >= this.state.canvasHeight) {
      this.state.ball.y = this.state.canvasHeight - r;
      this.state.ball.vy = -this.state.ball.vy;
    }
    
     
    this.state.paddles.forEach((paddle, i) => {
      const dir = this.playerDirs[i];
      if (dir === 'up') paddle.y = Math.max(0, paddle.y - this.paddleSpeed);
      else if (dir === 'down') paddle.y = Math.min(this.state.canvasHeight - paddle.height, paddle.y + this.paddleSpeed);
    });

     
    const left = this.state.paddles[0];
    const right = this.state.paddles[1];
     
    if (
      this.state.ball.vx < 0 &&
      this.state.ball.x - r <= left.x + left.width &&
      this.state.ball.y + r >= left.y &&
      this.state.ball.y - r <= left.y + left.height
    ) {
       
      this.state.ball.x = left.x + left.width + r;
       
      this.state.ball.vx = -this.state.ball.vx;
       
      const hitPos = (this.state.ball.y - (left.y + left.height / 2)) / (left.height / 2);
      this.state.ball.vy = hitPos * 5;
       
      this.state.ball.vx += this.state.ball.vx > 0 ? this.ballSpeedIncrement : -this.ballSpeedIncrement;
    }
     
    else if (
      this.state.ball.vx > 0 &&
      this.state.ball.x + r >= right.x &&
      this.state.ball.y + r >= right.y &&
      this.state.ball.y - r <= right.y + right.height
    ) {
      this.state.ball.x = right.x - r;
      this.state.ball.vx = -this.state.ball.vx;
      const hitPos = (this.state.ball.y - (right.y + right.height / 2)) / (right.height / 2);
      this.state.ball.vy = hitPos * 5;
      this.state.ball.vx += this.state.ball.vx > 0 ? this.ballSpeedIncrement : -this.ballSpeedIncrement;
    }
    
     
    if (this.state.ball.x + this.state.ball.size < 0) {
       
      this.state.scores[1]++;
      this.resetBall(-1);
    } else if (this.state.ball.x > this.state.canvasWidth) {
       
      this.state.scores[0]++;
      this.resetBall(1);
    }

     
    if (this.state.scores[0] >= this.scoreLimit || this.state.scores[1] >= this.scoreLimit) {
      this.state.gameEnded = true;
    }
  }
  
   
  private resetBall(direction: -1 | 1) {
    this.state.ball = {
      x: this.state.canvasWidth / 2,
      y: this.state.canvasHeight / 2,
      vx: direction * this.initialBallSpeed,
      vy: (Math.random() * 2 - 1) * (this.initialBallSpeed / 2),
      size: this.state.ball.size
    };
     
    this.state.isCountingDown = true;
    this.state.countdownNumber = this.countdownFrom;
    this.countdownStartMs = Date.now();
  }
  
   
  handleInput(playerIndex: 0 | 1, input: PlayerInput) {
    this.playerDirs[playerIndex] = input.direction;
  }
  
   
  getState(): GameState {
    return { ...this.state };
  }

  private applyDifficulty(d: Difficulty) {
    if (d === 'easy') {
  this.initialBallSpeed = 3; this.paddleSpeed = 6; this.ballSpeedIncrement = 0.2;
    } else if (d === 'hard') {
  this.initialBallSpeed = 7; this.paddleSpeed = 7; this.ballSpeedIncrement = 0.5;
    } else {
  this.initialBallSpeed = 5; this.paddleSpeed = 6; this.ballSpeedIncrement = 0.3;
    }
  }

   
  pause(by: 0 | 1) {
    if (this.state.gameEnded) return;
  if (this.state.isCountingDown) return;  
    if (this.state.isPaused) return;
    this.state.isPaused = true;
    this.state.pausedByIndex = by;
  }

  resume(by: 0 | 1) {
    if (!this.state.isPaused) return;
    if (this.state.pausedByIndex !== by) return;  
    this.state.isPaused = false;
    this.state.pausedByIndex = null;
     
    this.state.isCountingDown = true;
    this.state.countdownNumber = this.countdownFrom;
    this.countdownStartMs = Date.now();
  }
}