// Server-side translation helper
import enTranslations from '../../i18n/en.json'
import deTranslations from '../../i18n/de.json'

type Language = 'en' | 'de'
type Translations = typeof enTranslations

const translations: Record<Language, Translations> = {
  en: enTranslations,
  de: deTranslations
}

export function getTranslation(key: string, language: Language = 'de'): string {
  const keys = key.split('.')
  let value: any = translations[language]

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k]
    } else {
      console.warn(`Translation key not found: ${key}`)
      return key // Return key as fallback
    }
  }

  return typeof value === 'string' ? value : key
}