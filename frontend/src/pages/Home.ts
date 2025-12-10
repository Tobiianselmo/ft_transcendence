 

 
import { t } from "../languages/translation"
import { authManager } from "../auth"
import { getSocket } from "../socket"
import { API_BASE_URL } from "../config/url"
import { escapeHTML, handleUserBlocked, handleUserUnblocked, attachBlockListener, attachUnblockListener, attachUserListener, updateChatInputState } from './Chat';

export let chatState = {
  generalChatId: null as number | null,
  currentChatId: null as number | null,
  userChats: [] as Array<{ chat_id: number; generalChat: boolean; other_display_name: string }>,
  socket: null as any,
  user: null as any,
  initialized: false as boolean,
  lastChatListAt: 0 as number,
  cleanupRegistered: false as boolean,
  abortController: null as AbortController | null,
  authListenerRegistered: false as boolean,
}

export default function Home(): string {
   
   
  if (window.location.pathname === '/' && (authManager.isAuthenticated() || authManager.hasLocalData())) {
     
    setTimeout(() => {
      initializeChatInHome()
    }, 100)
  }

   
  if (!chatState.authListenerRegistered) {
    chatState.authListenerRegistered = true
    authManager.onAuthChange(() => {
      if (window.location.pathname === '/' && authManager.isAuthenticated() && !chatState.initialized) {
         
        setTimeout(() => {
          initializeChatInHome()
        }, 100)
      }
    })
  }

  return `
    <div class="home-container">
      <div class="game-section">
        <div class="game-modes">
          <a href="/play" data-link class="game-mode-box quick-match">
            <div class="mode-icon">⚡</div>
            <span class="mode-title">${t("home.gameContainer.quickMatch.title")}</span>
            <p class="mode-subtitle">${t("home.gameContainer.quickMatch.subtitle")}</p>
          </a>
          
          <a href="/tournament" data-link class="game-mode-box tournament">
            <div class="mode-icon">🏆</div>
            <span class="mode-title">${t("home.gameContainer.tournament.title")}</span>
            <p class="mode-subtitle">${t("home.gameContainer.tournament.subtitle")}</p>
          </a>
        </div>
      </div>
      
      <div class="chat-section">
        <div class="chat-container">
          <div class="chat-left-panel">
            <div class="chat-header">
              <h3>${t("home.chat.header")}</h3>
            </div>
            
            <div class="new-chat-section">
              <button class="new-chat-toggle" id="new-chat-toggle">
                <span class="plus-icon">+</span>
                ${t("home.chat.newChatButton")}
              </button>
              <div class="new-chat-form" id="new-chat-form" style="display: none;">
                <input 
                  type="text" 
                  id="new-chat-username" 
                  class="new-chat-input" 
                  placeholder="${t("chat.newChat.usernamePlaceholder")}"
                />
                <div class="new-chat-buttons">
                  <button class="create-chat-btn" id="create-chat-btn">
                    ${t("chat.newChat.createButton")}
                  </button>
                  <button class="cancel-chat-btn" id="cancel-chat-btn">
                    ${t('common.cancel')}
                  </button>
                </div>
              </div>
            </div>
            
            <div id="chat-list" class="chat-list">
              <!-- Chat list will be populated here -->
            </div>
          </div>
          
          <div class="chat-right-panel">
            <div class="chat-main-header">
              <h3 id="current-chat-title">${t("chat.header")}</h3>
              <div class="chat-controls" id="chat-controls" style="display: none;">
                <button class="chat-control-btn users-btn" id="users-btn">
                  <span class="btn-icon">👥</span>
                  ${t('chat.usersBtn')}
                </button>
              </div>
            </div>
            
            <div id="chat-messages" class="chat-messages">
              <div class="welcome-message">
                <p>${t("chat.welcome")}</p>
              </div>
            </div>
            
            <div class="chat-input-container">

              <input 
                  type="text" 
                  class="chat-input" 
                  id="chat-input"
                  placeholder="${t('chat.inputPlaceholder')}" 
                  />

                  <button class="chat-send" id="chat-send-btn">
                  ${t("chat.sendButton")}
                  </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Modal -->
    <div class="modal-overlay" id="users-modal" style="display: none;">
      <div class="modal-content">
        <div class="modal-header">
          <h3>${t('chat.chatUsers')}</h3>
          <button class="modal-close" id="close-users-modal">&times;</button>
        </div>
        <div class="modal-body" id="users-list">
          <!-- Users list will be populated here -->
        </div>
      </div>
    </div>
  `
}

