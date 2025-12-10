 
import { authService } from "../services/authService"
import { validators } from "../utils/validation"
import { formManager, commonValidationRules } from "../managers/FormManager"
import { t } from "../languages/translation"

export async function handleForgotPassword(form: HTMLFormElement): Promise<void> {
  await formManager.handleFormSubmission(
    form,
    {
      buttonId: "forgot-password-btn",
      validationRules: commonValidationRules.email,
      successMessage: `${t('messages.success.resetToken')}`,
      onSuccess: async () => {
        formManager.toggleElements(["forgot-password-step"], ["reset-password-step"])

        const tokenInput = document.getElementById("token") as HTMLInputElement
        if (tokenInput) {
          setTimeout(() => tokenInput.focus(), 100)
        }
      },
    },
    async (formData) => {
      const email = formData.get("email") as string
      return await authService.forgotPassword({ email })
    },
  )
}

export async function handleResetPassword(form: HTMLFormElement): Promise<void> {
  const formData = new FormData(form)
  const password = formData.get("password") as string

  await formManager.handleFormSubmission(
    form,
    {
      buttonId: "reset-password-btn",
      validationRules: {
        token: (value: string) => {
          if (!value || value.trim().length === 0) {
            return { isValid: false, error: "Reset token is required" }
          }
          return { isValid: true }
        },
        password: (value: string) => validators.password(value),
        "confirm-password": (value: string) => validators.confirmPassword(value, password),
      },
      successMessage: `${t('messages.success.passReset')}`,
      successRedirect: "/login",
      successDelay: 3000,
    },
    async (formData) => {
      const token = (formData.get("token") as string).trim()
      const password = formData.get("password") as string
      return await authService.resetPassword({ token, password })
    },
  )
}
