 
export class UIManager {
   
  static hideAllProfileForms(): void {
    const forms = [
      { form: "username-edit-form", button: "username-display" },
      { form: "password-change-form", button: "change-password-btn" },
      { form: "twofa-form", button: "toggle-2fa-btn" },
      { form: "delete-account-form", button: "delete-account-btn" },
    ]

    forms.forEach(({ form, button }) => {
      const formElement = document.getElementById(form)
      const buttonElement = document.getElementById(button)

      if (formElement && formElement.style.display !== "none") {
        formElement.style.display = "none"
        if (buttonElement) {
          buttonElement.style.display = form === "username-edit-form" ? "block" : "flex"
        }
      }
    })
  }

   
  static hideOtherProfileForms(exceptForm: string): void {
    const formMappings = {
      "username-edit-form": [
        { form: "password-change-form", button: "change-password-btn" },
        { form: "twofa-form", button: "toggle-2fa-btn" },
        { form: "delete-account-form", button: "delete-account-btn" },
      ],
      "password-change-form": [
        { form: "username-edit-form", button: "username-display" },
        { form: "twofa-form", button: "toggle-2fa-btn" },
        { form: "delete-account-form", button: "delete-account-btn" },
      ],
      "twofa-form": [
        { form: "username-edit-form", button: "username-display" },
        { form: "password-change-form", button: "change-password-btn" },
        { form: "delete-account-form", button: "delete-account-btn" },
      ],
      "delete-account-form": [
        { form: "username-edit-form", button: "username-display" },
        { form: "password-change-form", button: "change-password-btn" },
        { form: "twofa-form", button: "toggle-2fa-btn" },
      ],
    }

    const formsToHide = formMappings[exceptForm as keyof typeof formMappings] || []

    formsToHide.forEach(({ form, button }) => {
      const formElement = document.getElementById(form)
      const buttonElement = document.getElementById(button)

      if (formElement && formElement.style.display !== "none") {
        formElement.style.display = "none"
        if (buttonElement) {
          buttonElement.style.display = form === "username-edit-form" ? "block" : "flex"
        }
      }
    })
  }

   
  static handleForgotPasswordStepTransition(): void {
    const step1 = document.getElementById("forgot-password-step")
    const step2 = document.getElementById("reset-password-step")

    if (step1 && step2) {
      step2.style.display = "none"
      step1.style.display = "block"

       
      const resetForm = document.getElementById("reset-password-form") as HTMLFormElement
      if (resetForm) {
        resetForm.reset()
      }

       
      const emailInput = document.getElementById("email") as HTMLInputElement
      if (emailInput) {
        setTimeout(() => emailInput.focus(), 100)
      }
    }
  }
}