import { initializeTournamentGame } from "../game/TournamentGame"
import { sendStartTournamentMessage } from './Chat'
import { t } from '../languages/translation'
 

let tournamentInProgress = false;

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  } as Record<string, string>)[c] || c);
}

function cleanName(raw: string): string {
  const noTags = raw.replace(/<[^>]*>/g, "");
  return noTags.trim().slice(0, 32);
}

// Initialize tournament state on page load
function initializeTournamentState() {
  //console.log("🏆 Initializing tournament state");
  tournamentInProgress = false;
  disableTournamentProtection();
  
  // Clear any leftover session data if tournament is not actually active
  const hasActiveGame = document.querySelector('canvas') && document.querySelector('.tournament-match-info');
  if (!hasActiveGame) {
    sessionStorage.removeItem("tournamentBracket");
    sessionStorage.removeItem("tournamentProgress");
  }
}

// Call initialization when module loads
initializeTournamentState();

function setTournamentInProgress(inProgress: boolean) {
  //console.log("🏆 Setting tournament in progress:", inProgress);
  tournamentInProgress = inProgress;
  
  if (inProgress) {
    // Enable page protection
    //console.log("🏆 Enabling tournament protection");
    enableTournamentProtection();
  } else {
    // Disable page protection
    //console.log("🏆 Disabling tournament protection");
    disableTournamentProtection();
    
    // Clear any existing tournament data
    sessionStorage.removeItem("tournamentBracket");
    sessionStorage.removeItem("tournamentProgress");
    
    // Reset tournament state variables
    editingNames = true;
    tournamentBracket = [];
    currentRound = 0;
    currentMatch = 0;
    tournamentPlayers = [];
  }
}

function isTournamentInProgress(): boolean {
  // Double check: verify we actually have tournament data and are in a game
  if (!tournamentInProgress) return false;
  
  // Verify we have valid tournament data
  const hasConfig = sessionStorage.getItem("tournamentConfig");
  const hasPlayers = tournamentPlayers && tournamentPlayers.length > 0;
  const hasBracket = tournamentBracket && tournamentBracket.length > 0;
  
  if (!hasConfig || !hasPlayers || !hasBracket) {
    //console.log("🏆 Tournament marked as active but missing data, disabling protection");
    setTournamentInProgress(false);
    return false;
  }
  
  return true;
}

