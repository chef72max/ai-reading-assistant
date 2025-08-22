'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Edit, 
  Trash2,
  CheckCircle,
  Clock
} from 'lucide-react'
import { useReadingStore, ReadingGoal, Book } from '@/lib/store'
import { format, addDays, differenceInDays } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function ReadingGoals() {
  const { goals, books, addGoal, updateGoal, deleteGoal } = useReadingStore()
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<ReadingGoal | null>(null)
  const [formData, setFormData] = useState({
    bookId: '',
    targetPages: '',
    dailyTarget: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.bookId || !formData.targetPages || !formData.dailyTarget) {
      toast.error('请填写所有必填字段')
      return
    }

    const goalData = {
      bookId: formData.bookId,
      targetPages: parseInt(formData.targetPages),
      dailyTarget: parseInt(formData.dailyTarget),
      startDate: new Date(formData.startDate),
      endDate: new Date(formData.endDate),
      completed: false,
    }

    if (editingGoal) {
      updateGoal(editingGoal.id, goalData)
      toast.success('目标更新成功！')
      setEditingGoal(null)
    } else {
      addGoal(goalData)
      toast.success('目标创建成功！')
    }

    setShowAddGoal(false)
    resetForm()
  }

  const handleEdit = (goal: ReadingGoal) => {
    setEditingGoal(goal)
    setFormData({
      bookId: goal.bookId,
      targetPages: goal.targetPages.toString(),
      dailyTarget: goal.dailyTarget.toString(),
      startDate: format(new Date(goal.startDate), 'yyyy-MM-dd'),
      endDate: goal.endDate ? format(new Date(goal.endDate), 'yyyy-MM-dd') : '',
    })
    setShowAddGoal(true)
  }

  const handleDelete = (goalId: string) => {
    if (confirm('确定要删除这个阅读目标吗？')) {
      deleteGoal(goalId)
      toast.success('目标已删除')
    }
  }

  const resetForm = () => {
    setFormData({
      bookId: '',
      targetPages: '',
      dailyTarget: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    })
  }

  const getGoalProgress = (goal: ReadingGoal) => {
    const book = books.find(b => b.id === goal.bookId)
    if (!book) return 0
    return Math.min((book.progress / 100) * goal.targetPages, goal.targetPages)
  }

  const getDaysRemaining = (goal: ReadingGoal) => {
    if (goal.completed) return 0
    const endDate = goal.endDate || addDays(new Date(goal.startDate), 30)
    return Math.max(0, differenceInDays(endDate, new Date()))
  }

  const getBookTitle = (bookId: string) => {
    const book = books.find(b => b.id === bookId)
    return book ? book.title : '未知书籍'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">阅读目标</h2>
          <p className="text-gray-600 mt-1">设定和管理你的阅读计划</p>
        </div>
        
        <button
          onClick={() => setShowAddGoal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>新建目标</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center space-x-3">
            <Target className="h-8 w-8 text-primary-600" />
            <div>
              <p className="text-sm text-gray-600">总目标</p>
              <p className="text-2xl font-bold text-gray-900">{goals.length}</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">进行中</p>
              <p className="text-2xl font-bold text-gray-900">
                {goals.filter(g => !g.completed).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">已完成</p>
              <p className="text-2xl font-bold text-gray-900">
                {goals.filter(g => g.completed).length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center space-x-3">
            <Clock className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">平均进度</p>
              <p className="text-2xl font-bold text-gray-900">
                {goals.length > 0 ? Math.round(goals.reduce((acc, g) => {
                  const progress = getGoalProgress(g)
                  return acc + (progress / g.targetPages) * 100
                }, 0) / goals.length) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <div className="text-center py-12">
          <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">还没有阅读目标</h3>
          <p className="text-gray-600">创建一个目标来开始你的阅读计划</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map((goal, index) => {
            const progress = getGoalProgress(goal)
            const progressPercent = Math.round((progress / goal.targetPages) * 100)
            const daysRemaining = getDaysRemaining(goal)
            
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="card hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {getBookTitle(goal.bookId)}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>目标: {goal.targetPages} 页</span>
                      <span>每日: {goal.dailyTarget} 页</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-1 text-gray-400 hover:text-blue-600 rounded"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">进度</span>
                    <span className="text-sm font-medium text-gray-900">
                      {progress} / {goal.targetPages} 页 ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        progressPercent === 100 ? 'bg-green-500' :
                        progressPercent > 70 ? 'bg-blue-500' :
                        progressPercent > 40 ? 'bg-yellow-500' : 'bg-gray-300'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {format(new Date(goal.startDate), 'MM/dd', { locale: zhCN })} - 
                      {goal.endDate ? format(new Date(goal.endDate), ' MM/dd', { locale: zhCN }) : ' 无截止日期'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {goal.completed ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        已完成
                      </span>
                    ) : daysRemaining > 0 ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Clock className="h-3 w-3 mr-1" />
                        剩余 {daysRemaining} 天
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <Clock className="h-3 w-3 mr-1" />
                        已逾期
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddGoal(false)} />
            
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingGoal ? '编辑目标' : '新建目标'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddGoal(false)
                    setEditingGoal(null)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      目标页数 *
                    </label>
                    <input
                      type="number"
                      value={formData.targetPages}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetPages: e.target.value }))}
                      className="input-field"
                      placeholder="100"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      每日目标 *
                    </label>
                    <input
                      type="number"
                      value={formData.dailyTarget}
                      onChange={(e) => setFormData(prev => ({ ...prev, dailyTarget: e.target.value }))}
                      className="input-field"
                      placeholder="10"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      开始日期
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      结束日期
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddGoal(false)
                      setEditingGoal(null)
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
                    {editingGoal ? '更新目标' : '创建目标'}
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
