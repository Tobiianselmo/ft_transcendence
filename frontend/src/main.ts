 
import { router } from "./router"
import { authManager } from "./auth"
import { setupEventListeners } from "./handlers/eventHandlers"
import { setupGlobalReloadProtection, setPageLoading } from "./utils/reloadProtection"
import { setupCookieMonitor, logCookies } from "./utils/cookieDebug"

 
setupGlobalReloadProtection()

 
setupCookieMonitor()

 
 
window.addEventListener("load", async () => {
   
  logCookies("Al cargar página")

   
  const waitForBackend = async (retries = 10, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const isUp = await authManager.checkBackendHealth();
        if (isUp) return true;
      } catch (error) {
         
      }
       
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    return false;
  };

  try {
     
    const backendAvailable = await waitForBackend();

    if (backendAvailable) {
       

       
       
      await authManager.initialize()
       
    } else {
      console.warn("⚠️ Backend no disponible tras varios intentos")
       
       
    }
  } catch (error) {
    console.warn("⚠️ Error crítico conectando con backend:", error)
  }

   
  router()
   

   
  setupEventListeners()
   

   
  setPageLoading(false)
})