function showTournamentExitConfirmation(): Promise<boolean> {
  return new Promise((resolve) => {
    pauseTournamentGame();
    
    // Create custom modal dialog
    const modal = document.createElement('div');
    modal.className = 'tournament-protection-modal';
    modal.innerHTML = `
      <div class="tournament-protection-overlay">
        <div class="tournament-protection-dialog">
          <h3>${t('tournament.leaveTournament.confirm')}</h3>
          <p>${t('tournament.leaveTournament.warning')}</p>
          <div class="tournament-protection-buttons">
            <button class="btn-cancel" id="tournamentStayExitBtn">${t('tournament.leaveTournament.stayButton')}</button>
            <button class="btn-confirm" id="tournamentConfirmExitBtn">${t('tournament.leaveTournament.leaveButton')}</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    document.getElementById('tournamentStayExitBtn')?.addEventListener('click', () => {
      document.body.removeChild(modal);
      resumeTournamentGame();
      resolve(false);
    });
    
    document.getElementById('tournamentConfirmExitBtn')?.addEventListener('click', () => {
      document.body.removeChild(modal);
      resolve(true);
    });
    
    // Focus on the stay button by default
    const stayBtn = document.getElementById('tournamentStayExitBtn');
    if (stayBtn) stayBtn.focus();
    
    // Add ESC key listener to close modal and show pause hint
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.body.removeChild(modal);
        resumeTournamentGame();
        resolve(false);
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Close modal if clicking outside the dialog
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target === modal.querySelector('.tournament-protection-overlay')) {
        document.body.removeChild(modal);
        resumeTournamentGame(); // Show pause hint
        resolve(false);
        document.removeEventListener('keydown', handleEscape);
      }
    });
  });
}

function enableTournamentProtection() {
  // Intercept specific key combinations with custom modal
  window.addEventListener('keydown', handleKeyDown);
  
  // Popstate protection handled globally by router with checkTournamentNavigation;
  // we no longer attach a second listener here to avoid double handling.
  
  // Add focus listener to detect when user returns after canceling F5
  window.addEventListener('focus', handleWindowFocus);
  
  // Add visibility change listener for better detection
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // Override location.reload to intercept programmatic reloads
  interceptBrowserReloadButton();
}

function disableTournamentProtection() {
  window.removeEventListener('keydown', handleKeyDown);
  // popstate listener removal no longer needed (router owns it)
  window.removeEventListener('focus', handleWindowFocus);
  document.removeEventListener('visibilitychange', handleVisibilityChange);
  
  // Remove browser button interception
  removeBrowserReloadInterception();
}

// Experimental: Try to intercept browser reload button clicks
function interceptBrowserReloadButton() {
  // Add a global key event listener with capture to catch all reload attempts
  document.addEventListener('keydown', handleGlobalKeyDown, true);
  
  //console.log("🏆 Browser reload button interception enabled (keyboard only)");
}

function removeBrowserReloadInterception() {
  document.removeEventListener('keydown', handleGlobalKeyDown, true);
  //console.log("🏆 Browser reload button interception disabled");
}

function handleGlobalKeyDown(event: KeyboardEvent) {
  if (isTournamentInProgress()) {
    // Intercept any reload-related key combinations globally with high priority
    if (event.key === 'F5' || 
        (event.ctrlKey && event.key === 'r') || 
        (event.metaKey && event.key === 'r') || 
        (event.ctrlKey && event.key === 'F5') ||
        (event.ctrlKey && event.shiftKey && event.key === 'R')) {
      
      //console.log("🏆 Intercepted reload key combination:", event.key);
      
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      
      pauseTournamentGame();
      showCustomTournamentDialog();
      return false;
    }
  }
}

function handleKeyDown(event: KeyboardEvent) {
  // This is now handled by handleGlobalKeyDown with capture=true
  // Keep this as a fallback
  if (isTournamentInProgress()) {
    // Detect F5, Ctrl+R, Ctrl+F5, Cmd+R (Mac)
    if (event.key === 'F5' || 
        (event.ctrlKey && event.key === 'r') || 
        (event.metaKey && event.key === 'r') || 
        (event.ctrlKey && event.key === 'F5')) {
      
      event.preventDefault();
      pauseTournamentGame();
      showCustomTournamentDialog();
      return false;
    }
  }
}

function pauseTournamentGame() {
  const tournamentGame = (window as any).currentTournamentGame;
  if (tournamentGame) {
    //console.log("🏆 Pausing tournament game via normal pause mechanism");
    
    // Check if game is not already paused
    if (!tournamentGame.game.isPaused) {
      // Simulate pressing 'P' to pause (works during countdown now)
      const pauseEvent = new KeyboardEvent('keydown', {
        key: 'p',
        code: 'KeyP',
        keyCode: 80,
        bubbles: true,
        cancelable: true
      });
      
      // Trigger the game's normal pause mechanism
      tournamentGame.handleKeyDown(pauseEvent);
    }
  }
}

function resumeTournamentGame() {
  const tournamentGame = (window as any).currentTournamentGame;
  
  // Don't auto-resume - let the user press 'P' to resume manually
  //console.log("🏆 Tournament game paused - press 'P' to resume");
  
  // Show a pause hint to the user
  const gameInfo = document.querySelector('.tournament-match-info');
  if (gameInfo) {
    const pauseHint = document.createElement('div');
    pauseHint.className = 'pause-hint';
    pauseHint.style.cssText = `
      color: #ff00ff;
      font-size: 1.1rem;
      font-weight: bold;
      text-align: center;
      margin-top: 0.5rem;
      animation: pulse 2s infinite;
    `;
    pauseHint.textContent = `⏸️ ${t('tournament.gamePaused')}`;
    
    // Remove any existing pause hint
    const existingHint = gameInfo.querySelector('.pause-hint');
    if (existingHint) existingHint.remove();
    
    gameInfo.appendChild(pauseHint);
    
    // Remove the hint after 5 seconds or when game is resumed
    const removeHint = () => {
      if (pauseHint.parentNode) {
        pauseHint.remove();
      }
    };
    
    setTimeout(removeHint, 5000);
    
    // Also remove hint when game is resumed
    if (tournamentGame && tournamentGame.game) {
      const checkResumed = setInterval(() => {
        if (!tournamentGame.game.isPaused || tournamentGame.game.gameEnded) {
          removeHint();
          clearInterval(checkResumed);
        }
      }, 100);
      
      // Clear interval after 10 seconds max
      setTimeout(() => clearInterval(checkResumed), 10000);
    }
  }
}

function showCustomTournamentDialog() {
  // Create custom modal dialog
  const modal = document.createElement('div');
  modal.className = 'tournament-protection-modal';
  modal.innerHTML = `
    <div class="tournament-protection-overlay">
      <div class="tournament-protection-dialog">
        <h3>${t('tournament.leaveTournament.confirm')}</h3>
        <p>${t('tournament.leaveTournament.refresh')}</p>
        <p class="tournament-info">💡 <em>${t('tournament.leaveTournament.note')}</em></p>
        <div class="tournament-protection-buttons">
          <button class="btn-cancel" id="tournamentStayBtn">${t('tournament.leaveTournament.stayButton')}</button>
          <button class="btn-confirm" id="tournamentLeaveBtn">${t('tournament.leaveTournament.leaveButton')}</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add event listeners
  document.getElementById('tournamentStayBtn')?.addEventListener('click', () => {
    document.body.removeChild(modal);
    resumeTournamentGame(); // This will show the pause hint, not auto-resume
  });
  
  document.getElementById('tournamentLeaveBtn')?.addEventListener('click', () => {
    //console.log("🏆 User confirmed leaving tournament");
    document.body.removeChild(modal);
    
    // Completely disable tournament protection
    setTournamentInProgress(false);
    
    // Clear any tournament-related session storage
    sessionStorage.removeItem("tournamentConfig");
    
    // Force reload to clean state
    window.location.reload();
  });
  
  // Focus on the stay button by default
  const stayBtn = document.getElementById('tournamentStayBtn');
  if (stayBtn) stayBtn.focus();
  
  // Add ESC key listener to close modal and resume game
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      document.body.removeChild(modal);
      resumeTournamentGame();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
  
  // Close modal if clicking outside the dialog
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target === modal.querySelector('.tournament-protection-overlay')) {
      document.body.removeChild(modal);
      resumeTournamentGame();
      document.removeEventListener('keydown', handleEscape);
    }
  });
}

function handleWindowFocus() {
  if (tournamentInProgress) {
    //console.log("🏆 Window focused during tournament - ensuring game is active");
    // Small delay to ensure any dialogs are fully closed
    setTimeout(() => {
      refreshTournamentState();
    }, 300);
  }
}

function handleVisibilityChange() {
  if (tournamentInProgress && document.visibilityState === 'visible') {
    //console.log("🏆 Page became visible during tournament - checking game state");
    // Longer delay for visibility change as it might be from tab switching
    setTimeout(() => {
      const gameCanvas = document.querySelector('canvas');
      if (gameCanvas && tournamentInProgress) {
        //console.log("🏆 Detected potential game freeze, attempting recovery");
        recoverGameState();
      }
    }, 800);
  }
}

