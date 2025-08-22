'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Target,
  Download,
  Share2,
  Filter,
  BookOpen,
  FileText
} from 'lucide-react'
import { useReadingStore, Book, ReadingSession, Note, Highlight } from '@/lib/store'
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

export default function ReadingStats() {
  const { books, sessions, notes, highlights, goals } = useReadingStore()
  const [timeRange, setTimeRange] = useState('week')
  const [selectedBook, setSelectedBook] = useState('all')

  // 计算统计数据
  const totalBooks = books.length
  const completedBooks = books.filter(b => b.progress === 100).length
  const readingBooks = books.filter(b => b.progress > 0 && b.progress < 100).length
  const totalPages = books.reduce((acc, b) => acc + (b.totalPages || 0), 0)
  const totalNotes = notes.length
  const totalHighlights = highlights.length
  const totalGoals = goals.length
  const completedGoals = goals.filter(g => g.completed).length

  // 计算阅读时间
  const totalReadingTime = sessions.reduce((acc, s) => {
    if (s.endTime) {
      return acc + (new Date(s.endTime).getTime() - new Date(s.startTime).getTime())
    }
    return acc
  }, 0)

  const averageReadingTime = sessions.length > 0 ? totalReadingTime / sessions.length : 0

  // 生成时间范围数据
  const getTimeRangeData = () => {
    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (timeRange) {
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 1 })
        endDate = endOfWeek(now, { weekStartsOn: 1 })
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31)
        break
      default:
        startDate = subDays(now, 7)
        endDate = now
    }

    const days = eachDayOfInterval({ start: startDate, end: endDate })
    
    return days.map(day => {
      const daySessions = sessions.filter(s => {
        const sessionDate = new Date(s.startTime)
        return format(sessionDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      })
      
      const dayNotes = notes.filter(n => {
        const noteDate = new Date(n.createdAt)
        return format(noteDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
      })

      return {
        date: format(day, 'MM/dd'),
        readingTime: daySessions.reduce((acc, s) => {
          if (s.endTime) {
            return acc + (new Date(s.endTime).getTime() - new Date(s.startTime).getTime()) / (1000 * 60) // 转换为分钟
          }
          return acc
        }, 0),
        notes: dayNotes.length,
        pages: daySessions.reduce((acc, s) => acc + s.pagesRead, 0)
      }
    })
  }

  // 书籍类型分布
  const bookTypeData = books.reduce((acc, book) => {
    acc[book.fileType] = (acc[book.fileType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const pieChartData = Object.entries(bookTypeData).map(([type, count]) => ({
    name: type.toUpperCase(),
    value: count
  }))

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  // 阅读进度分布
  const progressRanges = [
    { range: '0%', count: books.filter(b => b.progress === 0).length },
    { range: '1-25%', count: books.filter(b => b.progress > 0 && b.progress <= 25).length },
    { range: '26-50%', count: books.filter(b => b.progress > 25 && b.progress <= 50).length },
    { range: '51-75%', count: books.filter(b => b.progress > 50 && b.progress <= 75).length },
    { range: '76-99%', count: books.filter(b => b.progress > 75 && b.progress < 100).length },
    { range: '100%', count: books.filter(b => b.progress === 100).length }
  ]

  // 笔记类型分布
  const noteTypeData = notes.reduce((acc, note) => {
    acc[note.type] = (acc[note.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const noteTypeChartData = Object.entries(noteTypeData).map(([type, count]) => ({
    name: type === 'note' ? '笔记' : type === 'summary' ? '总结' : type === 'question' ? '问题' : '洞察',
    value: count
  }))

  const exportStats = () => {
    const statsData = {
      summary: {
        totalBooks,
        completedBooks,
        readingBooks,
        totalPages,
        totalNotes,
        totalHighlights,
        totalGoals,
        completedGoals,
        totalReadingTime: Math.round(totalReadingTime / (1000 * 60 * 60)) // 转换为小时
      },
      books: books.map(b => ({
        title: b.title,
        author: b.author,
        progress: b.progress,
        currentPage: b.currentPage,
        lastReadAt: b.lastReadAt
      })),
      notes: notes.map(n => ({
        bookId: n.bookId,
        type: n.type,
        page: n.page,
        content: n.content.substring(0, 100),
        createdAt: n.createdAt
      }))
    }

    const dataStr = JSON.stringify(statsData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `reading-stats-${format(new Date(), 'yyyy-MM-dd')}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">阅读统计</h2>
          <p className="text-gray-600 mt-1">了解你的阅读习惯和进度</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="input-field w-32"
          >
            <option value="week">本周</option>
            <option value="month">本月</option>
            <option value="year">本年</option>
          </select>
          
          <select
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            className="input-field w-48"
          >
            <option value="all">所有书籍</option>
            {books.map(book => (
              <option key={book.id} value={book.id}>
                {book.title}
              </option>
            ))}
          </select>
          
          <button
            onClick={exportStats}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>导出统计</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">总书籍</p>
              <p className="text-2xl font-bold text-gray-900">{totalBooks}</p>
              <p className="text-xs text-gray-500">
                {completedBooks} 已完成 • {readingBooks} 进行中
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">总阅读时间</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(totalReadingTime / (1000 * 60 * 60))}h
              </p>
              <p className="text-xs text-gray-500">
                平均 {Math.round(averageReadingTime / (1000 * 60))} 分钟/次
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">总笔记</p>
              <p className="text-2xl font-bold text-gray-900">{totalNotes}</p>
              <p className="text-xs text-gray-500">
                {totalHighlights} 高亮 • {new Set(notes.map(n => n.bookId)).size} 本书
              </p>
            </div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Target className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">阅读目标</p>
              <p className="text-2xl font-bold text-gray-900">{totalGoals}</p>
              <p className="text-xs text-gray-500">
                {completedGoals} 已完成 • {totalGoals - completedGoals} 进行中
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reading Progress Over Time */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">阅读进度趋势</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getTimeRangeData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="readingTime" stroke="#3b82f6" strokeWidth={2} name="阅读时间(分钟)" />
              <Line type="monotone" dataKey="notes" stroke="#10b981" strokeWidth={2} name="笔记数量" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Book Progress Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">阅读进度分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={progressRanges}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Book Types Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">书籍类型分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Note Types Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">笔记类型分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={noteTypeChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {noteTypeChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Books */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.9 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">热门书籍</h3>
        <div className="space-y-3">
          {books
            .sort((a, b) => b.progress - a.progress)
            .slice(0, 5)
            .map((book, index) => (
              <div key={book.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-primary-600">#{index + 1}</span>
                  <div>
                    <h4 className="font-medium text-gray-900">{book.title}</h4>
                    <p className="text-sm text-gray-600">{book.author}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{book.progress}%</p>
                  <p className="text-sm text-gray-600">
                    {format(new Date(book.lastReadAt), 'MM/dd', { locale: zhCN })}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </motion.div>
    </div>
  )
}
