 
import { authManager } from "../auth"
import { authService } from "../services/authService"
import type { MatchHistory, ProfileStats, SearchUsersResponse } from "../types/shared"
import { t } from "../languages/translation"
 
 
function escapeHTML(s: string) {
  const d = document.createElement("div")
  d.textContent = s
  return d.innerHTML
}

export default function Profile(): string {
   
  authService.getFriendsList().then((friends) => {
    const friendsCount = document.getElementById("friends-count")
    if (friendsCount) friendsCount.textContent = friends ? friends.length.toString() : "0"
  }).catch(() => {
    const friendsCount = document.getElementById("friends-count")
    if (friendsCount) friendsCount.textContent = "0"
  })
  const user = authManager.getCurrentUser()

  if (!user) {
    return `
      <div class="profile-page">
        <div class="profile-container">
          <div class="profile-header">
            <h1>${t('profile.noUserPage.title')}</h1>
            <p>${t('profile.noUserPage.please')} <a href="/login" data-link>${t('profile.noUserPage.login')}</a> ${t('profile.noUserPage.toView')}.</p>
          </div>
        </div>
      </div>
    `
  }

  const displayName = user.display_name || "Unknown User"
  const email = user.email || "No email available"
  const twoFAEnabled = user.twofa_enabled || false
   

  return `
    <div class="profile-page">
      <div class="profile-container">
        <div class="profile-header">
          <div class="avatar-wrapper">
            <div class="avatar">
              <img id="profile-avatar" />
              <div class="avatar-placeholder"></div>
            </div>
            <button class="avatar-edit-btn" id="avatar-edit-btn" title="Change avatar">📷</button>
            <input type="file" id="avatar-file-input" accept="image/*" style="display:none;" />
          </div>
          <div class="profile-info">
            <div class="username-container">
              <h1 class="username" id="username-display">${displayName}</h1>
              <button class="edit-username-btn" id="edit-username-btn" title="Edit username">
                ✏️
              </button>
              <div class="username-edit-form" id="username-edit-form" style="display: none;">
                <input 
                  type="text" 
                  id="username-input" 
                  class="username-input" 
                  value="${displayName}"
                  maxlength="20"
                  pattern="[a-zA-Z0-9_]+"
                />
                <div class="username-edit-actions">
                  <button class="save-username-btn" id="save-username-btn">✅</button>
                  <button class="cancel-username-btn" id="cancel-username-btn">❌</button>
                </div>
              </div>
            </div>
            <div class="user-email">
              <span class="email-label">📧 Email:</span>
              <span class="email-value">${email}</span>
            </div>
            <div class="user-stats">
              <div class="stat">
                <span class="stat-value" id="wins-value">-</span>
                <span class="stat-label">${t('profile.wins')}</span>
              </div>
              <div class="stat">
                <span class="stat-value" id="losses-value">-</span>
                <span class="stat-label">${t('profile.losses')}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="profile-sections">
          <div class="section">
            <h2>${t('profile.recentMatches')}</h2>
            <div class="matches-list" id="matches-list">
              <div class="loading-matches">${t('profile.loadingMatches')}</div>
            </div>
          </div>

          <!-- NEW: Social Section Tabs -->
          <div class="section">
            <h2>${t('profile.social')}</h2>
            <div class="social-tabs">
              <button class="social-tab-btn" id="tab-search-users" data-tab="search-users">${t('profile.searchUsers')}</button>
              <button class="social-tab-btn" id="tab-my-friends" data-tab="my-friends">
                ${t('profile.myFriends')} (<span id="friends-count">0</span>)
              </button>
              <button class="social-tab-btn" id="tab-friend-requests" data-tab="friend-requests">
                ${t('profile.friendRequests')} (<span id="pending-count">0</span>)
              </button>
            </div>
            <div class="social-tab-content">
              <div id="social-search-users" class="social-tab-panel" style="display: block;">
                <div class="search-container">
                  <input 
                    type="text" 
                    id="user-search-input" 
                    class="search-input" 
                    placeholder="${t('profile.searchPlaceholder')}"
                    autocomplete="off"
                  />
                  <div id="search-results" class="search-results" style="display: none;"></div>
                </div>
              </div>
              <div id="social-my-friends" class="social-tab-panel" style="display: none;">
                <div class="friends-list scrolleable" id="friends-list">
                  <div class="loading-friends">${t('profile.loadFriendList')}</div>
                </div>
              </div>
              <div id="social-friend-requests" class="social-tab-panel" style="display: none;">
                <div class="pending-requests-list scrolleable" id="pending-requests-list">
                  <div class="loading-requests">${t('profile.loadRequests')}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>${t('profile.accountSettings.title')}</h2>
            <div class="settings-options">
              <button class="setting-btn" id="change-password-btn">
                ${t('profile.accountSettings.changePassword.title')}
              </button>
              <div class="password-change-form" id="password-change-form" style="display: none;">
                <h3>${t('profile.accountSettings.changePassword.title')}</h3>
                <div class="password-inputs">
                  <input 
                    type="password" 
                    id="current-password-input" 
                    class="password-input" 
                    placeholder="${t('profile.accountSettings.changePassword.currentPassword')}"
                    required
                  />
                  <input 
                    type="password" 
                    id="new-password-input" 
                    class="password-input" 
                    placeholder="${t('profile.accountSettings.changePassword.newPassword')}"
                    required
                    minlength="8"
                  />
                  <input 
                    type="password" 
                    id="confirm-password-input" 
                    class="password-input" 
                    placeholder="${t('profile.accountSettings.changePassword.confirmNewPassword')}"
                    required
                  />
                </div>
                <div class="password-form-actions">
                  <button class="save-password-btn" id="save-password-btn">${t('profile.accountSettings.changePassword.saveButton')}</button>
                  <button class="cancel-password-btn" id="cancel-password-btn">${t('common.cancel')}</button>
                </div>
              </div>
              <button class="setting-btn" id="toggle-2fa-btn">
                ${t('profile.accountSettings.twoAuthentication.title')}
                <span class="setting-status" id="twofa-status">${twoFAEnabled ? `${t('profile.accountSettings.twoAuthentication.enable')}` : `${t('profile.accountSettings.twoAuthentication.disable')}`}}</span>
              </button>
              <div class="twofa-form" id="twofa-form" style="display: none;">
                <h3>${t('profile.accountSettings.twoAuthentication.title')}</h3>
                <div class="twofa-info">
                  <div class="twofa-status-display">
                    <span class="status-label">${t('profile.accountSettings.twoAuthentication.currentStatus')}</span>
                    <span class="status-value ${twoFAEnabled ? `${t('profile.accountSettings.twoAuthentication.enabled')}` : `${t('profile.accountSettings.twoAuthentication.disabled')}`}" id="twofa-current-status">
                      ${twoFAEnabled ? `🟢 ${t('profile.accountSettings.twoAuthentication.enable')}` : `🔴 ${t('profile.accountSettings.twoAuthentication.disable')}`}
                    </span>
                  </div>
                  <div class="twofa-description">
                    <p>
                      ${
                        twoFAEnabled
                          ? `${t('profile.accountSettings.twoAuthentication.currently')} <strong>${t('profile.accountSettings.twoAuthentication.enabled')}</strong>. ${t('profile.accountSettings.twoAuthentication.enableAccount')}`
                          : `${t('profile.accountSettings.twoAuthentication.currently')} <strong>${t('profile.accountSettings.twoAuthentication.disabled')}</strong>. ${t('profile.accountSettings.twoAuthentication.disableAccount')}`
                      }
                    </p>
                  </div>
                </div>
                <div class="twofa-form-actions">
                  <button class="toggle-2fa-btn ${twoFAEnabled ? "disable" : "enable"}" id="confirm-toggle-2fa-btn">
                    ${twoFAEnabled ? `${t('profile.accountSettings.twoAuthentication.disabledButton')}` : `${t('profile.accountSettings.twoAuthentication.enabledButton')}`}
                  </button>
                  <button class="cancel-2fa-btn" id="cancel-2fa-btn">${t('common.cancel')}</button>
                </div>
              </div>
              <button class="setting-btn danger" id="delete-account-btn">
                ${t('profile.accountSettings.deleteAccount.title')}
              </button>
              <div class="delete-account-form" id="delete-account-form" style="display: none;">
                <h3>${t('profile.accountSettings.deleteAccount.title')}</h3>
                <div class="delete-account-warning">
                  <div class="warning-icon">⚠️</div>
                  <div class="warning-content">
                    <p><strong>${t('profile.accountSettings.deleteAccount.cantBeUndone')}</strong></p>
                    <p>${t('profile.accountSettings.deleteAccount.warningTitle')}</p>
                    <ul>
                      <li>${t('profile.accountSettings.deleteAccount.profileInformation')}</li>
                      <li>${t('profile.accountSettings.deleteAccount.gameStatistics')}</li>
                      <li>${t('profile.accountSettings.deleteAccount.achievements')}</li>
                      <li>${t('profile.accountSettings.deleteAccount.preferences')}</li>
                    </ul>
                    <p>${t('profile.accountSettings.deleteAccount.confirmChoices')}</p>
                  </div>
                </div>
                <div class="delete-confirmation">
                  <label class="confirmation-checkbox">
                    <input type="checkbox" id="delete-confirmation-checkbox">
                    <span class="checkmark"></span>
                    ${t('profile.accountSettings.deleteAccount.understand')}
                  </label>
                </div>
                <div class="delete-account-form-actions">
                  <button class="delete-account-confirm-btn" id="confirm-delete-account-btn" disabled>
                    ${t('profile.accountSettings.deleteAccount.title')}
                  </button>
                  <button class="cancel-delete-btn" id="cancel-delete-btn">${t('common.cancel')}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

 
export function setupAvatarEditing(): void {
  const img = document.getElementById("profile-avatar") as HTMLImageElement | null
  const placeholder = document.querySelector(".avatar .avatar-placeholder") as HTMLElement | null
  const editBtn = document.getElementById("avatar-edit-btn") as HTMLButtonElement | null
  const fileInput = document.getElementById("avatar-file-input") as HTMLInputElement | null

  if (!img || !editBtn || !fileInput) return

   
  authService
    .getUserAvatar()
    .then(({ avatarUrl }) => {
      if (avatarUrl) {
         
        img.onload = () => {
          img.style.display = "block"
          if (placeholder) placeholder.style.display = "none"
        }
        img.onerror = () => {
           
          img.style.display = "none"
          if (placeholder) placeholder.style.display = "flex"
        }
        img.src = avatarUrl
      }
    })
    .catch(() => {
       
    })

   
  editBtn.addEventListener("click", () => fileInput.click())

   
  fileInput.addEventListener("change", async () => {
    const file = fileInput.files?.[0]
    if (!file) return

     
    const allowed = ["image/jpeg", "image/png"]
    if (!allowed.includes(file.type)) {
      alert("Invalid file type. Please upload a JPG or PNG image.")
      fileInput.value = ""
      return
    }
    const maxBytes = 2 * 1024 * 1024
    if (file.size > maxBytes) {
      alert("File too large. Maximum size is 2MB.")
      fileInput.value = ""
      return
    }

    try {
      editBtn.disabled = true
      editBtn.textContent = "⏳"
      const result = await authService.uploadAvatar(file)
      if (result?.avatarUrl) {
         
        const newSrc = `${result.avatarUrl}?t=${Date.now()}`
        img.src = newSrc
        img.style.display = "block"
        if (placeholder) placeholder.style.display = "none"
      }
    } catch (err) {
      console.error("❌ Error uploading avatar:", err)
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes("CSRF")) {
        alert("Security check failed (CSRF). Please refresh the page and try again. If you opened the site with a different host (localhost vs your LAN IP), use the same URL you logged in with.")
      } else if (msg.includes("Unauthorized") || msg.includes("401")) {
        alert("Your session expired. Please log in again.")
      } else {
        alert("Failed to upload avatar. Please try again.")
      }
    } finally {
      editBtn.disabled = false
      editBtn.textContent = "📷"
      fileInput.value = ""
    }
  })
}

 
export function setupUserSearch(): void {
  const searchInput = document.getElementById("user-search-input") as HTMLInputElement
  const searchResults = document.getElementById("search-results")

  if (!searchInput || !searchResults) return

  let searchTimeout: any

  searchInput.addEventListener("input", async (e) => {
    const query = (e.target as HTMLInputElement).value.trim()

    clearTimeout(searchTimeout)

    if (query.length < 2) {
      searchResults.style.display = "none"
      return
    }

    searchTimeout = setTimeout(async () => {
      try {
        searchResults.innerHTML = `<div class="search-loading">${t('profile.searching')}</div>`
        searchResults.style.display = "block"

        const results: SearchUsersResponse = await authService.searchUsers(query)

        if (!results || results.length === 0) {
          searchResults.innerHTML = `<div class="search-no-results">${t('profile.noUsers')}</div>`
          return
        }

        searchResults.innerHTML = results
          .map(
            (user) => `
            <div class="search-result-item" data-user-id="${user.user_id}">
              <span class="result-avatar">👤</span>
              <span class="result-name">${escapeHTML(user.display_name)}</span>
            </div>
          `,
          )
          .join("")

        const resultItems = searchResults.querySelectorAll(".search-result-item")
        resultItems.forEach((item) => {
          item.addEventListener("click", () => {
            const username = item.querySelector(".result-name")?.textContent
            if (username) {
              history.pushState(null, "", `/users/${username}`)
              window.dispatchEvent(new PopStateEvent("popstate"))
            }
          })
        })
      } catch (error) {
        console.error("❌ Error searching users:", error)
        searchResults.innerHTML = '<div class="search-error">Error searching users</div>'
      }
    }, 300)
  })

  document.addEventListener("click", (e) => {
    if (!searchInput.contains(e.target as Node) && !searchResults.contains(e.target as Node)) {
      searchResults.style.display = "none"
    }
  })
}

   
  export function setupSocialTabs(): void {
    const tabButtons = [
      document.getElementById("tab-search-users"),
      document.getElementById("tab-my-friends"),
      document.getElementById("tab-friend-requests"),
    ]
    const tabPanels = [
      document.getElementById("social-search-users"),
      document.getElementById("social-my-friends"),
      document.getElementById("social-friend-requests"),
    ]
    if (tabButtons.some((btn) => !btn) || tabPanels.some((panel) => !panel)) return

    tabButtons.forEach((btn, idx) => {
      btn!.addEventListener("click", () => {
        tabButtons.forEach((b, i) => {
          if (i === idx) {
            b!.classList.add("active")
            tabPanels[i]!.style.display = "block"
             
            if (b!.id === "tab-my-friends") {
              loadFriendsList()
            }
            if (b!.id === "tab-friend-requests") {
              loadPendingRequests()
            }
          } else {
            b!.classList.remove("active")
            tabPanels[i]!.style.display = "none"
          }
        })
      })
    })
  }

 
export async function loadProfileStats(): Promise<void> {
  const winsElement = document.getElementById("wins-value")
  const lossesElement = document.getElementById("losses-value")

  if (!winsElement || !lossesElement) return

  try {
     
    const stats: ProfileStats = await authService.getProfileStats()
     

    winsElement.textContent = stats.games_won.toString()
    lossesElement.textContent = stats.lost_games.toString()
  } catch (error) {
    console.error("❌ Error cargando estadísticas:", error)
    winsElement.textContent = "0"
    lossesElement.textContent = "0"
  }
}

 
export async function loadMatchHistory(): Promise<void> {
  const matchesList = document.getElementById("matches-list")
  if (!matchesList) return

  try {
     
    const history: MatchHistory = await authService.getMatchHistory()
     

    if (history.length === 0) {
      matchesList.innerHTML = `
        <div class="no-matches">
          <p>${t('profile.noMatches')}</p> 
        </div>
      `
      return
    }

    matchesList.innerHTML = history
      .map((match) => {
        const resultClass = match.user.result
        const resultEmoji = match.user.result === "win" ? "🏆" : match.user.result === "loss" ? "😞" : "🤝"
        const opponentsText =
          match.opponents.length > 0
            ? match.opponents.map((opp) => (opp.display_name == null || opp.display_name.trim() === "" ? "?" : opp.display_name)).join(", ")
            : "?"

        const date = new Date(match.played_at)
        const formattedDate = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
        const formattedTime = date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        })

        return `
          <div class="match-item ${resultClass}">
            <div class="match-result">
              <span class="result-emoji">${resultEmoji}</span>
              <span class="result-text">${match.user.result.toUpperCase()}</span>
            </div>
            <div class="match-details">
              <span class="match-opponent">vs ${opponentsText}</span>
              <span class="match-score">${match.user.score}-${match.opponents.map((o) => o.score).join(", ")}</span>
            </div>
            <div class="match-date">
              <span class="date">${formattedDate}</span>
              <span class="time">${formattedTime}</span>
            </div>
          </div>
        `
      })
      .join("")
  } catch (error) {
    console.error("❌ Error cargando historial:", error)
    matchesList.innerHTML = `
      <div class="error-matches">
        <p>Failed to load match history. Please try again later.</p>
      </div>
    `
  }
}

 
export function updateProfileTwoFAStatus() {
  const user = authManager.getCurrentUser()
  if (!user) return

  const twoFAEnabled = user.twofa_enabled || false
   

  const twoFAStatus = document.getElementById("twofa-status")
  if (twoFAStatus) {
    twoFAStatus.textContent = twoFAEnabled ? `${t('profile.accountSettings.twoAuthentication.enable')}` : `${t('profile.accountSettings.twoAuthentication.disable')}`
  }

  const currentStatus = document.getElementById("twofa-current-status")
  if (currentStatus) {
    currentStatus.textContent = twoFAEnabled ? `🟢 ${t('profile.accountSettings.twoAuthentication.enable')}` : `🔴 ${t('profile.accountSettings.twoAuthentication.disable')}`
    currentStatus.className = `status-value ${twoFAEnabled ? "enabled" : "disabled"}`
  }

  const description = document.querySelector(".twofa-description p")
  if (description) {
    description.innerHTML = twoFAEnabled
      ? `${t('profile.accountSettings.twoAuthentication.currently')} <strong>${t('profile.accountSettings.twoAuthentication.enabled')}</strong>. ${t('profile.accountSettings.twoAuthentication.enableAccount')}`
                          : `${t('profile.accountSettings.twoAuthentication.currently')} <strong>${t('profile.accountSettings.twoAuthentication.disabled')}</strong>. ${t('profile.accountSettings.twoAuthentication.disableAccount')}`
  }

  const confirmBtn = document.getElementById("confirm-toggle-2fa-btn")
  if (confirmBtn) {
    confirmBtn.textContent = twoFAEnabled ? `${t('profile.accountSettings.twoAuthentication.disabledButton')}` : `${t('profile.accountSettings.twoAuthentication.enabledButton')}`
    confirmBtn.className = `toggle-2fa-btn ${twoFAEnabled ? "disable" : "enable"}`
  }
}

 
export async function loadPendingRequests(): Promise<void> {
  const user = authManager.getCurrentUser()
  if (!user) return

  const requestsList = document.getElementById("pending-requests-list")
  const pendingCount = document.getElementById("pending-count")

  if (!requestsList || !pendingCount) {
    console.warn("No requestsList or pendingCount element found for pending requests")
    return
  }

  try {
     
    const requests = await authService.getPendingRequests()
     

    pendingCount.textContent = requests.length.toString()

    if (requests.length === 0) {
      requestsList.innerHTML = `<p class="no-friends">${t('profile.noFriendRequests')}</p>`
      return
    }

    requestsList.innerHTML = requests
      .map(
        (request) => `
        <div class="friend-item request-item" data-username="${escapeHTML(request.display_name)}" data-user-id="${request.user_id}">
          <div class="request-info">
            <a href="/users/${escapeHTML(request.display_name)}" data-link class="friend-link">
              👤 ${escapeHTML(request.display_name)}
            </a>
          </div>
          <div class="request-actions">
            <button class="accept-request-btn styled-request-btn" data-username="${escapeHTML(request.display_name)}">
              ${t('profile.acceptButton')}
            </button>
            <button class="reject-request-btn styled-request-btn" data-username="${escapeHTML(request.display_name)}">
              ${t('profile.rejectButton')}
            </button>
          </div>
        </div>
      `,
      )
      .join("")

  setupRequestButtons()
  } catch (error) {
    console.error("❌ Error cargando solicitudes pendientes:", error)
    requestsList.innerHTML = `<p class="error-friends">${t('profile.failedFriendRequest')}</p>`
  }
}

 
function setupRequestButtons(): void {
  const user = authManager.getCurrentUser()
  if (!user) return

  document.querySelectorAll(".accept-request-btn, .reject-request-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const target = e.currentTarget as HTMLElement
      const username = target.getAttribute("data-username")
      if (!username) return

      const isAccept = target.classList.contains("accept-request-btn")
      const requestItem = target.closest(".request-item") as HTMLElement

      try {
        if (isAccept) {
          await authService.acceptFriendRequest(username, user.display_name)
           
          authService.getFriendsList().then((friends) => {
            const friendsCount = document.getElementById("friends-count")
            if (friendsCount) friendsCount.textContent = friends ? friends.length.toString() : "0"
          }).catch(() => {
            const friendsCount = document.getElementById("friends-count")
            if (friendsCount) friendsCount.textContent = "0"
          })
        } else {
          await authService.rejectOrRemoveFriend(username, user.display_name)
        }

         
        if (requestItem) {
          requestItem.remove()
        }

         
        const requestsList = document.getElementById("pending-requests-list")
        const pendingCount = document.getElementById("pending-count")
        if (requestsList && pendingCount) {
          const remaining = requestsList.querySelectorAll(".request-item").length
          pendingCount.textContent = remaining.toString()
          if (remaining === 0) {
            requestsList.innerHTML = `
              <div class="no-friends">
                <p>${t('profile.noFriendRequests')}</p>
              </div>
            `
          }
        }
      } catch (error) {
        console.error("❌ Error handling friend request:", error)
        alert("Failed to process request. Please try again.")
      }
    })
  })
}

 
export function setupPendingRequestsToggle(): void {
  const toggleButton = document.getElementById("toggle-requests-btn")
  const requestsList = document.getElementById("pending-requests-list")

  if (toggleButton && requestsList) {
    toggleButton.addEventListener("click", () => {
      const isHidden = requestsList.style.display === "none"
      requestsList.style.display = isHidden ? "block" : "none"
      toggleButton.textContent = `${isHidden ? "Hide" : "Show"} Pending Requests (${ 
        document.getElementById("pending-count")?.textContent || "0"
      })`
    })
  }
}

 
export async function loadFriendsList(): Promise<void> {
  const friendsList = document.getElementById("friends-list")
  if (!friendsList) return

  try {
    const friends = await authService.getFriendsList()
    
    const friendsCount = document.getElementById("friends-count")
    if (friendsCount) friendsCount.textContent = friends ? friends.length.toString() : "0"

    if (!friends || friends.length === 0) {
      friendsList.innerHTML = `<p class="no-friends">${t('profile.noFriends')}</p>`
      return ;
    }

    const friendsHTML = friends.map((friend) => `
      <div class="friend-item">
        <a href="/users/${escapeHTML(friend.display_name)}" data-link class="friend-link">
          👤 ${escapeHTML(friend.display_name)}
        </a>
      </div>
    `).join("")

    friendsList.innerHTML = friendsHTML
  } catch (error) {
    console.error("Error loading friends list:", error)
    friendsList.innerHTML = `<p class="error-friends">${t('profile.failedFriendsList')}</p>`
  }
}

 
export function setupFriendsListToggle(): void {
  const toggleButton = document.getElementById("toggle-friends-btn")
  const friendsList = document.getElementById("friends-list")

  if (toggleButton && friendsList) {
    toggleButton.addEventListener("click", () => {
      const isHidden = friendsList.style.display === "none"
      friendsList.style.display = isHidden ? "block" : "none"
      toggleButton.textContent = `${isHidden ? "Hide" : "Show"} Friends List`  
      
       
      if (isHidden && friendsList.children.length === 1 && friendsList.children[0].className === "loading-friends") {
        loadFriendsList()
      }
    })
  }
}