function recoverGameState() {
  //console.log("🏆 Attempting to recover game state");
  
  // Check if we have an active canvas (game running)
  const gameCanvas = document.querySelector('canvas');
  if (gameCanvas) {
    //console.log("🏆 Found game canvas, checking if game is responsive");
    
    // Try to get the tournament game instance
    const tournamentGame = (window as any).currentTournamentGame;
    if (tournamentGame) {
      //console.log("🏆 Found tournament game instance, checking state");
      
      // Try to resume if paused
      if (typeof tournamentGame.isPaused === 'function' && tournamentGame.isPaused()) {
        //console.log("🏆 Game is paused, attempting to resume");
        if (typeof tournamentGame.resume === 'function') {
          tournamentGame.resume();
          return; // Successfully resumed
        }
      }
      
      // If game is running, just ensure it's focused
      if (typeof tournamentGame.isRunning === 'function' && tournamentGame.isRunning()) {
        //console.log("🏆 Game is running, ensuring focus");
        gameCanvas.focus();
        return; // Game is fine
      }
    }
    
    //console.log("🏆 Game may be frozen but canvas exists - trying gentle recovery");
    // Don't restart immediately, just ensure focus and check if it responds
    gameCanvas.focus();
    
    // Wait a bit and check if the game responds
    setTimeout(() => {
      const stillExists = document.querySelector('canvas');
      if (stillExists && tournamentInProgress) {
        //console.log("🏆 Game still seems frozen, will keep current match but refresh display");
        // Instead of restarting, just refresh the current state without losing progress
        refreshCurrentMatchDisplay();
      }
    }, 2000);
    
  } else {
    // No canvas found - check if we should be showing a match
    const playContent = document.getElementById('play-content');
    if (playContent && !playContent.querySelector('.tournament-match-container')) {
      //console.log("🏆 No game or result screen found, re-rendering current state");
      renderCurrentMatch();
    }
  }
}

function refreshCurrentMatchDisplay() {
  // Refresh the display without losing game progress
  //console.log("🏆 Refreshing current match display while preserving progress");
  const playContent = document.getElementById('play-content');
  if (playContent) {
    // Add a subtle visual indication that we're recovering
    playContent.style.opacity = '0.8';
    setTimeout(() => {
      playContent.style.opacity = '1';
      // Try to re-render the current match if no game is active
      if (!document.querySelector('canvas')) {
        renderCurrentMatch();
      }
    }, 500);
  }
}

// Removed handlePopState – navigation confirmation now centralized via router + checkTournamentNavigation.

// Export functions for external use
export async function checkTournamentNavigation(): Promise<boolean> {
  if (isTournamentInProgress()) {
    const shouldExit = await showTournamentExitConfirmation();
    if (shouldExit) {
      // User confirmed exit, clean up completely
      //console.log("🏆 User confirmed exit via checkTournamentNavigation");
      setTournamentInProgress(false);
      sessionStorage.removeItem("tournamentConfig");
    }
    return shouldExit;
  }
  return true;
}

export function forceTournamentEnd() {
  setTournamentInProgress(false);
}

export function refreshTournamentState() {
  // Function to refresh tournament state if it gets frozen
  if (tournamentInProgress) {
    //console.log("🏆 Refreshing tournament state");
    
    // Check if there's an active game
    const gameCanvas = document.querySelector('canvas');
    if (gameCanvas) {
      //console.log("🏆 Found game canvas, checking if game is responsive");
      
      // Try to interact with the game to see if it's frozen
      const tournamentGame = (window as any).currentTournamentGame;
      if (tournamentGame) {
        //console.log("🏆 Found tournament game instance");
        // If the game exists but seems frozen, restart the match
        if (typeof tournamentGame.isPaused === 'function' && tournamentGame.isPaused()) {
          //console.log("🏆 Game is paused, attempting to resume");
          if (typeof tournamentGame.resume === 'function') {
            tournamentGame.resume();
          }
        }
      } else {
        //console.log("🏆 No tournament game instance found, refreshing display");
        refreshCurrentMatchDisplay();
      }
    } else {
      // No canvas found - check if we should be showing a match
      const playContent = document.getElementById('play-content');
      if (playContent && !playContent.querySelector('.tournament-match-container')) {
        //console.log("🏆 No game or result screen found, re-rendering current state");
        renderCurrentMatch();
      }
    }
  }
}

// --- Tournament Bracket Visual Generation ---

function generateBracketHTML(participants: number, bracket?: TournamentMatch[][]): string {
  if (participants === 2) {
    return generateTwoPlayerBracket(bracket);
  } else if (participants === 4) {
    return generateFourPlayerBracket(bracket);
  } else if (participants === 8) {
    return generateEightPlayerBracket(bracket);
  }
  return `<p>${t('tournament.numberLimit')}</p>`;
}

function generateTwoPlayerBracket(bracket?: TournamentMatch[][]): string {
  const finalist1 = bracket?.[0]?.[0]?.player1 || "TBD";
  const finalist2 = bracket?.[0]?.[0]?.player2 || "TBD";
  const winner = bracket?.[0]?.[0]?.winner || ""; // translate????
  
  return `
    <div class="bracket-container bracket-2">
      <div class="bracket-round final-round">
        <div class="bracket-match">
          <div class="match-player ${winner === finalist1 ? 'winner' : ''}">${esc(finalist1)}</div>
          <div class="match-vs">vs</div>
          <div class="match-player ${winner === finalist2 ? 'winner' : ''}">${esc(finalist2)}</div>
        </div>
      </div>
    </div>
  `;
}

