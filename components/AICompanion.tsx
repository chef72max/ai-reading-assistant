'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Lightbulb, 
  Send, 
  BookOpen, 
  Brain, 
  Sparkles,
  MessageSquare,
  Download,
  Share2,
  RotateCcw
} from 'lucide-react'
import { useReadingStore, Book, Note } from '@/lib/store'
import { useLanguage } from '@/contexts/LanguageContext'
import toast from 'react-hot-toast'

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  bookId?: string
  page?: number
}

export default function AICompanion() {
  const { books, notes, currentBook } = useReadingStore()
  const { t } = useLanguage()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedBook, setSelectedBook] = useState<string>('')
  const [selectedPage, setSelectedPage] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'ai',
        content: t('ai.welcome') + '\n\n' + t('ai.capabilities').map((cap: string) => '• ' + cap).join('\n') + '\n\n' + t('ai.selectBookPrompt'),
        timestamp: new Date()
      }])
    }
  }, [t, messages.length])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
      bookId: selectedBook,
      page: selectedPage ? parseInt(selectedPage) : undefined
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // TODO: Replace with actual AI API call
      const aiResponse = "This is a placeholder response from the AI. Please implement the actual AI logic.";
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        bookId: selectedBook,
        page: selectedPage ? parseInt(selectedPage) : undefined
      };

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      toast.error(t('ai.responseFailed'))
    } finally {
      setIsLoading(false)
    }
  }

  const exportConversation = () => {
    const conversationText = messages.map(msg => 
      `${msg.type === 'user' ? 'You' : 'AI Assistant'} (${msg.timestamp.toLocaleString()}):\n${msg.content}\n\n`
    ).join('---\n\n')
    
    const blob = new Blob([conversationText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-conversation-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Conversation exported successfully!')
  }

  const clearConversation = () => {
    if (confirm('Are you sure you want to clear all conversations?')) {
      setMessages([{
        id: '1',
        type: 'ai',
        content: t('ai.conversationCleared') + '\n\n' + t('ai.helpPrompt'),
        timestamp: new Date()
      }])
      toast.success('Conversation cleared')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Reading Companion</h2>
          <p className="text-gray-600 mt-1">Let AI be your reading partner, answer questions and summarize key points</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={exportConversation}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export Conversation</span>
          </button>
          
          <button
            onClick={clearConversation}
            className="btn-secondary flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Clear Conversation</span>
          </button>
        </div>
      </div>

      {/* Book Selection */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <BookOpen className="h-5 w-5 text-primary-600" />
          <span className="text-sm font-medium text-gray-700">Select Book:</span>
          
          <select
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            className="input-field w-64"
          >
            <option value="">Choose a book</option>
            {books.map(book => (
              <option key={book.id} value={book.id}>
                {book.title} - {book.author}
              </option>
            ))}
          </select>
          
          <span className="text-sm font-medium text-gray-700">Page:</span>
          <input
            type="number"
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            placeholder="Optional"
            className="input-field w-20"
            min="1"
          />
        </div>
      </div>

      {/* Chat Interface */}
      <div className="card h-[600px] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-primary-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                  {message.bookId && (
                    <span className="ml-2">
                      📖 {books.find(b => b.id === message.bookId)?.title}
                      {message.page && ` (Page ${message.page})`}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-sm text-gray-500">AI is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask your question or request..."
              className="input-field flex-1"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="btn-primary px-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>💡 Tip: You can ask me about book content, summarize key points, generate mind maps, etc.</span>
            <div className="flex items-center space-x-2">
              <button className="hover:text-gray-700">
                <Share2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => {
            setInputMessage('Please help me summarize the main points of this book')
            handleSendMessage()
          }}
          className="card hover:shadow-md transition-shadow duration-200 text-left p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lightbulb className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Summarize Key Points</h4>
              <p className="text-sm text-gray-600">Quickly understand the core content of the book</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            setInputMessage('Please generate a mind map for this book')
            handleSendMessage()
          }}
          className="card hover:shadow-md transition-shadow duration-200 text-left p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Brain className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Generate Mind Map</h4>
              <p className="text-sm text-gray-600">Visualize the book structure and concepts</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            setInputMessage('Please recommend related extended reading')
            handleSendMessage()
          }}
          className="card hover:shadow-md transition-shadow duration-200 text-left p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">Extended Reading</h4>
              <p className="text-sm text-gray-600">Discover more related resources</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
