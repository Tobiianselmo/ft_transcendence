 
import { API_BASE_URL } from "../config/url"
export interface LoadingButton {
  button: HTMLButtonElement
  textElement: HTMLElement
  loaderElement: HTMLElement
}

export class ButtonLoadingManager {
  private loadingButtons = new Map<string, LoadingButton>()

  setLoading(buttonId: string, isLoading: boolean): void {
    const button = document.getElementById(buttonId) as HTMLButtonElement
    if (!button) {
       
       
       
       
      if (window.location.hostname === "localhost" || window.location.hostname === `${API_BASE_URL}`) {
        console.warn(`Button with id ${buttonId} not found`)
      }
      return
    }

    const textElement = button.querySelector(".button-text") as HTMLElement
    const loaderElement = button.querySelector(".button-loader") as HTMLElement

    if (!textElement || !loaderElement) {
      console.warn(`Button ${buttonId} missing .button-text or .button-loader elements`)
      return
    }

     
    this.loadingButtons.set(buttonId, { button, textElement, loaderElement })

     
    button.disabled = isLoading
    textElement.style.display = isLoading ? "none" : "inline"
    loaderElement.style.display = isLoading ? "flex" : "none"

     
    if (isLoading) {
      button.classList.add("loading")
    } else {
      button.classList.remove("loading")
    }
  }

   
  resetAll(): void {
    this.loadingButtons.forEach((_, buttonId) => {
      this.setLoading(buttonId, false)
    })
  }

   
  cleanup(): void {
    this.loadingButtons.clear()
  }

   
  buttonExists(buttonId: string): boolean {
    return document.getElementById(buttonId) !== null
  }
}

 
export const buttonLoader = new ButtonLoadingManager()

 
export function setupCodeInput(inputId: string): void {
  const input = document.getElementById(inputId) as HTMLInputElement
  if (!input) return

  input.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement
    const value = target.value
    target.value = value.replace(/[^0-9]/g, "")

     
    if (target.value.length === 6) {
      target.classList.add("valid")
      target.classList.remove("invalid")
    } else {
      target.classList.remove("valid", "invalid")
    }
  })
}

 
export function showMessage(message: string, type: "error" | "success" | "info" | "warning" = "info"): void {
   
  let messageContainer = document.getElementById("app-messages")
  if (!messageContainer) {
    messageContainer = document.createElement("div")
    messageContainer.id = "app-messages"
    messageContainer.className = "app-messages"
    document.body.appendChild(messageContainer)
  }

   
  const messageElement = document.createElement("div")
  messageElement.className = `app-message app-message-${type}`
  messageElement.textContent = message

   
  messageContainer.appendChild(messageElement)

   
  setTimeout(() => {
    if (messageElement.parentNode) {
      messageElement.parentNode.removeChild(messageElement)
    }
  }, 5000)
}

 
export function clearMessages(): void {
  const messageContainer = document.getElementById("app-messages")
  if (messageContainer) {
    messageContainer.innerHTML = ""
  }
}
