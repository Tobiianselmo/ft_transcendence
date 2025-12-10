 

import { API_CONFIG } from "../config/api"
import { httpClient } from "./httpClient"
import { BaseService } from "./BaseService"
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  LogoutResponse,
  MeResponse,
  Verify2FARequest,
  Verify2FAResponse,
  Toggle2FAResponse,
  UpdateDisplayNameRequest,
  UpdateDisplayNameResponse,
  MatchHistory,
  ProfileStats,
  SearchUsersResponse,
  PublicProfileResponse,
  FriendsList,
  PendingRequestsList,
  FriendRequestData,
  FriendActionResponse,
} from "../types/shared"

 
interface VerifyRegisterRequest {
  email: string
  code: string
}

interface VerifyRegisterResponse {
  message: string
}

interface ResendCodeResponse {
  message: string
}

interface ForgotPasswordRequest {
  email: string
}

interface ForgotPasswordResponse {
  message: string
}

interface ResetPasswordRequest {
  token: string
  password: string
}

interface ResetPasswordResponse {
  message: string
}

interface UpdatePasswordRequest {
  currentPassword: string
  newPassword: string
}

interface UpdatePasswordResponse {
  message: string
}

class AuthService extends BaseService {
  constructor() {
    super(httpClient)
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    return this.dataRequest("Enviando login al backend", API_CONFIG.ENDPOINTS.LOGIN, data, data.email)
  }

  async signup(data: SignupRequest): Promise<SignupResponse> {
    return this.dataRequest("Enviando registro al backend", API_CONFIG.ENDPOINTS.REGISTER, data, data.email)
  }

  async logout(): Promise<LogoutResponse> {
    try {
       
       

      const result = await this.httpClient.postWithoutContentType<LogoutResponse>(API_CONFIG.ENDPOINTS.LOGOUT)
       
      return result
    } catch (error) {
       
      return { message: "Logout successful (local only)" }
    }
  }

  async getMe(): Promise<MeResponse> {
     
     
    return this.httpClient.get<MeResponse>(API_CONFIG.ENDPOINTS.ME)
  }

  async verify2FA(data: Verify2FARequest): Promise<Verify2FAResponse> {
    return this.dataRequest("Verificando código 2FA", API_CONFIG.ENDPOINTS.VERIFY_2FA, data, data.email)
  }

  async verifyRegister(data: VerifyRegisterRequest): Promise<VerifyRegisterResponse> {
    return this.dataRequest("Verificando código de registro", API_CONFIG.ENDPOINTS.VERIFY_REGISTER, data, data.email)
  }

  async toggle2FA(): Promise<Toggle2FAResponse> {
    return this.patchRequest("Cambiando estado 2FA", API_CONFIG.ENDPOINTS.TOGGLE_2FA, {})
  }

  async updateDisplayName(data: UpdateDisplayNameRequest): Promise<UpdateDisplayNameResponse> {
    return this.patchRequest(
      "Actualizando nombre de usuario",
      API_CONFIG.ENDPOINTS.UPDATE_DISPLAY_NAME,
      data,
      data.display_name,
    )
  }

  async updatePassword(data: UpdatePasswordRequest): Promise<UpdatePasswordResponse> {
    return this.patchRequest("Actualizando contraseña", API_CONFIG.ENDPOINTS.UPDATE_PASSWORD, data)
  }

