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
    // Clear existing data
    // Note: This is just a demo, actual applications should have proper data clearing functionality
    
    // Add demo books
    demoBooks.forEach(book => {
      addBook({
        title: book.title,
        author: book.author,
        filePath: book.filePath,
        fileType: book.fileType as 'pdf' | 'epub' | 'mobi',
        totalPages: book.totalPages
      })
    })
    
    // Add demo notes
    demoNotes.forEach(note => {
      addNote({
        bookId: note.bookId,
        page: note.page,
        content: note.content,
        type: note.type as 'note' | 'summary' | 'insight' | 'question',
        tags: note.tags
      })
    })
    
    // Add demo goals
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
    // Automatically load demo data when page loads
    if (books.length === 0) {
      loadDemoData()
    }
  }, [books.length, loadDemoData])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧪 AI Reading Assistant - Feature Test Page
          </h1>
          <p className="text-gray-600">
            This page is used to test and verify various features of the application
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Data Statistics</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Books Count:</span>
                <span className="font-medium">{books.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Notes Count:</span>
                <span className="font-medium">{notes.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Goals Count:</span>
                <span className="font-medium">{goals.length}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🎯 Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={loadDemoData}
                className="w-full btn-primary"
              >
                Reload Demo Data
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full btn-secondary"
              >
                Return to Main App
              </button>
            </div>
          </div>
        </div>

        <div className="card mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">📚 Current Books</h2>
          {books.length === 0 ? (
            <p className="text-gray-500">No books yet, click the button above to load demo data</p>
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
                        Page {book.currentPage}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">💡 Usage Tips</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-700 mb-4">
              Demo data has been loaded successfully! Now you can:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Return to the main app to see the complete interface</li>
              <li>Test library management features</li>
              <li>Create and manage reading goals</li>
              <li>Add and manage notes</li>
              <li>Chat with the AI reading companion</li>
              <li>View reading statistics and charts</li>
            </ul>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> All data is saved in the browser&apos;s local storage, so data won&apos;t be lost when refreshing the page.
                You can reload demo data anytime to reset the application state.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