async function initializeChatInHome(): Promise<void> {
   

   
  registerHomeCleanup()

  chatState.user = authManager.getCurrentUser();
  chatState.socket = getSocket()
  
  if (!chatState.socket) {
    console.error("❌ [DEBUG] Socket not connected")
    return
  }
  
  if (!chatState.user) {
    console.error("❌ [DEBUG] User not authenticated")
    return
  }

   
  setUpSocketListeners();
  setupChatEventListeners();
  setupChatNotificationSystem();

   
  if (chatState.initialized) {
     
    return
  }

   
  
   
  loadChatListWhenReady();
  await updateChatHeader(`${t('chat.generalChat')}`, true)

   
  chatState.initialized = true
   

  function loadChatListWhenReady() {
    if (chatState.socket.connected) {
       
      loadChatList()
    } else {
       
      
      setTimeout(() => {
        if (chatState.socket.connected) {
           
          loadChatList()
        } else {
           
          chatState.socket.once('connect', () => {
             
            loadChatList()
          })
        }
      }, 100)
    }
  }
}

async function setupChatEventListeners(): Promise<void> {
   

  attachUserListener();
  const newChatToggle = document.getElementById("new-chat-toggle")
  const newChatForm = document.getElementById("new-chat-form")

  newChatToggle?.addEventListener("click", () => {
    const isVisible = newChatForm?.style.display !== "none"
    if (newChatForm) {
      newChatForm.style.display = isVisible ? "none" : "block"
    }
  })

  const createChatBtn = document.getElementById("create-chat-btn")
  const cancelChatBtn = document.getElementById("cancel-chat-btn")
  const newChatInput = document.getElementById("new-chat-username") as HTMLInputElement

  cancelChatBtn?.addEventListener("click", () => {
    newChatInput.value = ""
    if (newChatForm) {
      newChatForm.style.display = "none"
    }
  })

   
  let creating = false
  createChatBtn?.addEventListener("click", async () => {
    if (creating) return
    creating = true
    const username = newChatInput?.value.trim()
    if (!username) return

    const csrf = await getCsrfFromCookie()
    if (!csrf) {
      showNotification(`${t('notifications.missingToken')}`, "error")
      return
    }

    if (!localStorage.getItem("csrfToken")) {
      localStorage.setItem("csrfToken", csrf)
    }      

    try {
      chatState.abortController?.abort()
      chatState.abortController = new AbortController()
      const signal = chatState.abortController.signal
      const res = await fetch(
        `${API_BASE_URL}/friends/search?displayName=${encodeURIComponent(username)}`,
        {
          method: "GET",
          credentials: "include",
          cache: "no-store",
          headers: { "X-CSRF-Token": csrf },
          signal,
        }
      )

      if (!res.ok) {
        const txt = await res.text()
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
        signal,
      })

      if (chatRes.ok) {
        showNotification(`${t("chat.notifications.success.chatCreatedWith")} ${username}!`, "success")
        loadChatList()
      } else {
        const txt = await chatRes.text()
        showNotification(`${t("chat.notifications.error.creatingChat")}`, "error")
      }
    } catch (e) {
      showNotification(`${t("chat.notifications.error.network")}`, "error")
    } finally {
      newChatInput.value = ""
      const form = document.getElementById("new-chat-form")
      if (form) form.style.display = "none"
      creating = false
    }
  });

  document.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement
    const chatItem = target.closest(".chat-list-item") as HTMLElement

    if (chatItem) {
      const newChatId = Number(chatItem.dataset.chatId)
      const isGeneral = chatItem.dataset.isGeneral === "true"

      if (newChatId !== chatState.currentChatId) {
        chatState.currentChatId = newChatId
        loadMessages(chatState.currentChatId)
        renderChatList()
        if (isGeneral){
          await updateChatHeader(`${t('chat.generalChat')}`, true)
        } else {
          await updateChatHeader(chatItem.querySelector(".chat-name")?.textContent || "Chat", isGeneral)
        }
      }
    }
  })

  const sendBtn = document.getElementById("chat-send-btn")
  const chatInput = document.getElementById("chat-input") as HTMLInputElement

  const sendMessage = () => {
    const message = chatInput?.value.trim()
    if (message) {
       
      chatState.socket.emit("sendMessage", { chatId: chatState.currentChatId, content: message })
      chatInput.value = ""
    }
  }

  sendBtn?.addEventListener("click", sendMessage)
  chatInput?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage()
  })
}

