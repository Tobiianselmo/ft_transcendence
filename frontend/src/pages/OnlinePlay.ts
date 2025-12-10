import { GamePageBuilder } from "../builders/GamePageBuilder"
import { t } from '../languages/translation'
import { API_BASE_URL } from '../config/url'
import { getSocket } from '../socket'
import { loadChatList, showNotification, getCsrfFromCookie } from './Home'

export function showOnlineOptions(): string {
  return GamePageBuilder.buildGameModePage({
	title: `${t('game.onlineGame.title')}`,
	backHref: "/play",
	backText: `${t('game.backGameArena')}`,
	modes: [
	  {
      href: "/play/online/1vs1",
      className: "online-1v1",
      icon: "⚔️",
      title: `${t('game.onlineGame.onevsoneButton.title')}`,
      description: `${t('game.onlineGame.onevsoneButton.description')}`,
	  },
	],
  })
}

export function showOnline1v1Options(): string {
  return GamePageBuilder.buildGameModePage({
	title: `${t('game.onlineGame.onevsoneButton.title')}`,
	backHref: "/play/online",
	backText: `${t('game.onlineGame.backToMenu')}`,
	modes: [
	  {
      href: "/play/online/1vs1/create",
      className: "random-match",
      icon: "🛠️",
      title: `${t('game.common.createMatch')}`,
      description: `${t('game.common.createMatchDescription')}`,
	  },
	  {
      href: "/play/online/1vs1/join",
      className: "search-match",
      icon: "🔍",
      title: `${t('game.onlineGame.joinMatch.title')}`,
      description: `${t('game.onlineGame.joinMatch.subtitle')}`,
	  },
	],
  })
}

export function showCreateMatch(): string {
  return `
    <div class="play-page">
      <div class="game-arena">
        <h1 class="play-title">⚔️${t('game.common.createOneVsOneMatchButton')}</h1>
        <div id="play-content" class="play-content">
          <button class="back-button" data-link href="/play/online/1vs1">${t('game.onlineGame.backToOneVsOneMenu')}</button>
          <div class="config-container fade-in">
            <div class="config-section">
              <h3 class="config-title">${t('game.common.configTitle')}</h3>
              <div class="config-options">
                <label class="config-option">
                  <input type="radio" name="difficulty" value="easy" checked>
                  <span class="option-card easy">
                    <span class="option-icon">🟢</span>
                    <span class="option-title">${t('game.difficulty.easy.title')}</span>
                    <span class="option-description">${t('game.difficulty.easy.description')}</span>
                  </span>
                </label>
                
                <label class="config-option">
                  <input type="radio" name="difficulty" value="medium">
                  <span class="option-card medium">
                    <span class="option-icon">🟡</span>
                    <span class="option-title">${t('game.difficulty.medium.title')}</span>
                    <span class="option-description">${t('game.difficulty.medium.description')}</span>
                  </span>
                </label>
                
                <label class="config-option">
                  <input type="radio" name="difficulty" value="hard">
                  <span class="option-card hard">
                    <span class="option-icon">🔴</span>
                    <span class="option-title">${t('game.difficulty.hard.title')}</span>
                    <span class="option-description">${t('game.difficulty.hard.description')}</span>
                  </span>
                </label>
              </div>
            </div>
            
            <div class="config-section">
              <h3 class="config-title">${t('game.common.scoreLimitTitle')}</h3>
              <div class="score-selector">
                <label>${t('game.common.playUntil')}:</label>
                <select id="scoreLimit" class="score-dropdown">
                  <option value="1">1 ${t('game.common.point')}</option>
                  <option value="2">2 ${t('game.common.points')}</option>
                  <option value="3" selected>3 ${t('game.common.points')}</option>
                  <option value="4">4 ${t('game.common.points')}</option>
                  <option value="5">5 ${t('game.common.points')}</option>
                </select>
                <span class="score-description">${t('game.common.pointToWin')}</span>
              </div>
            </div>
            
            <div class="config-actions">
              <button class="btn-cancel" data-link href="/play/online/1vs1">${t('common.cancel')}</button>
              <button class="btn-start-game" id="btn-start-game">${t('game.onlineGame.chooseFriend.button')}</button>
            </div>
            <div id="create-error" style="color:#ff6b6b; margin-top:8px;"></div>
          </div>
        </div>
      </div>
    </div>
  `
}

