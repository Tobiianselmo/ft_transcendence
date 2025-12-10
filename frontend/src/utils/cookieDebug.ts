 

 
export function logCookies(label: string = "Cookies actuales"): void {
  const cookies = document.cookie.split("; ")
   
  
  if (cookies.length === 0 || (cookies.length === 1 && cookies[0] === "")) {
     
    return
  }

 
}

 
export function hasCsrfToken(): boolean {
  const csrfCookie = document.cookie
    .split("; ")
    .find((c) => c.startsWith("csrf_token="))
  
  const exists = !!csrfCookie
   
  return exists
}

 
let lastCookieState = document.cookie

export function setupCookieMonitor(): void {
  setInterval(() => {
    const currentCookies = document.cookie
    if (currentCookies !== lastCookieState) {
       
      logCookies("Antes")
      lastCookieState = currentCookies
      logCookies("Después")
    }
  }, 1000)  
}
