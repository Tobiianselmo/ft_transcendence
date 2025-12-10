 
import { router } from "../router"
import { setupCodeInput } from "../utils/ui"
import { hideAllOpenForms } from "../handlers/uiHelpers"
import { UIManager } from "./UIManager"

interface ClickHandler {
  id: string
  handler: (target: HTMLElement, e: Event) => void | Promise<void>
  preventDefault?: boolean
}

interface FormHandler {
  id: string
  handler: (form: HTMLFormElement) => Promise<void>
}

interface KeyHandler {
  key: string
  targetId?: string
  targetClass?: string
  handler: (target: HTMLElement, e: KeyboardEvent) => void
  preventDefault?: boolean
}

export class EventManager {
  private static clickHandlers: ClickHandler[] = [
     
    { id: "terms-link", handler: async () => { (await import("../handlers/modalHandlers")).handleTermsModal() }, preventDefault: true },
    { id: "privacy-link", handler: async () => { (await import("../handlers/modalHandlers")).handlePrivacyModal() }, preventDefault: true },
    { id: "terms-close", handler: async () => { (await import("../handlers/modalHandlers")).handleCloseTermsModal() } },
    { id: "privacy-close", handler: async () => { (await import("../handlers/modalHandlers")).handleClosePrivacyModal() } },

     
    { id: "resend-code", handler: async (target) => { (await import("../handlers/resendCodeHandlers")).handleResend2FACode(target) }, preventDefault: true },
    { id: "resend-verification-code", handler: async (target) => { (await import("../handlers/resendCodeHandlers")).handleResendVerificationCode(target) }, preventDefault: true },

     
    { id: "back-to-email-btn", handler: () => UIManager.handleForgotPasswordStepTransition(), preventDefault: true },

     
    {
      id: "edit-username-btn",
      handler: () => {
        UIManager.hideOtherProfileForms("username-edit-form");
        (async () => { (await import("../handlers/profileHandlers")).handleEditUsernameClick() })()
      },
    },
    { id: "save-username-btn", handler: async () => { (await import("../handlers/profileHandlers")).handleSaveUsername() } },
    { id: "cancel-username-btn", handler: async () => { (await import("../handlers/profileHandlers")).handleCancelUsernameEdit() } },

    {
      id: "change-password-btn",
      handler: () => {
        UIManager.hideOtherProfileForms("password-change-form");
        (async () => { (await import("../handlers/profileHandlers")).handleChangePasswordClick() })()
      },
    },
    { id: "save-password-btn", handler: async () => { (await import("../handlers/profileHandlers")).handleSavePassword() } },
    { id: "cancel-password-btn", handler: async () => { (await import("../handlers/profileHandlers")).handleCancelPasswordEdit() } },

    {
      id: "toggle-2fa-btn",
      handler: () => {
        UIManager.hideOtherProfileForms("twofa-form");
        (async () => { (await import("../handlers/profileHandlers")).handleToggle2FAClick() })()
      },
    },
    { id: "confirm-toggle-2fa-btn", handler: async () => { (await import("../handlers/profileHandlers")).handleConfirmToggle2FA() } },
    { id: "cancel-2fa-btn", handler: async () => { (await import("../handlers/profileHandlers")).handleCancel2FA() } },

    {
      id: "delete-account-btn",
      handler: () => {
        UIManager.hideOtherProfileForms("delete-account-form");
        (async () => { (await import("../handlers/profileHandlers")).handleDeleteAccountClick() })()
      },
    },
    { id: "confirm-delete-account-btn", handler: async () => { (await import("../handlers/profileHandlers")).handleConfirmDeleteAccount() } },
    { id: "cancel-delete-btn", handler: async () => { (await import("../handlers/profileHandlers")).handleCancelDeleteAccount() } },
  ]

  private static formHandlers: FormHandler[] = [
    { id: "login-form", handler: async (form) => (await import("../handlers/authHandlers")).handleLogin(form) },
    { id: "signup-form", handler: async (form) => (await import("../handlers/authHandlers")).handleSignup(form) },
    { id: "twofa-form", handler: async (form) => (await import("../handlers/authHandlers")).handle2FA(form) },
    { id: "verify-register-form", handler: async (form) => (await import("../handlers/authHandlers")).handleVerifyRegister(form) },
    { id: "forgot-password-form", handler: async (form) => (await import("../handlers/passwordRecoveryHandlers")).handleForgotPassword(form) },
    { id: "reset-password-form", handler: async (form) => (await import("../handlers/passwordRecoveryHandlers")).handleResetPassword(form) },
  ]