function setupChatNotificationSystem(): void {
   

  chatState.socket.on(
    "chatInvitation",
    (data: {
      chat_id: number
      from_user: string
      from_user_id: number
      message: string
    }) => {
      chatState.socket.emit('joinChat', data.chat_id);
      loadChatListWhenReady()
    },
  )

  chatState.socket.on("notification", (data: { message: string; type: string }) => {
    showNotification(data.message, data.type as any)
  })

  chatState.socket.on('error', (data: { message: string }) => {
    showNotification(data.message, "error");
  })
}

function loadChatListWhenReady() {
  if (chatState.socket.connected) {
     
    loadChatList()
  } else {
     
    
    setTimeout(() => {
      if (chatState.socket.connected) {
         
        loadChatList()
      } else {
         
        chatState.socket.once('connect', () => {
           
          loadChatList()
        })
      }
    }, 100)
  }
}

function loadMessages(chatId: number): void {

  if (chatId == null) return
   
  chatState.socket.emit("getMessages", chatId)
  chatState.socket.once("messagesList", (messages: Array<{ content: string; from_name: string }>) => {
     
    const chatMessages = document.getElementById("chat-messages")
    if (!chatMessages) {
       
      return
    }

    chatMessages.innerHTML = '';
    if (messages.length === 0) {
      const wrapper = document.createElement('div');
      wrapper.className = 'welcome-message';
      const p = document.createElement('p');
      p.textContent = t('chat.noMessages');
      wrapper.appendChild(p);
      chatMessages.appendChild(wrapper);
    } else {
      const welcomeMsg = chatMessages.querySelector('.welcome-message');
      if (welcomeMsg) {
        welcomeMsg.remove();
      }
      
      for (const msg of messages) {
        chatMessages.appendChild(createMessageElement(msg.content, msg.from_name));
      }
    }
    chatMessages.scrollTop = chatMessages.scrollHeight
  })
}

