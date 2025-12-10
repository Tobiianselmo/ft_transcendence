 
import { t, translator } from "./languages/translation"
import { authManager } from "./auth"
import { showMessage } from "./utils/ui"
import { checkTournamentNavigation } from "./pages/Tournament"

const PROTECTED_ROUTES = ["/profile"]
const PROTECTED_ROUTE_PREFIXES = ["/play/online", "/profile/", "/users/"]
const AUTH_ONLY_ROUTES = ["/login", "/signup", "/2fa", "/verify-register", "/forgot-password"]

function isProtectedRoute(path: string): boolean {
  if (PROTECTED_ROUTES.includes(path)) {
    return true
  }

  return PROTECTED_ROUTE_PREFIXES.some((prefix) => path.startsWith(prefix))
}

async function handleProtectedRoute(path: string, app: HTMLElement): Promise<boolean> {
  if (!isProtectedRoute(path)) {
    return false
  }

   

   
   
  if (authManager.isAuthenticated() || authManager.hasLocalData()) {
     
    
     
    authManager.verifyAuth().then(isValid => {
      if (!isValid) {
        console.warn("⚠️ Verificación con backend falló, pero permitiendo acceso temporal")
      }
    }).catch(error => {
      console.warn("⚠️ Error en verificación background:", error)
    })
    
    return false
  }

   

  if (path.startsWith("/play/online")) {
     
  }

  history.replaceState(null, "", "/login")
  const { default: Login } = await import("./pages/Login")
  app.innerHTML = Login()
  return true
}

export async function router() {
  const path = window.location.pathname
  const app = document.getElementById("app")

   
   

  if (!app) {
    console.error("❌ App element not found!")
    return
  }

  const canNavigate = await checkTournamentNavigation()
  if (!canNavigate) {
     
    history.replaceState(null, "", "/tournament/bracket")
    return
  }

  if (AUTH_ONLY_ROUTES.includes(path) && authManager.isAuthenticated()) {
     
    history.replaceState(null, "", "/")
    const { default: Home } = await import("./pages/Home")
    app.innerHTML = Home()
    updateNavigationSmart()
    return
  }

  if (isProtectedRoute(path)) {
    handleProtectedRoute(path, app).then(async (wasRedirected) => {
      if (!wasRedirected) {
        await renderRoute(path, app)
        if (path === "/profile") {
          setTimeout(async () => {
            const { updateProfileTwoFAStatus, loadMatchHistory, loadProfileStats, setupUserSearch, loadPendingRequests, setupPendingRequestsToggle } = await import("./pages/Profile")
            updateProfileTwoFAStatus()
            loadMatchHistory()
            loadProfileStats()
            setupUserSearch()
            loadPendingRequests()
            setupPendingRequestsToggle()
          }, 100)
        } else if (path.startsWith("/users/")) {
          const username = path.split("/")[2]
          if (username) {
            setTimeout(async () => {
              const { loadPublicProfile } = await import("./pages/PublicProfile")
              loadPublicProfile(username)
            }, 100)
          }
        }
      }
      updateNavigation()
    })
    return
  }

  await renderRoute(path, app)
  updateNavigationSmart()
}