  private static keyHandlers: KeyHandler[] = [
     
    { key: "Enter", targetId: "username-input", handler: async () => { (await import("../handlers/profileHandlers")).handleSaveUsername() }, preventDefault: true },
    { key: "Escape", targetId: "username-input", handler: async () => { (await import("../handlers/profileHandlers")).handleCancelUsernameEdit() }, preventDefault: true },

     
    {
      key: "Enter",
      targetClass: "password-input",
      handler: (target) => {
        if (target.id === "confirm-password-input") {
          (async () => { (await import("../handlers/profileHandlers")).handleSavePassword() })()
        } else {
           
          const form = target.closest(".password-edit-form")
          const inputs = form?.querySelectorAll(".password-input") as NodeListOf<HTMLInputElement>
          const currentIndex = Array.from(inputs).indexOf(target as HTMLInputElement)
          if (inputs && currentIndex < inputs.length - 1) {
            inputs[currentIndex + 1].focus()
          }
        }
      },
      preventDefault: true,
    },
    {
      key: "Escape",
      targetClass: "password-input",
      handler: async () => { (await import("../handlers/profileHandlers")).handleCancelPasswordEdit() },
      preventDefault: true,
    },

     
    {
      key: "Escape",
      handler: async (target, e) => {
        const twoFAForm = document.getElementById("twofa-form")
        if (twoFAForm && twoFAForm.style.display !== "none") {
          e.preventDefault()
          ;(await import("../handlers/profileHandlers")).handleCancel2FA()
        }
      },
    },

     
    {
      key: "Escape",
      handler: async (target, e) => {
        const deleteAccountForm = document.getElementById("delete-account-form")
        if (deleteAccountForm && deleteAccountForm.style.display !== "none") {
          e.preventDefault()
          ;(await import("../handlers/profileHandlers")).handleCancelDeleteAccount()
        }
      },
    },

     
    { key: "Escape", handler: async () => { (await import("../handlers/modalHandlers")).handleEscapeKeyForModals() } },
  ]

   
  private static handleSpecificClicks(target: HTMLElement, e: Event): boolean {
     
    const clickHandler = this.clickHandlers.find((handler) => handler.id === target.id)
    if (clickHandler) {
      if (clickHandler.preventDefault) {
        e.preventDefault()
      }
      clickHandler.handler(target, e)
      return true
    }

    return false
  }

   
  private static handleClassClicks(target: HTMLElement, e: Event): boolean {
     
    if (target.classList.contains("forgot-password")) {
      e.preventDefault()
      history.pushState(null, "", "/forgot-password")
      router()
      return true
    }

     
    if (target.classList.contains("setting-btn") && !this.isProfileActionButton(target)) {
      hideAllOpenForms()
      return true
    }

     
    if (target.classList.contains("nav-btn") || target.classList.contains("back-button")) {
      hideAllOpenForms()
      return true
    }

    return false
  }

   
  private static isProfileActionButton(target: HTMLElement): boolean {
    const profileActionIds = [
      "change-password-btn",
      "save-password-btn",
      "cancel-password-btn",
      "toggle-2fa-btn",
      "confirm-toggle-2fa-btn",
      "cancel-2fa-btn",
      "delete-account-btn",
      "confirm-delete-account-btn",
      "cancel-delete-btn",
    ]
    return profileActionIds.includes(target.id)
  }

   
  private static handleNavigation(target: HTMLElement, e: Event): boolean {
    const linkElement = target.closest("[data-link]") as HTMLElement
    if (linkElement) {
      e.preventDefault()
      const href = linkElement.getAttribute("href")
      if (href) {
        history.pushState(null, "", href)
        router()
      }
      return true
    }
    return false
  }

   
  private static setupClickListener(): void {
    document.body.addEventListener("click", (e) => {
      const target = e.target as HTMLElement

       
      if (this.handleNavigation(target, e)) return
      if (this.handleSpecificClicks(target, e)) return
      if (this.handleClassClicks(target, e)) return

       
      ;(async () => { (await import("../handlers/modalHandlers")).handleModalBackgroundClick(target) })()
    })
  }

   
  private static setupFocusListener(): void {
    document.body.addEventListener(
      "focus",
      (e) => {
        const target = e.target as HTMLElement
        if (target.id === "code" || target.id === "verification-code") {
          setupCodeInput(target.id)
        }
      },
      true,
    )
  }

   
  private static setupFormListener(): void {
    document.body.addEventListener("submit", async (e) => {
      const target = e.target as HTMLFormElement
      const formHandler = this.formHandlers.find((handler) => handler.id === target.id)

      if (formHandler) {
        e.preventDefault()
        await formHandler.handler(target)
      }
    })
  }

   
  private static setupKeyListener(): void {
    document.body.addEventListener("keydown", (e) => {
      const target = e.target as HTMLElement

      for (const keyHandler of this.keyHandlers) {
        if (keyHandler.key !== e.key) continue

         
        if (keyHandler.targetId && target.id !== keyHandler.targetId) continue
        if (keyHandler.targetClass && !target.classList.contains(keyHandler.targetClass)) continue

         
        if (!keyHandler.targetId && !keyHandler.targetClass) {
          keyHandler.handler(target, e)
          continue
        }

         
        if (
          keyHandler.targetId === target.id ||
          (keyHandler.targetClass && target.classList.contains(keyHandler.targetClass))
        ) {
          if (keyHandler.preventDefault) {
            e.preventDefault()
          }
          keyHandler.handler(target, e)
          break
        }
      }
    })
  }

   
  static setupEventListeners(): void {
    this.setupClickListener()
    this.setupFocusListener()
    this.setupFormListener()
    this.setupKeyListener()

     
    window.addEventListener("popstate", router)
  }
}