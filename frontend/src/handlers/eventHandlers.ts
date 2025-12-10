 
import { EventManager } from "../managers/EventManager"
import { API_CONFIG } from "../config/api"

export function setupEventListeners(): void {
  EventManager.setupEventListeners()

   
  document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement

     
    const googleButton = target.closest("#google-login-btn") || (target.id === "google-login-btn" ? target : null)

    if (googleButton) {
      e.preventDefault()
      e.stopPropagation()

       

      const startUrl = `${API_CONFIG.BASE_URL}/auth/google/start`
       
      window.location.href = startUrl
    }
  })
}
