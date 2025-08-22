'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, FileText, User, BookOpen } from 'lucide-react'
import { useReadingStore } from '@/lib/store'
import { validateFile, createFileURL, revokeFileURL, getFileType } from '@/lib/fileUtils'
import toast from 'react-hot-toast'

interface AddBookModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AddBookModal({ isOpen, onClose }: AddBookModalProps) {
  const { addBook } = useReadingStore()
  const [formData, setFormData] = useState<{
    title: string
    author: string
    filePath: string
    fileType: 'pdf' | 'epub' | 'mobi'
  }>({
    title: '',
    author: '',
    filePath: '',
    fileType: 'pdf',
  })
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [fileURL, setFileURL] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.author || !selectedFile) {
      toast.error('请填写所有必填字段并选择文件')
      return
    }

    try {
      setIsUploading(true)
      
      // 在实际应用中，这里会上传文件到服务器
      // 现在我们先使用本地文件URL
      const bookFilePath = fileURL || selectedFile.name
      
      addBook({
        title: formData.title,
        author: formData.author,
        filePath: bookFilePath,
        fileType: formData.fileType,
      })
      
      toast.success('书籍添加成功！')
      handleClose()
    } catch (error) {
      toast.error('添加失败，请重试')
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
    if (fileURL) {
      revokeFileURL(fileURL)
      setFileURL('')
    }
    onClose()
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // 验证文件
      const validation = validateFile(file)
      if (!validation.valid) {
        toast.error(validation.error || '文件验证失败')
        return
      }
      
      // 设置文件信息
      setSelectedFile(file)
      setFormData(prev => ({
        ...prev,
        filePath: file.name,
        fileType: getFileType(file.name)
      }))
      
      // 创建文件URL用于预览
      const url = createFileURL(file)
      setFileURL(url)
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
                  <h2 className="text-xl font-semibold text-gray-900">添加新书籍</h2>
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
                    书籍标题 *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="input-field pl-10"
                      placeholder="输入书籍标题"
                      required
                    />
                    <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    作者 *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.author}
                      onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                      className="input-field pl-10"
                      placeholder="输入作者姓名"
                      required
                    />
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    文件类型
                  </label>
                  <select
                    value={formData.fileType}
                    onChange={(e) => setFormData(prev => ({ ...prev, fileType: e.target.value as any }))}
                    className="input-field"
                  >
                    <option value="pdf">PDF</option>
                    <option value="epub">EPUB</option>
                    <option value="mobi">MOBI</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    选择文件 *
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".pdf,.epub,.mobi"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                      required
                    />
                    <label
                      htmlFor="file-upload"
                      className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200"
                    >
                      <div className="flex items-center space-x-2">
                        <Upload className="h-5 w-5 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {selectedFile ? selectedFile.name : '点击选择文件'}
                        </span>
                      </div>
                    </label>
                    
                    {selectedFile && (
                      <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">文件类型: {formData.fileType.toUpperCase()}</span>
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
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="btn-primary flex-1 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>添加中...</span>
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        <span>添加书籍</span>
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
