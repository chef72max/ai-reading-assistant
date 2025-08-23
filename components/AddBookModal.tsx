'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, FileText, User, BookOpen } from 'lucide-react'
import { useReadingStore } from '@/lib/store'
import { validateFile, createFileURL, revokeFileURL, getFileType, parseBookInfo, cleanBookTitle, cleanAuthorName } from '@/lib/fileUtils'
import { useLanguage } from '@/contexts/LanguageContext'
import toast from 'react-hot-toast'

interface AddBookModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddBookModal({ isOpen, onClose }: AddBookModalProps) {
  const { addBook } = useReadingStore()
  const { t } = useLanguage()
  const [formData, setFormData] = useState<{
    title: string
    author: string
    filePath: string
    fileType: 'pdf' | 'epub' | 'mobi' | 'azw' | 'txt' | 'html'
  }>({
    title: '',
    author: '',
    filePath: '',
    fileType: 'pdf',
  })
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    
    console.log('formData', formData)
    console.log('selectedFile', selectedFile)

    if (!formData.title || !formData.author || !selectedFile) {
      toast.error(t('errors.fillAllFields'))
      return
    }

    try {
      setIsUploading(true)
      
      // In actual applications, files would be uploaded to server here
      // For now, we use local file URLs
      addBook({
        title: formData.title,
        author: formData.author,
        filePath: selectedFile.name,
        originalFileName: selectedFile.name, // Save original filename
        fileData: selectedFile, // Save File object
        fileType: formData.fileType,
      })
      
      toast.success(t('bookForm.addBookSuccess'))
      handleClose()
    } catch (error) {
      toast.error(t('errors.addFailed'))
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      author: '',
      filePath: '',
      fileType: 'pdf',
    })
    setSelectedFile(null)
    setSubmitted(false)
    onClose()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file
      const validation = validateFile(file)
      if (!validation.valid) {
        toast.error(validation.error || t('errors.fileValidationFailed'))
        return
      }
      
      // Intelligently parse filename to extract book information
      const parsedInfo = parseBookInfo(file.name)
      console.log('Parsed book information:', parsedInfo)
      
      // Set file information
      setSelectedFile(file)
      const inferredType = getFileType(file.name) as 'pdf' | 'epub' | 'mobi' | 'azw' | 'txt' | 'html' | 'unknown'
      const normalizedType: 'pdf' | 'epub' | 'mobi' | 'azw' | 'txt' | 'html' =
        inferredType === 'pdf' || inferredType === 'epub' || inferredType === 'mobi' || inferredType === 'azw' || inferredType === 'txt' || inferredType === 'html'
          ? inferredType
          : 'pdf'
      setFormData(prev => ({
        ...prev,
        title: parsedInfo.title || prev.title,
        author: parsedInfo.author || prev.author,
        filePath: file.name, // Use filename as path
        fileType: normalizedType
      }))
      
      // If information was successfully parsed, show notification
      if (parsedInfo.title && parsedInfo.author) {
        toast.success(t('bookForm.autoFillSuccess'))
      } else if (parsedInfo.title) {
        toast.success(t('bookForm.autoFillTitleSuccess'))
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={handleClose}
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <BookOpen className="h-6 w-6 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">{t('bookForm.addNewBook')}</h2>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('bookForm.bookTitle')} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="input-field pl-10 pr-12"
                      placeholder={t('bookForm.enterBookTitle')}
                      required
                      aria-invalid={submitted && !formData.title}
                    />
                    <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={() => {
                          const parsedInfo = parseBookInfo(selectedFile.name)
                          setFormData(prev => ({ ...prev, title: cleanBookTitle(parsedInfo.title) }))
                          toast.success(t('bookForm.smartFillTitle'))
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded"
                        title={t('bookForm.smartFillTitle')}
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('bookForm.author')} *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                      className="input-field pl-10 pr-12"
                      placeholder={t('bookForm.enterAuthorName')}
                      required
                      aria-invalid={submitted && !formData.author}
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={() => {
                          const parsedInfo = parseBookInfo(selectedFile.name)
                          setFormData(prev => ({ ...prev, author: cleanAuthorName(parsedInfo.author) }))
                          toast.success(t('bookForm.smartFillAuthor'))
                        }}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded"
                        title={t('bookForm.smartFillAuthor')}
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('bookForm.fileType')}
                  </label>
                  <select
                    value={formData.fileType}
                    onChange={(e) => setFormData(prev => ({ ...prev, fileType: e.target.value as any }))}
                    className="input-field"
                  >
                    <option value="pdf">{t('bookForm.pdf')}</option>
                    <option value="epub">{t('bookForm.epub')}</option>
                    <option value="mobi">{t('bookForm.mobi')}</option>
                    <option value="azw">{t('bookForm.azw')}</option>
                    <option value="txt">{t('bookForm.txt')}</option>
                    <option value="html">{t('bookForm.html')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('bookForm.selectFile')} *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.epub,.mobi,.azw,.txt,.html,.htm"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                      required
                      aria-invalid={submitted && !selectedFile}
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-2">
                        <Upload className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {selectedFile ? selectedFile.name : t('bookForm.clickToSelectFile')}
                        </span>
                      </div>
                    </label>
                    
                    {selectedFile && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{t('bookForm.fileType')}: {formData.fileType.toUpperCase()}</span>
                          <span className="text-gray-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="btn-secondary flex-1"
                  >
                    {t('bookForm.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="btn-primary flex-1 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>{t('bookForm.adding')}</span>
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        <span>{t('bookForm.addBook')}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}
