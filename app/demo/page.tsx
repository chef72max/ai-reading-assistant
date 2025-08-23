'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  FileText, 
  Upload, 
  Play, 
  Eye,
  Download,
  Share2
} from 'lucide-react'
import { useReadingStore } from '@/lib/store'
import PDFReader from '@/components/PDFReader'
import toast from 'react-hot-toast'

export default function DemoPage() {
  const { addBook, books } = useReadingStore()
  const [readingBook, setReadingBook] = useState<any>(null)
  const [showUpload, setShowUpload] = useState(false)

  const addDemoBook = () => {
    // Add a demo book
    addBook({
      title: 'Demo PDF Document',
      author: 'AI Reading Assistant',
      filePath: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      fileType: 'pdf'
    })
    toast.success('Demo book added successfully!')
  }

  const startReading = (book: any) => {
    setReadingBook(book)
  }

  const closeReader = () => {
    setReadingBook(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🧪 AI Reading Assistant - Feature Demo
          </h1>
          <p className="text-xl text-gray-600">
            Experience complete reading features including PDF viewing, note taking, highlighting, and more
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="card text-center hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-6">
              <BookOpen className="h-16 w-16 text-primary-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Add Demo Book</h3>
              <p className="text-gray-600 mb-4">
                Add an online PDF document to test reading features
              </p>
              <button
                onClick={addDemoBook}
                className="btn-primary w-full"
              >
                Add Demo Book
              </button>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="card text-center hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-6">
              <Upload className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Local File</h3>
              <p className="text-gray-600 mb-4">
                Upload your own PDF, EPUB, or MOBI files
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="btn-primary w-full"
              >
                Upload File
              </button>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="card text-center hover:shadow-lg transition-shadow duration-200"
          >
            <div className="p-6">
              <Eye className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Reading</h3>
              <p className="text-gray-600 mb-4">
                Choose a book to start your reading experience
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="btn-primary w-full"
              >
                Go to Library
              </button>
            </div>
          </motion.div>
        </div>

        {/* Current Books */}
        {books.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Books</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{book.title}</h3>
                      <p className="text-sm text-gray-600">{book.author}</p>
                      <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                        <FileText className="h-3 w-3" />
                        <span>{book.fileType.toUpperCase()}</span>
                        <span>•</span>
                        <span>{book.progress}% Complete</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => startReading(book)}
                      className="w-full btn-primary flex items-center justify-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>Start Reading</span>
                    </button>
                    
                    <div className="flex space-x-2">
                      <button className="flex-1 btn-secondary text-sm py-2">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </button>
                      <button className="flex-1 btn-secondary text-sm py-2">
                        <Share2 className="h-3 w-3 mr-1" />
                        Share
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Features Overview */}
        <div className="card">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Feature Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">PDF Reader</h4>
                  <p className="text-sm text-gray-600">
                    Complete PDF reading experience with zoom, rotate, page navigation and more
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Note System</h4>
                  <p className="text-sm text-gray-600">
                    Add notes, summaries, questions and insights during reading
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Eye className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Highlight Marking</h4>
                  <p className="text-sm text-gray-600">
                    Select text for highlighting with multiple colors and note adding
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Play className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">AI Companion</h4>
                  <p className="text-sm text-gray-600">
                    Discuss book content with AI assistant for summaries and recommendations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PDF Reader */}
        {readingBook && (
          <PDFReader
            book={readingBook}
            onClose={closeReader}
          />
        )}
      </div>
    </div>
  )
}
