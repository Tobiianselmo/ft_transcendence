 
import { authManager } from "../auth"
import { t } from '../languages/translation'

export function hideAllOpenForms(): void {
  const usernameDisplay = document.getElementById("username-display")
  const usernameEditForm = document.getElementById("username-edit-form")
  const usernameInput = document.getElementById("username-input") as HTMLInputElement

  if (usernameDisplay && usernameEditForm && usernameInput) {
    if (usernameEditForm.style.display !== "none") {
      usernameEditForm.style.display = "none"
      usernameDisplay.style.display = "block"

      const currentUser = authManager.getCurrentUser()
      if (currentUser) {
        usernameInput.value = currentUser.display_name
      }
      usernameInput.classList.remove("valid", "invalid")
    }
  }

  const changePasswordBtn = document.getElementById("change-password-btn")
  const passwordForm = document.getElementById("password-change-form")
  const passwordInputs = passwordForm?.querySelectorAll(".password-input") as NodeListOf<HTMLInputElement>

  if (changePasswordBtn && passwordForm) {
    if (passwordForm.style.display !== "none") {
      passwordForm.style.display = "none"
      changePasswordBtn.style.display = "flex"

      if (passwordInputs) {
        passwordInputs.forEach((input) => {
          input.value = ""
          input.classList.remove("valid", "invalid")
        })
      }
    }
  }

  const toggle2FABtn = document.getElementById("toggle-2fa-btn")
  const twoFAForm = document.getElementById("twofa-form")

  if (toggle2FABtn && twoFAForm) {
    if (twoFAForm.style.display !== "none") {
      twoFAForm.style.display = "none"
      toggle2FABtn.style.display = "flex"
    }
  }

  const deleteAccountBtn = document.getElementById("delete-account-btn")
  const deleteAccountForm = document.getElementById("delete-account-form")

  if (deleteAccountBtn && deleteAccountForm) {
    if (deleteAccountForm.style.display !== "none") {
      deleteAccountForm.style.display = "none"
      deleteAccountBtn.style.display = "flex"
    }
  }
}

export function updateTwoFAUI(enabled: boolean): void {
  const twoFAStatus = document.getElementById("twofa-status")
  if (twoFAStatus) {
    twoFAStatus.textContent = enabled ? `${'profile.accountSettings.twoAuthentication.enable'}` : `${'profile.accountSettings.twoAuthentication.disable'}`
  }

  const currentStatus = document.getElementById("twofa-current-status")
  if (currentStatus) {
    currentStatus.textContent = enabled ? `${t('profile.accountSettings.twoAuthentication.enable')}` : `${t('profile.accountSettings.twoAuthentication.disable')}`
    currentStatus.className = `status-value ${enabled ? "enabled" : "disabled"}`
  }

  const description = document.querySelector(".twofa-description p")
  if (description) {
    description.innerHTML = enabled
      ? `${t('profile.accountSettings.twoAuthentication.currently')} <strong>${t('profile.accountSettings.twoAuthentication.enabled')}</strong>. ${t('profile.accountSettings.twoAuthentication.enableAccount')}`
                                : `${t('profile.accountSettings.twoAuthentication.currently')} <strong>${t('profile.accountSettings.twoAuthentication.disabled')}</strong>. ${t('profile.accountSettings.twoAuthentication.disableAccount')}`
  }

  const confirmBtn = document.getElementById("confirm-toggle-2fa-btn")
  if (confirmBtn) {
    confirmBtn.textContent = enabled ? `🔓 ${t('profile.accountSettings.twoAuthentication.enable')} 2FA` : `🔒 ${t('profile.accountSettings.twoAuthentication.disable')} 2FA`
    confirmBtn.className = `toggle-2fa-btn ${enabled ? "disable" : "enable"}`
  }
}

export function getCsrfToken(): string | null {
  const cookies = document.cookie.split(";")
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=")
    if (name === "csrf_token") {
      return value
    }
  }
  return null
}
