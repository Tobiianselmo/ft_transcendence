 
import { authManager } from "../auth"
import { showMessage } from "../utils/ui"
import { validators } from "../utils/validation"
import { router } from "../router"
import { formManager, commonValidationRules } from "../managers/FormManager"
import { t } from "../languages/translation"
 
export async function handleLogin(form: HTMLFormElement): Promise<void> {
  await formManager.handleFormSubmission(
    form,
    {
      buttonId: "login-btn",
      validationRules: commonValidationRules.login,
      onSuccess: async (result: any) => {
        if (result.requires2FA) {
           
          history.pushState(null, "", "/2fa")
          router()
        } else {
          history.pushState(null, "", "/")
          router()
        }
      },
      onError: (error: any) => {
         
        if (error.needsVerification) {
           
          history.pushState(null, "", "/verify-register")
          router()
          showMessage(`${t('auth.verifyYourAccount.messages.please')}`, "info")
          return
        }

        const errorMessage = error.message || `${t('auth.verifyYourAccount.messages.loginFailed')}`  
        showMessage(errorMessage, "error")
      },
    },
    async (formData) => {
      const email = formData.get("email") as string
      const password = formData.get("password") as string
      return await authManager.login(email, password)
    },
  )
}

export async function handleSignup(form: HTMLFormElement): Promise<void> {
  const formData = new FormData(form)

   
  if (!formManager.validateTermsAndConditions(formData)) {
    return
  }

  const password = formData.get("password") as string

  await formManager.handleFormSubmission(
    form,
    {
      buttonId: "signup-btn",
      validationRules: {
        ...commonValidationRules.signup,
        "confirm-password": (value: string) => validators.confirmPassword(value, password),
      },
      onSuccess: async (result: any) => {
        if (result.needsVerification) {
           
          history.pushState(null, "", "/verify-register")
          router()
          showMessage(`${t('auth.verifyYourAccount.messages.accountCreated')}`, "success")
        } else if (authManager.isPending2FA()) {
           
          history.pushState(null, "", "/2fa")
          router()
        } else {
          history.pushState(null, "", "/")
          router()
        }
      },
    },
    async (formData) => {
      const username = formData.get("username") as string
      const email = formData.get("email") as string
      const password = formData.get("password") as string
      return await authManager.signup(username, email, password)
    },
  )
}

export async function handle2FA(form: HTMLFormElement): Promise<void> {
  await formManager.handleFormSubmission(
    form,
    {
      buttonId: "twofa-btn",
      validationRules: commonValidationRules.twoFA,
      successRedirect: "/",
      onError: (error: any) => {
        const codeInput = document.getElementById("code") as HTMLInputElement
        if (codeInput) {
          codeInput.classList.add("invalid")
          codeInput.value = ""
          codeInput.focus()
        }
        const errorMessage = error.message || `${t('auth.verifyYourAccount.messages.invalidCode')}`  
        showMessage(errorMessage, "error")
      },
    },
    async (formData) => {
      const code = formData.get("code") as string
      return await authManager.verify2FA(code)
    },
  )
}

export async function handleVerifyRegister(form: HTMLFormElement): Promise<void> {
  await formManager.handleFormSubmission(
    form,
    {
      buttonId: "verify-register-btn",
      validationRules: {
        "verification-code": (value: string) => validators.twoFACode(value),
      },
      successMessage: `${t('messages.success.successVerified')}`,
      successRedirect: "/login",
      successDelay: 2000,
      onError: (error: any) => {
        const codeInput = document.getElementById("verification-code") as HTMLInputElement
        if (codeInput) {
          codeInput.classList.add("invalid")
          codeInput.value = ""
          codeInput.focus()
        }
        const errorMessage = error.message || `${t('auth.verifyYourAccount.messages.invalidCode')}`  
        showMessage(errorMessage, "error")
      },
    },
    async (formData) => {
      const code = formData.get("verification-code") as string
      const email = authManager.getPendingVerificationEmail()

      if (!email) {
        throw new Error("No verification pending. Please sign up again.") 
      }

      return await authManager.verifyRegistration(email, code)
    },
  )
}