async function updateChatHeader(chatName: string, isGeneral: boolean): Promise<void> {
   

  const titleElement = document.getElementById("current-chat-title")
  const controlsElement = document.getElementById("chat-controls")

  if (!titleElement) return

  if (isGeneral) {
    titleElement.textContent = chatName

    if (controlsElement) {
      controlsElement.style.display = "flex";
      controlsElement.innerHTML = `
        <button class="chat-control-btn users-btn" id="users-btn">
          <span class="btn-icon">👥</span>
            ${t('chat.usersBtn')}
          </button>
        `
    }
    attachUserListener();
    updateChatInputState(false);
  } else {
    const safe = escapeHTML(chatName)

    const blocked = await new Promise<{ isBlocked: boolean, blockedUser: string | null }>((resolve) => {
      chatState.socket.off('isBlockedResponse')
      
      chatState.socket.once('isBlockedResponse', (data: { isBlocked: boolean, blockedUser: string | null }) => {
        resolve({ isBlocked: data.isBlocked, blockedUser: data.blockedUser })
      })
      
      chatState.socket.emit('isBlocked', chatName)
    })

    const onlineStatus = await new Promise<{ online: boolean }>((resolve) => {
      chatState.socket.off('onlineStatusResponse');
      chatState.socket.once('onlineStatusResponse', (u: { online: boolean }) => {
        resolve(u);
      });
      chatState.socket.emit('getOnlineStatus', chatName);
    });

    let button = `<button class="block-user-btn" id="block-user-btn" data-username="${safe}">${t('chat.blockBtn')}</button>`;

    if (blocked.isBlocked && blocked.blockedUser != null && blocked.blockedUser === chatState.user?.display_name) {
       
      button = `<button class="im-blocked-btn" id="im-blocked-btn" data-username="${safe}">${t('chat.blocked')}</button>`
    } else if (blocked.isBlocked){
      button = `<button class="unblock-user-btn" id="unblock-user-btn" data-username="${safe}">${t('chat.unblockBtn')}</button>`;
    }

    updateChatInputState(blocked.isBlocked);

    titleElement.innerHTML = `
      <div class="chat-header-private">
        <a href="/users/${encodeURIComponent(chatName)}"
            data-link
            class="chat-header-user-link"
            title="View profile">
            ${safe}
        </a>
        <span class="status-dot ${onlineStatus.online ? 'online' : 'offline'}"></span>
      </div>
      `
    if (controlsElement) {
      controlsElement.style.display = "flex"
      controlsElement.innerHTML = `
        <div class="chat-header-buttons">
          ${button}
        </div>
      `
    }


    attachBlockListener(chatName);
    attachUnblockListener(chatName);

    const blockedBtn = document.getElementById('im-blocked-btn');
    blockedBtn?.addEventListener("click", () => {
      showNotification(`${t('notifications.blockedBy')} ${chatName}. ${t('notifications.youCant')}`, "error")
    });
  }
}

function createMessageElement(content: string, fromName: string): HTMLDivElement {
  const container = document.createElement('div');
  container.className = 'chat-message-container';
  const contentDiv = document.createElement('div');
  contentDiv.className = 'chat-message-content';
  
   
  const inviteRegex = /Join room code: ([a-zA-Z0-9]+)/;
  const match = content.match(inviteRegex);

  if (match) {
    const roomId = match[1];
    const preText = content.substring(0, match.index);
    
    contentDiv.appendChild(document.createTextNode(preText));
    const joinLink = document.createElement('a');
    joinLink.href = `/play/online/1vs1/join?room=${roomId}`;
    joinLink.className = 'join-game-btn';
    joinLink.textContent = `${roomId}`;
    joinLink.setAttribute('data-link', '');
    joinLink.style.display = 'inline-block';
    joinLink.style.marginTop = '5px';
    joinLink.style.padding = '5px 10px';
    joinLink.style.backgroundColor = '#4CAF50';
    joinLink.style.color = 'white';
    joinLink.style.textDecoration = 'none';
    joinLink.style.borderRadius = '4px';
    joinLink.style.fontWeight = 'bold';
    
    contentDiv.appendChild(joinLink);
  } else {
    contentDiv.textContent = content;
  }

  const senderDiv = document.createElement('div');
  senderDiv.className = 'chat-message-sender';
  senderDiv.textContent = fromName;
  container.appendChild(contentDiv);
  container.appendChild(senderDiv);
  return container;
}

function addMessageToChat(data: { content: string; from_name: string; chat_id: number }): void {
   
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) {
    console.error(' Chat messages container not found when adding message');
    return;
  }
  
  const welcomeMsg = chatMessages.querySelector('.welcome-message');
  if (welcomeMsg) {
    welcomeMsg.remove();
  }
  
  chatMessages.appendChild(createMessageElement(data.content, data.from_name));
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function renderChatList(): void {
   
  const chatListDiv = document.getElementById("chat-list")
  if (!chatListDiv) {
     
    return
  }

   
  
  const renderedHTML = chatState.userChats.map(chat => `
    <button class="chat-list-item${chat.chat_id === chatState.currentChatId ? " active" : ""}" 
            data-chat-id="${chat.chat_id}"
            data-is-general="${chat.generalChat}">
      <div class="chat-item-content">
        <span class="chat-name">${chat.other_display_name}</span>
        ${chat.generalChat ? '<span class="general-badge">General</span>' : ""}
      </div>
    </button>`).join("")
  chatListDiv.innerHTML = renderedHTML
}

