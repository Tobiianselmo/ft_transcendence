 
import { startConfiguredLocalGame, startConfigured2vs2Game, startConfiguredAIGame } from "./LocalGameManager"
import { validators } from "../utils/validation"
import { t } from "../languages/translation"

export function setupConfigEventListeners() {
  const startButton = document.getElementById("startConfiguredGame")
  if (startButton) {
    startButton.addEventListener("click", () => {
       
      const difficultyRadios = document.querySelectorAll('input[name="difficulty"]') as NodeListOf<HTMLInputElement>
      let selectedDifficulty = "medium"
      for (const radio of difficultyRadios) {
        if (radio.checked) {
          selectedDifficulty = radio.value
          break
        }
      }

       
      const scoreLimitSelect = document.getElementById("scoreLimit") as HTMLSelectElement
      const scoreLimit = Number.parseInt(scoreLimitSelect.value)

       

       
      startConfiguredLocalGame(selectedDifficulty, scoreLimit)
    })
  }
}

export function setup2vs2ConfigEventListeners() {
  const startButton = document.getElementById("start2vs2ConfiguredGame")
  if (startButton) {
    startButton.addEventListener("click", () => {
       
      const difficultyRadios = document.querySelectorAll('input[name="difficulty"]') as NodeListOf<HTMLInputElement>
      let selectedDifficulty = "medium"
      for (const radio of difficultyRadios) {
        if (radio.checked) {
          selectedDifficulty = radio.value
          break
        }
      }

       
      const scoreLimitSelect = document.getElementById("scoreLimit2vs2") as HTMLSelectElement
      const scoreLimit = Number.parseInt(scoreLimitSelect.value)

       
      const team1NameInput = document.getElementById("team1Name") as HTMLInputElement
      const team2NameInput = document.getElementById("team2Name") as HTMLInputElement

       
      const team1Validation = validators.teamName(team1NameInput.value)
      const team2Validation = validators.teamName(team2NameInput.value)
      
      const team1Name = team1Validation.isValid ? team1NameInput.value : `${t('game.twovstwo.team1Placeholder')}`
      const team2Name = team2Validation.isValid ? team2NameInput.value : `${t('game.twovstwo.team2Placeholder')}`

       

       
      startConfigured2vs2Game(selectedDifficulty, scoreLimit, team1Name, team2Name)
    })
  }
}

export function setupAIConfigEventListeners() {
  const startButton = document.getElementById("startAIConfiguredGame")
  if (startButton) {
    startButton.addEventListener("click", () => {
       
      const difficultyRadios = document.querySelectorAll('input[name="difficulty"]') as NodeListOf<HTMLInputElement>
      let selectedDifficulty = "medium"
      for (const radio of difficultyRadios) {
        if (radio.checked) {
          selectedDifficulty = radio.value
          break
        }
      }

       
      const scoreLimitSelect = document.getElementById("scoreLimitAI") as HTMLSelectElement
      const scoreLimit = Number.parseInt(scoreLimitSelect.value)

       

       
      startConfiguredAIGame(selectedDifficulty, scoreLimit)
    })
  }
}