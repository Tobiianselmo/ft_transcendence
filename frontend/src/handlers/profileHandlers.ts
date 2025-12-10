 
import { authManager } from "../auth"
import { authService } from "../services/authService"
import { showMessage } from "../utils/ui"
import { validators } from "../utils/validation"
import { updateTwoFAUI } from "./uiHelpers"
import { formManager } from "../managers/FormManager"
import { t } from '../languages/translation'

 
export function handleEditUsernameClick(): void {
  const usernameDisplay = document.getElementById("username-display")
  const editForm = document.getElementById("username-edit-form")
  const usernameInput = document.getElementById("username-input") as HTMLInputElement

  if (usernameDisplay && editForm && usernameInput) {
    usernameDisplay.style.display = "none"
    editForm.style.display = "flex"
    usernameInput.focus()
    usernameInput.select()

     
    formManager.setupRealtimeValidation([
      {
        inputId: "username-input",
        validator: validators.displayName,
      },
    ])
  }
}

export async function handleSaveUsername(): Promise<void> {
  const usernameInput = document.getElementById("username-input") as HTMLInputElement
  const editBtn = document.getElementById("edit-username-btn")

  if (!usernameInput || !editBtn) return

  const newUsername = usernameInput.value.trim()

   
  const validation = validators.displayName(newUsername)
  if (!validation.isValid) {
    formManager.handleInputError("username-input", validation.error!)
    return
  }

   
  const currentUser = authManager.getCurrentUser()
  if (currentUser && newUsername === currentUser.display_name) {
    handleCancelUsernameEdit()
    return
  }

   
  editBtn.classList.add("loading")

  try {
    await authManager.updateDisplayName(newUsername)

     
    const usernameDisplay = document.getElementById("username-display")
    if (usernameDisplay) {
      usernameDisplay.textContent = newUsername
    }

    handleCancelUsernameEdit()
    showMessage(`${t('profile.messages.usernameUpdated')}`, "success")

     
  } catch (error: any) {
    console.error("❌ Error updating username:", error) 
    formManager.handleInputError("username-input", error.message || `${t('profile.messages.failedUpdate')}`)
  } finally {
    editBtn.classList.remove("loading")
  }
}

export function handleCancelUsernameEdit(): void {
  const usernameDisplay = document.getElementById("username-display")
  const editForm = document.getElementById("username-edit-form")
  const usernameInput = document.getElementById("username-input") as HTMLInputElement

  if (usernameDisplay && editForm && usernameInput) {
    editForm.style.display = "none"
    usernameDisplay.style.display = "block"

    const currentUser = authManager.getCurrentUser()
    if (currentUser) {
      usernameInput.value = currentUser.display_name
    }

    usernameInput.classList.remove("valid", "invalid")
  }
}

export function handleChangePasswordClick(): void {
  const changePasswordBtn = document.getElementById("change-password-btn")
  const passwordForm = document.getElementById("password-change-form")
  const currentPasswordInput = document.getElementById("current-password-input") as HTMLInputElement

  if (changePasswordBtn && passwordForm && currentPasswordInput) {

    changePasswordBtn.style.display = "none"
    passwordForm.style.display = "block"
    currentPasswordInput.focus()

    formManager.setupRealtimeValidation([
      {
        inputId: "current-password-input",
        validator: (value: string) => {
          if (value.length > 0) {
            return { isValid: true }
          }
          return { isValid: false, error: `${t('messages.success.currentPassNeeded')}` }
        },
      },
      {
        inputId: "new-password-input",
        validator: validators.password,
      },
      {
        inputId: "confirm-password-input",
        validator: (value: string) => {
          const newPasswordInput = document.getElementById("new-password-input") as HTMLInputElement
          return validators.confirmPassword(value, newPasswordInput?.value || "")
        },
      },
    ])
  }
}

export async function handleSavePassword(): Promise<void> {
  const currentPasswordInput = document.getElementById("current-password-input") as HTMLInputElement
  const newPasswordInput = document.getElementById("new-password-input") as HTMLInputElement
  const confirmPasswordInput = document.getElementById("confirm-password-input") as HTMLInputElement
  const saveBtn = document.getElementById("save-password-btn")

  if (!currentPasswordInput || !newPasswordInput || !confirmPasswordInput || !saveBtn) return

  const currentPassword = currentPasswordInput.value.trim()
  const newPassword = newPasswordInput.value.trim()
  const confirmPassword = confirmPasswordInput.value.trim()

  if (!currentPassword) {
    currentPasswordInput.classList.add("invalid")
    showMessage(`${t('profile.accountSettings.messages.currentPassNeeded')}`, "error") 
    return
  }

  const newPasswordValidation = validators.password(newPassword)
  if (!newPasswordValidation.isValid) {
    newPasswordInput.classList.add("invalid")
    showMessage(newPasswordValidation.error!, "error")  
    return
  }

  const confirmValidation = validators.confirmPassword(confirmPassword, newPassword)
  if (!confirmValidation.isValid) {
    confirmPasswordInput.classList.add("invalid")
    showMessage(confirmValidation.error!, "error")  
    return
  }

  saveBtn.classList.add("loading")
  if (saveBtn instanceof HTMLButtonElement) {
    saveBtn.disabled = true
  }

  try {
    await authService.updatePassword({
      currentPassword: currentPassword,
      newPassword: newPassword,
    })

    handleCancelPasswordEdit()
    showMessage(`${t('profile.accountSettings.messages.passUpdated')}`, "success")

     
  } catch (error: any) {
    console.error("❌ Error updating password:", error)

    if (error.message.includes("Current password")) {
      currentPasswordInput.classList.add("invalid")
    }

    const errorMessage = error.message || `${t('profile.accountSettings.messages.failedUpdate')}`
    showMessage(errorMessage, "error")  
  } finally {
    saveBtn.classList.remove("loading")
    if (saveBtn instanceof HTMLButtonElement) {
      saveBtn.disabled = false
    }
  }
}

