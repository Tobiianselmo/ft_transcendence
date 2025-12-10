import { authManager } from "../auth"
import { t } from "../languages/translation"

export default function GoogleCallback(): string {
  return `
    <div class="auth-container">
      <div class="auth-card">
        <h2>${t('google.title')}</h2>
        <div class="loading-spinner"></div>
        <p id="callback-status">${t('google.subtitle')}</p>
      </div>
    </div>
  `
}

export async function handleGoogleCallback(): Promise<void> {
  const urlParams = new URLSearchParams(window.location.search)
  const code = urlParams.get("code")
  const error = urlParams.get("error")
  const statusElement = document.getElementById("callback-status")

   
   
   

  if (error) {
    console.error("Google OAuth error:", error)
    if (statusElement) {
      statusElement.textContent = `${t('google.loginFailed')}`
      statusElement.style.color = "red"
    }
    setTimeout(() => {
      window.location.href = "/login"
    }, 2000)
    return
  }

  try {
    if (statusElement) {
      statusElement.textContent = `${t('google.verifying')}`
    }

     
     
    await new Promise((resolve) => setTimeout(resolve, 1000))

     
    const params = new URLSearchParams(window.location.search)
    const twofa = params.get("twofa")
    const emailParam = params.get("email")

    if (twofa) {
      console.log("Google OAuth: 2FA required for", emailParam)
       
      try {
        const { authManager } = await import("../auth")
        if (emailParam) authManager.setPending2FA(emailParam)
      } catch (err) {
        console.warn("Could not set pending 2FA on authManager:", err)
      }

      if (statusElement) {
        statusElement.textContent = `${t('google.requiring2FA')}`
        statusElement.style.color = "orange"
      }

      setTimeout(() => {
        history.pushState(null, "", "/2fa")
        window.dispatchEvent(new PopStateEvent("popstate"))
      }, 500)
      return
    }

    const isAuthenticated = await authManager.verifyAuth()

    if (isAuthenticated) {
      console.log("Google login successful")
      if (statusElement) {
        statusElement.textContent = `${t('google.loginSuccess')}`
        statusElement.style.color = "green"
      }

      setTimeout(() => {
        window.location.href = "/"
      }, 1000)
    } else {
      throw new Error("Authentication verification failed")
    }
  } catch (error) {
    console.error("Error during Google callback:", error)
    if (statusElement) {
      statusElement.textContent = `${t('google.failedAuth')}`
      statusElement.style.color = "red"
    }
    setTimeout(() => {
      window.location.href = "/login"
    }, 3000)
  }
}
