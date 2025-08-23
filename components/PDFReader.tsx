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
  FileText as FileTextIcon,
  Clock,
  Target,
  Maximize2,
  Minimize2,
  BarChart3
} from 'lucide-react'
import { useReadingStore, Book } from '@/lib/store'
import { getFileFromIndexedDB } from '@/lib/store'
import { getFileType, isSupportedFormat, detectFileFormat } from '@/lib/fileUtils'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'
import ePub from 'epubjs'
import { useLanguage } from '@/contexts/LanguageContext'

// Highlight styles - 荧光笔效果
const highlightStyles = `
  .highlight-yellow { 
    background: linear-gradient(180deg, transparent 30%, #FFFF00 30%, #FFFF00 70%, transparent 70%) !important;
    background-color: rgba(255, 255, 0, 0.3) !important;
    color: inherit !important;
    padding: 0 2px !important;
    border-radius: 2px !important;
  }
  .highlight-green { 
    background: linear-gradient(180deg, transparent 30%, #00FF00 30%, #00FF00 70%, transparent 70%) !important;
    background-color: rgba(0, 255, 0, 0.3) !important;
    color: inherit !important;
    padding: 0 2px !important;
    border-radius: 2px !important;
  }
  .highlight-blue { 
    background: linear-gradient(180deg, transparent 30%, #00BFFF 30%, #00BFFF 70%, transparent 70%) !important;
    background-color: rgba(0, 191, 255, 0.3) !important;
    color: inherit !important;
    padding: 0 2px !important;
    border-radius: 2px !important;
  }
  .highlight-pink { 
    background: linear-gradient(180deg, transparent 30%, #FF69B4 30%, #FF69B4 70%, transparent 70%) !important;
    background-color: rgba(255, 105, 180, 0.3) !important;
    color: inherit !important;
    padding: 0 2px !important;
    border-radius: 2px !important;
  }
  .highlight-purple { 
    background: linear-gradient(180deg, transparent 30%, #9370DB 30%, #9370DB 70%, transparent 70%) !important;
    background-color: rgba(147, 112, 219, 0.3) !important;
    color: inherit !important;
    padding: 0 2px !important;
    border-radius: 2px !important;
  }
  
  /* 悬停效果 */
  .highlight-yellow:hover { opacity: 0.8 !important; }
  .highlight-green:hover { opacity: 0.8 !important; }
  .highlight-blue:hover { opacity: 0.8 !important; }
  .highlight-pink:hover { opacity: 0.8 !important; }
  .highlight-purple:hover { opacity: 0.8 !important; }
  
  /* Fullscreen specific styles */
  .reader-content.fullscreen {
    background: #000;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 9999;
  }
  
  .reader-header.fullscreen {
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 10000;
  }
  
  .reader-nav.fullscreen {
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10000;
  }
  
  .pdf-page.fullscreen {
    box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    margin: 20px auto;
    max-width: 90vw;
    max-height: 80vh;
  }
  
  .text-content.fullscreen {
    background: white;
    border-radius: 12px;
    padding: 30px;
    margin: 20px auto;
    max-width: 80vw;
    max-height: 70vh;
    overflow-y: auto;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.3);
  }
  
  /* Force hide any top seams/lines in fullscreen */
  .reader-content.fullscreen * {
    border-top: none !important;
  }
  
  /* Global fullscreen overrides */
  body.fullscreen {
    overflow: hidden !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  
  html.fullscreen {
    overflow: hidden !important;
  }
  
  /* Hide any fixed elements at the very top */
  .fullscreen-override *[style*="position: fixed"],
  .fullscreen-override *[style*="position:fixed"] {
    display: none !important;
  }
  
  .fullscreen-override *[class*="next"],
  .fullscreen-override *[id*="next"],
  .fullscreen-override *[data-nextjs] {
    display: none !important;
  }
`

// Configure PDF.js worker - using more reliable configuration
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

// Fallback worker source
if (!pdfjs.GlobalWorkerOptions.workerSrc) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
}

interface EBookReaderProps {
  book: Book
  onClose: () => void
}

// Supported file formats
const SUPPORTED_FORMATS = {
  pdf: 'application/pdf',
  epub: 'application/epub+zip',
  mobi: 'application/x-mobipocket-ebook',
  azw: 'application/vnd.amazon.ebook',
  txt: 'text/plain',
  html: 'text/html'
}



