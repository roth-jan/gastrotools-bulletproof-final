'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Language = 'de' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations = {
  de: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.nutrition': 'Nährwertrechner',
    'nav.cost': 'Kostenkontrolle',
    'nav.inventory': 'Lagerverwaltung',
    'nav.menu': 'Menüplaner',
    'nav.cards': 'Speisekarten-Designer',
    'nav.contact': 'Kontakt',
    'nav.logout': 'Abmelden',

    // Auth
    'auth.login': 'Anmelden',
    'auth.register': 'Registrieren',
    'auth.email': 'E-Mail',
    'auth.password': 'Passwort',
    'auth.name': 'Name',
    'auth.company': 'Firma',
    'auth.login_title': 'Anmelden bei GastroTools',
    'auth.login_subtitle': 'Willkommen zurück! Melden Sie sich an, um fortzufahren.',
    'auth.register_title': 'Kostenloses Konto erstellen',
    'auth.register_subtitle': 'Starten Sie noch heute mit professionellen Gastro-Tools',
    'auth.forgot_password': 'Passwort vergessen?',
    'auth.reset_password': 'Passwort zurücksetzen',
    'auth.sign_in': 'Anmelden',
    'auth.create_account': 'Konto erstellen',

    // Nutrition Tool
    'nutrition.title': 'Nährwertrechner',
    'nutrition.subtitle': 'EU-konforme Nährwertberechnung für Ihre Rezepte',
    'nutrition.recipe_name': 'Rezeptname',
    'nutrition.portions': 'Portionen',
    'nutrition.add_ingredient': 'Zutat hinzufügen',
    'nutrition.amount': 'Menge',
    'nutrition.unit': 'Einheit',
    'nutrition.calculate': 'Nährwerte berechnen',
    'nutrition.calculating': 'Berechne...',

    // Common
    'common.loading': 'Laden...',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.delete': 'Löschen',
    'common.edit': 'Bearbeiten',
    'common.search': 'Suchen',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Willkommen zurück!',
    'dashboard.tools': 'Ihre Tools',

    // Homepage
    'home.title': 'Professionelle Gastro-Tools',
    'home.subtitle': 'Alles was Sie für erfolgreiches Restaurantmanagement brauchen',
    'home.get_started': 'Jetzt starten',
  },
  
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.nutrition': 'Nutrition Calculator',
    'nav.cost': 'Cost Control',
    'nav.inventory': 'Inventory Management',
    'nav.menu': 'Menu Planner',
    'nav.cards': 'Menu Card Designer',
    'nav.contact': 'Contact',
    'nav.logout': 'Logout',

    // Auth
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.name': 'Name',
    'auth.company': 'Company',
    'auth.login_title': 'Sign in to GastroTools',
    'auth.login_subtitle': 'Welcome back! Please sign in to continue.',
    'auth.register_title': 'Create Free Account',
    'auth.register_subtitle': 'Start today with professional restaurant tools',
    'auth.forgot_password': 'Forgot password?',
    'auth.reset_password': 'Reset Password',
    'auth.sign_in': 'Sign In',
    'auth.create_account': 'Create Account',

    // Nutrition Tool
    'nutrition.title': 'Nutrition Calculator',
    'nutrition.subtitle': 'EU-compliant nutrition calculation for your recipes',
    'nutrition.recipe_name': 'Recipe Name',
    'nutrition.portions': 'Portions',
    'nutrition.add_ingredient': 'Add Ingredient',
    'nutrition.amount': 'Amount',
    'nutrition.unit': 'Unit',
    'nutrition.calculate': 'Calculate Nutrition',
    'nutrition.calculating': 'Calculating...',

    // Common
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.welcome': 'Welcome back!',
    'dashboard.tools': 'Your Tools',

    // Homepage
    'home.title': 'Professional Restaurant Tools',
    'home.subtitle': 'Everything you need for successful restaurant management',
    'home.get_started': 'Get Started',
  }
}

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('de')

  useEffect(() => {
    const saved = localStorage.getItem('gastrotools-language')
    if (saved && (saved === 'de' || saved === 'en')) {
      setLanguage(saved as Language)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('gastrotools-language', language)
  }, [language])

  const t = (key: string): string => {
    const translation = translations[language][key as keyof typeof translations[typeof language]]
    if (!translation) {
      console.warn(`Missing translation for key: ${key} (${language})`)
      return key
    }
    return translation
  }

  const value = {
    language,
    setLanguage,
    t
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}