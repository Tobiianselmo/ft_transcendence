 

let isPageLoading = false
let lastReloadTime = 0
const RELOAD_DEBOUNCE_MS = 3000  

 
export function preventReloadSpam(event: KeyboardEvent): boolean {
  const now = Date.now()
  const isReloadKey =
    event.key === "F5" ||
    (event.ctrlKey && event.key === "r") ||
    (event.metaKey && event.key === "r") ||
    (event.ctrlKey && event.shiftKey && event.key === "R")

  if (isReloadKey) {
     
    if (isPageLoading || now - lastReloadTime < RELOAD_DEBOUNCE_MS) {
       
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
      return true  
    }

     
     
    lastReloadTime = now
  }

  return false  
}

 
export function setPageLoading(loading: boolean): void {
  isPageLoading = loading
}

 
export function setupGlobalReloadProtection(): void {
   
  document.addEventListener("keydown", preventReloadSpam, true)

   
  setPageLoading(true)

   
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setPageLoading(false)
    })
  } else {
    setPageLoading(false)
  }

   
  window.addEventListener("load", () => {
    setPageLoading(false)
  })

   
}

 
export function removeGlobalReloadProtection(): void {
  document.removeEventListener("keydown", preventReloadSpam, true)
   
}
