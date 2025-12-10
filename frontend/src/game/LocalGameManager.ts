 
 
import { initializeConfigurablePong } from "./Pong1vs1Game"
import { initializeConfigurable2vs2Pong } from "./Pong2vs2Game"
import { initializeAIPong } from "./Pong1vsAIGame"
import { t } from "../languages/translation"

export async function initializeLocalGame(mode: string) {
   

  if (mode === "1vs1") {
    setTimeout(() => {
      const loadingScreen = document.querySelector(".random-match-container") as HTMLElement
      const playContent = document.getElementById("play-content")

      if (loadingScreen && playContent) {
        const gameContainer = document.createElement("div")
        gameContainer.innerHTML = `
          <div class="local-game-container">
            <div class="game-header">
              <h2>🎮 ${t('game.localGame.type')} 1 vs 1 ${t('game.localGame.game')}</h2>
              <div class="game-controls">
                <span>${t('game.common.player')} 1: W/S</span>
                <span>${t('game.common.player')} 2: ↑/↓</span>
                <span>${t('game.common.pause')}: P</span>
              </div>
            </div>
            <canvas id="gameCanvas" width="800" height="400"></canvas>
            <div class="game-footer">
              <button class="btn-back" onclick="history.back()">${t('common.back')}</button>
              <button class="btn-reset" id="resetGame">🔄 ${t('game.common.resetBtn')}</button>
            </div>
          </div>
        `
        playContent.innerHTML = ""
        playContent.appendChild(gameContainer)

        initializeConfigurablePong("medium", 3)
      }
    }, 1000)
  } else if (mode === "1vsai") {
    setTimeout(() => {
      const loadingScreen = document.querySelector(".random-match-container") as HTMLElement
      const playContent = document.getElementById("play-content")

      if (loadingScreen && playContent) {
        
        const gameContainer = document.createElement("div") 
        gameContainer.innerHTML = `
          <div class="local-game-container">
            <div class="game-header">
              <h2>🤖 ${t('game.onevsAI')}</h2>
              <div class="game-controls">e
                <span>${t('game.common.player')}: W/S</span>
                <span>${t('game.automatic')}</span>
                <span>${t('game.common.pause')}: P</span>
              </div>
            </div>
            <canvas id="gameCanvas" width="800" height="400"></canvas>
            <div class="game-footer">
              <button class="btn-back" onclick="history.back()">${t('common.back')}</button>
              <button class="btn-reset" id="resetGame">🔄 ${t('game.common.resetBtn')}</button>
            </div>
          </div>
        `
        playContent.innerHTML = ""
        playContent.appendChild(gameContainer)

        initializeAIPong("medium", 3)
      }
    }, 1000)
  } else if (mode === "2vs2") {
    setTimeout(() => {
      const loadingScreen = document.querySelector(".random-match-container") as HTMLElement
      const playContent = document.getElementById("play-content")

      if (loadingScreen && playContent) {
        const gameContainer = document.createElement("div")
        gameContainer.innerHTML = `
          <div class="local-game-container">
            <div class="game-header-simple">
              <div class="game-info-no-bg">
                <span>${t('game.common.playUntil')}: 3 ${t('game.common.point')}s</span>
                <div class="score-display">
                  <span id="leftTeamScore">0</span> - <span id="rightTeamScore">0</span>
                </div>
              </div>
              <div class="game-controls">
                <div class="team-controls-display">
                  <div class="left-team">
                    <span>${t('game.common.playerLetter')}1: W/S</span> | <span>${t('game.common.playerLetter')}2: T/G</span>
                  </div>
                  <span class="pause-control">${t('game.common.pause')}: P</span>
                  <div class="right-team">
                    <span>${t('game.common.playerLetter')}3: ↑/↓</span> | <span>${t('game.common.playerLetter')}4: 8/5</span>
                  </div>
                </div>
              </div>
            </div>
            <canvas id="gameCanvas2vs2" width="800" height="400"></canvas>
            <div class="game-footer">
              <button class="btn-back" onclick="history.back()">${t('common.back')}</button>
              <button class="btn-reset" id="reset2vs2Game">🔄 ${t('game.common.resetBtn')}</button>
            </div>
          </div>
        `

        playContent.innerHTML = ""
        playContent.appendChild(gameContainer)

        initializeConfigurable2vs2Pong(`${t('game.difficulty.medium.nextTitle')}`, 3, `${t('game.twovstwo.team1Placeholder')}`, `${'game.twovstwo.team2Placeholder'}`) 
      }
    }, 1000)
  }
}