export function chooseFriend(): string {
   
  return `
    <div class="play-page">
      <div class="game-arena">
        <h1 class="play-title">${t('game.onlineGame.chooseFriend.title')}</h1>
        <div id="play-content" class="play-content">
          <button class="back-button" data-link href="/play/online/1vs1/create">${t('game.backToConfig')}</button>
          <div class="section">
            <div class="social-tab-content">
              <div id="social-search-users" class="social-tab-panel" style="display: block;">
                <div class="search-container">
                  <input 
                    type="text" 
                    id="new-chat-username" 
                    class="search-input" 
                    placeholder="${t('game.onlineGame.chooseFriend.placeHolder')}"
                    autocomplete="off"
                  />
                  <div id="search-results" class="search-results" style="display: none;"></div>
                </div>
              </div>
            </div>
            <div class="social-tabs">
              <button class="social-tab-btn" id="invite-to-game-btn" data-tab="search-users">${t('game.onlineGame.chooseFriend.searchBtn')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

export  async function mountChooseFriend(): Promise<void> {
  const { WebSocketTransport } = await import('../game/net/WebSocketTransport')
  const transport = new WebSocketTransport()
  let isConnected = false
  try {
    await transport.connect()
    isConnected = true
     
  } catch (e) {
    const err = document.getElementById('create-error')
    if (err) err.textContent = `${t('errors.game.notConnected')}`
     
  }

  const newChatInput = document.getElementById("new-chat-username") as HTMLInputElement
  const inviteToGame = document.getElementById('invite-to-game-btn')
  
  inviteToGame?.addEventListener('click', async () => {
    const username = newChatInput?.value.trim()
    if (!username) return

     

    const csrf = await getCsrfFromCookie()
    if (!csrf) {
      console.error("CSRF cookie missing")
      return
    }

    if (!localStorage.getItem("csrfToken")) {
      localStorage.setItem("csrfToken", csrf)
    }      

    try {
      const res = await fetch(
        
         
        `${API_BASE_URL}/friends/search?displayName=${encodeURIComponent(username)}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: { "X-CSRF-Token": csrf },
        },
      )

      if (!res.ok) {
        const txt = await res.text()
          console.error("Search user error:", res.status, txt)
        showNotification(`${t("chat.notifications.error.searchingUser")}`, "error")
        return
      }

      const foundUser = await res.json()
       
      
       
      const chatRes = await fetch(`${API_BASE_URL}/chats`, {
        method: "POST",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": await getCsrfFromCookie(),  
        },
        body: JSON.stringify({ otherUserId: foundUser.user_id }),
      })

      const chatData = await chatRes.json()
       

      transport.onCreated = async ({ roomId, config }) => {
         
        const socket = getSocket()
        let message = `You are invited to a Pong match! Join room code: ${roomId}` 
        
        if (chatData.isBlocked && chatData.blockedUser === foundUser.display_name) {
          showNotification(`You have ${foundUser.display_name} blocked. You cannot send messages to them. Unblock them to play online`, "error");
          return ;
        } else if (chatData.isBlocked){
          showNotification(`You have been blocked by ${foundUser.display_name}. You cannot send messages to them.`, "error");
          return ;         
        }

        socket.emit("sendMessage", { chatId: chatData.chatId, content: message })
         

        ;(async () => {
          const { startOnline1v1WithTransport } = await import('../game/Online1v1Game')
          startOnline1v1WithTransport(transport, { roomId, config })
          
          const playContent = document.getElementById('play-content')
          if (playContent) {
            if (getComputedStyle(playContent).position === 'static') {
              playContent.style.position = 'relative'
            }
            let overlay = document.getElementById('online-wait-overlay') as HTMLDivElement | null
            if (!overlay) {
              overlay = document.createElement('div')
              overlay.id = 'online-wait-overlay'
              overlay.style.position = 'absolute'
              overlay.style.left = '0'
              overlay.style.top = '0'
              overlay.style.right = '0'
              overlay.style.bottom = '0'
              overlay.style.display = 'flex'
              overlay.style.alignItems = 'center'
              overlay.style.justifyContent = 'center'
              overlay.style.background = 'rgba(0,0,0,0.7)'
              overlay.style.zIndex = '10'
              playContent.appendChild(overlay)
            }
            overlay.innerHTML = `
              <div style="text-align:center; color:#fff;">
                <div style="font-size:3rem; margin-bottom:8px;">⏳</div>
                <h2>${t('game.onlineGame.waitingPlayer')}</h2>
              </div>`
          }
        })()
      }

      transport.onReady = () => {
         
        const overlay = document.getElementById('online-wait-overlay')
        if (overlay && overlay.parentElement) {
          overlay.parentElement.removeChild(overlay)
        }
      }

      transport.onStart = (data) => {
         
        const overlay = document.getElementById('online-wait-overlay')
        if (overlay && overlay.parentElement) {
          overlay.parentElement.removeChild(overlay)
        }
      }

      const gameConfig = localStorage.getItem('gameConfig')
      if (gameConfig) {
        const { difficulty, scoreLimit } = JSON.parse(gameConfig)
        transport.createMatch({ difficulty, scoreLimit })
      } else {
        transport.createMatch({ difficulty: 'medium', scoreLimit: 3 })
      }

      try {
        loadChatList()
      } catch (e) {
         
      }
    } catch (e) {
      console.error("Network error:", e)
       
    } finally {
      newChatInput.value = ""
      const form = document.getElementById("new-chat-form")
      if (form) form.style.display = "none"
    }
  });
}

