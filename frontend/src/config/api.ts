import { API_BASE_URL } from "./url";

export const API_CONFIG = {
   
  BASE_URL: "/api",
  ENDPOINTS: {
     
    REGISTER: "/register",
    LOGIN: "/login",
    LOGOUT: "/logout",
    VERIFY_2FA: "/verify-2fa",
    VERIFY_REGISTER: "/verify-register",

     
    ME: "/me",
    TOGGLE_2FA: "/2fa/toggle",
    UPDATE_DISPLAY_NAME: "/update-display-name",
    UPDATE_PASSWORD: "/update-password",
    DELETE_ACCOUNT: "/delete-account",

     
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",

     
    RESEND_2FA: "/resend-2fa",
    RESEND_VERIFICATION: "/resend-verification",

     
    MATCH_HISTORY: "/profile/history",
    PROFILE_STATS: "/profile/stats",

     
    SEARCH_USERS: "/users/search",
    PUBLIC_PROFILE: "/users",  

     
    FRIEND_REQUEST: "/friends/request",
    FRIEND_ACCEPT: "/friends/accept",
    FRIEND_REMOVE: "/friends/remove",
    FRIENDS_LIST: "/friends/list",
    FRIENDS_PENDINGS: "/friends/pendings",

   
  AVATAR_GET: "/profile/avatar",
  AVATAR_UPDATE: "/profile/update-avatar",

     
    HEALTH: "/health",
  },

  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
}

export const AUTH_CONFIG = {
  USE_JWT: true,
  USE_COOKIES: true,
  TOKEN_STORAGE_KEY: "auth_token",
  USER_STORAGE_KEY: "user_data",
  CSRF_HEADER: "x-csrf-token",
}

 
export const OAUTH_START = {
  GOOGLE: `${API_CONFIG.BASE_URL}/auth/google/start`,
}
