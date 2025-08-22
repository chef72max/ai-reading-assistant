'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Clock, 
  Target, 
  Play, 
  Pause, 
  CheckCircle,
  FileText,
  MoreVertical,
  Eye
} from 'lucide-react'
import { useReadingStore, Book } from '@/lib/store'
import { useLanguage } from '@/contexts/LanguageContext'
import { formatDistanceToNow } from 'date-fns'
import { enUS, zhCN, es } from 'date-fns/locale'
import PDFReader from './PDFReader'

export default function BookLibrary() {
  const { books, currentBook, setCurrentBook, startSession, endSession } = useReadingStore()
  const { t, language } = useLanguage()
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [readingBook, setReadingBook] = useState<Book | null>(null)

  const getDateLocale = () => {
    switch (language) {
      case 'zh': return zhCN
      case 'es': return es
      default: return enUS
    }
  }

  const filteredBooks = books.filter(book => {
    if (filter === 'reading') return book.progress > 0 && book.progress < 100
    if (filter === 'completed') return book.progress === 100
    if (filter === 'not-started') return book.progress === 0
    return true
  })

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === 'recent') return new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime()
    if (sortBy === 'title') return a.title.localeCompare(b.title)
    if (sortBy === 'progress') return b.progress - a.progress
    return 0
  })

  const handleStartReading = (book: Book) => {
    setCurrentBook(book)
    startSession(book.id)
    setReadingBook(book)
  }

  const handleStopReading = () => {
    endSession()
    setCurrentBook(null)
  }

  const handleCloseReader = () => {
    setReadingBook(null)
  }

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500'
    if (progress > 50) return 'bg-blue-500'
    if (progress > 20) return 'bg-yellow-500'
    return 'bg-gray-300'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('library.title')}</h2>
          <p className="text-gray-600 mt-1">{t('library.subtitle')}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input-field w-40"
          >
            <option value="all">{t('library.totalBooks')}</option>
            <option value="reading">{t('library.currentlyReading')}</option>
            <option value="completed">{t('library.completed')}</option>
            <option value="not-started">Not Started</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input-field w-40"
          >
            <option value="recent">Recent</option>
            <option value="title">By Title</option>
            <option value="progress">By Progress</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-primary-600" />
            <div>
              <p className="text-sm text-gray-600">{t('library.totalBooks')}</p>
              <p className="text-2xl font-bold text-gray-900">{books.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3">
            <Play className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">{t('library.currentlyReading')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {books.filter(b => b.progress > 0 && b.progress < 100).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">{t('library.completed')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {books.filter(b => b.progress === 100).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3">
            <Target className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">{t('library.averageProgress')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {books.length > 0 ? Math.round(books.reduce((acc, b) => acc + b.progress, 0) / books.length) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      {sortedBooks.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('library.noBooks')}</h3>
          <p className="text-gray-600">{t('library.noBooksDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedBooks.map((book, index) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="card hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{book.author}</p>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <FileText className="h-3 w-3" />
                    <span>{book.fileType.toUpperCase()}</span>
                    <span>•</span>
                    <Clock className="h-3 w-3" />
                    <span>{formatDistanceToNow(new Date(book.lastReadAt), { locale: getDateLocale(), addSuffix: true })}</span>
                  </div>
                </div>
                
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">{t('library.readingProgress')}</span>
                  <span className="text-sm font-medium text-gray-900">{book.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(book.progress)}`}
                    style={{ width: `${book.progress}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => setReadingBook(book)}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>{t('library.startReading')}</span>
                </button>
                
                {currentBook?.id === book.id ? (
                  <button
                    onClick={handleStopReading}
                    className="btn-secondary flex items-center justify-center space-x-2 px-3"
                  >
                    <Pause className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartReading(book)}
                    className="btn-secondary flex items-center justify-center space-x-2 px-3"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* PDF Reader */}
      {readingBook && (
        <PDFReader
          book={readingBook}
          onClose={handleCloseReader}
        />
      )}
    </div>
  )
}