export function handleCancelPasswordEdit(): void {
  const changePasswordBtn = document.getElementById("change-password-btn")
  const passwordForm = document.getElementById("password-change-form")
  const inputs = passwordForm?.querySelectorAll(".password-input") as NodeListOf<HTMLInputElement>

  if (changePasswordBtn && passwordForm) {
    passwordForm.style.display = "none"
    changePasswordBtn.style.display = "flex"
  }

  if (inputs) {
    inputs.forEach((input) => {
      formManager.clearInputState(input.id)
    })
  }
}

export function handleToggle2FAClick(): void {
  formManager.toggleElements(["toggle-2fa-btn"], ["twofa-form"])
}

export async function handleConfirmToggle2FA(): Promise<void> {
  const confirmBtn = document.getElementById("confirm-toggle-2fa-btn")

  if (!confirmBtn) return

  confirmBtn.classList.add("loading")
  if (confirmBtn instanceof HTMLButtonElement) {
    confirmBtn.disabled = true
  }

  try {
    const newStatus = await authManager.toggle2FA()

    updateTwoFAUI(newStatus)

    handleCancel2FA()
    showMessage(`${t('profile.messages.twoFactorAuth.title')} ${newStatus ? t('profile.messages.twoFactorAuth.enable') : t('profile.messages.twoFactorAuth.disable')} ${t('profile.messages.twoFactorAuth.success')}`, "success")

     
  } catch (error: any) {
    console.error("❌ Error updating 2FA:", error)  
    const errorMessage = error.message || `${t('profile.messages.failedTwoFactor')}`
    showMessage(errorMessage, "error")
  } finally {
    confirmBtn.classList.remove("loading")
    if (confirmBtn instanceof HTMLButtonElement) {
      confirmBtn.disabled = false
    }
  }
}

export function handleCancel2FA(): void {
  formManager.toggleElements(["twofa-form"], ["toggle-2fa-btn"])
}

export function handleDeleteAccountClick(): void {
  const deleteAccountBtn = document.getElementById("delete-account-btn")
  const deleteAccountForm = document.getElementById("delete-account-form")

  if (deleteAccountBtn && deleteAccountForm) {

    deleteAccountBtn.style.display = "none"
    deleteAccountForm.style.display = "block"

    formManager.setupCheckboxValidation("delete-confirmation-checkbox", "confirm-delete-account-btn")
  }
}

export async function handleConfirmDeleteAccount(): Promise<void> {
  const confirmationCheckbox = document.getElementById("delete-confirmation-checkbox") as HTMLInputElement

  if (!confirmationCheckbox?.checked) {
    showMessage(`${t('messages.error.confirmPermanency')}`, "error")
    return
  }

  const form = document.createElement("form")

  await formManager.handleFormSubmission(
    form,
    {
      buttonId: "confirm-delete-account-btn",
      successMessage: `${t('messages.success.deleteAccount')}`,
      successRedirect: "/",
      successDelay: 1000,
      onSuccess: async () => {
         
        authManager.clearAuth()
        authManager.clearCookies()
      },
    },
    async () => {
      return await authService.deleteAccount()
    },
  )
}

export function handleCancelDeleteAccount(): void {
  const deleteAccountBtn = document.getElementById("delete-account-btn")
  const deleteAccountForm = document.getElementById("delete-account-form")
  const confirmationCheckbox = document.getElementById("delete-confirmation-checkbox") as HTMLInputElement
  const confirmBtn = document.getElementById("confirm-delete-account-btn") as HTMLButtonElement

  if (deleteAccountBtn && deleteAccountForm) {
    deleteAccountForm.style.display = "none"
    deleteAccountBtn.style.display = "flex"
  }

  if (confirmationCheckbox && confirmBtn) {
    confirmationCheckbox.checked = false
    confirmBtn.disabled = true
    confirmBtn.classList.remove("enabled")
  }
}
