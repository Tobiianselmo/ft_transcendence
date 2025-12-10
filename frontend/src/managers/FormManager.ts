 
import { buttonLoader, showMessage } from "../utils/ui"
import { validators, validateFormData, type ValidationResult } from "../utils/validation"
import { router } from "../router"
import { t } from "../languages/translation"

export interface FormConfig {
  buttonId: string
  validationRules?: Record<string, (value: string, ...args: any[]) => ValidationResult>
  onSuccess?: (result: any) => void | Promise<void>
  onError?: (error: any) => void
  successMessage?: string
  successRedirect?: string
  successDelay?: number
}

export interface FormFieldConfig {
  inputId: string
  validator: (value: string, ...args: any[]) => ValidationResult
  errorClass?: string
  validClass?: string
  additionalArgs?: any[]
}

export class FormManager {
  async handleFormSubmission<T>(
    form: HTMLFormElement,
    config: FormConfig,
    submitAction: (formData: FormData) => Promise<T>,
  ): Promise<void> {
    const formData = new FormData(form)

    if (config.validationRules) {
      const validationResult = validateFormData(formData, config.validationRules)
      if (!validationResult.isValid) {
        showMessage(validationResult.error!, "error")  
        return
      }
    }

    buttonLoader.setLoading(config.buttonId, true)

    try {
      const result = await submitAction(formData)

      if (config.onSuccess) {
        await config.onSuccess(result)
      }

      if (config.successMessage) {
        showMessage(config.successMessage, "success")  
      }

      if (config.successRedirect) {
        const delay = config.successDelay || 0
        if (delay > 0) {
          setTimeout(() => {
            history.pushState(null, "", config.successRedirect!)
            router()
          }, delay)
        } else {
          history.pushState(null, "", config.successRedirect)
          router()
        }
      }
    } catch (error: any) {
      console.error("Form submission error:", error)

      if (config.onError) {
        config.onError(error)
      } else {
         
        const errorMessage = error.message || `${t('messages.error.errorOccurred')}`
        showMessage(errorMessage, "error")
      }
    } finally {
       
      if (buttonLoader.buttonExists(config.buttonId)) {
        buttonLoader.setLoading(config.buttonId, false)
      }
    }
  }

   
  setupRealtimeValidation(fields: FormFieldConfig[]): void {
    fields.forEach((field) => {
      const input = document.getElementById(field.inputId) as HTMLInputElement
      if (!input) return

      input.addEventListener("input", () => {
        const value = input.value.trim()
        const args = field.additionalArgs || []
        const validation = field.validator(value, ...args)

         
        const classesToRemove = ["valid", "invalid", field.errorClass, field.validClass].filter(
          (cls): cls is string => cls !== undefined && cls !== null && cls.trim() !== "",
        )
        input.classList.remove(...classesToRemove)

        if (validation.isValid) {
          input.classList.add(field.validClass || "valid")
        } else if (value.length > 0) {
           
          input.classList.add(field.errorClass || "invalid")
        }
      })
    })
  }

   
  validateTermsAndConditions(formData: FormData): boolean {
    const termsAccepted = formData.get("terms") as string
    if (!termsAccepted) {
      showMessage(`${t('auth.termsAndServices.warning')}`, "warning")

       
      const termsContainer = document.querySelector(".checkbox-container") as HTMLElement
      if (termsContainer) {
        termsContainer.style.border = "2px solid #f59e0b"
        termsContainer.style.borderRadius = "4px"
        termsContainer.style.padding = "8px"
        termsContainer.style.backgroundColor = "#fef3c7"

         
        setTimeout(() => {
          termsContainer.style.border = ""
          termsContainer.style.borderRadius = ""
          termsContainer.style.padding = ""
          termsContainer.style.backgroundColor = ""
        }, 3000)
      }

      return false
    }
    return true
  }

   
  handleInputError(inputId: string, errorMessage: string): void {
    const input = document.getElementById(inputId) as HTMLInputElement
    if (input) {
      input.classList.add("invalid")
      if (input.type !== "password") {
        input.focus()
      }
    }
    showMessage(errorMessage, "error")
  }

   
  clearInputState(inputId: string): void {
    const input = document.getElementById(inputId) as HTMLInputElement
    if (input) {
      input.classList.remove("valid", "invalid")
      input.value = ""
    }
  }

   
  toggleElements(hideIds: string[], showIds: string[]): void {
    hideIds.forEach((id) => {
      const element = document.getElementById(id)
      if (element) element.style.display = "none"
    })

    showIds.forEach((id) => {
      const element = document.getElementById(id)
      if (element) element.style.display = "block"
    })
  }

   
  setupCheckboxValidation(checkboxId: string, buttonId: string): void {
    const checkbox = document.getElementById(checkboxId) as HTMLInputElement
    const button = document.getElementById(buttonId) as HTMLButtonElement

    if (checkbox && button) {
       
      button.disabled = !checkbox.checked

      checkbox.addEventListener("change", () => {
        button.disabled = !checkbox.checked
        if (checkbox.checked) {
          button.classList.add("enabled")
        } else {
          button.classList.remove("enabled")
        }
      })
    }
  }
}

 
export const formManager = new FormManager()

 
export const commonValidationRules = {
  login: {
    email: (value: string) => validators.email(value),
    password: (value: string) => validators.password(value),
  },
  signup: {
    username: (value: string) => validators.displayName(value),
    email: (value: string) => validators.email(value),
    password: (value: string) => validators.password(value),
  },
  twoFA: {
    code: (value: string) => validators.twoFACode(value),
  },
  email: {
    email: (value: string) => validators.email(value),
  },
  password: {
    password: (value: string) => validators.password(value),
  },
}
