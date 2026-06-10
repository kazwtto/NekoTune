import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import enUS from "./locales/en-US.json"
import ptBR from "./locales/pt-BR.json"

const resources = {
  "en-US": { translation: enUS },
  "pt-BR": { translation: ptBR },
}

const savedLang = typeof window !== "undefined" ? localStorage.getItem("nekotune-language") : null
const detectedLang = navigator?.language || "en-US"
const browserLang = detectedLang.startsWith("pt") ? "pt-BR" : "en-US"

i18n.use(initReactI18next).init({
  resources,
  lng: savedLang || browserLang,
  fallbackLng: "en-US",
  interpolation: {
    escapeValue: false,
  },
})

export function changeLanguage(lang: string) {
  localStorage.setItem("nekotune-language", lang)
  i18n.changeLanguage(lang)
}

export default i18n
