import { showNotification, chatState } from './Home';
import { t } from '../languages/translation';

export async function handleUserBlocked(data: { username: string }): Promise<void> {
    const titleElement = document.getElementById("current-chat-title");
    const controlsElement = document.getElementById("chat-controls");
    
    const onlineStatus = await new Promise<{ online: boolean }>((resolve) => {
      chatState.socket.off('onlineStatusResponse');
      chatState.socket.once('onlineStatusResponse', (u: { online: boolean }) => {
        resolve(u);
      });
      chatState.socket.emit('getOnlineStatus', data.username);
    });

    if (titleElement && isCurrentChatUser(data.username)) {
        const safe = escapeHTML(data.username);

        titleElement.innerHTML = `
        <div class="chat-header-private">
            <a href="/users/${encodeURIComponent(data.username)}"
                data-link
                class="chat-header-user-link"
                title="View profile">
                ${safe}
            </a>
            <span class="status-dot ${onlineStatus.online ? 'online' : 'offline'}"></span>
        </div> `

        if (controlsElement) {
            controlsElement.style.display = "flex"
            controlsElement.innerHTML = `
                <div class="chat-header-buttons">
                    <button class="block-user-btn" id="unblock-user-btn" data-username="${safe}">${t('chat.unblockBtn')}</button>
                </div>
            `
        }

        attachUnblockListener(data.username);
        updateChatInputState(true);
    }
    showNotification(`${data.username} ${t('notifications.userBlocked')}`, "success");
}

export async function handleUserUnblocked(data: {username: string}): Promise<void> {
    const titleElement = document.getElementById("current-chat-title");
    const controlsElement = document.getElementById("chat-controls");

    const onlineStatus = await new Promise<{ online: boolean }>((resolve) => {
      chatState.socket.off('onlineStatusResponse');
      chatState.socket.once('onlineStatusResponse', (u: { online: boolean }) => {
        resolve(u);
      });
      chatState.socket.emit('getOnlineStatus', data.username);
    });
    
    if (titleElement && isCurrentChatUser(data.username)) {
        const safe = escapeHTML(data.username);

        titleElement.innerHTML = `
        <div class="chat-header-private">
            <a href="/users/${encodeURIComponent(data.username)}"
                data-link
                class="chat-header-user-link"
                title="View profile">
                ${safe}
            </a>
            <span class="status-dot ${onlineStatus.online ? 'online' : 'offline'}"></span>
        </div> `
        
        if (controlsElement) {
            controlsElement.style.display = "flex"
            controlsElement.innerHTML = `
                <div class="chat-header-buttons">
                    <button class="block-user-btn" id="block-user-btn" data-username="${safe}">${t('chat.blockBtn')}</button>
                </div>
            `
        }

        attachBlockListener(data.username);
        updateChatInputState(false);
    }
    showNotification(`${data.username} ${t('notifications.userUnblocked')}`, "success");
}

function isCurrentChatUser(username: string): boolean {
  const currentChat = chatState.userChats.find(c => c.chat_id === chatState.currentChatId)
  return currentChat?.other_display_name === username
}

export function attachBlockListener(username: string): void {
    setTimeout(() => {
        const btn = document.getElementById("block-user-btn");
        btn?.addEventListener("click", () => {
            chatState.socket.emit("blockUser", username);
        })
    })
}

export function attachUnblockListener(username: string): void {
    setTimeout(() => {
        const btn = document.getElementById("unblock-user-btn");
        btn?.addEventListener("click", () => {
            chatState.socket.emit("unblockUser", username);
        })
    })
}

export function attachUserListener(): void {
    const usersBtn = document.getElementById("users-btn")
    const usersModal = document.getElementById("users-modal")
    const usersList = document.getElementById("users-list");
    const closeModal = document.getElementById("close-users-modal")

    usersBtn?.addEventListener("click", () => {
      if (chatState.currentChatId && chatState.generalChatId && chatState.currentChatId === chatState.generalChatId) {
         
        chatState.socket.emit("generalUsers");
        chatState.socket.off("generalUsersResponse");
        chatState.socket.on("generalUsersResponse", (data: Array<{display_name: string; online: boolean}>) => {
          if (!usersList || !usersModal) return;

           
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
          usersModal.style.display = "flex";
        });
      } else if (chatState.currentChatId) {
        const chat = chatState.userChats.find(c => c.chat_id === chatState.currentChatId);
        if (chat && usersList && usersModal) {
          usersList.innerHTML = `<div class="user-row"><span>${chat.other_display_name}</span></div>`;
          usersModal.style.display = "flex";
        }
      }
    });

    closeModal?.addEventListener("click", () => {
      if (usersModal) usersModal.style.display = "none";
    });
}


export function updateChatInputState(isBlocked: boolean): void {
    const input = document.getElementById("chat-input") as HTMLInputElement
    const btn = document.getElementById("chat-send-btn") as HTMLButtonElement
  
    if (input && btn) {
        input.disabled = isBlocked
        btn.disabled = isBlocked
        
        const placeholder = isBlocked ? t("chat.blockedPlaceholder") : t("chat.inputPlaceholder")
        input.placeholder = placeholder
        
        if (isBlocked) {
            input.style.color = "#999"
            btn.style.opacity = "0.5"
            btn.style.cursor = "not-allowed"
        } else {
            input.style.backgroundColor = ""
            input.style.color = ""
            btn.style.opacity = "1"
            btn.style.cursor = "pointer"
        }
        
         
    } 
     
     
     
}

export function escapeHTML(s: string) {
    const d = document.createElement("div")
    d.textContent = s
    return d.innerHTML
}

export async function sendStartTournamentMessage(): Promise<void> {
  if (!chatState.user) return;
  chatState.socket.emit('getGeneralId');
  chatState.socket.off('generalIdResponse');
  chatState.socket.on('generalIdResponse', (data: { generalId: number }) => {
       
      chatState.socket.emit("sendMessage", {chatId: data.generalId, content: "Hi! A tournament has started!"})  
  });
}