 

import { Socket } from 'socket.io';
import { GameModel, PlayerInput } from './game';
import { runQuery, getQuery } from "../db/utils";
import type { User } from "../types/types";

interface Player {
  id: string;
  socket: Socket;
  name: string;
  index: 0 | 1;
}

interface GameSession {
  id: string;
  game: GameModel;
  players: Player[];
  isLocalGame: boolean;
  interval: ReturnType<typeof setInterval> | null;
  opts?: { difficulty?: 'easy'|'medium'|'hard'; scoreLimit?: number };
  hasEnded?: boolean;
}

export class GameManager {
  private games: Map<string, GameSession> = new Map();
  
  constructor(private io: any) {}
  
   
  createGame(isLocalGame: boolean = false, opts?: { difficulty?: 'easy'|'medium'|'hard'; scoreLimit?: number }): string {
    const gameId = Math.random().toString(36).substring(2, 15);
    const game = new GameModel({ difficulty: opts?.difficulty, scoreLimit: opts?.scoreLimit, width: 800, height: 400 });
    
    this.games.set(gameId, {
      id: gameId,
      game,
      players: [],
      isLocalGame,
      interval: null,
      opts,
      hasEnded: false,
    });
    
    return gameId;
  }
  
   
  joinGame(gameId: string, socket: Socket, playerName: string): boolean {
    const session = this.games.get(gameId);
    if (!session) return false;
    
    if (session.players.length >= 2) return false;
    
    const playerIndex = session.players.length as 0 | 1;
    
    session.players.push({
      id: socket.id,
      socket,
      name: playerName,
      index: playerIndex
    });
    
     
    this.setupPlayerSocket(socket, gameId, playerIndex);
    
     
    if (session.isLocalGame) {
      this.startGame(gameId);
    } 
     
    else if (session.players.length === 2) {
      this.startGame(gameId);
    }
    
    return true;
  }
  
   
  private setupPlayerSocket(socket: Socket, gameId: string, playerIndex: 0 | 1) {
    socket.join(gameId);
    
    socket.on('player:input', (input: PlayerInput) => {
      const session = this.games.get(gameId);
      if (!session) return;
      
      session.game.handleInput(playerIndex, input);
      
       
      if (session.isLocalGame && playerIndex === 0) {
        socket.on('player2:input', (input: PlayerInput) => {
          session.game.handleInput(1, input);
        });
      }
    });

     
    socket.on('game:pause', () => {
      const session = this.games.get(gameId);
      if (!session) return;
      session.game.pause(playerIndex);
       
  const st = session.game.getState();
  this.io.to(gameId).emit('game:state', st);
  this.io.to(gameId).emit('game:paused', { isPaused: st.isPaused, pausedByIndex: st.pausedByIndex });
    });

    socket.on('game:resume', () => {
      const session = this.games.get(gameId);
      if (!session) return;
      session.game.resume(playerIndex);
       
  const st = session.game.getState();
  this.io.to(gameId).emit('game:state', st);
  this.io.to(gameId).emit('game:paused', { isPaused: st.isPaused, pausedByIndex: st.pausedByIndex });
    });
    
    socket.on('disconnect', () => {
      this.handlePlayerDisconnect(gameId, socket.id);
    });
  }
  
   
  private startGame(gameId: string) {
    const session = this.games.get(gameId);
    if (!session) return;
    
    session.game.start();
    
     
    session.interval = setInterval(() => {
      const state = session.game.getState();
      this.io.to(gameId).emit('game:state', state);
      this.io.to(gameId).emit('game:score', { scores: state.scores });
      if (state.gameEnded) {
        this.io.to(gameId).emit('game:end', { scores: state.scores });
        this.endGame(gameId);
      }
    }, 1000 / 30);
    
     
    this.io.to(gameId).emit('game:start', {
      players: session.players.map(p => ({ name: p.name, index: p.index }))
    });
  }
  
   
  private handlePlayerDisconnect(gameId: string, playerId: string) {
    const session = this.games.get(gameId);
    if (!session) return;
    
     
    if (session.isLocalGame) {
      this.endGame(gameId);
      return;
    }
    
     
    const playerIndex = session.players.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {

      const winnerIndex = playerIndex === 0 ? 1 : 0;
      const state = session.game.getState();
      session.hasEnded = true;
      state.scores[winnerIndex] = 3;
      state.scores[playerIndex] = 0;
      state.gameEnded = true;

      this.io.to(gameId).emit('game:player_left', {
        name: session.players[playerIndex].name
      });
      this.endGame(gameId);
    }
  }
  
   
  private endGame(gameId: string) {
    const session = this.games.get(gameId);
    if (!session) return;

    if (session.hasEnded) {
      return;
    }
    session.hasEnded = true;
    
    if (session.interval) {
      clearInterval(session.interval);
      session.interval = null;
    }
    
    session.game.stop();
    
    const finalScores = session.game.getState().scores as [number, number];
    this.io.to(gameId).emit('game:end', {
      scores: finalScores
    });

    const p0 = session.players[0]?.name;
    const p1 = session.players[1]?.name;
    (async () => {
      try {
        if (!p0 || !p1) return;
        const u1 = await getQuery<User>("SELECT * FROM users WHERE display_name = ?", [p0]);
        const u2 = await getQuery<User>("SELECT * FROM users WHERE display_name = ?", [p1]);
        if (!u1 || !u2) return;
         
        const recent = await getQuery<{ match_id: number }>(
          `SELECT m.match_id
           FROM matches m
           JOIN match_players mp1 ON mp1.match_id = m.match_id AND mp1.user_id = ? AND mp1.score = ?
           JOIN match_players mp2 ON mp2.match_id = m.match_id AND mp2.user_id = ? AND mp2.score = ?
           WHERE m.played_at >= datetime('now', '-1 minutes')
           LIMIT 1`,
          [u1.user_id, finalScores[0], u2.user_id, finalScores[1]]
        );
        if (recent && recent.match_id) return;

        const matchId = await runQuery("INSERT INTO matches DEFAULT VALUES", []);
        const [s0, s1] = finalScores;
        const r0 = s0 > s1 ? 'win' : 'loss';
        const r1 = s0 > s1 ? 'loss' : 'win';
        await runQuery(
          "INSERT INTO match_players (match_id, user_id, score, result) VALUES (?, ?, ?, ?)",
          [matchId, u1.user_id, s0, r0]
        );
        await runQuery(
          "INSERT INTO match_players (match_id, user_id, score, result) VALUES (?, ?, ?, ?)",
          [matchId, u2.user_id, s1, r1]
        );
      } catch (e) {
        console.error('[GameManager] Error saving match result:', e);
      }
    })();
    
     
    setTimeout(() => {
      this.games.delete(gameId);
    }, 5000);
  }

   
  resetGame(gameId: string): boolean {
    const session = this.games.get(gameId);
    if (!session) return false;
    const state = session.game.getState();
    if (!state.gameEnded) return false;
    if (session.interval) {
      clearInterval(session.interval);
      session.interval = null;
    }
     
    session.game = new GameModel({ difficulty: session.opts?.difficulty, scoreLimit: session.opts?.scoreLimit, width: 800, height: 400 });
    this.startGame(gameId);
    this.io.to(gameId).emit('game:start', { players: session.players.map(p => ({ name: p.name, index: p.index })) });
    return true;
  }
}