function generateFourPlayerBracket(bracket?: TournamentMatch[][]): string {
  // Semifinales
  const semi1p1 = bracket?.[0]?.[0]?.player1 || "TBD";
  const semi1p2 = bracket?.[0]?.[0]?.player2 || "TBD";
  const semi1winner = bracket?.[0]?.[0]?.winner || "";
  
  const semi2p1 = bracket?.[0]?.[1]?.player1 || "TBD";
  const semi2p2 = bracket?.[0]?.[1]?.player2 || "TBD";
  const semi2winner = bracket?.[0]?.[1]?.winner || "";
  
  // Final
  const finalist1 = bracket?.[1]?.[0]?.player1 || semi1winner || "TBD";
  const finalist2 = bracket?.[1]?.[0]?.player2 || semi2winner || "TBD";
  const champion = bracket?.[1]?.[0]?.winner || "";
// translate????
  return `
    <div class="bracket-container bracket-4">
      <div class="bracket-round semifinals">
        <div class="bracket-match">
          <div class="match-player ${semi1winner === semi1p1 ? 'winner' : ''}">${esc(semi1p1)}</div>
          <div class="match-vs">vs</div>
          <div class="match-player ${semi1winner === semi1p2 ? 'winner' : ''}">${esc(semi1p2)}</div>
        </div>
        <div class="bracket-match">
          <div class="match-player ${semi2winner === semi2p1 ? 'winner' : ''}">${esc(semi2p1)}</div>
          <div class="match-vs">vs</div>
          <div class="match-player ${semi2winner === semi2p2 ? 'winner' : ''}">${esc(semi2p2)}</div>
        </div>
      </div>
      
      <div class="bracket-connector">
        <div class="connector-line"></div>
        <div class="connector-line"></div>
      </div>
      
      <div class="bracket-round final-round">
        <div class="bracket-match">
          <div class="match-player ${champion === finalist1 ? 'winner' : ''}">${esc(finalist1)}</div>
          <div class="match-vs">vs</div>
          <div class="match-player ${champion === finalist2 ? 'winner' : ''}">${esc(finalist2)}</div>
        </div>
      </div>
    </div>
  `;
}

function generateEightPlayerBracket(bracket?: TournamentMatch[][]): string {
  // 8 jugadores: Cuartos -> Semifinales -> Final
  let html = `<div class="bracket-container bracket-8">`;
  
  // Cuartos de final (Round 0)
  html += `<div class="bracket-round quarterfinals">`;
  for (let i = 0; i < 4; i++) {
    const match = bracket?.[0]?.[i];
    const p1 = match?.player1 || "TBD";
    const p2 = match?.player2 || "TBD";
    const winner = match?.winner || "";
    
    html += `
      <div class="bracket-match">
        <div class="match-player ${winner === p1 ? 'winner' : ''}">${esc(p1)}</div>
        <div class="match-vs">vs</div>
        <div class="match-player ${winner === p2 ? 'winner' : ''}">${esc(p2)}</div>
      </div>
    `;
  }
  html += `</div>`;
  
  // Conectores
  html += `
    <div class="bracket-connector">
      <div class="connector-line"></div>
      <div class="connector-line"></div>
    </div>
  `;
  
  // Semifinales (Round 1)
  html += `<div class="bracket-round semifinals">`;
  for (let i = 0; i < 2; i++) {
    const match = bracket?.[1]?.[i];
    const p1 = match?.player1 || "TBD";
    const p2 = match?.player2 || "TBD";
    const winner = match?.winner || "";
    
    html += `
      <div class="bracket-match">
        <div class="match-player ${winner === p1 ? 'winner' : ''}">${esc(p1)}</div>
        <div class="match-vs">vs</div>
        <div class="match-player ${winner === p2 ? 'winner' : ''}">${esc(p2)}</div>
      </div>
    `;
  }
  html += `</div>`;
  
  // Conectores
  html += `
    <div class="bracket-connector">
      <div class="connector-line"></div>
    </div>
  `;
  
  // Final (Round 2)
  const finalMatch = bracket?.[2]?.[0];
  const finalist1 = finalMatch?.player1 || "TBD";
  const finalist2 = finalMatch?.player2 || "TBD";
  const champion = finalMatch?.winner || "";
  
  html += `
    <div class="bracket-round final-round">
      <div class="bracket-match">
        <div class="match-player ${champion === finalist1 ? 'winner' : ''}">${esc(finalist1)}</div>
        <div class="match-vs">vs</div>
        <div class="match-player ${champion === finalist2 ? 'winner' : ''}">${esc(finalist2)}</div>
      </div>
    </div>
  `;
  
  html += `</div>`;
  return html;
}

