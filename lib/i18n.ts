import en from '@/locales/en.json'
import es from '@/locales/es.json'
import zh from '@/locales/zh.json'

export type Language = 'en' | 'es' | 'zh'

export const languages: Record<Language, { name: string; nativeName: string; flag: string }> = {
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸'
  },
  zh: {
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳'
  }
}

export const translations = {
  en,
  es,
  zh
}

export const defaultLanguage: Language = 'en'

export function getTranslation(lang: Language) {
  return translations[lang] || translations[defaultLanguage]
}

export function getLanguageName(lang: Language) {
  return languages[lang]?.name || languages[defaultLanguage].name
}

export function getNativeLanguageName(lang: Language) {
  return languages[lang]?.nativeName || languages[defaultLanguage].nativeName
}

export function getLanguageFlag(lang: Language) {
  return languages[lang]?.flag || languages[defaultLanguage].flag
}