export async function renderRoute(path: string, app: HTMLElement) {
   
  try { (window as any).__pageCleanup?.() } catch {}
  if (path === "/tournament/bracket") {
    import("./pages/Tournament")
      .then((mod) => {
         
        if (mod.mountTournamentBracket) {
           
          mod.mountTournamentBracket()
        } else {
           
          app.innerHTML = mod.showTournamentBracket()
        }
      })
      .catch((err) => {
        console.error("🏆 Error loading tournament module:", err)
        app.innerHTML = "<h2>Error loading tournament</h2>"
      })
    return
  }

   
  if (path.startsWith("/users/")) {
    const username = path.split("/")[2]
    if (username) {
      import("./pages/Home").then((mod) => mod.setCurrentChatNull && mod.setCurrentChatNull())
       
      const { default: PublicProfile, loadPublicProfile } = await import("./pages/PublicProfile")
      app.innerHTML = PublicProfile(username)
      setTimeout(() => loadPublicProfile(username), 100)
      return
    }
  }

  if (path === "/") {
     
    try {
      const { default: Home } = await import("./pages/Home")
      const homeContent = Home()
       
      app.innerHTML = homeContent
       
    } catch (error) {
      console.error("❌ Error loading Home:", error)
      app.innerHTML = "<h1>Error loading Home page</h1>"
    }
  } else if (path === "/profile") {
     
    const { default: Profile } = await import("./pages/Profile")
    app.innerHTML = Profile()
    setTimeout(() => {
      import("./pages/Profile").then((mod) => {
        mod.updateProfileTwoFAStatus && mod.updateProfileTwoFAStatus()
        mod.loadMatchHistory && mod.loadMatchHistory()
        mod.loadProfileStats && mod.loadProfileStats()
        mod.setupUserSearch && mod.setupUserSearch()
        mod.setupSocialTabs && mod.setupSocialTabs()
        mod.loadPendingRequests && mod.loadPendingRequests()
        mod.setupPendingRequestsToggle && mod.setupPendingRequestsToggle()
        mod.setupFriendsListToggle && mod.setupFriendsListToggle()
      })
       
      import("./pages/Profile").then((mod) => mod.setupAvatarEditing && mod.setupAvatarEditing())
    }, 100)
    import("./pages/Home").then((mod) => mod.setCurrentChatNull && mod.setCurrentChatNull())
  } else if (path === "/tournament") {
     
    const { showTournamentConfig } = await import("./pages/Tournament")
    app.innerHTML = showTournamentConfig()
    import("./pages/Tournament").then((mod) => mod.setupTournamentConfigListeners && mod.setupTournamentConfigListeners())
    import("./pages/Home").then((mod) => mod.setCurrentChatNull && mod.setCurrentChatNull())
  } else if (path === "/play") {
     
    const { showMainMenu } = await import("./pages/Play")
    app.innerHTML = showMainMenu()
    import("./pages/Home").then((mod) => mod.setCurrentChatNull && mod.setCurrentChatNull())
  } else if (path === "/play/local") {
    const { showLocalOptions } = await import("./pages/Play")
    app.innerHTML = showLocalOptions()
  } else if (path === "/play/online") {
     
    const { showOnlineOptions } = await import("./pages/OnlinePlay")
    app.innerHTML = showOnlineOptions()
  } else if (path === "/play/online/1vs1") {
    const { showOnline1v1Options } = await import("./pages/OnlinePlay")
    app.innerHTML = showOnline1v1Options()
  } else if (path.startsWith("/play/local/")) {
    const parts = path.split("/")
    const mode = parts[3]
    const subMode = parts[4]
    if (mode === "1vs1" && subMode === "config") {
      const { show1vs1Config } = await import("./pages/Play")
      app.innerHTML = show1vs1Config()
    } else if (mode === "1vsai" && subMode === "config") {
      const { showAIConfig } = await import("./pages/Play")
      app.innerHTML = showAIConfig()
    } else if (mode === "2vs2" && subMode === "config") {
      const { show2vs2Config } = await import("./pages/Play")
      app.innerHTML = show2vs2Config()
    } else if (mode === "1vsai" || mode === "1vs1" || mode === "2vs2") {
      const { startLocalGame } = await import("./pages/Play")
      app.innerHTML = startLocalGame(mode)
    } else {
      app.innerHTML = "<h2>404 - Invalid Local Mode</h2>"
    }
  } else if (path.startsWith("/play/online/1vs1/")) {
    const parts = path.split("/")
    const subMode = parts[4]
    if (subMode === "create") {
      if (parts[5] == "chooseFriend")
      {
        ;(async () => {
          const { chooseFriend, mountChooseFriend } = await import ('./pages/OnlinePlay')
          app.innerHTML = chooseFriend();
          mountChooseFriend();
        })()
      } else {
        ;(async () => {
          const { showCreateMatch, mountCreateMatch } = await import("./pages/OnlinePlay")
          app.innerHTML = showCreateMatch()
          mountCreateMatch();
        })()
      }
    } else if (subMode === "join") {
      ;(async () => {
        const { showJoinMatch, mountJoinMatch } = await import("./pages/OnlinePlay")
        app.innerHTML = showJoinMatch()
        import("./pages/Home").then((mod) => mod.setCurrentChatNull && mod.setCurrentChatNull())
        mountJoinMatch()
      })()
    } else {
      app.innerHTML = "<h2>404 - Invalid 1v1 Mode</h2>"
    }
  } else if (path.startsWith("/play/online/")) {
    const parts = path.split("/")
    const mode = parts[3]
    if (mode === "quick" || mode === "ranked") {
      const { startOnlineGame } = await import("./pages/OnlinePlay")
      app.innerHTML = startOnlineGame(mode)
    } else {
      app.innerHTML = "<h2>404 - Invalid Online Mode</h2>"
    }
  } else if (path === "/login") {
    const { default: Login } = await import("./pages/Login")
    app.innerHTML = Login()
    try {
      const params = new URLSearchParams(window.location.search)
      const msg = params.get("msg")
      if (msg === "google_email_exists") {
        showMessage(
          `${t('google.errorMsg')}`,
          "error",
        )
        history.replaceState(null, "", "/login")
      }
    } catch {}
    updateNavigationForPublicRoute()
  } else if (path === "/signup") {
    const { default: Signup } = await import("./pages/Signup")
    app.innerHTML = Signup()
    updateNavigationForPublicRoute()
  } else if (path === "/verify-register") {
     
     
     
    try {
      const params = new URLSearchParams(window.location.search)
      const emailParam = params.get("email")
      if (emailParam) {
         
        authManager.setPendingVerification(emailParam)
      }
    } catch (err) {
      console.warn("Could not parse verify-register query params", err)
    }

    if (authManager.isPendingVerification()) {
       
      const { default: VerifyRegister } = await import("./pages/VerifyRegister")
      app.innerHTML = VerifyRegister()
    } else {
       
      history.replaceState(null, "", "/login")
      const { default: Login } = await import("./pages/Login")
      app.innerHTML = Login()
    }
    updateNavigationForPublicRoute()
  } else if (path === "/2fa") {
    if (authManager.isPending2FA()) {
       
      const { default: TwoFA } = await import("./pages/TwoFA")
      app.innerHTML = TwoFA()
    } else {
       
      history.replaceState(null, "", "/login")
      const { default: Login } = await import("./pages/Login")
      app.innerHTML = Login()
    }
    updateNavigationForPublicRoute()
  } else if (path === "/forgot-password") {
    const { default: ForgotPassword } = await import("./pages/ForgotPassword")
    app.innerHTML = ForgotPassword()
    updateNavigationForPublicRoute()
  } else if (path === "/auth/google/callback") {
     
    const { default: GoogleCallback, handleGoogleCallback } = await import("./pages/GoogleCallback")
    app.innerHTML = GoogleCallback()
    setTimeout(() => handleGoogleCallback(), 1)
    updateNavigationForPublicRoute()
  } else if (path !== "/") {
    app.innerHTML = "<h2>404 - Page Not Found</h2>"
    updateNavigationForPublicRoute()
  }
}