// Página del bracket del torneo (placeholder inicial)
export function showTournamentBracket(): string {
  // Read config from sessionStorage
  const configStr = sessionStorage.getItem("tournamentConfig")
  let config: { difficulty: string; scoreLimit: number; participants: number } = { difficulty: "medium", scoreLimit: 5, participants: 2 }
  if (configStr) {
    try { config = JSON.parse(configStr) } catch {}
  }  
  if (config.difficulty === "easy") {
    config.difficulty = t('game.difficulty.easy.nextTitle');
  } else if (config.difficulty === "medium") {
    config.difficulty = t('game.difficulty.medium.nextTitle');
  } else if (config.difficulty === "hard") {
    config.difficulty = t('game.difficulty.hard.nextTitle');
  }
  const players = Array.from({ length: config.participants }, (_, i) => `${t('game.common.player')} ${i + 1}`)
  return `
    <div class="play-page">
      <div class="game-arena">
        <h1 class="play-title">🏆 ${t('tournament.bracket.title')}</h1>
        <div id="play-content" class="play-content">
          <button class="back-button" data-link href="/tournament">${t('game.backToConfig')}</button>
          <div class="config-container fade-in">
            <div class="config-section">
              <h3 class="config-title">👥 ${t('tournament.bracket.participants')}</h3>
              <div class="score-selector">
                <ul style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;padding:0;list-style:none;">
                  ${players.map((p, i) => `<li style="margin-bottom:8px;"><input type="text" value="${p}" data-player-index="${i}" class="player-name-input score-dropdown" style="min-width:120px;text-align:center;" /></li>`).join("")}
                </ul>
              </div>
            </div>
            <div class="config-section">
              <h3 class="config-title">${t('tournament.bracket.bracket')}</h3>
              <div class="bracket-visual">
                ${generateBracketHTML(config.participants)}
              </div>
            </div>
            <div class="tournament-bracket-info" style="margin-top:16px;">
              <p>${t('tournament.bracket.difficulty')}: <b>${config.difficulty}</b> | ${t('tournament.bracket.scoreLimit')}: <b>${config.scoreLimit}</b> | 👥 ${t('tournament.bracket.participants')}: <b>${config.participants}</b></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}
// Lógica para manejar el submit del formulario de configuración del torneo
export function setupTournamentConfigListeners() {
  const form = document.getElementById("tournamentConfigForm") as HTMLFormElement | null
  if (!form) return

  form.addEventListener("submit", (e) => {
    e.preventDefault()
    const difficulty = (form.elements.namedItem("difficulty") as RadioNodeList).value || "medium"
    const scoreLimit = parseInt((form.elements.namedItem("scoreLimit") as HTMLSelectElement).value)
    const participants = parseInt((form.elements.namedItem("participants") as HTMLSelectElement).value)
    const errorDiv = document.getElementById("tournamentConfigError")

    // Validar cantidad de participantes (solo 2, 4 u 8 jugadores)
    if (![2, 4, 8].includes(participants)) {
      if (errorDiv) errorDiv.textContent = `${t('tournament.cantd')}`
      return
    }

    // Limpiar error
    if (errorDiv) errorDiv.textContent = ""

    // Guardar config en sessionStorage (o state global) y redirigir a bracket
    const config = { difficulty, scoreLimit, participants }
    sessionStorage.setItem("tournamentConfig", JSON.stringify(config))
    //console.log("🏆 Saving tournament config and navigating to bracket:", config);
    window.history.pushState({}, "", "/tournament/bracket")

    sendStartTournamentMessage();
    // Use safeRouter instead of popstate event
    import("../router").then(async mod => {
      //console.log("🏆 Calling router to navigate to bracket");
      await mod.router();
    });
  })
}
// pages/Tournament.ts

// Menú de configuración del torneo local
export function showTournamentConfig(): string {
    return `
      <div class="play-page">
        <div class="game-arena">
          <h1 class="play-title">${t('tournament.configTitle')}</h1>
          <div id="play-content" class="play-content">
            <div class="config-container fade-in">
              <form id="tournamentConfigForm">
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
                    <label>${t('game.common.playUntil')}</label>
                    <select id="scoreLimit" name="scoreLimit" class="score-dropdown">
                      <option value="1">1 ${t('game.common.point')}</option>
                      <option value="2">2 ${t('game.common.point')}s</option>
                      <option value="3" selected>3 ${t('game.common.point')}s</option>
                      <option value="4">4 ${t('game.common.point')}s</option>
                      <option value="5">5 ${t('game.common.point')}s</option>
                    </select>
                    <span class="score-description">${t('game.common.pointToWin')}</span>
                  </div>
                </div>
                <div class="config-section">
                  <h3 class="config-title">👥 ${t('tournament.bracket.participants')}</h3>
                  <div class="score-selector">
                    <label>${t('tournament.numberParticipants')}</label>
                    <select id="participants" name="participants" class="score-dropdown">
                      <option value="2">2</option>
                      <option value="4">4</option>
                      <option value="8">8</option>
                    </select>
                    <span class="score-description">${t('tournament.participantsMsg')}</span>
                  </div>
                </div>
                <div class="config-actions">
                  <button class="btn-start-game" type="submit" id="startTournamentBtn">${t('tournament.startButton')}</button>
                </div>
                <div id="tournamentConfigError" class="error-message"></div>
              </form>
            </div>
          </div>
        </div>
      </div>
    `
}

// --- Tournament Bracket Logic (REWORKED) ---

interface TournamentMatch {
  player1: string;
  player2: string;
  winner?: string;
}

let tournamentBracket: TournamentMatch[][] = [];
let currentRound = 0;
let currentMatch = 0;
let tournamentPlayers: string[] = [];
let tournamentConfig: { difficulty: string; scoreLimit: number; participants: number } = { difficulty: "medium", scoreLimit: 5, participants: 2 };
let editingNames = true;

export function setupTournamentBracketListeners() {
  // Get config
  const configStr = sessionStorage.getItem("tournamentConfig");
  if (configStr) {
    try { 
      const parsedConfig = JSON.parse(configStr);
      tournamentConfig = parsedConfig;
      //console.log("🏆 Tournament config loaded from sessionStorage:", tournamentConfig);
    } catch (error) {
      console.error("🏆 Error parsing tournament config from sessionStorage:", error);
    }
  } else {
    console.warn("🏆 No tournament config found in sessionStorage, using defaults");
  }
  
  // Si ya no estamos editando nombres, renderizar el partido actual
  if (!editingNames) {
    renderCurrentMatch();
  }
}

function enumerateDuplicateNames(names: string[]): string[] {
  const counts: Record<string, number> = {};
  const result: string[] = [];
  names.forEach((name) => {
    counts[name] = (counts[name] || 0) + 1;
    if (counts[name] === 1) {
      result.push(name);
    } else {
      result.push(`${name}(${counts[name]})`);
    }
  });
  return result;
}

function generateBracket() {
  // Enumerar duplicados antes de mezclar
  const enumeratedPlayers = enumerateDuplicateNames(tournamentPlayers);
  // Shuffle players for randomness
  const shuffled = [...enumeratedPlayers];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  // Generate bracket structure based on number of players
  tournamentBracket = [];
  
  // First round - pair up all players
  let round: TournamentMatch[] = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    round.push({ player1: shuffled[i], player2: shuffled[i + 1] });
  }
  tournamentBracket.push(round);
  
  // Generate subsequent rounds until we have a winner
  let currentRoundSize = round.length;
  while (currentRoundSize > 1) {
    const nextRoundSize = Math.floor(currentRoundSize / 2);
    const nextRound: TournamentMatch[] = [];
    for (let i = 0; i < nextRoundSize; i++) {
      nextRound.push({ player1: '', player2: '' });
    }
    tournamentBracket.push(nextRound);
    currentRoundSize = nextRoundSize;
  }
  
  currentRound = 0;
  currentMatch = 0;
}

function renderCurrentMatch() {
  // Always get the latest config from sessionStorage
  const configStr = sessionStorage.getItem("tournamentConfig");
  if (configStr) {
    try { 
      const parsedConfig = JSON.parse(configStr);
      tournamentConfig = parsedConfig;
      //console.log("🏆 Updated tournament config before starting match:", tournamentConfig);
    } catch (error) {
      console.error("🏆 Error parsing tournament config:", error);
    }
  }

  if (tournamentConfig.difficulty === "easy") {
    tournamentConfig.difficulty = t('game.difficulty.easy.nextTitle');
  } else if (tournamentConfig.difficulty === "medium") {
    tournamentConfig.difficulty = t('game.difficulty.medium.nextTitle');
  } else if (tournamentConfig.difficulty === "hard") {
    tournamentConfig.difficulty = t('game.difficulty.hard.nextTitle');
  }

  // Reset title to generic tournament title
  const playTitle = document.querySelector(".play-title")
  if (playTitle) {
    playTitle.textContent = `🏆 ${t('tournament.bracket.title')}`
  }

  const match = tournamentBracket[currentRound][currentMatch];
  const playContent = document.getElementById('play-content');
  if (!playContent) return;
  playContent.innerHTML = `
    <div class="tournament-match-container fade-in">
      <h2 class="match-title">${t('tournament.match')}: <b>${esc(match.player1)}</b> vs <b>${esc(match.player2)}</b></h2>
      
      <div class="config-section" style="margin: 1.5rem 0;">
        <h3 class="config-title">📊 ${t('tournament.bracket.title')}</h3>
        <div class="bracket-visual">
          ${generateBracketHTML(tournamentConfig.participants, tournamentBracket)}
        </div>
      </div>

      <button class="btn-start-game" id="startTournamentGameBtn">${t('tournament.startGame')}</button>
      <div class="bracket-info">${t('tournament.round')} ${currentRound + 1} - ${t('tournament.match')} ${currentMatch + 1}</div>
      <div class="match-config">${t('tournament.playingTo')} ${tournamentConfig.scoreLimit} ${t('game.common.point')}s - ${t('tournament.difficulty')} ${esc(tournamentConfig.difficulty)}</div>
    </div>
  `;
  const btn = document.getElementById('startTournamentGameBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      // Iniciar el juego real con callback personalizado para el torneo
      //console.log("🏆 Starting tournament game with config:", { difficulty: tournamentConfig.difficulty, scoreLimit: tournamentConfig.scoreLimit });
      startTournamentGame(match, tournamentConfig.difficulty, tournamentConfig.scoreLimit);
    });
  }
}

function startTournamentGame(match: TournamentMatch, difficulty: string, scoreLimit: number) {
  //console.log("🏆 startTournamentGame called with:", { match, difficulty, scoreLimit });
  // Iniciar el juego personalizado para torneo
  startTournamentLocalGame(match.player1, match.player2, difficulty, scoreLimit, (winner: string) => {
    // Callback cuando termine el juego
    // PRIMERO: Actualizar el bracket con el ganador
    updateBracketWithWinner(winner);
    // SEGUNDO: Mostrar el resultado con el bracket actualizado
    showMatchResult(match, winner);
  });
}

function startTournamentLocalGame(player1Name: string, player2Name: string, difficulty: string, scoreLimit: number, onGameEnd: (winner: string) => void) {
  //console.log("🏆 startTournamentLocalGame called with:", { player1Name, player2Name, difficulty, scoreLimit });
  const playContent = document.getElementById("play-content")
  if (!playContent) return

  // Mostrar pantalla de carga
  playContent.innerHTML = `
    <div class="random-match-container fade-in">
      <div class="match-status">
        <div class="status-icon">⚔️</div>
        <h2 class="status-title">${t('tournament.starting')}</h2>
        <p class="status-description">${esc(player1Name)} vs ${esc(player2Name)} - ${esc(difficulty)} ${t('tournament.difficultyUpTo')} ${scoreLimit} ${t('game.common.point')}s</p>

        <div class="search-progress">
          <div class="progress-bar">
            <div class="progress-fill local"></div>
          </div>
          <p class="search-info">
            ${t('tournament.gameConfigProgress')}...
          </p>
        </div>
      </div>
    </div>
  `

  // Inicializar el juego después de un momento
  setTimeout(() => {
    initializeTournamentGameUI(player1Name, player2Name, difficulty, scoreLimit, onGameEnd)
  }, 1000)
}

function initializeTournamentGameUI(player1Name: string, player2Name: string, difficulty: string, scoreLimit: number, onGameEnd: (winner: string) => void) {
  //console.log("🎮 Iniciando juego de torneo...", { player1Name, player2Name, difficulty, scoreLimit })

  const playContent = document.getElementById("play-content")
  if (!playContent) return

  // Cambiar el título principal
  const playTitle = document.querySelector(".play-title")
  if (playTitle) {
    playTitle.textContent = `🏆 ${t('tournament.title')}: ${player1Name} vs ${player2Name}`
  }

  // Crear el canvas del juego con nombres personalizados
  const gameContainer = document.createElement("div")

  gameContainer.innerHTML = `
    <div class="local-game-container">
      <div class="game-header-simple">
        <div class="game-info-no-bg">
          <span>${t('game.common.playUntil')}: ${scoreLimit} ${t('game.common.point')}s</span>
          <div class="score-display">
            <span id="leftScore">0</span> - <span id="rightScore">0</span>
          </div>
        </div>
        <div class="game-controls">
          <span>${esc(player1Name)}: W/S</span>
          <span>${esc(player2Name)}: ↑/↓</span>
          <span>${t('game.common.pause')}: P</span>
        </div>
      </div>
      <canvas id="gameCanvas" width="800" height="400"></canvas>
    </div>
  `

  // Reemplazar el contenido
  playContent.innerHTML = ""
  playContent.appendChild(gameContainer)

  // Inicializar el juego de torneo con callback
  //console.log("🎮 About to call initializeTournamentGame with scoreLimit:", scoreLimit);
  initializeTournamentGame(player1Name, player2Name, difficulty, scoreLimit, onGameEnd)
}

function showMatchResult(match: TournamentMatch, winner: string) {
  const playContent = document.getElementById('play-content');
  if (!playContent) return;
  
  // Reset title to generic tournament title
  const playTitle = document.querySelector(".play-title")
  if (playTitle) {
    playTitle.textContent = `🏆 ${t('tournament.bracket.title')}`
  }
  
  // Read config from sessionStorage to get participant count
  const configStr = sessionStorage.getItem("tournamentConfig");
  let participantCount = 2;
  if (configStr) {
    try {
      const config = JSON.parse(configStr);
      participantCount = config.participants || 2;
    } catch {}
  }
  
  const loser = winner === match.player1 ? match.player2 : match.player1;
  
  // Check if this is the final match
  const isFinalMatch = (currentRound + 1 >= tournamentBracket.length);
  const buttonText = isFinalMatch ? `${t('tournament.restartTournament')}` : `${t('tournament.nextMatch')}`;
  const buttonId = isFinalMatch ? "restartTournamentBtn" : "nextMatchBtn";
  
  // If it's the final match, show the bracket. If not, just show the result and next button.
  // The bracket will be shown in the next screen (renderCurrentMatch) for intermediate matches.
  const bracketHtml = isFinalMatch ? `
      <div class="config-section" style="margin: 1.5rem 0;">
        <h3 class="config-title">📊 ${t('tournament.bracket.title')}</h3>
        <div class="bracket-visual">
          ${generateBracketHTML(participantCount, tournamentBracket)}
        </div>
      </div>` : '';

  playContent.innerHTML = `
    <div class="tournament-match-container fade-in">
      <h2 class="match-title">${t('tournament.matchResult')}</h2>
      <div class="match-result">
        <div class="winner-announcement">
          <span class="winner-label">${t('tournament.winner')}:</span>
          <span class="winner-name">${esc(winner)}</span>
        </div>
        <div class="match-summary">
          <span>${esc(winner)} ${t('game.common.point')}s ${esc(loser)}</span>
        </div>
      </div>
      ${bracketHtml}
      
      <button class="btn-start-game" id="${buttonId}">${buttonText}</button>
      <div class="bracket-info">${t('tournament.round')} ${currentRound + 1} - ${t('tournament.match')} ${currentMatch + 1} ${t('game.common.completed')}</div>
    </div>
  `;
  
  const actionBtn = document.getElementById(buttonId);
  if (actionBtn) {
    actionBtn.addEventListener('click', () => {
      if (isFinalMatch) {
        // Reiniciar torneo directamente
        setTournamentInProgress(false);
        sessionStorage.removeItem("tournamentConfig");
        sessionStorage.removeItem("tournamentBracket");
        sessionStorage.removeItem("tournamentProgress");
        window.history.pushState({}, "", "/tournament");
        import("../router").then(async mod => {
          await mod.router();
        });
      } else {
        // Continue to next match
        advanceWinner(winner);
      }
    });
  }
}

function promptWinner(match: TournamentMatch) {
  const playContent = document.getElementById('play-content');
  if (!playContent) return;//who won
  playContent.innerHTML = `
    <div class="tournament-match-container fade-in">
      <h2 class="match-title">${t('tournament.whoWon')}</h2>
      <button class="btn-winner" id="winner1">${esc(match.player1)}</button>
      <button class="btn-winner" id="winner2">${esc(match.player2)}</button>
    </div>
  `;
  document.getElementById('winner1')?.addEventListener('click', () => advanceWinner(match.player1));
  document.getElementById('winner2')?.addEventListener('click', () => advanceWinner(match.player2));
}

function updateBracketWithWinner(winner: string) {
  tournamentBracket[currentRound][currentMatch].winner = winner;

  if (currentRound + 1 < tournamentBracket.length) {
    const nextMatchIdx = Math.floor(currentMatch / 2);
    const nextMatch = tournamentBracket[currentRound + 1][nextMatchIdx] || { player1: '', player2: '' };
    if (currentMatch % 2 === 0) nextMatch.player1 = winner;
    else nextMatch.player2 = winner;
    tournamentBracket[currentRound + 1][nextMatchIdx] = nextMatch;
  }
}

function advanceWinner(winner: string) {

  if (currentRound + 1 >= tournamentBracket.length) {
    showWinner(winner);
    return;
  }

  if (currentMatch + 1 < tournamentBracket[currentRound].length) {
    currentMatch++;
    renderCurrentMatch();
  } else {
    currentRound++;
    currentMatch = 0;
    renderCurrentMatch();
  }
}

function showWinner(winner: string) {
  const playContent = document.getElementById('play-content');
  if (!playContent) return;
  
  // Reset title to generic tournament title
  const playTitle = document.querySelector(".play-title")
  if (playTitle) {
    playTitle.textContent = `🏆 ${t('tournament.bracket.title')}`
  }
  
  setTournamentInProgress(false);
  
  const configStr = sessionStorage.getItem("tournamentConfig");
  let participantCount = 2;
  if (configStr) {
    try {
      const config = JSON.parse(configStr);
      participantCount = config.participants || 2;
    } catch {}
  }
  
  playContent.innerHTML = `
    <div class="tournament-winner-container fade-in">
      <h1 class="winner-title">🏆 ${t('tournament.tWinner')}</h1>
      <h2 class="winner-name">${winner}</h2>
      
      <div class="config-section" style="margin: 1.5rem 0;">
        <h3 class="config-title">📊 ${t('tournament.final')}</h3>
        <div class="bracket-visual">
          ${generateBracketHTML(participantCount, tournamentBracket)}
        </div>
      </div>
      
      <button class="btn-start-game" id="restartTournamentBtn">${t('tournament.restartTournament')}</button>
    </div>
  `;

  const restartBtn = document.getElementById('restartTournamentBtn');
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      setTournamentInProgress(false);
      sessionStorage.removeItem("tournamentConfig");
      window.history.pushState({}, "", "/tournament");
      import("../router").then(async mod => {
        await mod.router();
      });
    });
  }
}

// --- Montar bracket con edición de nombres ---
export function mountTournamentBracket() {
  //console.log("🏆 mountTournamentBracket called");
  
  const configStr = sessionStorage.getItem("tournamentConfig");
  let config: { difficulty: string; scoreLimit: number; participants: number } = { difficulty: "medium", scoreLimit: 5, participants: 2 };
  if (configStr) {
    try { config = JSON.parse(configStr); } catch {}
  }
  
  //console.log("🏆 Tournament config:", config);

  const players = Array.from({ length: config.participants }, (_, i) => `${t('game.common.player')} ${i + 1}`);
  editingNames = true;
  tournamentBracket = [];
  currentRound = 0;
  currentMatch = 0;
  tournamentPlayers = [];
  
  const app = document.getElementById('app');
  if (!app) {
    console.error("🏆 App element not found!");
    return;
  }
  
  //console.log("🏆 Setting up tournament bracket HTML");
  if (config.difficulty === "easy") {
    config.difficulty = t('game.difficulty.easy.nextTitle');
  } else if (config.difficulty === "medium") {
    config.difficulty = t('game.difficulty.medium.nextTitle');
  } else if (config.difficulty === "hard") {
    config.difficulty = t('game.difficulty.hard.nextTitle');
  }
  app.innerHTML = `
    <div class="play-page">
      <div class="game-arena">
        <h1 class="play-title">🏆 ${t('tournament.bracket.title')}</h1>
        <div id="play-content" class="play-content">
          <button class="back-button" data-link href="/tournament">${t('game.backToConfig')}</button>
          <div class="config-container fade-in">
            <div class="config-section">
              <h3 class="config-title">👥 ${t('tournament.bracket.participants')}</h3>
              <div class="score-selector">
                <ul style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center;padding:0;list-style:none;">
                  ${players.map((p, i) => `<li style="margin-bottom:8px;"><input type="text" value="${p}" data-player-index="${i}" class="player-name-input score-dropdown" style="min-width:120px;text-align:center;" /></li>`).join("")}
                </ul>
              </div>
              <div style="text-align:center;margin-top:16px;">
                <button class="btn-start-game" id="startTournamentBracketBtn">${t('tournament.startButton')}</button>
              </div>
            </div>
            <div class="config-section">
              <h3 class="config-title">${t('tournament.bracket.bracket')}</h3>
              <div class="bracket-placeholder">
                <p>${t('tournament.bracket.singleEli')}</p>
              </div>
            </div>
            <div class="tournament-bracket-info" style="margin-top:16px;">
              <p>${t('tournament.bracket.difficulty')}: <b>${config.difficulty}</b> | ${t('tournament.bracket.scoreLimit')}: <b>${config.scoreLimit}</b> | ${t('tournament.bracket.participants')}: <b>${config.participants}</b></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Configure the start tournament button immediately
  //console.log("🏆 Setting up tournament bracket listeners");
  setTimeout(() => {
    const startBtn = document.getElementById('startTournamentBracketBtn');
    //console.log("🏆 Start button found:", !!startBtn);
    if (startBtn) {
      // Remove any existing listeners to avoid duplicates
      const newButton = startBtn.cloneNode(true) as HTMLButtonElement;
      startBtn.parentNode?.replaceChild(newButton, startBtn);
      
      newButton.addEventListener('click', () => {
        //console.log("🏆 Start Tournament button clicked!");
        const playerInputs = document.querySelectorAll('.player-name-input') as NodeListOf<HTMLInputElement>;
        tournamentPlayers = Array.from(playerInputs).map(input => {
          const cleaned = cleanName(input.value);
          return cleaned || input.placeholder || "Player";
        });
        //console.log("🏆 Tournament players:", tournamentPlayers);
        editingNames = false;
        generateBracket();
        // Mark tournament as in progress
        setTournamentInProgress(true);
        renderCurrentMatch();
      });
    } else {
      console.error("🏆 Start button not found!");
    }
  }, 100);
}