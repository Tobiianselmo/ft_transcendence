 
import { authService } from "./services/authService"
import { AUTH_CONFIG } from "./config/api"
import type { UserData } from "./types/shared"
import { API_BASE_URL } from "./config/url"
import { initializeSocket, getSocket, disconnectSocket } from "./socket"
import { chatState } from "./pages/Home"

class AuthManager {
  private user: UserData | null = null
  private listeners: (() => void)[] = []
  private pending2FA: string | null = null
  private pending2FAPassword: string | null = null
  private pendingVerification: string | null = null
  private hasVerifiedWithBackend = false  
  private isInitialized = false  

  constructor() {
     
     
    this.loadFromStorage()
  }

   
  private loadFromStorage(): void {
    try {
      const userData = localStorage.getItem(AUTH_CONFIG.USER_STORAGE_KEY)
      if (userData) {
        this.user = JSON.parse(userData)
         
         
      }
    } catch (error) {
       
      this.clearStorage()
    }
  }

   
  async initialize(): Promise<void> {
    if (this.isInitialized) {
       
      return
    }

    this.isInitialized = true
     
  }

   
  isAuthenticated(): boolean {
    const result = this.user !== null && this.hasVerifiedWithBackend
     
    return result
  }

   
  hasLocalData(): boolean {
    const result = this.user !== null
     
    return result
  }

  getCurrentUser(): UserData | null {
    return this.user
  }

  isPending2FA(): boolean {
    return this.pending2FA !== null
  }

  getPending2FAEmail(): string | null {
    return this.pending2FA
  }

   
   
  setPending2FA(email: string | null): void {
    if (email) {
      this.pending2FA = email
       
      this.notifyListeners()
    } else {
      this.pending2FA = null
      this.notifyListeners()
    }
  }

  isPendingVerification(): boolean {
    return this.pendingVerification !== null
  }

