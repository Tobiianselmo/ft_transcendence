 

 
export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  display_name: string
}

export interface Verify2FARequest {
  email: string
  code: string
}

export interface UpdateDisplayNameRequest {
  display_name: string
}

 
export interface LoginResponse {
  message: string
  twofa_required?: boolean
  token?: string
  debug?: any
}

export interface SignupResponse {
  message: string
  redirect?: string
  email?: string
}

export interface LogoutResponse {
  message: string
  debug?: any
}

export interface MeResponse {
  message: string
  user: {
    user_id: number
    display_name: string
    email: string
    twofa_enabled: boolean
  }
  token: string
}

export interface Verify2FAResponse {
  message: string
}

export interface Toggle2FAResponse {
  message: string
  twofa_enabled: boolean
}

export interface UpdateDisplayNameResponse {
  message: string
  display_name: string
}

 
export interface ApiErrorResponse {
  error: string
  redirect?: string
  email?: string
}

 
export interface UserData {
  user_id: number
  display_name: string
  email: string
  twofa_enabled: boolean
}

 
export interface MatchOpponent {
   
  display_name: string | null
  score: number
  result: "win" | "loss" | "draw"
}

export interface Match {
  match_id: number
  played_at: string  
  user: {
    score: number
    result: "win" | "loss" | "draw"
  }
  opponents: MatchOpponent[]
}

export type MatchHistory = Match[]

 
export interface ProfileStats {
  user_id: number
  games_played: number
  games_won: number
  lost_games: number
}

 
export interface SearchUserItem {
  user_id: number
  display_name: string
}

export type SearchUsersResponse = SearchUserItem[]

 
export interface PublicProfileResponse {
  user: {
    user_id: number
    display_name: string
    avatar_url: string
  }
  stats: {
    user_id: number
    games_played: number
    games_won: number
    lost_games: number
  }
  recent_matches: Match[]
  friendship_status?: "none" | "pending_sent" | "pending_received" | "friends"
}

export interface FriendUser {
  display_name: string
  email: string
  user_id: number
}

export type FriendsList = FriendUser[]
export type PendingRequestsList = FriendUser[]

export interface FriendRequestData {
  requesterName: string
  receiverName: string
}

export interface FriendActionResponse {
  message: string
}