let languageSelectorRef: HTMLSelectElement | null = null
const handleLanguageChange = (e: Event) => {
  const sel = e.currentTarget as HTMLSelectElement
  translator.changeLanguage(sel.value)
  import("./pages/Home").then((mod) => mod.setCurrentChatNull && mod.setCurrentChatNull())
}

export function setUpLeftNav() {
  const navLeft = document.getElementById("nav-left")
  const currentLang = translator.getLanguage()
  const path = window.location.pathname
  
  if (!navLeft) return

  if (path === "/") {
    navLeft.innerHTML = `
      <div class="language-selector-container">
        <select id="language-selector" class="score-dropdown">
          <option value="en" ${currentLang === "en" ? "selected" : ""}>${t("navigation.englishLang")}</option>
          <option value="es" ${currentLang === "es" ? "selected" : ""}>${t("navigation.spanishLang")}</option>
          <option value="fr" ${currentLang === "fr" ? "selected" : ""}>${t("navigation.frenchLang")}</option>
        </select>
      </div>
    `
    if (languageSelectorRef) {
      languageSelectorRef.removeEventListener("change", handleLanguageChange)
    }
    languageSelectorRef = document.getElementById("language-selector") as HTMLSelectElement | null
    languageSelectorRef?.addEventListener("change", handleLanguageChange)
  } else {
    navLeft.innerHTML = `
      <a href="/" data-link class="nav-btn">${t("navigation.home")}</a>`

  }
}

