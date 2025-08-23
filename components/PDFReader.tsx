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
  Share2,
  FileText as FileTextIcon
} from 'lucide-react'
import { useReadingStore, Book } from '@/lib/store'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import { useLanguage } from '@/contexts/LanguageContext'

// 设置PDF.js worker - 使用CDN worker确保兼容性
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

// 备用worker源
if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`
}

interface EBookReaderProps {
  book: Book
  onClose: () => void
}

// 支持的文件格式
const SUPPORTED_FORMATS = {
  pdf: 'application/pdf',
  epub: 'application/epub+zip',
  mobi: 'application/x-mobipocket-ebook',
  azw: 'application/vnd.amazon.ebook',
  txt: 'text/plain',
  html: 'text/html'
}

// 获取文件格式
function getFileFormat(filePath: string): string {
  // 处理blob URL
  if (filePath.startsWith('blob:')) {
    // 对于blob URL，我们假设是PDF格式
    return 'pdf'
  }
  const extension = filePath.split('.').pop()?.toLowerCase()
  return extension || 'unknown'
}

// 检查是否支持该格式
function isSupportedFormat(filePath: string): boolean {
  const format = getFileFormat(filePath)
  return Object.keys(SUPPORTED_FORMATS).includes(format)
}

export default function EBookReader({ book, onClose }: EBookReaderProps) {
  const { updateBookProgress, addNote, addHighlight } = useReadingStore()
  const { t, language } = useLanguage()
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
  const [fileFormat, setFileFormat] = useState<string>('')
  const [pdfFile, setPdfFile] = useState<File | string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // 更新阅读进度
  useEffect(() => {
    if (numPages > 0) {
      const progress = Math.round((pageNumber / numPages) * 100)
      updateBookProgress(book.id, pageNumber, progress)
    }
  }, [pageNumber, numPages, book.id, updateBookProgress])

  // 处理blob URL转换为File对象
  const getFileFromBlob = async (blobUrl: string): Promise<File | null> => {
    try {
      console.log('开始转换blob URL:', blobUrl)
      const response = await fetch(blobUrl)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const blob = await response.blob()
      console.log('成功获取blob:', blob.size, 'bytes, type:', blob.type)
      
      // 创建新的blob URL，确保类型正确
      const newBlobUrl = URL.createObjectURL(blob)
      console.log('创建新的blob URL:', newBlobUrl)
      
      return newBlobUrl
    } catch (error) {
      console.error('转换blob URL失败:', error)
      return null
    }
  }

  // 使用useEffect来处理文件加载
  useEffect(() => {
    const loadPDF = async () => {
      if (!book.filePath) {
        setError(t('reader.noFileError'))
        setLoading(false)
        return
      }
      
      const format = getFileFormat(book.filePath)
      setFileFormat(format)
      
      if (!isSupportedFormat(book.filePath)) {
        setError(t('reader.unsupportedFormatError').replace('{format}', format))
        setLoading(false)
        return
      }
      
      console.log('尝试加载电子书文件:', book.filePath, '格式:', format)
      setLoading(true)
      setError(null)
      
      // 如果是blob URL，转换为新的blob URL
      if (book.filePath.startsWith('blob:')) {
        try {
          console.log('检测到blob URL，开始转换...')
          const newBlobUrl = await getFileFromBlob(book.filePath)
          if (newBlobUrl) {
            console.log('成功转换blob URL，设置pdfFile状态')
            setPdfFile(newBlobUrl)
            // 不在这里设置loading为false，让Document组件处理
          } else {
            console.error('转换blob URL失败')
            setError(t('reader.loadError'))
            setLoading(false)
          }
        } catch (error) {
          console.error('转换blob URL过程中出错:', error)
          setError(t('reader.loadError'))
          setLoading(false)
        }
      } else {
        console.log('使用直接文件路径:', book.filePath)
        setPdfFile(book.filePath)
        setLoading(false)
      }
    }
    
    loadPDF()
  }, [book.filePath, t])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF加载成功，页数:', numPages)
    setNumPages(numPages)
    setLoading(false)
    setError(null)
  }

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF加载错误:', error)
    setError(t('reader.loadError'))
    setLoading(false)
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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('reader.loadFailed')}</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="btn-primary"
            >
              {t('reader.returnToLibrary')}
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
              <span>{t('reader.addNote')}</span>
            </button>
            
            <button
              onClick={downloadPDF}
              className="btn-secondary flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>{t('reader.download')}</span>
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
              {t('reader.pageInfo').replace('{current}', pageNumber.toString()).replace('{total}', numPages.toString())}
            </span>
            
            <button
              onClick={goToNextPage}
              disabled={pageNumber >= numPages}
              className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-200"
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
                <p className="text-gray-600">{t('reader.loadingPDF')}</p>
                <p className="text-sm text-gray-500 mt-2">{t('reader.filePath')}: {book.filePath || t('reader.notSet')}</p>
              </div>
            </div>
          )}
          
          {!loading && pdfFile && (
            <Document
              file={pdfFile}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">{t('reader.loadingPDF')}</p>
                  </div>
                </div>
              }
              error={
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('reader.loadFailed')}</h3>
                    <p className="text-gray-600">{t('reader.loadError')}</p>
                    <button
                      onClick={() => setPdfFile(null)}
                      className="btn-secondary mt-4"
                    >
                      {t('reader.returnToLibrary')}
                    </button>
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
                onLoadSuccess={() => {
                  console.log('页面加载成功:', pageNumber)
                }}
                onLoadError={(error) => {
                  console.error('页面加载失败:', error)
                }}
              />
            </Document>
          )}
          
          {!loading && !pdfFile && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('reader.noPDFFile')}</h3>
                <p className="text-gray-600">{t('reader.uploadPDF')}</p>
              </div>
            </div>
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
              <span className="text-sm font-medium text-gray-700">{t('reader.highlightColor')}:</span>
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
              placeholder={t('reader.addHighlightNote')}
              className="w-full p-2 border border-gray-300 rounded text-sm mb-3 resize-none"
              rows={2}
            />
            
            <div className="flex space-x-2">
              <button
                onClick={handleAddHighlight}
                className="btn-primary text-sm px-3 py-1"
              >
                {t('reader.addHighlight')}
              </button>
              <button
                onClick={() => setShowHighlightMenu(false)}
                className="btn-secondary text-sm px-3 py-1"
              >
                {t('reader.cancel')}
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
                <h3 className="text-xl font-semibold text-gray-900">{t('reader.addNote')}</h3>
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
                    {t('reader.noteType')}
                  </label>
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value as any)}
                    className="input-field"
                  >
                    <option value="note">{t('reader.note')}</option>
                    <option value="summary">{t('reader.summary')}</option>
                    <option value="question">{t('reader.question')}</option>
                    <option value="insight">{t('reader.insight')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('reader.noteContent')}
                  </label>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder={t('reader.writeYourThoughts')}
                    className="input-field min-h-[120px] resize-none"
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowNotes(false)}
                    className="btn-secondary flex-1"
                  >
                    {t('reader.cancel')}
                  </button>
                  <button
                    onClick={addNoteToPage}
                    className="btn-primary flex-1"
                  >
                    {t('reader.addNote')}
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