export default function EBookReader({ book, onClose }: EBookReaderProps) {
  const { updateBookProgress, addNote, addHighlight, highlights } = useReadingStore()
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
  const [fileContent, setFileContent] = useState<File | string | null>(null)
  const [currentFormat, setCurrentFormat] = useState<string>('')
  const [fileRestored, setFileRestored] = useState<boolean>(false)

  // Reading statistics
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date())
  const [currentPageStartTime, setCurrentPageStartTime] = useState<Date>(new Date())
  const [totalReadingTime, setTotalReadingTime] = useState<number>(0)
  const [currentPageTime, setCurrentPageTime] = useState<number>(0)
  const [previousPageTime, setPreviousPageTime] = useState<number>(0)

  // Highlights for current page
  const [pageHighlights, setPageHighlights] = useState<any[]>([])
  
  // Page reading history
  const [pageReadingHistory, setPageReadingHistory] = useState<{[key: number]: number}>({})
  
  // EPUB specific state
  const [epubBook, setEpubBook] = useState<any>(null)
  const [epubRendition, setEpubRendition] = useState<any>(null)
  
  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showUI, setShowUI] = useState(true)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Update reading progress
  useEffect(() => {
    if (numPages > 0) {
      const progress = Math.round((pageNumber / numPages) * 100)
      updateBookProgress(book.id, pageNumber, progress)
    }
  }, [pageNumber, numPages, book.id, updateBookProgress])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goToPreviousPage()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        goToNextPage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [pageNumber, numPages])

  // Track page viewing time
  useEffect(() => {
    const now = new Date()
    console.log(`📖 Page changed to ${pageNumber}, resetting page timer`)
    
    // Save previous page time before resetting
    if (pageNumber > 1) {
      const previousTime = now.getTime() - currentPageStartTime.getTime()
      setPreviousPageTime(previousTime)
      
      // Update page reading history
      setPageReadingHistory(prev => ({
        ...prev,
        [pageNumber - 1]: previousTime
      }))
      
      console.log(`⏱️ Previous page (${pageNumber - 1}) reading time: ${formatTime(previousTime)}`)
    }
    
    setCurrentPageStartTime(now)
    setCurrentPageTime(0) // Reset current page time immediately
  }, [pageNumber])

  // Update reading statistics every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      setTotalReadingTime(now.getTime() - sessionStartTime.getTime())
      setCurrentPageTime(now.getTime() - currentPageStartTime.getTime())
    }, 1000)

    return () => {
      clearInterval(interval)
    }
  }, [sessionStartTime, currentPageStartTime])

  // Update page highlights when page or highlights change
  useEffect(() => {
    const currentPageHighlights = highlights.filter(
      h => h.bookId === book.id && h.page === pageNumber
    )
    setPageHighlights(currentPageHighlights)
  }, [highlights, book.id, pageNumber])

  

  // Use useEffect to handle file loading
  useEffect(() => {
    const loadEBook = async () => {
      console.log('=== Starting ebook loading ===')
      console.log('book object:', book)
      console.log('book.filePath:', book.filePath)
      console.log('book.fileData:', book.fileData)
      console.log('book.fileType:', book.fileType)
      console.log('book.originalFileName:', book.originalFileName)
      
      if (!book.filePath && !book.fileData) {
        setError(t('reader.noFileError'))
        setLoading(false)
        return
      }
      
      let fileToUse: File | string | null = null
      let detectedFormat = ''
      
      if (book.fileData) {
        console.log('Using File object from book.fileData')
        fileToUse = book.fileData
        detectedFormat = detectFileFormat(book.fileData.name, book.fileData.type)
      } else {
        // Try to restore file from IndexedDB
        console.log('Attempting to restore file from IndexedDB...')
        try {
          const restoredFile = await getFileFromIndexedDB(book.id)
          if (restoredFile) {
            console.log('✅ File restored from IndexedDB:', restoredFile.name)
            fileToUse = restoredFile
            detectedFormat = detectFileFormat(restoredFile.name, restoredFile.type)
            // Update the book with restored file data
            book.fileData = restoredFile
            setFileRestored(true)
          } else if (book.filePath) {
            console.log('Using book.filePath as fallback')
            // Extract filename from path for format detection
            const fileNameFromPath = book.filePath.split('/').pop() || book.filePath
            detectedFormat = detectFileFormat(fileNameFromPath)
            fileToUse = book.filePath
          }
        } catch (error) {
          console.error('Failed to restore file from IndexedDB:', error)
          if (book.filePath) {
            console.log('Using book.filePath as fallback after IndexedDB failure')
            const fileNameFromPath = book.filePath.split('/').pop() || book.filePath
            detectedFormat = detectFileFormat(fileNameFromPath)
            fileToUse = book.filePath
          }
        }
      }
      
      // Additional validation
      if (!fileToUse) {
        console.error('❌ No valid file source found')
        setError('没有找到有效的文件源。请重新上传书籍。')
        setLoading(false)
        return
      }
      
      console.log('Determined fileToUse:', fileToUse)
      console.log('Detected format:', detectedFormat)
      setFileFormat(detectedFormat)
      setCurrentFormat(detectedFormat)
      
      // Only check format if we have a specific format, allow unknown to proceed
      if (detectedFormat !== 'unknown' && !isSupportedFormat(detectedFormat)) {
        console.error('Unsupported format:', detectedFormat)
        setError(t('reader.unsupportedFormatError').replace('{format}', detectedFormat))
        setLoading(false)
        return
      }
      
      console.log('Attempting to load ebook file, format:', detectedFormat)
      setLoading(true)
      setError(null)
      
      if (fileToUse instanceof File) {
        console.log('Setting fileContent directly from File object')
        
        // Check file permissions and validity
        try {
          // For text-based formats, extract and display content
          if (['txt', 'html', 'htm'].includes(detectedFormat)) {
            try {
              const textContent = await fileToUse.text()
              setFileContent(textContent)
            } catch (err) {
              console.error('Failed to read text content:', err)
              const errorMessage = err instanceof Error ? err.message : '未知错误'
              if (err instanceof Error && err.message.includes('not granted')) {
                setError('文件权限被拒绝。请检查浏览器设置或重新上传文件。')
              } else {
                setError('读取文件内容失败：' + errorMessage)
              }
              setLoading(false)
              return
            }
          } else if (detectedFormat === 'epub') {
            // Load EPUB content
            try {
              const epubUrl = URL.createObjectURL(fileToUse)
              const epubBookInstance = ePub(epubUrl)
              setEpubBook(epubBookInstance)
              
              epubBookInstance.ready.then(() => {
                const rendition = epubBookInstance.renderTo('#epub-viewer', {
                  width: '100%',
                  height: '100%',
                  flow: 'paginated'
                })
                setEpubRendition(rendition)
                rendition.display()
                setLoading(false)
              }).catch((err: any) => {
                console.error('EPUB loading error:', err)
                const errorMessage = err instanceof Error ? err.message : '未知错误'
                setError(t('reader.epubLoadFailed') + ': ' + errorMessage)
                setLoading(false)
              })
            } catch (err: any) {
              console.error('EPUB processing error:', err)
              const errorMessage = err instanceof Error ? err.message : '未知错误'
              setError(t('reader.epubProcessFailed') + ': ' + errorMessage)
              setLoading(false)
            }
            return
          } else {
            // For PDF and other binary formats, create object URL
            try {
              const objectUrl = URL.createObjectURL(fileToUse)
              console.log('Created object URL for File:', objectUrl)
              setFileContent(objectUrl)
            } catch (err) {
              console.error('Failed to create object URL:', err)
              const errorMessage = err instanceof Error ? err.message : '未知错误'
              setError('创建文件URL失败：' + errorMessage)
              setLoading(false)
              return
            }
          }
          
          setLoading(false)
        } catch (err) {
          console.error('File processing error:', err)
          const errorMessage = err instanceof Error ? err.message : '未知错误'
          setError('文件处理失败：' + errorMessage)
          setLoading(false)
          return
        }
      } else if (typeof fileToUse === 'string') {
        console.log('Fetching file content from URL:', fileToUse)
        try {
          const response = await fetch(fileToUse)
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          // For text-based formats, get text content
          if (['txt', 'html', 'htm'].includes(detectedFormat)) {
            const textContent = await response.text()
            setFileContent(textContent)
          } else {
            const blob = await response.blob()
            const objectUrl = URL.createObjectURL(blob)
            console.log('Created object URL:', objectUrl)
            setFileContent(objectUrl)
          }
          
          setLoading(false)
        } catch (err) {
          console.error('File loading failed during fetch:', err)
          setError(t('reader.loadError'))
          setLoading(false)
        }
      } else {
        setError(t('reader.noFileError'))
        setLoading(false)
      }
    }
    
    loadEBook()
  }, [book.filePath, book.fileData, t, book.originalFileName, book.fileType])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log('PDF loaded successfully, pages:', numPages)
    setNumPages(numPages)
    setLoading(false)
    setError(null)
    
    // Update book progress if we have valid page count
    if (numPages > 0 && book.totalPages !== numPages) {
      // Update the book's total pages if it was not set correctly
      console.log('Updating book total pages from', book.totalPages, 'to', numPages)
    }
  }

  const onDocumentLoadError = (error: Error) => {
    console.error('PDF loading error:', error)
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
      // Handle file upload logic here
      console.log('Selected file:', file.name)
    }
  }

  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      console.log('Text selected:', selection.toString().trim())
      setSelectedText(selection.toString().trim())
      setShowHighlightMenu(true)
    }
  }

  // Enhanced text selection for different file types
  const handleTextSelectionEnhanced = (event: React.MouseEvent) => {
    console.log('Mouse up event triggered')
    setTimeout(() => {
      const selection = window.getSelection()
      console.log('Selection object:', selection)
      if (selection && selection.toString().trim()) {
        const selectedText = selection.toString().trim()
        console.log('✅ Text selected:', selectedText)
        setSelectedText(selectedText)
        setShowHighlightMenu(true)
        
        // Position highlight menu near selection
        try {
          const range = selection.getRangeAt(0)
          const rect = range.getBoundingClientRect()
          console.log('Selection position:', rect)
        } catch (e) {
          console.log('Could not get selection position:', e)
        }
      } else {
        console.log('❌ No text selected')
        setShowHighlightMenu(false)
      }
    }, 150) // Optimized delay for better reliability
  }

  const handleAddHighlight = () => {
    if (selectedText.trim()) {
      console.log('Adding highlight:', {
        bookId: book.id,
        page: pageNumber,
        text: selectedText,
        color: highlightColor,
        note: noteContent || undefined
      })
      
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



  // Helper function to apply highlights to text - 荧光笔效果
  const applyHighlights = (text: string) => {
    if (pageHighlights.length === 0) {
      return text
    }

    let highlightedText = text
    
    // Sort highlights by length (longest first) to avoid partial replacements
    const sortedHighlights = [...pageHighlights].sort((a, b) => b.text.length - a.text.length)
    
    sortedHighlights.forEach((highlight) => {
      if (highlightedText.includes(highlight.text)) {
        const colorClass = `highlight-${highlight.color}`
        const highlightHtml = `<span class="${colorClass}" data-highlight-id="${highlight.id}" title="${highlight.note || t('reader.addHighlightNote')}">${highlight.text}</span>`
        highlightedText = highlightedText.replace(highlight.text, highlightHtml)
      }
    })
    
    return highlightedText
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

  const closeNoteModal = () => {
    setNoteContent('')
    setShowNotes(false)
  }

  const downloadPDF = () => {
    // Implement PDF download logic here
    console.log('Downloading PDF:', book.title)
  }

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true)
        console.log('Entered fullscreen mode')
        
        // Force apply fullscreen styles to body and html
        document.body.classList.add('fullscreen')
        document.documentElement.classList.add('fullscreen')
        document.body.classList.add('fullscreen-override')
        
        // Additional force hiding of top elements
        setTimeout(() => {
          const allTopElements = document.querySelectorAll('*')
          allTopElements.forEach(el => {
            if (el instanceof HTMLElement) {
              const rect = el.getBoundingClientRect()
              if (rect.top <= 20) {
                const styles = window.getComputedStyle(el)
                if (styles.position === 'fixed' || styles.position === 'absolute') {
                  el.style.display = 'none'
                  el.style.visibility = 'hidden'
                  el.style.opacity = '0'
                }
              }
            }
          })
        }, 100)
        
      }).catch(err => {
        console.error('Error entering fullscreen:', err)
      })
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false)
        console.log('Exited fullscreen mode')
        
        // Remove fullscreen classes
        document.body.classList.remove('fullscreen')
        document.documentElement.classList.remove('fullscreen')
        document.body.classList.remove('fullscreen-override')
      }).catch(err => {
        console.error('Error exiting fullscreen:', err)
      })
    }
  }

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  // Auto-enter fullscreen when component mounts
  useEffect(() => {
    // Auto-enter fullscreen after a short delay
    const timer = setTimeout(() => {
      if (!document.fullscreenElement) {
        toggleFullscreen()
      }
    }, 1000) // 1 second delay

    return () => clearTimeout(timer)
  }, []) // Only run once on mount
  
  // Hide Next.js dev panel and other dev elements in fullscreen
  useEffect(() => {
    if (isFullscreen) {
      // Hide Next.js dev panel
      const devPanel = document.querySelector('[data-nextjs-data-runtime]')
      if (devPanel && devPanel instanceof HTMLElement) {
        devPanel.style.display = 'none'
      }
      
      // Hide any other dev-related elements
      const devElements = document.querySelectorAll('[data-nextjs], [data-testid*="dev"], [class*="dev"], [id*="dev"]')
      devElements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.display = 'none'
        }
      })
      
      // Hide any elements with "next" in their attributes
      const nextElements = document.querySelectorAll('[class*="next"], [id*="next"]')
      nextElements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.display = 'none'
        }
      })
      
      // Hide any elements that might be the seam/line
      const seamElements = document.querySelectorAll('[class*="border"], [class*="divider"], [class*="seam"], [style*="border"], [style*="height: 1px"], [style*="height: 2px"]')
      seamElements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.display = 'none'
        }
      })
      
      // Hide any fixed positioned elements at the top
      const fixedTopElements = document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]')
      fixedTopElements.forEach(el => {
        if (el instanceof HTMLElement) {
          const rect = el.getBoundingClientRect()
          if (rect.top <= 10) { // If element is within 10px of top
            el.style.display = 'none'
          }
        }
      })
      
      // Force hide any remaining top elements
      const allElements = document.querySelectorAll('*')
      allElements.forEach(el => {
        if (el instanceof HTMLElement) {
          const rect = el.getBoundingClientRect()
          const styles = window.getComputedStyle(el)
          if (rect.top <= 5 && (styles.position === 'fixed' || styles.position === 'absolute')) {
            el.style.display = 'none'
          }
        }
      })
    }
  }, [isFullscreen])

  // Auto-hide UI in fullscreen mode
  useEffect(() => {
    if (!isFullscreen) return

    let hideTimer: NodeJS.Timeout
    let isMoving = false
    
    const showUI = () => {
      if (!isMoving) {
        setShowUI(true)
        isMoving = true
      }
      clearTimeout(hideTimer)
      hideTimer = setTimeout(() => {
        setShowUI(false)
        isMoving = false
      }, 3000) // Hide after 3 seconds
    }

    const handleMouseMove = () => showUI()
    const handleKeyPress = () => showUI()

    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('keydown', handleKeyPress, { passive: true })
    
    // Initial hide timer
    hideTimer = setTimeout(() => {
      setShowUI(false)
      isMoving = false
    }, 3000)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('keydown', handleKeyPress)
      clearTimeout(hideTimer)
    }
  }, [isFullscreen])

  // Helper function to format time
  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  }

  // Helper function to get highlight color - 荧光笔颜色
  const getHighlightColor = (color: string) => {
    const colors = {
      yellow: '#FFFF00',
      green: '#00FF00', 
      blue: '#00BFFF',
      pink: '#FF69B4',
      purple: '#9370DB'
    }
    return colors[color as keyof typeof colors] || colors.yellow
  }

  // Render different ebook formats
  const renderEBookContent = () => {
    if (!fileContent) return null

    switch (currentFormat) {
      case 'pdf':
        return (
          <Document
            file={fileContent}
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
                </div>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              rotate={rotation}
              className="shadow-lg pdf-page"
              renderTextLayer={true}
              renderAnnotationLayer={true}
              onLoadSuccess={() => {
                console.log('Page loaded successfully:', pageNumber)
              }}
              onLoadError={(error) => {
                console.error('Page loading failed:', error)
              }}
            />
          </Document>
        )
      
      case 'txt':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Text File Reader</h3>
              
              {/* Show highlights for current page */}
              {pageHighlights.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">页面高亮 ({pageHighlights.length})</h4>
                  <div className="space-y-1">
                    {pageHighlights.map((highlight, index) => (
                      <div key={highlight.id} className="text-xs text-blue-800">
                        <span 
                          className={`inline-block w-3 h-3 rounded mr-2`}
                          style={{ backgroundColor: getHighlightColor(highlight.color) }}
                        ></span>
                        {highlight.text.substring(0, 50)}...
                        {highlight.note && <span className="ml-2 italic">({highlight.note})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div 
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto text-content"
                onMouseUp={handleTextSelectionEnhanced}
              >
                {typeof fileContent === 'string' ? (
                  <div 
                    className="text-sm text-gray-800 whitespace-pre-wrap font-mono select-text"
                    dangerouslySetInnerHTML={{ __html: applyHighlights(fileContent) }}
                  />
                ) : (
                  <p className="text-gray-500">Loading text content...</p>
                )}
              </div>
            </div>
          </div>
        )
      
      case 'html':
      case 'htm':
        return (
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">HTML File Reader</h3>
              <div 
                className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto text-content"
                onMouseUp={handleTextSelectionEnhanced}
              >
                {typeof fileContent === 'string' ? (
                  <div 
                    className="text-sm text-gray-800 prose prose-sm max-w-none select-text"
                    dangerouslySetInnerHTML={{ __html: fileContent }}
                  />
                ) : (
                  <p className="text-gray-500">Loading HTML content...</p>
                )}
              </div>
            </div>
          </div>
        )
      
      case 'epub':
        return (
          <div className="w-full h-full">
            {epubRendition ? (
              <div 
                id="epub-viewer" 
                className="w-full h-full bg-white"
                style={{ 
                  fontSize: '16px', 
                  lineHeight: '1.6',
                  padding: '20px',
                  overflowY: 'auto'
                }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="text-center max-w-md">
                  <FileText className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    EPUB Reader
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {t('reader.epubLoading')}
                  </p>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mt-4"></div>
                </div>
              </div>
            )}
          </div>
        )
      
      case 'mobi':
        return (
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md">
              <FileText className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                MOBI Reader
              </h3>
              <p className="text-gray-600 mb-4">
                MOBI format detected. Full MOBI reader implementation is coming soon.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-green-900 mb-2">📚 What you can do:</h4>
                <ul className="text-sm text-green-800 space-y-1 text-left">
                  <li>• Convert to PDF using Calibre</li>
                  <li>• Use Amazon's Kindle converter</li>
                  <li>• Try online MOBI to PDF converters</li>
                </ul>
              </div>
              <button
                onClick={onClose}
                className="btn-primary"
              >
                Return to Library
              </button>
            </div>
          </div>
        )
      
      case 'azw':
        return (
          <div className="flex items-center justify-center py-20">
            <div className="text-center max-w-md">
              <FileText className="h-16 w-16 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                AZW Reader
              </h3>
              <p className="text-gray-600 mb-4">
                AZW format detected. Full AZW reader implementation is coming soon.
              </p>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-purple-900 mb-2">📚 What you can do:</h4>
                <ul className="text-sm text-purple-800 space-y-1 text-left">
                  <li>• Convert to PDF using Calibre</li>
                  <li>• Use Kindle for PC/Mac to export</li>
                  <li>• Try DRM removal tools first</li>
                </ul>
              </div>
              <button
                onClick={onClose}
                className="btn-primary"
              >
                Return to Library
              </button>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('reader.unknownFormat')}
              </h3>
              <p className="text-gray-600">
                {t('reader.unknownFormatDesc')}
              </p>
            </div>
          </div>
        )
    }
    
    return null
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 bg-white">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md">
            <FileText className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">电子书加载失败</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
              <h4 className="font-medium text-red-900 mb-2">可能的原因：</h4>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• 文件路径不存在或已损坏</li>
                <li>• 文件格式不支持</li>
                <li>• 文件权限问题</li>
                <li>• 网络连接问题</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={onClose}
                className="btn-primary w-full"
              >
                返回图书馆
              </button>
              <button
                onClick={() => {
                  console.log('Retrying to load book:', book)
                  setError(null)
                  setLoading(true)
                }}
                className="btn-secondary w-full"
              >
                重试加载
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`fixed inset-0 z-50 bg-white ${isFullscreen ? 'fullscreen-mode' : ''}`}>
      {/* Highlight Styles */}
      <style dangerouslySetInnerHTML={{ __html: highlightStyles }} />
      
      {/* Fullscreen Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        .fullscreen-mode {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%) !important;
        }
        
        .fullscreen-mode .reader-header {
          background: rgba(0, 0, 0, 0.85) !important;
          backdrop-filter: blur(15px) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.15) !important;
          padding: 1rem 2rem !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
        }
        
        .fullscreen-mode .reader-nav {
          background: rgba(0, 0, 0, 0.85) !important;
          backdrop-filter: blur(15px) !important;
          border-top: 1px solid rgba(255, 255, 255, 0.15) !important;
          padding: 1rem 2rem !important;
          box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3) !important;
        }
        
        .fullscreen-mode .reader-content {
          height: 100vh !important;
          max-height: 100vh !important;
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%) !important;
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }
        
        .fullscreen-mode .pdf-page {
          max-width: 90vw !important;
          max-height: 85vh !important;
          object-fit: contain !important;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4) !important;
          border-radius: 8px !important;
          background: white !important;
        }
        
        .fullscreen-mode .text-content {
          max-width: 80vw !important;
          max-height: 80vh !important;
          margin: 0 auto !important;
          padding: 3rem !important;
          background: rgba(255, 255, 255, 0.98) !important;
          border-radius: 16px !important;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3) !important;
          overflow-y: auto !important;
        }
        
        .fullscreen-mode .btn-secondary {
          background: rgba(255, 255, 255, 0.15) !important;
          border: 1px solid rgba(255, 255, 255, 0.25) !important;
          color: white !important;
          backdrop-filter: blur(15px) !important;
          padding: 0.75rem 1.5rem !important;
          border-radius: 8px !important;
          font-weight: 500 !important;
          transition: all 0.2s ease !important;
        }
        
        .fullscreen-mode .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.25) !important;
          border-color: rgba(255, 255, 255, 0.35) !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
        }
        
        .fullscreen-mode .text-gray-600 {
          color: rgba(255, 255, 255, 0.9) !important;
        }
        
        .fullscreen-mode .text-gray-900 {
          color: white !important;
        }
        
        .fullscreen-mode .text-lg {
          color: white !important;
        }
        
        .fullscreen-mode .text-sm {
          color: rgba(255, 255, 255, 0.8) !important;
        }
        
        /* Force hide top seam/line */
        .fullscreen-mode * {
          border-top: none !important;
          margin-top: 0 !important;
          padding-top: 0 !important;
        }
        
        /* Hide any fixed elements at the top */
        .fullscreen-mode [style*="position: fixed"],
        .fullscreen-mode [style*="position:fixed"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
        }
        
        /* Hide Next.js dev elements */
        .fullscreen-mode [class*="next"],
        .fullscreen-mode [id*="next"],
        .fullscreen-mode [data-nextjs] {
          display: none !important;
        }
        
        /* Force remove top spacing */
        .fullscreen-mode body > *:first-child,
        .fullscreen-mode html > *:first-child {
          margin-top: 0 !important;
          padding-top: 0 !important;
        }
        
        /* Enhanced fullscreen content layout */
        .fullscreen-mode .reader-content > * {
          margin: 0 auto !important;
        }
        
        /* Smooth transitions */
        .fullscreen-mode * {
          transition: all 0.2s ease !important;
        }
      `}} />
      
      {/* Header */}
      <header className={`bg-white border-b border-gray-200 px-4 py-3 reader-header transition-all duration-300 ${
        isFullscreen && !showUI ? 'opacity-0 pointer-events-none transform -translate-y-full' : 'opacity-100'
      }`}>
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
                {fileRestored && (
                  <p className="text-xs text-green-600 mt-1">
                    ✅ 文件已从本地存储恢复
                  </p>
                )}
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
              

              
              {/* Reading Stats Button */}
              <button
                onClick={() => {
                  const totalPages = Object.keys(pageReadingHistory).length
                  const totalTime = Object.values(pageReadingHistory).reduce((sum, time) => sum + time, 0)
                  const avgTime = totalPages > 0 ? totalTime / totalPages : 0
                  
                  alert(`📊 阅读统计\n\n已读页面: ${totalPages} 页\n总阅读时间: ${formatTime(totalTime)}\n平均每页: ${formatTime(avgTime)}\n\n详细记录:\n${Object.entries(pageReadingHistory).map(([page, time]) => `第${page}页: ${formatTime(time)}`).join('\n')}`)
                }}
                className="btn-secondary flex items-center space-x-2"
                title="查看阅读统计"
              >
                <BarChart3 className="h-4 w-4" />
                <span>统计</span>
              </button>
              
              {/* Fullscreen Toggle Button */}
              <button
                onClick={toggleFullscreen}
                className="btn-secondary flex items-center space-x-2"
                title={isFullscreen ? "退出全屏" : "进入全屏"}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
                <span>{isFullscreen ? "退出全屏" : "全屏"}</span>
              </button>
            
            
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <div className={`bg-gray-50 border-b border-gray-200 px-4 py-2 reader-nav transition-all duration-300 ${
        isFullscreen && !showUI ? 'opacity-0 pointer-events-none transform -translate-y-full' : 'opacity-100'
      }`}>
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

            {/* Reading Statistics */}
            <div className="flex items-center space-x-4 text-xs text-gray-500 border-l border-gray-300 pl-4">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>总计: {formatTime(totalReadingTime)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Target className="h-3 w-3" />
                <span>当前页: {formatTime(currentPageTime)}</span>
              </div>
              {previousPageTime > 0 && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>上一页: {formatTime(previousPageTime)}</span>
                </div>
              )}
              {/* Debug info */}
              <div className="text-xs text-gray-400">
                Timer: {Math.floor(totalReadingTime / 1000)}s
              </div>
              {/* Highlight debug */}
              <div className="text-xs text-gray-400">
                Highlights: {pageHighlights.length}
              </div>
            </div>
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
        className="flex-1 overflow-auto bg-gray-100 h-full reader-content"
        onMouseUp={handleTextSelectionEnhanced}
      >
        {/* Fullscreen hint */}
        {isFullscreen && !showUI && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-6 py-3 rounded-full text-sm z-50 backdrop-blur-sm border border-white/20">
            <div className="flex items-center space-x-2">
              <span>👆</span>
              <span>移动鼠标或按键显示控制栏</span>
            </div>
          </div>
        )}
        <div className={`flex justify-center ${isFullscreen ? 'p-0' : 'p-4'}`}>
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">{t('reader.loadingPDF')}</p>
                <p className="text-sm text-gray-500 mt-2">{t('reader.filePath')}: {book.filePath || t('reader.notSet')}</p>
              </div>
            </div>
          )}
          
          {/* Remove demo mode interface - show content directly */}
          {!loading && fileContent && (
            <div className={isFullscreen ? 'w-full h-full flex items-center justify-center' : ''}>
              {renderEBookContent()}
            </div>
          )}
          
          {!loading && !fileContent && !error && (
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
            className="fixed z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg p-3"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-sm font-medium text-gray-700">Highlight Color:</span>
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
              placeholder="Add highlight note (optional)"
              className="w-full p-2 border border-gray-300 rounded text-sm mb-3 resize-none"
              rows={2}
            />
            
            <div className="flex space-x-2">
              <button
                onClick={handleAddHighlight}
                className="btn-primary text-sm px-3 py-1"
              >
                Add Highlight
              </button>
              <button
                onClick={() => setShowHighlightMenu(false)}
                className="btn-secondary text-sm px-3 py-1"
              >
                Cancel
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
                <h3 className="text-xl font-semibold text-gray-900">Add Note</h3>
                <button
                  onClick={closeNoteModal}
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
                    onClick={closeNoteModal}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addNoteToPage}
                    className="btn-primary flex-1"
                  >
                    Add Note
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