export function updateNavigationSmart() {
  const navRight = document.getElementById("nav-right")
  const path = window.location.pathname

  if (!navRight) return
  setUpLeftNav();
  
   
   
  const hasSession = authManager.isAuthenticated() || authManager.hasLocalData()
  
  if (hasSession) {
     
    if (path === "/profile"){
      navRight.innerHTML = `
      <button class="nav-btn logout-btn" id="logout-btn">${t("navigation.logout")}</button>`
    } else {   
      navRight.innerHTML = `
      <a href="/profile" data-link class="nav-btn">${t("navigation.profile")}</a>
      <button class="nav-btn logout-btn" id="logout-btn">${t("navigation.logout")}</button>`
    }

    const logoutBtn = document.getElementById("logout-btn")
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        await authManager.logout()
      })
    }
  } else {
     
    navRight.innerHTML = `
      <a href="/login" data-link class="nav-btn">${t("navigation.login")}</a>
      <a href="/signup" data-link class="nav-btn signup-btn">${t("navigation.signup")}</a>
    `
  }
}

function updateNavigationForPublicRoute() {
  const navRight = document.getElementById("nav-right")
  if (!navRight) return
  navRight.innerHTML = `
    <a href="/login" data-link class="nav-btn">${t("navigation.login")}</a>
    <a href="/signup" data-link class="nav-btn signup-btn">${t("navigation.signup")}</a>
  `
  setUpLeftNav()
}

function updateNavigation() {
  const navRight = document.getElementById("nav-right")
  const path = window.location.pathname

  if (!navRight) return
  setUpLeftNav();
  
   
  const hasSession = authManager.isAuthenticated() || authManager.hasLocalData()
  
  if (hasSession) {
     
    if (path === "/profile"){
      navRight.innerHTML = `
      <button class="nav-btn logout-btn" id="logout-btn">${t("navigation.logout")}</button>`
    } else {   
      navRight.innerHTML = `
      <a href="/profile" data-link class="nav-btn">${t("navigation.profile")}</a>
      <button class="nav-btn logout-btn" id="logout-btn">${t("navigation.logout")}</button>`
    }

    const logoutBtn = document.getElementById("logout-btn")
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        await authManager.logout()
      })
    }
  } else {
    navRight.innerHTML = `
      <a href="/login" data-link class="nav-btn">${t("navigation.login")}</a>
      <a href="/signup" data-link class="nav-btn signup-btn">${t("navigation.signup")}</a>
    `
  }
}

authManager.onAuthChange(() => {
   
  updateNavigationSmart()

  if (window.location.pathname === "/profile") {
    setTimeout(async () => {
      const {
        updateProfileTwoFAStatus,
        loadMatchHistory,
        loadProfileStats,
        setupUserSearch,
        loadPendingRequests,
        setupPendingRequestsToggle,
      } = await import("./pages/Profile")
      updateProfileTwoFAStatus && updateProfileTwoFAStatus()
      loadMatchHistory && loadMatchHistory()
      loadProfileStats && loadProfileStats()
      setupUserSearch && setupUserSearch()
      loadPendingRequests && loadPendingRequests()
      setupPendingRequestsToggle && setupPendingRequestsToggle()
    }, 100)
  }
})
