import { en } from "./en"
import { es } from "./es"
import { fr } from "./fr"
import { renderRoute, updateNavigationSmart } from "../router"

type Language = "en" | "es" | "fr"
type TranslationKey = string

const translations = { en, es, fr }

class Translator {
  private language: Language = "en"

  constructor() {
    this.language = "en"
    this.loadLanguageFromStorage()
  }

  changeLanguage(language: string) {
    if (language === "en" || language === "es" || language === "fr") {
      this.setLanguage(language)
    }
    

    updateNavigationSmart();
    const currentPath = window.location.pathname
    const app = document.getElementById("app")
    if (app) {
      renderRoute(currentPath, app)
    }
  }

  setLanguage(lang: Language) {
    this.language = lang
    localStorage.setItem("language", lang)
  }

  getLanguage(): Language {
    return this.language
  }

  private loadLanguageFromStorage() {
    const saved = localStorage.getItem("language")

    if (saved && (saved === "en" || saved === "es" || saved === "fr")) {
      this.language = saved
       
    } else this.language = "en"
  }

  t(key: TranslationKey): string {
     
    const keys = key.split(".")  
    let value: any = translations[this.language]

    for (const k of keys) {
      value = value?.[k]
    }
    if (typeof value !== "string") {
       
      return key
    }
    return value
  }
}

export const translator = new Translator()
export const t = translator.t.bind(translator)