  async deleteAccount(): Promise<{ message: string }> {
    return this.deleteRequest("Eliminando cuenta", API_CONFIG.ENDPOINTS.DELETE_ACCOUNT)
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return this.emailRequest(
      "Enviando solicitud de reset de contraseña",
      API_CONFIG.ENDPOINTS.FORGOT_PASSWORD,
      data.email,
    )
  }

  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return this.dataRequest("Reseteando contraseña con token", API_CONFIG.ENDPOINTS.RESET_PASSWORD, data)
  }

  async resend2FACode(email: string): Promise<ResendCodeResponse> {
    return this.emailRequest("Reenviando código 2FA", API_CONFIG.ENDPOINTS.RESEND_2FA, email)
  }

  async resendVerificationCode(email: string): Promise<ResendCodeResponse> {
    return this.emailRequest("Reenviando código de verificación", API_CONFIG.ENDPOINTS.RESEND_VERIFICATION, email)
  }

  async getMatchHistory(): Promise<MatchHistory> {
    return this.getRequest("Obteniendo historial de partidas", API_CONFIG.ENDPOINTS.MATCH_HISTORY)
  }

  async getProfileStats(): Promise<ProfileStats> {
    return this.getRequest("Obteniendo estadísticas del perfil", API_CONFIG.ENDPOINTS.PROFILE_STATS)
  }

  async searchUsers(query: string): Promise<SearchUsersResponse> {
    try {
       
      const url = `${API_CONFIG.ENDPOINTS.SEARCH_USERS}?query=${encodeURIComponent(query)}`
      const result = await this.httpClient.get<SearchUsersResponse>(url)
       
      return result
    } catch (error) {
       
      throw error
    }
  }

  async getPublicProfile(username: string): Promise<PublicProfileResponse> {
    try {
       
      const url = `${API_CONFIG.ENDPOINTS.PUBLIC_PROFILE}/${encodeURIComponent(username)}/profile`
      const result = await this.httpClient.get<PublicProfileResponse>(url)
       
      return result
    } catch (error) {
       
      throw error
    }
  }

  async sendFriendRequest(requesterName: string, receiverName: string): Promise<FriendActionResponse> {
    try {
       
      const data: FriendRequestData = { requesterName, receiverName }
      const result = await this.httpClient.post<FriendActionResponse>(API_CONFIG.ENDPOINTS.FRIEND_REQUEST, data)
       
      return result
    } catch (error) {
       
      throw error
    }
  }

  async acceptFriendRequest(requesterName: string, receiverName: string): Promise<FriendActionResponse> {
    try {
       
      const data: FriendRequestData = { requesterName, receiverName }
      const result = await this.httpClient.post<FriendActionResponse>(API_CONFIG.ENDPOINTS.FRIEND_ACCEPT, data)
       
      return result
    } catch (error) {
       
      throw error
    }
  }

  async rejectOrRemoveFriend(requesterName: string, receiverName: string): Promise<FriendActionResponse> {
    try {
       
      const data: FriendRequestData = { requesterName, receiverName }
      const result = await this.httpClient.delete<FriendActionResponse>(API_CONFIG.ENDPOINTS.FRIEND_REMOVE, data)
       
      return result
    } catch (error) {
       
      throw error
    }
  }

  async getFriendsList(): Promise<FriendsList> {
    try {
       
      const result = await this.httpClient.get<FriendsList>(API_CONFIG.ENDPOINTS.FRIENDS_LIST)
       
      return result
    } catch (error) {
       
      throw error
    }
  }

  async getPendingRequests(userId?: number, displayName?: string): Promise<PendingRequestsList> {
    try {
      if (userId && displayName) {
         
      } else {
         
      }
      const result = await this.httpClient.get<PendingRequestsList>(API_CONFIG.ENDPOINTS.FRIENDS_PENDINGS)
       
      return result
    } catch (error) {
       
      throw error
    }
  }

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
     
    return this.httpClient.get<{ status: string; timestamp: string }>(API_CONFIG.ENDPOINTS.HEALTH)
  }

  async getUserAvatar(): Promise<{ avatarUrl: string }> {
    return this.getRequest("Obteniendo avatar del usuario", API_CONFIG.ENDPOINTS.AVATAR_GET)
  }

  async uploadAvatar(file: File): Promise<{ message: string; avatarUrl: string }> {
    const formData = new FormData()
    formData.append("avatar", file)
    return this.httpClient.postFormData(API_CONFIG.ENDPOINTS.AVATAR_UPDATE, formData)
  }
}

export const authService = new AuthService()
