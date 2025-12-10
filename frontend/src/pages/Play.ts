import { setupConfigEventListeners, setup2vs2ConfigEventListeners, setupAIConfigEventListeners } from "../game/GameConfig"
import { initializeLocalGame } from "../game/LocalGameManager"
import { GamePageBuilder } from "../builders/GamePageBuilder"
import { t } from "../languages/translation"

export default function Play(): string {
  return showMainMenu()
}

export function showMainMenu(): string {
  return GamePageBuilder.buildGameModePage({
    title: `${t('game.header')}`,
    backHref: "/",
    backText: `${t('game.backButton')}`,
    modes: [
      {
        href: "/play/local",
        className: "local",
        icon: "🏠",
        title: `${t('game.localGame.title')}`,
        description: `${t('game.localGame.subtitle')}`,
      },
      {
        href: "/play/online",
        className: "online",
        icon: "🌐",
        title: `${t('game.onlineGame.title')}`,
        description: `${t('game.onlineGame.subtitle')}`,
      },
    ],
  })
}

export function showLocalOptions(): string {
  return GamePageBuilder.buildGameModePage({
    title: `${t('game.localGame.title')}`,
    backHref: "/play",
    backText: `${t('game.backGameArena')}`,
    modes: [
      {
        href: "/play/local/1vsai/config",
        className: "ai-match",
        icon: "🤖",
        title: `${t('game.localGame.onevsAIButton.title')}`,
        description: `${t('game.localGame.onevsAIButton.subtitle')}`,
      },
      {
        href: "/play/local/1vs1/config",
        className: "pvp-match",
        icon: "⚔️",
        title: "1 vs 1",
        description: `${t('game.localGame.onevsoneButton.subtitle')}`,
      },
      {
        href: "/play/local/2vs2/config",
        className: "team-match",
        icon: "👥",
        title: "2 vs 2",
        description: `${t('game.localGame.twovstwoButton.subtitle')}`,
      },
    ],
  })
}

