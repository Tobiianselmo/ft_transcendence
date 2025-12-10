 

import { FastifyRequest } from 'fastify';

export interface User {
  user_id: number;
  email: string;
  password_hash: string;
  display_name: string;
  avatar: string;
  google_id: string;
  is_verified: boolean;
  verification_code: string;
  verification_expires: number;
  twofa_enabled: boolean;
  twofa_verified: boolean;
  twofa_code: string;
  twofa_expires_at: number;
  reset_token: string;
  reset_token_expires: number;
}

export interface Match {
  match_id: number;
  played_at: string;
  user_id: number;
  score: number;
  result: string;
}

export interface Stats {
  user_id: number;
  games_played: number;
  games_won: number;
  lost_games: number;
}

export interface Opponent {
  display_name: string | null;
  score: number;
  result: string;
}

export interface MatchHistoryResponse {
  match_id: number;
  played_at: string;
  user: { score: number; result: string };
  opponents: Opponent[];
}

export interface Friends {
  user_id: number;
  friend_id: number;
  requester_id: number;
  friend_state: 'pending' | 'accepted' | 'blocked';
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  sent_at: string;
}

export interface RegisterRequestBody {
  email: string;
  password: string;
  display_name: string;
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface VerifyRegisterBody {
  email: string;
  code: string;
}

export interface AuthenticatedRequest extends FastifyRequest {
  user: {
    user_id: number;
    display_name: string;
  };
}