"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, LogOut, User, Globe } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/LanguageContext"

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const { language, setLanguage, t } = useLanguage()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    router.push('/')
  }

  const toggleLanguage = () => {
    setLanguage(language === 'de' ? 'en' : 'de')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href={user ? "/dashboard" : "/"} className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              GastroTools
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link href="/dashboard" className="text-sm font-medium hover:text-purple-600 transition-colors">
                  {t('nav.dashboard')}
                </Link>
                <Link href="/naehrwertrechner" className="text-sm font-medium hover:text-purple-600 transition-colors">
                  {t('nav.nutrition')}
                </Link>
                <Link href="/kostenkontrolle" className="text-sm font-medium hover:text-purple-600 transition-colors">
                  {t('nav.cost')}
                </Link>
                <Link href="/lagerverwaltung" className="text-sm font-medium hover:text-purple-600 transition-colors">
                  {t('nav.inventory')}
                </Link>
                <Link href="/menueplaner" className="text-sm font-medium hover:text-purple-600 transition-colors">
                  {t('nav.menu')}
                </Link>
                <Link href="/speisekarten-designer" className="text-sm font-medium hover:text-purple-600 transition-colors">
                  {t('nav.cards')}
                </Link>
              </>
            ) : (
              <>
                <Link href="#tools" className="text-sm font-medium hover:text-purple-600 transition-colors">
                  Tools
                </Link>
                <Link href="#features" className="text-sm font-medium hover:text-purple-600 transition-colors">
                  Features
                </Link>
              </>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center gap-2"
              title={language === 'de' ? 'Switch to English' : 'Zu Deutsch wechseln'}
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">
                {language === 'de' ? 'EN' : 'DE'}
              </span>
            </Button>
            {user ? (
              <>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>{user.name || user.email}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('nav.logout')}
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">
                    {t('auth.login')}
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    {t('auth.register')}
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-2">
              {user ? (
                <>
                  <Link href="/dashboard" className="block px-4 py-2 text-sm font-medium hover:bg-purple-50 rounded">
                    {t('nav.dashboard')}
                  </Link>
                  <Link href="/naehrwertrechner" className="block px-4 py-2 text-sm font-medium hover:bg-purple-50 rounded">
                    {t('nav.nutrition')}
                  </Link>
                  <Link href="/kostenkontrolle" className="block px-4 py-2 text-sm font-medium hover:bg-purple-50 rounded">
                    {t('nav.cost')}
                  </Link>
                  <Link href="/lagerverwaltung" className="block px-4 py-2 text-sm font-medium hover:bg-purple-50 rounded">
                    {t('nav.inventory')}
                  </Link>
                  <Link href="/menueplaner" className="block px-4 py-2 text-sm font-medium hover:bg-purple-50 rounded">
                    {t('nav.menu')}
                  </Link>
                  <Link href="/speisekarten-designer" className="block px-4 py-2 text-sm font-medium hover:bg-purple-50 rounded">
                    {t('nav.cards')}
                  </Link>
                  <hr className="my-2" />
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm font-medium hover:bg-purple-50 rounded"
                  >
                    {t('nav.logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block px-4 py-2 text-sm font-medium hover:bg-purple-50 rounded">
                    {t('auth.login')}
                  </Link>
                  <Link href="/register" className="block px-4 py-2 text-sm font-medium hover:bg-purple-50 rounded">
                    {t('auth.register')}
                  </Link>
                </>
              )}
              <hr className="my-2" />
              <button 
                onClick={toggleLanguage}
                className="block w-full text-left px-4 py-2 text-sm font-medium hover:bg-purple-50 rounded"
              >
                <Globe className="w-4 h-4 inline mr-2" />
                {language === 'de' ? 'English' : 'Deutsch'}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}