'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Target, 
  FileText, 
  Lightbulb, 
  BarChart3, 
  Settings,
  Plus,
  Search
} from 'lucide-react'
import { useReadingStore } from '@/lib/store'
import { useLanguage } from '@/contexts/LanguageContext'
import BookLibrary from '@/components/BookLibrary'
import ReadingGoals from '@/components/ReadingGoals'
import NotesManager from '@/components/NotesManager'
import AICompanion from '@/components/AICompanion'
import ReadingStats from '@/components/ReadingStats'
import AddBookModal from '@/components/AddBookModal'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { demoBooks, demoNotes, demoGoals } from '@/demo-data'

export default function Home() {
  const [activeTab, setActiveTab] = useState('library')
  const [showAddBook, setShowAddBook] = useState(false)
  const { books, currentBook, addBook, addNote, addGoal } = useReadingStore()
  const { t, language, setLanguage } = useLanguage()

  // Manual initialization function for testing
  const initializeDemoData = () => {
    console.log('Manually initializing demo data...')
    
    // Create virtual file content for demo books
    const createVirtualFile = (title: string, author: string, content: string, type: string) => {
      const blob = new Blob([content], { type: `text/${type}` })
      return new File([blob], `${title.toLowerCase().replace(/\s+/g, '-')}.${type}`, { type: `text/${type}` })
    }
    
    const demoBooksWithVirtualContent = [
      {
        title: 'Thinking, Fast and Slow',
        author: 'Daniel Kahneman',
        content: `Thinking, Fast and Slow

by Daniel Kahneman

Chapter 1: The Characters of the Story

Our brains have two systems:
- System 1: Fast, automatic, intuitive
- System 2: Slow, deliberate, logical

System 1 operates automatically and quickly, with little or no effort and no sense of voluntary control.

System 2 allocates attention to the effortful mental activities that demand it, including complex computations.

This is a demonstration of the book content. In a real application, this would be the actual PDF content.`,
        fileType: 'txt' as const,
        totalPages: 400
      },
      {
        title: 'Principles',
        author: 'Ray Dalio',
        content: `Principles

by Ray Dalio

Introduction

I believe that everything that happens comes about because of cause-effect relationships that repeat and evolve over time.

The key to success in life is to:
1. Know what you want
2. Know what's true
3. Know what to do about it

This is a demonstration of the book content. In a real application, this would be the actual PDF content.`,
        fileType: 'txt' as const,
        totalPages: 350
      },
      {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        content: `Sapiens: A Brief History of Humankind

by Yuval Noah Harari

Chapter 1: An Animal of No Significance

About 13.5 billion years ago, matter, energy, time and space came into being in what is known as the Big Bang.

The story of these fundamental features of our universe is called physics.

About 300,000 years after their appearance, matter and energy started to coalesce into complex structures, called atoms.

This is a demonstration of the book content. In a real application, this would be the actual PDF content.`,
        fileType: 'txt' as const,
        totalPages: 450
      }
    ]
    
    demoBooksWithVirtualContent.forEach(book => {
      console.log('Adding book with virtual content:', book.title)
      const virtualFile = createVirtualFile(book.title, book.author, book.content, book.fileType)
      
      addBook({
        title: book.title,
        author: book.author,
        filePath: virtualFile.name,
        fileData: virtualFile, // Include the virtual file
        fileType: book.fileType,
        totalPages: book.totalPages
      })
    })
    
    console.log('Demo data initialization complete')
  }

  // Initialize demo data if no books exist
  useEffect(() => {
    if (books.length === 0) {
      console.log('Initializing demo data...')
      
      // Create virtual file content for demo books
      const createVirtualFile = (title: string, author: string, content: string, type: string) => {
        const blob = new Blob([content], { type: `text/${type}` })
        return new File([blob], `${title.toLowerCase().replace(/\s+/g, '-')}.${type}`, { type: `text/${type}` })
      }
      
      const demoBooksWithVirtualContent = [
        {
          title: 'Thinking, Fast and Slow',
          author: 'Daniel Kahneman',
          content: `Thinking, Fast and Slow

by Daniel Kahneman

Chapter 1: The Characters of the Story

Our brains have two systems:
- System 1: Fast, automatic, intuitive
- System 2: Slow, deliberate, logical

System 1 operates automatically and quickly, with little or no effort and no sense of voluntary control.

System 2 allocates attention to the effortful mental activities that demand it, including complex computations.

This is a demonstration of the book content. In a real application, this would be the actual PDF content.`,
          fileType: 'txt' as const,
          totalPages: 400
        },
        {
          title: 'Principles',
          author: 'Ray Dalio',
          content: `Principles

by Ray Dalio

Introduction

I believe that everything that happens comes about because of cause-effect relationships that repeat and evolve over time.

The key to success in life is to:
1. Know what you want
2. Know what's true
3. Know what to do about it

This is a demonstration of the book content. In a real application, this would be the actual PDF content.`,
          fileType: 'txt' as const,
          totalPages: 350
        },
        {
          title: 'Sapiens: A Brief History of Humankind',
          author: 'Yuval Noah Harari',
          content: `Sapiens: A Brief History of Humankind

by Yuval Noah Harari

Chapter 1: An Animal of No Significance

About 13.5 billion years ago, matter, energy, time and space came into being in what is known as the Big Bang.

The story of these fundamental features of our universe is called physics.

About 300,000 years after their appearance, matter and energy started to coalesce into complex structures, called atoms.

This is a demonstration of the book content. In a real application, this would be the actual PDF content.`,
          fileType: 'txt' as const,
          totalPages: 450
        }
      ]
      
      demoBooksWithVirtualContent.forEach(book => {
        console.log('Adding book with virtual content:', book.title)
        const virtualFile = createVirtualFile(book.title, book.author, book.content, book.fileType)
        
        addBook({
          title: book.title,
          author: book.author,
          filePath: virtualFile.name,
          fileData: virtualFile, // Include the virtual file
          fileType: book.fileType,
          totalPages: book.totalPages
        })
      })
      
      demoNotes.forEach(note => {
        addNote({
          bookId: note.bookId,
          page: note.page,
          content: note.content,
          type: note.type as 'note' | 'summary' | 'question' | 'insight',
          tags: note.tags
        })
      })
      
      demoGoals.forEach(goal => {
        addGoal({
          bookId: goal.bookId,
          targetPages: goal.targetPages,
          dailyTarget: goal.dailyTarget,
          startDate: goal.startDate,
          endDate: goal.endDate,
          completed: goal.completed
        })
      })
    }
  }, [books.length, addBook, addNote, addGoal])

  const tabs = [
    { id: 'library', label: t('navigation.library'), icon: BookOpen },
    { id: 'goals', label: t('navigation.goals'), icon: Target },
    { id: 'notes', label: t('navigation.notes'), icon: FileText },
    { id: 'ai', label: t('navigation.ai'), icon: Lightbulb },
    { id: 'stats', label: t('navigation.stats'), icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">AI Reading Assistant</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('common.search') + ' books, notes...'}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent w-64"
                />
              </div>
              
              {/* Debug button for testing */}
              {books.length === 0 && (
                <button
                  onClick={initializeDemoData}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <span>🧪 Init Demo Data</span>
                </button>
              )}
              
              <button
                onClick={() => setShowAddBook(true)}
                className="btn-primary flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>{t('library.addBook')}</span>
              </button>
              
              <LanguageSwitcher 
                currentLanguage={language}
                onLanguageChange={setLanguage}
              />
              
              <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'library' && <BookLibrary />}
          {activeTab === 'goals' && <ReadingGoals />}
          {activeTab === 'notes' && <NotesManager />}
          {activeTab === 'ai' && <AICompanion />}
          {activeTab === 'stats' && <ReadingStats />}
        </motion.div>
      </main>

      {/* Add Book Modal */}
      <AddBookModal 
        isOpen={showAddBook} 
        onClose={() => setShowAddBook(false)} 
      />
    </div>
  )
}