  getPendingVerificationEmail(): string | null {
    return this.pendingVerification
  }

   
  clearCookies(): void {
     
     

    const cookiesToClear = ["session_id", "csrf_token", "token"]

    cookiesToClear.forEach((cookieName) => {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.localhost;`
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=127.0.0.1;`
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;`
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${API_BASE_URL};`
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=/api`
    })

     
  }

  async login(email: string, password: string): Promise<{ requires2FA: boolean }> {
    try {
       

      const response = await authService.login({ email, password })
      if (response.token) {
        localStorage.setItem("token", response.token);

        const socket = initializeSocket();
        if (!socket) {
          console.error("❌ No se pudo inicializar el socket después del login");
        }
      } else {
        console.error(" ❌ No se recibió token en la respuesta de login");
      }
      
      if (response.twofa_required) {
        this.pending2FA = email
        this.pending2FAPassword = password
         
        return { requires2FA: true }
      } else {
        
        await this.fetchUserData()
        this.hasVerifiedWithBackend = true 
        this.pending2FA = null
        this.pending2FAPassword = null
        this.notifyListeners()
         
        return { requires2FA: false }
      }
    } catch (error: any) {
       

       
      if (error.message === "User not verified" && error.email) {
        this.pendingVerification = error.email
        throw { message: "User not verified", needsVerification: true, email: error.email }
      }

      throw error
    }
  }

  async verify2FA(code: string): Promise<void> {
    if (!this.pending2FA) {
      throw new Error("No hay verificación 2FA pendiente")
    }

    try {
       

      const verifyResponse = await authService.verify2FA({
        email: this.pending2FA,
        code: code,
      })

      
      if (this.pending2FAPassword) {
         
        const loginResponse = await authService.login({
          email: this.pending2FA,
          password: this.pending2FAPassword,
        })
        if (loginResponse.token) {
          localStorage.setItem("token", loginResponse.token)
          const socket = initializeSocket();
          if (!socket) {
            console.error("❌ No se pudo inicializar el socket después del login");
          }
        }

        await this.fetchUserData()
        this.hasVerifiedWithBackend = true
        this.pending2FA = null
        this.pending2FAPassword = null
        this.notifyListeners()

      } else {

         
        if (verifyResponse && (verifyResponse as any).token) {
          localStorage.setItem("token", (verifyResponse as any).token)
        }

        await this.fetchUserData()
        this.hasVerifiedWithBackend = true
        this.pending2FA = null
        this.notifyListeners()

        const socket = getSocket()
        if (!socket) {
          const s = initializeSocket()
          if (!s) console.error("❌ No se pudo inicializar socket después de 2FA (OAuth)")
        }
      }
    } catch (error) {
       
      throw error
    }
  }

  async verifyRegistration(email: string, code: string): Promise<void> {
    try {
       

      await authService.verifyRegister({ email, code })

      this.pendingVerification = null
       
    } catch (error) {
       
      throw error
    }
  }

  setPendingVerification(email: string | null): void {
    if (email) {
      this.pendingVerification = email
       
      this.notifyListeners()
    } else {
      this.pendingVerification = null
      this.notifyListeners()
    }
  }

  async signup(username: string, email: string, password: string): Promise<{ needsVerification: boolean }> {
    try {
       

      const response = await authService.signup({
        display_name: username,
        email,
        password,
      })

       

      if (response.redirect === "/verify-register") {
        this.pendingVerification = email
        return { needsVerification: true }
      }

      const loginResult = await this.login(email, password)

      if (loginResult.requires2FA) {
         
        return { needsVerification: false }
      } else {
         
        return { needsVerification: false }
      }
    } catch (error) {
       
      throw error
    }
  }

  async updateDisplayName(newDisplayName: string): Promise<void> {
    try {
       

      const response = await authService.updateDisplayName({
        display_name: newDisplayName,
      })

       
      if (this.user) {
        this.user.display_name = response.display_name
        this.saveToStorage()
        this.notifyListeners()
      }

       
    } catch (error) {
       
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
       

      try {
         
        await authService.logout()
         
      } catch (error) {
        console.warn("⚠️ Error en logout del backend:", error)
      }
      
      const socket = getSocket()
      if (socket) {
        socket.emit("userStatusChanged", { userId: chatState.user?.user_id, isOnline: false });
      }

      this.clearAuth()
      this.clearCookies()

      history.replaceState(null, "", "/")
      window.dispatchEvent(new PopStateEvent("popstate"))

       
    } catch (error) {
       
      this.clearAuth()
      this.clearCookies()
    }
  }
  
  async verifyAuth(): Promise<boolean> {
    try {
       

      const response = await authService.getMe()

      this.user = {
        user_id: response.user.user_id,
        display_name: response.user.display_name,
        email: response.user.email, 
        twofa_enabled: response.user.twofa_enabled,
      }

      this.hasVerifiedWithBackend = true
      this.saveToStorage()
      this.notifyListeners()
       
      return true
    } catch (error: any) {
      const isUnauthorized = error?.status === 401 || 
                            error?.message?.includes("401") || 
                            error?.message?.toLowerCase().includes("unauthorized")
      
      if (isUnauthorized) {
         
        this.clearAuth()
      } else {
         
      }

      return false
    }
  }

  async toggle2FA(): Promise<boolean> {
    try {
       

      const response = await authService.toggle2FA()

      if (this.user) {
        this.user.twofa_enabled = response.twofa_enabled
        this.saveToStorage()
        this.notifyListeners()  
      }

       
      return response.twofa_enabled
    } catch (error) {
       
      throw error
    }
  }

  async checkBackendHealth(): Promise<boolean> {
    try {
      await authService.healthCheck()
      return true
    } catch (error) {
       
      return false
    }
  }

   
  private async fetchUserData(): Promise<void> {
    try {
      const response = await authService.getMe()
      this.user = {
        user_id: response.user.user_id,
        display_name: response.user.display_name,
        email: response.user.email,  
        twofa_enabled: response.user.twofa_enabled,  
      }
      this.saveToStorage()
       
    } catch (error) {
       
      throw error
    }
  }

  onAuthChange(callback: () => void): void {
    this.listeners.push(callback)
  }

  private saveToStorage(): void {
    if (this.user) {
      localStorage.setItem(AUTH_CONFIG.USER_STORAGE_KEY, JSON.stringify(this.user))
       
    }
  }

  private clearStorage(): void {
    localStorage.removeItem(AUTH_CONFIG.USER_STORAGE_KEY)
     
  }

  clearAuth(): void {
     
    disconnectSocket()
    this.user = null
    this.hasVerifiedWithBackend = false  
    this.pending2FA = null
    this.pending2FAPassword = null
    this.pendingVerification = null
    this.clearStorage()
    this.notifyListeners()
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback())
  }
}

export const authManager = new AuthManager()
export type { UserData }