export function startConfiguredLocalGame(difficulty: string, scoreLimit: number) {
  const playContent = document.getElementById("play-content")
  if (!playContent) return

  playContent.innerHTML = `
    <div class="random-match-container fade-in">
      <div class="match-status">
        <div class="status-icon">⚔️</div>
        <h2 class="status-title">${t('game.startingGame')}...</h2>
        
        <div class="search-progress">
          <div class="progress-bar">
            <div class="progress-fill local"></div>
          </div>
          <p class="search-info">
            ${t('tournament.gameConfigProgress')}
          </p>
        </div>
      </div>
    </div>
  `

  setTimeout(() => {
    initializeConfiguredGame(difficulty, scoreLimit)
  }, 1000)
}

function initializeConfiguredGame(difficulty: string, scoreLimit: number) {
   

  const playContent = document.getElementById("play-content")
  if (!playContent) return

  const playTitle = document.querySelector(".play-title")
  if (playTitle) {
    playTitle.textContent = "🎮 1 vs 1"
  }

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
          <span>${t('game.common.player')} 1: W/S</span>
          <span>${t('game.common.player')} 2: ↑/↓</span>
          <span>${t('game.common.pause')}: P</span>
        </div>
      </div>
      <canvas id="gameCanvas" width="800" height="400"></canvas>
      <div class="game-footer">
        <button class="btn-back" onclick="history.back()">${t('common.back')}</button>
        <button class="btn-reset" id="resetGame">🔄 ${t('game.common.resetBtn')}</button>
      </div>
    </div>
  `
  playContent.innerHTML = ""
  playContent.appendChild(gameContainer)
  if (difficulty === "easy" || difficulty === "Easy" || difficulty === "EASY") {
    difficulty = t('game.difficulty.easy.nextTitle');
  } else if (difficulty === "medium" || difficulty === "Medium" || difficulty === "MEDIUM") {
    difficulty = t('game.difficulty.medium.nextTitle');
  } else if (difficulty === "hard" || difficulty === "Hard" || difficulty === "HARD") {
    difficulty = t('game.difficulty.hard.nextTitle');
  }
  initializeConfigurablePong(difficulty, scoreLimit)
}

export function startConfigured2vs2Game(difficulty: string, scoreLimit: number, team1Name: string, team2Name: string) {
  const playContent = document.getElementById("play-content")
  if (!playContent) return

  playContent.innerHTML = `
    <div class="random-match-container fade-in">
      <div class="match-status">
        <div class="status-icon">👥</div>
        <h2 class="status-title">${t('game.startingTwo')}...</h2>
        <p class="status-description">${t('game.common.configuredGame.settingUp')} ${difficulty} ${t('game.common.configuredGame.difficulty')} ${scoreLimit} ${t('game.common.point')}s</p>
        
        <div class="search-progress">
          <div class="progress-bar">
            <div class="progress-fill local"></div>
          </div>
          <p class="search-info">
            ${t('tournament.gameConfigProgress')}
          </p>
        </div>
      </div>
    </div>
  `

  setTimeout(() => {
    initialize2vs2Game(difficulty, scoreLimit, team1Name, team2Name)
  }, 1000)
}

function initialize2vs2Game(difficulty: string, scoreLimit: number, team1Name: string, team2Name: string) {
   

  const playContent = document.getElementById("play-content")
  if (!playContent) return

  const playTitle = document.querySelector(".play-title")
  if (playTitle) {
    playTitle.textContent = "👥 2 vs 2"
  }
  const gameContainer = document.createElement("div")

  gameContainer.innerHTML = `
    <div class="local-game-container">
      <div class="game-header-simple">
        <div class="game-info-no-bg">
          <span>${t('game.common.playUntil')}: ${scoreLimit} ${t('game.common.points')}</span>
          <div class="score-display">
            <span id="leftTeamScore">0</span> - <span id="rightTeamScore">0</span>
          </div>
        </div>
        <div class="game-controls">
          <div class="team-controls-display">
            <div class="left-team">
              <span>${t('game.common.playerLetter')}1: W/S</span> | <span>${t('game.common.playerLetter')}2: T/G</span>
            </div>
            <span class="pause-control">${t('game.common.pause')}: P</span>
            <div class="right-team">
              <span>${t('game.common.playerLetter')}3: ↑/↓</span> | <span>${t('game.common.playerLetter')}4: 8/5</span>
            </div>
          </div>
        </div>
      </div>
      <canvas id="gameCanvas2vs2" width="800" height="400"></canvas>
      <div class="game-footer">
        <button class="btn-back" onclick="history.back()">${t('common.back')}</button>
        <button class="btn-reset" id="reset2vs2Game">🔄 ${t('game.common.resetBtn')}</button>
      </div>
    </div>
  `

  playContent.innerHTML = ""
  playContent.appendChild(gameContainer)
  if (difficulty === "easy" || difficulty === "Easy" || difficulty === "EASY") {
    difficulty = t('game.difficulty.easy.nextTitle');
  } else if (difficulty === "medium" || difficulty === "Medium" || difficulty === "MEDIUM") {
    difficulty = t('game.difficulty.medium.nextTitle');
  } else if (difficulty === "hard" || difficulty === "Hard" || difficulty === "HARD") {
    difficulty = t('game.difficulty.hard.nextTitle');
  }
  initializeConfigurable2vs2Pong(difficulty, scoreLimit, team1Name, team2Name)
}

export function startConfiguredAIGame(difficulty: string, scoreLimit: number) {
  const playContent = document.getElementById("play-content")
  if (!playContent) return

  playContent.innerHTML = `
    <div class="random-match-container fade-in">
      <div class="match-status">
        <div class="status-icon">🤖</div>
        <h2 class="status-title">${t('game.startingThree')}...</h2>
        <p class="status-description">${t('game.common.configuredGame.settingUp')} ${difficulty} ${t('game.common.configuredGame.difficulty')} ${scoreLimit} ${t('game.common.point')}s</p>        
        <div class="search-progress">
          <div class="progress-bar">
            <div class="progress-fill local"></div>
          </div>
          <p class="search-info">
            ${t('game.aiCal')}
          </p>
        </div>
      </div>
    </div>
  `

  setTimeout(() => {
    initializeConfiguredAIGame(difficulty, scoreLimit)
  }, 1000)
}

function initializeConfiguredAIGame(difficulty: string, scoreLimit: number) {
   

  const playContent = document.getElementById("play-content")
  if (!playContent) return

  const playTitle = document.querySelector(".play-title")
  if (playTitle) {
    playTitle.textContent = "🤖 1 vs AI"
  }

  const gameContainer = document.createElement("div")
  if (difficulty === "easy" || difficulty === "Easy" || difficulty === "EASY") {
    difficulty = t('game.difficulty.easy.nextTitle');
  } else if (difficulty === "medium" || difficulty === "Medium" || difficulty === "MEDIUM") {
    difficulty = t('game.difficulty.medium.nextTitle');
  } else if (difficulty === "hard" || difficulty === "Hard" || difficulty === "HARD") {
    difficulty = t('game.difficulty.hard.nextTitle');
  }

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
          <span>${t('game.common.player')}: W/S</span>
          <span>${t('game.aiTitle')}: ${difficulty.toUpperCase()}</span>
          <span>${t('game.common.pause')}: P</span>
        </div>
      </div>
      <canvas id="gameCanvas" width="800" height="400"></canvas>
      <div class="game-footer">
        <button class="btn-back" onclick="history.back()">${t('common.back')}</button>
        <button class="btn-reset" id="resetGame">🔄 ${t('game.common.resetBtn')}</button>
      </div>
    </div>
  `

  playContent.innerHTML = ""
  playContent.appendChild(gameContainer)

  initializeAIPong(difficulty, scoreLimit)
}
