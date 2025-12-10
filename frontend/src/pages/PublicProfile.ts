 
import { authService } from "../services/authService"
import type { PublicProfileResponse } from "../types/shared"
import { authManager } from "../auth"
import { t } from '../languages/translation'
function escapeHTML(s: string) {
  const d = document.createElement("div")
  d.textContent = s
  return d.innerHTML
}

export default function PublicProfile(username: string): string {
  return `
    <div class="profile-page">
      <div class="profile-container">
        <button class="back-button" onclick="history.back()">${t('common.back')}</button>
        <div id="public-profile-content">
          <div class="profile-loading">
            <div class="spinner"></div>
            <p>${t('publicProfile.loading')}</p>
          </div>
        </div>
      </div>
    </div>
  `
}

function getFriendButton(status: string | undefined, displayName: string): string {
  const currentUser = authManager.getCurrentUser()
  if (!currentUser) return ""

  switch (status) {
    case "friends":
      return `
        <button class="friend-btn remove-friend" data-action="remove" data-username="${escapeHTML(displayName)}">
          ${t('publicProfile.removeFriend')}
        </button>
      `
    case "pending_sent":
      return `
        <div class="friend-status">
          <span class="status-text">${t('publicProfile.friendRequestSent')}</span>
        </div>
      `
    case "pending_received":
      return `
        <div class="friend-actions">
          <button class="friend-btn accept-friend" data-action="accept" data-username="${escapeHTML(displayName)}">
            ${t('publicProfile.acceptRequest')}
          </button>
          <button class="friend-btn reject-friend" data-action="reject" data-username="${escapeHTML(displayName)}">
            ${t('publicProfile.reject')}
          </button>
        </div>
      `
    default:
      return `
        <button class="friend-btn add-friend" data-action="add" data-username="${escapeHTML(displayName)}">
          ${t('publicProfile.addFriend')}
        </button>
      `
  }
}

function setupFriendButtons(): void {
  const currentUser = authManager.getCurrentUser()
  if (!currentUser) return

  document.querySelectorAll(".friend-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const target = e.currentTarget as HTMLElement
      const action = target.getAttribute("data-action")
      const username = target.getAttribute("data-username")

      if (!action || !username) return

      try {
        const currentUserName = currentUser.display_name

        switch (action) {
          case "add":
            await authService.sendFriendRequest(currentUserName, username)
            target.outerHTML = `
              <div class="friend-status">
                <span class="status-text">${t('publicProfile.friendRequestSent')}</span>
              </div>
            `
            break

          case "accept":
            await authService.acceptFriendRequest(username, currentUserName)
            target.parentElement!.outerHTML = `
              <button class="friend-btn remove-friend" data-action="remove" data-username="${escapeHTML(username)}">
                ${t('publicProfile.removeFriend')}
              </button>
            `
            setupFriendButtons()
            break

          case "reject":
            await authService.rejectOrRemoveFriend(username, currentUserName)
            target.parentElement!.outerHTML = `
              <button class="friend-btn add-friend" data-action="add" data-username="${escapeHTML(username)}">
                ${t('publicProfile.addFriend')}
              </button>
            `
            setupFriendButtons()
            break

          case "remove":
            await authService.rejectOrRemoveFriend(username, currentUserName)
            target.outerHTML = `
              <button class="friend-btn add-friend" data-action="add" data-username="${escapeHTML(username)}">
                ${t('publicProfile.addFriend')}
              </button>
            `
            setupFriendButtons()
            break
        }
      } catch (error) {
        console.error("❌ Error handling friend action:", error)
        alert("Failed to perform action. Please try again.")
      }
    })
  })
}

 
export async function loadPublicProfile(username: string): Promise<void> {
  const container = document.getElementById("public-profile-content")
  if (!container) return

  try {
     
    const profileData: PublicProfileResponse = await authService.getPublicProfile(username)
     

     
    container.innerHTML = `
      <div class="profile-header">
        <div class="avatar-wrapper">
          <div class="avatar">
            <img id="public-profile-avatar" />
            <div class="avatar-placeholder"></div>
          </div>
        </div>
        <div class="profile-info">
          <div class="username-container">
            <h1 class="username">${escapeHTML(profileData.user.display_name)}</h1>
          </div>
          <div class="user-stats user-stats-with-friends">
            <div class="stat">
              <span class="stat-value">${profileData.stats.games_won}</span>
              <span class="stat-label">${t('profile.wins')}</span>
            </div>
            <div class="stat">
              <span class="stat-value">${profileData.stats.lost_games}</span>
              <span class="stat-label">${t('profile.losses')}</span>
            </div>
            <div class="public-friend-actions">
              ${getFriendButton(profileData.friendship_status, profileData.user.display_name)}
            </div>
          </div>
        </div>
      </div>
      
      <div class="profile-sections">
        <div class="section">
          <h2>${t('profile.recentMatches')}</h2>
          <div class="matches-list">
            ${
              profileData.recent_matches.length === 0
                ? `<div class="no-matches"><p>${t('publicProfile.noMatches')}</p></div>`
                : profileData.recent_matches
                    .map((match) => {
                      const resultClass = match.user.result
                      const resultEmoji =
                        match.user.result === "win" ? "🏆" : match.user.result === "loss" ? "😞" : "🤝"
                      const opponentsText =
                        match.opponents.length > 0
                          ? match.opponents
                              .map((opp) => {
                                const name = opp.display_name == null || opp.display_name.trim() === "" ? "?" : opp.display_name
                                return escapeHTML(name)
                              })
                              .join(", ")
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
            }
          </div>
        </div>
      </div>
    `
     
    const img = document.getElementById("public-profile-avatar") as HTMLImageElement | null
    const placeholder = container.querySelector(".avatar-placeholder") as HTMLElement | null
    if (img) {
      img.onload = () => {
        if (placeholder) placeholder.style.display = "none"
      }
      img.onerror = () => {
        img.src = "/uploads/default.jpg"
      }
      img.src = profileData.user.avatar_url
    }

    setupFriendButtons()
  } catch (error) {
    console.error("❌ Error loading public profile:", error)
    container.innerHTML = `
      <div class="profile-error">
        <h2>${t('publicProfile.errorLoading.title')}</h2>
        <p>${t('publicProfile.errorLoading.subtitle')}</p>
      </div>
    `
  }
}