export function mountCreateMatch(): void {
  const btnStart = document.getElementById('btn-start-game')

  btnStart?.addEventListener('click', async () => {
    const difficultyRadios = document.querySelectorAll('input[name="difficulty"]') as NodeListOf<HTMLInputElement>
    let difficulty: 'easy'|'medium'|'hard' = 'medium'
    for (const r of difficultyRadios) if (r.checked) difficulty = r.value as any
    const scoreSel = document.getElementById('scoreLimit') as HTMLSelectElement | null
    const scoreLimit = Math.max(1, Math.min(21, Number(scoreSel?.value || 3)))

    localStorage.setItem('gameConfig', JSON.stringify({
      difficulty: difficulty,
      scoreLimit: scoreLimit
    }))

    window.history.pushState({}, '', '/play/online/1vs1/create/chooseFriend')
    window.dispatchEvent(new PopStateEvent('popstate'))
  });
}

export function showJoinMatch(): string {
  return `
    <div class="play-page">
      <div class="game-arena">
        <h1 class="play-title">${t('game.onlineGame.joinMatch.secondTitle')}</h1>
        <div id="play-content" class="play-content">
          <button class="back-button" data-link href="/play/online/1vs1">${t('game.onlineGame.backToOneVsOneMenu')}</button>
          <div class="player-search-container fade-in">
            <div class="search-form">
              <h2 class="search-title">${t('game.onlineGame.enterRoomCode')}</h2>
              <div class="search-input-container">
                <input type="text" id="join-room-code" class="player-search-input" placeholder="ABCDE..." />
                <button class="search-btn" id="join-match-btn">${t('game.onlineGame.joinMatch.join')}</button>
              </div>
            </div>
            <div id="join-result" class="results-header" style="margin-top: 16px;"></div>
          </div>
        </div>
      </div>
    </div>
  `
}

export function mountJoinMatch(): void {
  requestAnimationFrame(async () => {
     
    const btn = document.getElementById('join-match-btn') as HTMLButtonElement | null
    const code = document.getElementById('join-room-code') as HTMLInputElement | null
    if (!btn || !code) {
      console.warn('[online] No se encontró el botón o input de código en Join')
      return
    }
    code.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        btn.click()
      }
    })
    const { WebSocketTransport } = await import('../game/net/WebSocketTransport')
    const transport = new WebSocketTransport()
    try {
      await transport.connect()
       

       
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam) {
          code.value = roomParam;
           
          transport.joinMatch(roomParam);
      }

    } catch (e) {
      console.error('[online] (join) Error conectando transporte:', e)
      const result = document.getElementById('join-result')
      if (result) result.textContent = `${t('errors.game.tryAgain')}`
    }
    transport.onJoinError = ({ message }) => {  
      console.warn('[online] (join) Error al unirse:', message)
      const result = document.getElementById('join-result')
      if (result) result.textContent = message
    } 
    transport.onReady = (payload) => {
       
      const result = document.getElementById('join-result')
      if (result) result.textContent = `${t('game.joined')}`
      ;(async () => {
        const { startOnline1v1WithTransport } = await import('../game/Online1v1Game')
        startOnline1v1WithTransport(transport, { roomId: payload.roomId, meIndex: 1 as any })
      })()
    }
    transport.onStart = (data) => {
       
      const result = document.getElementById('join-result')
      if (result) result.textContent = ''
    }
    btn.addEventListener('click', () => {
      const roomId = (code.value || '').trim().toUpperCase()
      if (!roomId) return
       
      transport.joinMatch(roomId)
      const result = document.getElementById('join-result')
      if (result) result.textContent = `${t('game.joining')}`
      
      setTimeout(() => {
        const msg = document.getElementById('join-result')
        if (msg && msg.textContent === `${t('game.joining')}`) {
          console.warn('[online] (join) Timeout esperando inicio de partida')
          msg.textContent = `${t('errors.game.notStarted')}`
        }
      }, 8000)
    })
  })
}

export function startOnlineGame(mode: string): string {
  const modeTitle = mode === "quick" ? "Quick Match" : "Ranked Match"
  return `
	<div class="play-page">
	  <div class="game-arena">
		<h1 class="play-title">${t('game.header')}</h1>
		<div id="play-content" class="play-content">
		  <button class="back-button" data-link href="/play/online">${t('game.backToOnlineModes')}</button>
		  <div class="game-starting fade-in">
			<div class="game-board online">
			  <h2 class="section-title">${t('game.common.configuredGame.starting')} ${modeTitle}</h2>
			  <div class="game-placeholder">
				<div class="game-icon">🌐</div>
				<p>${t('game.onlineGame.searchingForOpponents')}</p>
				<div class="loading-bar">
				  <div class="loading-progress online"></div>
				</div>
				<p style="margin-top: 1rem; font-size: 0.9rem; color: rgba(255, 255, 255, 0.5);">
				  ${t('game.onlineGame.playersFound')} <span style="color: #00d4ff;">2/4</span>
				</p>
			  </div>
			</div>
		  </div>
		</div>
	  </div>
	</div>
  `
}