export async function loadChatList(): Promise<void> {
  if (!chatState.socket.connected) {
     
    return
  }
  
   
  
  chatState.socket.off('chatListResponse')
  
   
  const now = Date.now()
  const MIN_INTERVAL_MS = 150
  if (now - chatState.lastChatListAt < MIN_INTERVAL_MS) {
     
    return
  }
  chatState.lastChatListAt = now
  const timeout = setTimeout(() => {
    if (chatState.socket.connected) {
      loadChatList()
    } else {
      chatState.socket.once('connect', () => {
         
        loadChatList()
      })
    }
  }, 500)
  
  chatState.socket.once(
    "chatListResponse",
    async (chats: Array<{ chat_id: number; generalChat: boolean; other_display_name: string }>) => {
      clearTimeout(timeout)
       
      
      chatState.userChats = chats
  
      if (chats.length === 0) {
        setTimeout(() => {
          if (chatState.socket.connected) {
            chatState.socket.emit("chatList", chatState.user?.user_id)
          }
        }, 500)
        return
      }

      if (!chatState.generalChatId) {
        const general = chats.find(c => c.generalChat)
        if (general) {
          chatState.generalChatId = general.chat_id
        }
      }

      if (chatState.currentChatId == null && chatState.generalChatId != null) {
        chatState.currentChatId = chatState.generalChatId
        loadMessages(chatState.currentChatId)
        await updateChatHeader(`${t('chat.generalChat')}`, true)

      }
       
      renderChatList()
    },
  )
  chatState.socket.emit("chatList", chatState.user?.user_id)
}

export function setCurrentChatNull(): void {
  chatState.currentChatId = null;
}

function registerHomeCleanup(): void {
  if (chatState.cleanupRegistered) return
  ;(window as any).__pageCleanup = () => {
    try {
      chatState.abortController?.abort()
      chatState.abortController = null
       
      if (chatState.socket) {
        chatState.socket.off('chatInvitation')
        chatState.socket.off('notification')
        chatState.socket.off('chatCreated')
        chatState.socket.off('chatCreationError')
        chatState.socket.off('newMessage')
        chatState.socket.off('generalChatCreated')
        chatState.socket.off('userUpdated')
        chatState.socket.off('userBlocked')
        chatState.socket.off('userUnblocked')
        chatState.socket.off('connect')
        chatState.socket.off('disconnect')
      }
       
      chatState.initialized = false
    } catch {}
  }
  chatState.cleanupRegistered = true
}

function getNotificationIcon(type: "success" | "error" | "info"): string {
  switch (type) {
    case "success":
      return "✅"
    case "error":
      return "❌"
    case "info":
    default:
      return "ℹ️"
  }
}

