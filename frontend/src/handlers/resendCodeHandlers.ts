 
import { authManager } from "../auth"
import { authService } from "../services/authService"
import { showMessage } from "../utils/ui"
import { t } from "../languages/translation"

 
let resend2FATimeout: number | null = null
let resendVerificationTimeout: number | null = null

export async function handleResend2FACode(button: HTMLElement): Promise<void> {
  if (resend2FATimeout) {
    showMessage(`${t('messages.info.waitCode')}`, "info")
    return
  }

  const email = authManager.getPending2FAEmail()
  if (!email) {
    showMessage(`${t('messages.error.no2FA')}`, "error")
    return
  }

  try {
    button.textContent = `${t('doubleFactor.sending')}`
    button.style.pointerEvents = "none"
    button.style.opacity = "0.6"

    await authService.resend2FACode(email)
    showMessage(`${t('messages.success.newCode')}`, "success")

    let countdown = 60
    button.textContent = `${t('doubleFactor.resendCode')} (${countdown}s)`

    resend2FATimeout = window.setInterval(() => {
      countdown--
      if (countdown > 0) {
        button.textContent = `${t('doubleFactor.resendCode')} (${countdown}s)`
      } else {
        button.textContent = `${t('doubleFactor.resendCode')}`
        button.style.pointerEvents = "auto"
        button.style.opacity = "1"
        clearInterval(resend2FATimeout!)
        resend2FATimeout = null
      }
    }, 1000)
  } catch (error: any) {
    console.error("❌ Error resending 2FA code:", error)
    showMessage(error.message || `${t('messages.error.failedToSend')}`, "error")

    button.textContent = `${t('doubleFactor.resendCode')}`
    button.style.pointerEvents = "auto"
    button.style.opacity = "1"
  }
}

export async function handleResendVerificationCode(button: HTMLElement): Promise<void> {
  if (resendVerificationTimeout) {
    showMessage(`${t('messages.info.waitCode')}`, "info")
    return
  }

  const email = authManager.getPendingVerificationEmail()
  if (!email) {
    showMessage(`${t('messages.error.noVerification')}`, "error")
    return
  }

  try {
    button.textContent = `${t('doubleFactor.sending')}`
    button.style.pointerEvents = "none"
    button.style.opacity = "0.6"

    await authService.resendVerificationCode(email)
    showMessage(`${t('messages.success.newVerificationCode')}`, "success")

    let countdown = 60
    button.textContent = `${t('doubleFactor.resendCode')} (${countdown}s)`

    resendVerificationTimeout = window.setInterval(() => {
      countdown--
      if (countdown > 0) {
        button.textContent = `${t('doubleFactor.resendCode')} (${countdown}s)`
      } else {
        button.textContent = `${t('doubleFactor.resendCode')}`
        button.style.pointerEvents = "auto"
        button.style.opacity = "1"
        clearInterval(resendVerificationTimeout!)
        resendVerificationTimeout = null
      }
    }, 1000)
  } catch (error: any) {
    console.error("❌ Error resending verification code:", error)
    showMessage(error.message || `${t('messages.error.failedToSendVerification')}`, "error")

    button.textContent = `${t('doubleFactor.resendCode')}`
    button.style.pointerEvents = "auto"
    button.style.opacity = "1"
  }
}
