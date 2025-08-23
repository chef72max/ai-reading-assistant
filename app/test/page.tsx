'use client'

import { useEffect, useCallback } from 'react'
import { useReadingStore } from '@/lib/store'
import { demoBooks, demoNotes, demoGoals } from '@/demo-data'

export default function TestPage() {
  const { 
    addBook, 
    addNote, 
    addGoal, 
    books, 
    notes, 
    goals 
  } = useReadingStore()

  const loadDemoData = useCallback(() => {
    // 清空现有数据
    // 注意：这里只是演示，实际应用中应该有清空功能
    
    // 添加演示书籍
    demoBooks.forEach(book => {
      addBook({
        title: book.title,
        author: book.author,
        filePath: book.filePath,
        fileType: book.fileType as 'pdf' | 'epub' | 'mobi',
        totalPages: book.totalPages
      })
    })
    
    // 添加演示笔记
    demoNotes.forEach(note => {
      addNote({
        bookId: note.bookId,
        page: note.page,
        content: note.content,
        type: note.type as 'note' | 'summary' | 'insight' | 'question',
        tags: note.tags
      })
    })
    
    // 添加演示目标
    demoGoals.forEach(goal => {
      addGoal({
        bookId: goal.bookId,
        targetPages: goal.targetPages,
        dailyTarget: goal.dailyTarget,
        startDate: goal.startDate,
        endDate: goal.endDate,
        completed: goal.completed
      })
    })
  }, [addBook, addNote, addGoal])

  useEffect(() => {
    // 页面加载时自动加载演示数据
    if (books.length === 0) {
      loadDemoData()
    }
  }, [books.length, loadDemoData])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧪 AI阅读助手 - 功能测试页面
          </h1>
          <p className="text-gray-600">
            这个页面用于测试和验证应用的各种功能
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 数据统计</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>书籍数量:</span>
                <span className="font-medium">{books.length}</span>
              </div>
              <div className="flex justify-between">
                <span>笔记数量:</span>
                <span className="font-medium">{notes.length}</span>
              </div>
              <div className="flex justify-between">
                <span>目标数量:</span>
                <span className="font-medium">{goals.length}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 快速操作</h2>
            <div className="space-y-3">
              <button
                onClick={loadDemoData}
                className="w-full btn-primary"
              >
                重新加载演示数据
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full btn-secondary"
              >
                返回主应用
              </button>
            </div>
          </div>
        </div>

        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📚 当前书籍</h2>
          {books.length === 0 ? (
            <p className="text-gray-500">还没有书籍，点击上方按钮加载演示数据</p>
          ) : (
            <div className="space-y-3">
              {books.map(book => (
                <div key={book.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-gray-900">{book.title}</h3>
                      <p className="text-sm text-gray-600">{book.author}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{book.progress}%</p>
                      <p className="text-sm text-gray-500">
                        第 {book.currentPage} 页
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">💡 使用提示</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 mb-4">
              演示数据已加载完成！现在你可以：
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>返回主应用查看完整的界面</li>
              <li>测试书库管理功能</li>
              <li>创建和管理阅读目标</li>
              <li>添加和管理笔记</li>
              <li>与AI伴读助手对话</li>
              <li>查看阅读统计和图表</li>
            </ul>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>提示：</strong> 所有数据都保存在浏览器的本地存储中，刷新页面数据不会丢失。
                你可以随时重新加载演示数据来重置应用状态。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