export function showNotification(message: string, type: "success" | "error" | "info" = "info"): void {
  if (!message || message === "undefined") {
    return
  }

  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${getNotificationIcon(type)}</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close">&times;</button>
    </div>
  `

  document.body.appendChild(notification)

  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove()
    }
  }, 500)

   
  notification.querySelector(".notification-close")?.addEventListener("click", () => {
    if (notification.parentNode) {
      notification.remove()
    }
  })
}

function setUpSocketListeners(): void {
  if (chatState.socket) {
    chatState.socket.off('chatInvitation');
    chatState.socket.off('notification');
    chatState.socket.off('chatCreated');
    chatState.socket.off('chatCreationError');
    chatState.socket.off('newMessage');
    chatState.socket.off('generalChatCreated');
    chatState.socket.off('userUpdated');
    chatState.socket.off('userBlocked');
    chatState.socket.off('userUnblocked');
    
    chatState.socket.on('userBlocked', handleUserBlocked);
    chatState.socket.on('userUnblocked', handleUserUnblocked);
    
    chatState.socket.on('connect', () => {
       
      loadChatList()
    })

    chatState.socket.on('youAreBlocked', (data: { username: string }) => {
      if (window.location.pathname == '/') {
        updateChatHeader(data.username, false);
        loadChatList();
      }
      showNotification(`${t('notifications.blockedBy')} ${data.username}. ${t('notifications.youCant')}`, "error")
    })

    chatState.socket.on('youAreUnblocked', (data: { username: string }) => {
      if (window.location.pathname == '/') {
        updateChatHeader(data.username, false);
        loadChatList();
      }
      showNotification(`${t('notifications.unblockedBy')} ${data.username}. ${t('notifications.youCan')}`, "success")
    })
    
    chatState.socket.on('disconnect', () => {
       

      setTimeout(() => {
         
        chatState.socket = getSocket()
        if (chatState.socket && chatState.socket.connected) {
           
          loadChatList()
        }
      }, 200)
    })

    chatState.socket.on('generalChatCreated', async (data: { chat_id: number; creator: string }) => {
      chatState.generalChatId = data.chat_id

      if (!chatState.currentChatId) {
        chatState.currentChatId = data.chat_id;
        loadMessages(chatState.currentChatId);
        await updateChatHeader(`${t('chat.generalChat')}`, true)
      }
      
      setTimeout(() => {
        loadChatList();
      }, 150);
    })
    
    chatState.socket.on('userUpdated', (data: { userId: number, updateType: string, newValue: string, online: boolean }) => {
      if (window.location.pathname === '/') {
        
        setTimeout(() => {
          loadChatList();

          const usersModal = document.getElementById('users-modal')
          if (usersModal && usersModal.style.display === 'flex') {
             
            const usersList = document.getElementById('users-list');

            if (usersList) {
              chatState.socket.emit("generalUsers");
              chatState.socket.off("generalUsersResponse");
              chatState.socket.on("generalUsersResponse", (data: Array<{display_name: string; online: boolean}>) => {
                if (!usersList) return;

                 
                if (data.length === 0) {
                  usersList.innerHTML = `<p>${t('chat.noUser')}</p>`; 
                } else {
                  usersList.innerHTML = data.map(u => `
                    <div class="user-row">
                      <span>${u.display_name}</span>
                      <span class="status-dot ${u.online ? 'online' : 'offline'}"></span>
                    </div>
                  `).join("");
                }
                 
              });
            }
          }
        }, 100)
        if (data.updateType === 'status') {
          const chat = chatState.userChats.find(c => c.chat_id === chatState.currentChatId);
          updateChatHeader(chat?.other_display_name || '', false);
        }
      }
    })

    chatState.socket.on("newMessage", (data: { content: string; from_name: string; chat_id: number }) => {
       
      if (data.chat_id === chatState.currentChatId) {
        addMessageToChat(data)
      }
    })

    chatState.socket.on(
      "chatCreated",
      (data: { chat_id: number; other_display_name: string; success: boolean; message: string }) => {
         
        if (data.success) {
          showNotification(`${t('chat.notifications.success.chatCreatedWith')} ${data.other_display_name}!`, "success")
          loadChatList()
        } else {
          showNotification(data.message, "error") 
        }
      },
    )

    chatState.socket.on("chatCreationError", (data: { message: string }) => {
       
      showNotification(data.message, "error")  
    })
  }
}

export async function getCsrfFromCookie(retries = 10, delay = 1000): Promise<string> {
  for (let i = 0; i < retries; i++) {
    const entry = document.cookie.split("; ").find(c => c.startsWith("csrf_token="));
    if (entry) {
      return decodeURIComponent(entry.split("=")[1]);
    }

    await new Promise(resolve => setTimeout(resolve, delay));
  }
  return "";
}