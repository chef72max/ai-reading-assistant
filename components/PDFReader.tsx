'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  Download,
  BookOpen,
  Settings,
  X,
  FileText,
  Search,
  Bookmark,
  Share2
} from 'lucide-react'
import { useReadingStore, Book } from '@/lib/store'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

// 设置PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface PDFReaderProps {
  book: Book
  onClose: () => void
}

export default function PDFReader({ book, onClose }: PDFReaderProps) {
  const { updateBookProgress, addNote, addHighlight } = useReadingStore()
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState(book.currentPage || 1)
  const [scale, setScale] = useState(1.0)
  const [rotation, setRotation] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNotes, setShowNotes] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  const [noteType, setNoteType] = useState<'note' | 'summary' | 'question' | 'insight'>('note')
  const [selectedText, setSelectedText] = useState('')
  const [showHighlightMenu, setShowHighlightMenu] = useState(false)
  const [highlightColor, setHighlightColor] = useState<'yellow' | 'green' | 'blue' | 'pink' | 'purple'>('yellow')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 更新阅读进度
    if (numPages > 0) {
      const progress = Math.round((pageNumber / numPages) * 100)
      updateBookProgress(book.id, pageNumber, progress)
    }
  }, [pageNumber, numPages, book.id, updateBookProgress])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setLoading(false)
    setError(null)
  }

  const onDocumentLoadError = (error: Error) => {
    setError('PDF加载失败，请检查文件是否正确')
    setLoading(false)
    console.error('PDF加载错误:', error)
  }

  const goToPreviousPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1))
  }

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(numPages, prev + 1))
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // 这里可以处理文件上传逻辑
      console.log('选择的文件:', file.name)
    }
  }

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim())
      setShowHighlightMenu(true)
    }
  }

  const handleAddHighlight = () => {
    if (selectedText.trim()) {
      addHighlight({
        bookId: book.id,
        page: pageNumber,
        text: selectedText,
        color: highlightColor,
        note: noteContent || undefined
      })
      
      setSelectedText('')
      setNoteContent('')
      setShowHighlightMenu(false)
    }
  }

  const addNoteToPage = () => {
    if (noteContent.trim()) {
      addNote({
        bookId: book.id,
        page: pageNumber,
        content: noteContent,
        type: noteType,
        tags: []
      })
      setNoteContent('')
      setShowNotes(false)
    }
  }

  const downloadPDF = () => {
    // 这里可以实现PDF下载逻辑
    console.log('下载PDF:', book.title)
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <FileText className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">PDF加载失败</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="btn-primary"
            >
              返回书库
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-3">
              <BookOpen className="h-6 w-6 text-primary-600" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{book.title}</h1>
                <p className="text-sm text-gray-600">{book.author}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowNotes(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>添加笔记</span>
            </button>
            
            <button
              onClick={downloadPDF}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>下载</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPreviousPage}
              disabled={pageNumber <= 1}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-200"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <span className="text-sm text-gray-600">
              第 {pageNumber} 页，共 {numPages} 页
            </span>
            
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-200 rounded-lg hover:bg-gray-200"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            
            <button
              onClick={() => setScale(prev => Math.min(3.0, prev + 0.1))}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            
            <button
              onClick={() => setRotation(prev => prev + 90)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200"
            >
              <RotateCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-gray-100"
        onMouseUp={handleTextSelection}
      >
        <div className="flex justify-center p-4">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">正在加载PDF...</p>
              </div>
            </div>
          )}
          
          {!loading && (
            <Document
              file={book.filePath}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">正在加载PDF...</p>
                  </div>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                rotate={rotation}
                className="shadow-lg"
                renderTextLayer={true}
                renderAnnotationLayer={true}
              />
            </Document>
          )}
        </div>
      </div>

      {/* Highlight Menu */}
      <AnimatePresence>
        {showHighlightMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed z-60 bg-white border border-gray-200 rounded-lg shadow-lg p-3"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-sm font-medium text-gray-700">高亮颜色:</span>
              {['yellow', 'green', 'blue', 'pink', 'purple'].map(color => (
                <button
                  key={color}
                  onClick={() => setHighlightColor(color as any)}
                  className={`w-6 h-6 rounded-full border-2 ${
                    highlightColor === color ? 'border-gray-800' : 'border-gray-300'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="添加高亮笔记（可选）"
              className="w-full p-2 border border-gray-300 rounded text-sm mb-3 resize-none"
              rows={2}
            />
            
            <div className="flex space-x-2">
              <button
                onClick={handleAddHighlight}
                className="btn-primary text-sm px-3 py-1"
              >
                添加高亮
              </button>
              <button
                onClick={() => setShowHighlightMenu(false)}
                className="btn-secondary text-sm px-3 py-1"
              >
                取消
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Note Modal */}
      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
            >
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">添加笔记</h3>
                <button
                  onClick={() => setShowNotes(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    笔记类型
                  </label>
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value as any)}
                    className="input-field"
                  >
                    <option value="note">笔记</option>
                    <option value="summary">总结</option>
                    <option value="question">问题</option>
                    <option value="insight">洞察</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    笔记内容
                  </label>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="写下你的想法..."
                    className="input-field min-h-[120px] resize-none"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowNotes(false)}
                    className="btn-secondary flex-1"
                  >
                    取消
                  </button>
                  <button
                    onClick={addNoteToPage}
                    className="btn-primary flex-1"
                  >
                    添加笔记
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden file input for file selection */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
