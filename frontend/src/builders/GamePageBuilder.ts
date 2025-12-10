export interface GameModeCard {
  href: string
  className: string
  icon: string
  title: string
  description: string
}

export interface GamePageConfig {
  title: string
  backHref: string
  backText: string
  modes: GameModeCard[]
}

export class GamePageBuilder {
  static buildGameModePage(config: GamePageConfig): string {
    const modeCards = config.modes
      .map(
        (mode) => `
      <a href="${mode.href}" data-link class="mode-card ${mode.className}">
        <span class="mode-icon">${mode.icon}</span>
        <h2 class="mode-title">${mode.title}</h2>
        <p class="mode-description">${mode.description}</p>
      </a>
    `,
      )
      .join("")

    return `
      <div class="play-page">
        <div class="game-arena">
          <h1 class="play-title">${config.title}</h1>
          <div id="play-content" class="play-content">
            <button class="back-button" data-link href="${config.backHref}">${config.backText}</button>
            <div class="game-mode-selection fade-in">
              ${modeCards}
            </div>
          </div>
        </div>
      </div>
    `
  }

  static buildSearchPage(config: {
    title: string
    backHref: string
    backText: string
    searchTitle: string
    placeholder: string
    recentPlayersTitle: string
    players: Array<{
      name: string
      status: "online" | "offline"
      buttonText: string
      buttonDisabled?: boolean
    }>
  }): string {
    const playerItems = config.players
      .map(
        (player) => `
      <div class="player-item">
        <div class="player-avatar">👤</div>
        <div class="player-info">
          <span class="player-name">${player.name}</span>
          <span class="player-status ${player.status}">${player.status === "online" ? "Online" : "Offline"}</span>
        </div>
        <button class="${player.buttonText.toLowerCase()}-btn"${player.buttonDisabled ? " disabled" : ""}>${player.buttonText}</button>
      </div>
    `,
      )
      .join("")

    return `
      <div class="play-page">
        <div class="game-arena">
          <h1 class="play-title">${config.title}</h1>
          <div id="play-content" class="play-content">
            <button class="back-button" data-link href="${config.backHref}">${config.backText}</button>
            <div class="player-search-container fade-in">
              <div class="search-form">
                <h2 class="search-title">${config.searchTitle}</h2>
                <div class="search-input-container">
                  <input type="text" class="player-search-input" placeholder="${config.placeholder}" />
                  <button class="search-btn">🔍</button>
                </div>
              </div>
              
              <div class="search-results">
                <div class="results-header">
                  <h3>${config.recentPlayersTitle}</h3>
                </div>
                <div class="recent-players">
                  ${playerItems}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }

  static buildMatchSearchPage(config: {
    title: string
    backHref: string
    backText: string
    statusIcon: string
    statusTitle: string
    statusDescription: string
    progressClass: string
    searchInfo: string
    estimatedWait: string
    gameMode: string
  }): string {
    return `
      <div class="play-page">
        <div class="game-arena">
          <h1 class="play-title">${config.title}</h1>
          <div id="play-content" class="play-content">
            <button class="cancel-search-btn back-button" data-link href="${config.backHref}">${config.backText}</button>
            <div class="random-match-container fade-in">
              <div class="match-status">
                <div class="status-icon">${config.statusIcon}</div>
                <h2 class="status-title">${config.statusTitle}</h2>
                <p class="status-description">${config.statusDescription}</p>
                
                <div class="search-progress">
                  <div class="progress-bar">
                    <div class="progress-fill ${config.progressClass}"></div>
                  </div>
                  <p class="search-info">
                    ${config.searchInfo}
                  </p>
                </div>
                
                <div class="match-info">
                  <div class="info-item">
                    <span class="info-label">Estimated wait:</span>
                    <span class="info-value">${config.estimatedWait}</span>
                  </div>
                  <div class="info-item">
                    <span class="info-label">Game mode:</span>
                    <span class="info-value">${config.gameMode}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `
  }
}
