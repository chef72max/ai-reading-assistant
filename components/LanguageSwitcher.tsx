'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ChevronDown } from 'lucide-react'
import { Language, languages, getLanguageFlag, getNativeLanguageName } from '@/lib/i18n'

interface LanguageSwitcherProps {
  currentLanguage: Language
  onLanguageChange: (lang: Language) => void
}

export default function LanguageSwitcher({ currentLanguage, onLanguageChange }: LanguageSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleLanguageSelect = (lang: Language) => {
    onLanguageChange(lang)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors duration-200"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">
          {getLanguageFlag(currentLanguage)} {getNativeLanguageName(currentLanguage)}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
          >
            {Object.entries(languages).map(([code, lang]) => (
              <button
                key={code}
                onClick={() => handleLanguageSelect(code as Language)}
                className={`w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors duration-150 ${
                  currentLanguage === code ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <div className="flex-1">
                  <div className="font-medium">{lang.nativeName}</div>
                  <div className="text-xs text-gray-500">{lang.name}</div>
                </div>
                {currentLanguage === code && (
                  <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