export function show1vs1Config(): string {
  setTimeout(() => setupConfigEventListeners(), 100)

  return `
    <div class="play-page">
      <div class="game-arena">
        <h1 class="play-title">${t('game.common.onevsoneTitle')}</h1>
        <div id="play-content" class="play-content">
          <button class="back-button" data-link href="/play/local">${t('game.localGame.backButton')}</button>
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
                <label>${t('game.common.playUntil')}</label>
                <select id="scoreLimit" class="score-dropdown">
                  <option value="1">1 ${t('game.common.point')}</option>
                  <option value="2">2 ${t('game.common.point')}s</option>
                  <option value="3" selected>3 ${t('game.common.point')}s</option>
                  <option value="4">4 ${t('game.common.point')}s</option>
                  <option value="5">5 ${t('game.common.point')}s</option>
                </select>
                <span class="score-description">${t('game.common.pointToWin')}</span>
              </div>
            </div>
            
            <div class="config-actions">
              <button class="btn-cancel" data-link href="/play/local">${t('common.cancel')}</button>
              <button class="btn-start-game" id="startConfiguredGame">${t('game.common.startGameButton')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

export function showAIConfig(): string {
  setTimeout(() => setupAIConfigEventListeners(), 100)

  return `
    <div class="play-page">
      <div class="game-arena">
        <h1 class="play-title">${t('game.ai.config')}</h1>
        <div id="play-content" class="play-content">
          <button class="back-button" data-link href="/play/local">${t('game.localGame.backButton')}</button>
          <div class="config-container fade-in">
            <div class="config-section">
              <h3 class="config-title">${t('game.ai.difficultyTitle')}</h3>
              <div class="config-options">
                <label class="config-option">
                  <input type="radio" name="difficulty" value="easy">
                  <span class="option-card easy">
                    <span class="option-icon">🟢</span>
                    <span class="option-title">${t('game.ai.difficulties.easy.title')}</span>
                    <span class="option-description">${t('game.ai.difficulties.easy.description')}</span>
                  </span>
                </label>
                
                <label class="config-option">
                  <input type="radio" name="difficulty" value="medium" checked>
                  <span class="option-card medium">
                    <span class="option-icon">🟡</span>
                    <span class="option-title">${t('game.ai.difficulties.medium.title')}</span>
                    <span class="option-description">${t('game.ai.difficulties.medium.description')}</span>
                  </span>
                </label>
                
                <label class="config-option">
                  <input type="radio" name="difficulty" value="hard">
                  <span class="option-card hard">
                    <span class="option-icon">🔴</span>
                    <span class="option-title">${t('game.ai.difficulties.hard.title')}</span>
                    <span class="option-description">${t('game.ai.difficulties.hard.description')}</span>
                  </span>
                </label>
              </div>
            </div>
            
            <div class="config-section">
              <h3 class="config-title">${t('game.common.scoreLimitTitle')}</h3>
              <div class="score-selector">
                <label>${t('game.common.playUntil')}</label>
                <select id="scoreLimitAI" class="score-dropdown">
                  <option value="1">1 ${t('game.common.point')}</option>
                  <option value="2">2 ${t('game.common.point')}s</option>
                  <option value="3" selected>3 ${t('game.common.point')}s</option>
                  <option value="4">4 ${t('game.common.point')}s</option>
                  <option value="5">5 ${t('game.common.point')}s</option>
                </select>
                <span class="score-description">${t('game.common.pointToWin')}</span>
              </div>
            </div>
            
            <div class="config-info">
              <div class="ai-info-card">
                <h4>${t('game.ai.about')}</h4>
                <p>${t('game.ai.aboutDescription')}</p>
              </div>
            </div>
            
            <div class="config-actions">
              <button class="btn-cancel" data-link href="/play/local">${t('common.cancel')}</button>
              <button class="btn-start-game" id="startAIConfiguredGame">${t('game.ai.challenge')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

export function show2vs2Config(): string {
  setTimeout(() => setup2vs2ConfigEventListeners(), 100)

  return `
    <div class="play-page">
      <div class="game-arena">
        <h1 class="play-title">${t('game.common.twovstwoTitle')}</h1>
        <div id="play-content" class="play-content">
          <button class="back-button" data-link href="/play/local">${t('game.localGame.backButton')}</button>
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
                <label>${t('game.common.playUntil')}</label>
                <select id="scoreLimit2vs2" class="score-dropdown">
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
              <h3 class="config-title">${t('game.twovstwo.gameControlTitle')}</h3>
              <div class="controls-info">
                <div class="team-controls">
                  <div class="team-name-input">
                    <label for="team1Name">${t('game.twovstwo.team')} 1${t('game.twovstwo.name')}</label>
                    <input type="text" id="team1Name" maxlength="7" pattern="[A-Za-z]+" placeholder="${t('game.twovstwo.team1Placeholder')}" class="team-name-field">
                  </div>
                  <div class="player-control">
                    <span class="player-name">👤 ${t('game.common.player')} 1:</span>
                    <span class="control-keys">W / S</span>
                  </div>
                  <div class="player-control">
                    <span class="player-name">👤 ${t('game.common.player')} 2:</span>
                    <span class="control-keys">T / G</span>
                  </div>
                </div>
                <div class="team-controls">
                  <div class="team-name-input">
                    <label for="team2Name">${t('game.twovstwo.team')} 2${t('game.twovstwo.name')}</label>
                    <input type="text" id="team2Name" maxlength="7" pattern="[A-Za-z]+" placeholder="${t('game.twovstwo.team2Placeholder')}" class="team-name-field">
                  </div>
                  <div class="player-control">
                    <span class="player-name">👤 ${t('game.common.player')} 3:</span>
                    <span class="control-keys">↑ / ↓</span>
                  </div>
                  <div class="player-control">
                    <span class="player-name">👤 ${t('game.common.player')} 4:</span>
                    <span class="control-keys">8 / 5 (${t('game.common.numeric')})</span>
                  </div>
                </div>
              </div>
              <div class="general-controls">
                <span><strong>${t('game.common.pause')}:</strong> P</span>
              </div>
            </div>
            
            <div class="config-actions">
              <button class="btn-cancel" data-link href="/play/local">${t('common.cancel')}</button>
              <button class="btn-start-game" id="start2vs2ConfiguredGame">${t('game.common.startGameButton')}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
}

export function startLocalGame(mode: string): string {
  const modeTitle = mode === "1vsai" ? "1 vs AI" : mode === "1vs1" ? "1 vs 1" : "2 vs 2"
  const gameIcon = mode === "1vsai" ? "🤖" : mode === "1vs1" ? "⚔️" : "👥"
  const estimatedTime = mode === "1vsai" ? "~5 seconds" : mode === "1vs1" ? "~3 seconds" : "~10 seconds"

  setTimeout(() => initializeLocalGame(mode), 200)

  return GamePageBuilder.buildMatchSearchPage({
    title: `${modeTitle} Local`,
    backHref: "/play/local",
    backText: `${t('common.cancel')}`,
    statusIcon: gameIcon,
    statusTitle: `${t('game.initializing')} ${modeTitle}${t('game.game')}...`,
    statusDescription: `${t('game.settingUp')} ${modeTitle}${t('game.match')}`,
    progressClass: "local",
    searchInfo: `${t('game.localGameInProgress')}`,
    estimatedWait: estimatedTime,
    gameMode: `${modeTitle} Local`,
  })
}
