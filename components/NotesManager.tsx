'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2,
  Tag,
  BookOpen,
  Calendar,
  Download,
  Share2
} from 'lucide-react'
import { useReadingStore, Note, Book } from '@/lib/store'
import { useLanguage } from '@/contexts/LanguageContext'
import { format } from 'date-fns'
import { enUS, zhCN, es } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function NotesManager() {
  const { notes, books, addNote, updateNote, deleteNote } = useReadingStore()
  const { t, language } = useLanguage()

  const getLocale = () => {
    switch (language) {
      case 'en':
        return enUS
      case 'zh':
        return zhCN
      case 'es':
        return es
      default:
        return enUS
    }
  }
  const [showAddNote, setShowAddNote] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterBook, setFilterBook] = useState('all')
  const [formData, setFormData] = useState<{
    bookId: string
    page: string
    content: string
    type: 'note' | 'summary' | 'insight' | 'question'
    tags: string
  }>({
    bookId: '',
    page: '',
    content: '',
    type: 'note',
    tags: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.bookId || !formData.content) {
      toast.error('请填写所有必填字段')
      return
    }

    const noteData = {
      bookId: formData.bookId,
      page: parseInt(formData.page) || 1,
      content: formData.content,
      type: formData.type,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
    }

    if (editingNote) {
      updateNote(editingNote.id, noteData)
      toast.success('笔记更新成功！')
      setEditingNote(null)
    } else {
      addNote(noteData)
      toast.success('笔记创建成功！')
    }

    setShowAddNote(false)
    resetForm()
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setFormData({
      bookId: note.bookId,
      page: note.page.toString(),
      content: note.content,
      type: note.type,
      tags: note.tags.join(', '),
    })
    setShowAddNote(true)
  }

  const handleDelete = (noteId: string) => {
    if (confirm('确定要删除这条笔记吗？')) {
      deleteNote(noteId)
      toast.success('笔记已删除')
    }
  }

  const resetForm = () => {
    setFormData({
      bookId: '',
      page: '',
      content: '',
      type: 'note',
      tags: '',
    })
  }

  const getBookTitle = (bookId: string) => {
    const book = books.find(b => b.id === bookId)
    return book ? book.title : '未知书籍'
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'note': return 'bg-blue-100 text-blue-800'
      case 'summary': return 'bg-green-100 text-green-800'
      case 'question': return 'bg-yellow-100 text-yellow-800'
      case 'insight': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'note': return '笔记'
      case 'summary': return '总结'
      case 'question': return '问题'
      case 'insight': return '洞察'
      default: return '笔记'
    }
  }

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = filterType === 'all' || note.type === filterType
    const matchesBook = filterBook === 'all' || note.bookId === filterBook
    
    return matchesSearch && matchesType && matchesBook
  })

  const exportNotes = () => {
    const dataStr = JSON.stringify(filteredNotes, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `notes-${format(new Date(), 'yyyy-MM-dd')}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
    
    toast.success('笔记导出成功！')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('notes.title')}</h2>
          <p className="text-gray-600 mt-1">{t('notes.subtitle')}</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={exportNotes}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>{t('common.export')}</span>
          </button>
          
          <button
            onClick={() => setShowAddNote(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>{t('notes.newNote')}</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-primary-600" />
            <div>
              <p className="text-sm text-gray-600">{t('notes.totalNotes')}</p>
              <p className="text-2xl font-bold text-gray-900">{notes.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">{t('notes.booksWithNotes')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(notes.map(n => n.bookId)).size}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3">
            <Tag className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">{t('notes.totalTags')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(notes.flatMap(n => n.tags)).size}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3">
            <Calendar className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">{t('stats.month')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {notes.filter(n => {
                  const noteDate = new Date(n.createdAt)
                  const now = new Date()
                  return noteDate.getMonth() === now.getMonth() && 
                         noteDate.getFullYear() === now.getFullYear()
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索笔记内容或标签..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field w-40"
          >
            <option value="all">所有类型</option>
            <option value="note">笔记</option>
            <option value="summary">总结</option>
            <option value="question">问题</option>
            <option value="insight">洞察</option>
          </select>
          
          <select
            value={filterBook}
            onChange={(e) => setFilterBook(e.target.value)}
            className="input-field w-48"
          >
            <option value="all">所有书籍</option>
            {books.map(book => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes List */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">还没有笔记</h3>
          <p className="text-gray-600">创建你的第一条笔记开始记录想法</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredNotes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="card hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(note.type)}`}>
                    {getTypeLabel(note.type)}
                  </span>
                  <span className="text-sm text-gray-500">
                    第 {note.page} 页
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(note)}
                    className="p-1 text-gray-400 hover:text-blue-600 rounded"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="p-1 text-gray-400 hover:text-red-600 rounded"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h4 className="font-medium text-gray-900 mb-2">
                {getBookTitle(note.bookId)}
              </h4>
              
              <p className="text-gray-700 mb-3 line-clamp-3">
                {note.content}
              </p>

              {note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {note.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{format(new Date(note.createdAt), 'yyyy-MM-dd HH:mm', { locale: zhCN })}</span>
                <button className="flex items-center space-x-1 hover:text-gray-700">
                  <Share2 className="h-3 w-3" />
                  <span>分享</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Note Modal */}
      {showAddNote && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddNote(false)} />
            
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl mx-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingNote ? '编辑笔记' : '新建笔记'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddNote(false)
                    setEditingNote(null)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      选择书籍 *
                    </label>
                    <select
                      value={formData.bookId}
                      onChange={(e) => setFormData(prev => ({ ...prev, bookId: e.target.value }))}
                      className="input-field"
                      required
                    >
                      <option value="">选择一本书</option>
                      {books.map(book => (
                        <option key={book.id} value={book.id}>
                          {book.title} - {book.author}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      页码
                    </label>
                    <input
                      type="number"
                      value={formData.page}
                      onChange={(e) => setFormData(prev => ({ ...prev, page: e.target.value }))}
                      className="input-field"
                      placeholder="1"
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    笔记类型
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
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
                    笔记内容 *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="input-field min-h-[120px] resize-none"
                    placeholder="写下你的想法、问题或总结..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    标签 (用逗号分隔)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="input-field"
                    placeholder="重要, 概念, 问题"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddNote(false)
                      setEditingNote(null)
                      resetForm()
                    }}
                    className="btn-secondary flex-1"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {editingNote ? '更新笔记' : '创建笔记'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
