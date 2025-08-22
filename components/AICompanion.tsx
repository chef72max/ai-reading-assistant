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

  // 初始化欢迎消息
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: '1',
        type: 'ai',
        content: '你好！我是你的AI阅读助手。我可以帮你：\n\n• 解答关于书籍内容的问题\n• 总结章节要点\n• 分析重要概念\n• 生成思维导图\n• 提供阅读建议\n\n请选择一本书，然后告诉我你需要什么帮助！',
        timestamp: new Date()
      }])
    }
  }, [])

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
      // 模拟AI响应
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const aiResponse = generateAIResponse(inputMessage, selectedBook, selectedPage)
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse,
        timestamp: new Date(),
        bookId: selectedBook,
        page: selectedPage ? parseInt(selectedPage) : undefined
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      toast.error('AI响应生成失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  const generateAIResponse = (userInput: string, bookId: string, page: string): string => {
    const book = books.find(b => b.id === bookId)
    const bookNotes = notes.filter(n => n.bookId === bookId)
    
    if (!book) {
      return '请先选择一本书，这样我就能更好地帮助你！'
    }

    const lowerInput = userInput.toLowerCase()
    
    if (lowerInput.includes('总结') || lowerInput.includes('要点')) {
      return `基于《${book.title}》的内容，我来为你总结一下主要要点：\n\n` +
             `📚 **核心主题**：这本书主要探讨了...\n` +
             `🔑 **关键概念**：\n` +
             `• 概念1：...\n` +
             `• 概念2：...\n` +
             `• 概念3：...\n\n` +
             `💡 **主要观点**：\n` +
             `• 观点1：...\n` +
             `• 观点2：...\n` +
             `• 观点3：...\n\n` +
             `📝 **你的笔记**：我注意到你在这本书上做了 ${bookNotes.length} 条笔记，这些都很棒！`
    }
    
    if (lowerInput.includes('问题') || lowerInput.includes('疑问')) {
      return `关于《${book.title}》，我建议你可以思考这些问题：\n\n` +
             `🤔 **理解性问题**：\n` +
             `• 作者的主要论点是什么？\n` +
             `• 书中的核心概念如何相互关联？\n\n` +
             `💭 **思考性问题**：\n` +
             `• 这些观点如何应用到现实生活中？\n` +
             `• 你同意作者的哪些观点？为什么？\n\n` +
             `🔍 **深入问题**：\n` +
             `• 这本书与其他相关书籍有什么不同？\n` +
             `• 作者的背景如何影响了他的观点？`
    }
    
    if (lowerInput.includes('思维导图') || lowerInput.includes('导图')) {
      return `我来为《${book.title}》生成一个思维导图结构：\n\n` +
             `🌳 **主要分支**：\n` +
             `├── 核心概念\n` +
             `│   ├── 概念A\n` +
             `│   ├── 概念B\n` +
             `│   └── 概念C\n` +
             `├── 主要论点\n` +
             `│   ├── 论点1\n` +
             `│   ├── 论点2\n` +
             `│   └── 论点3\n` +
             `├── 应用场景\n` +
             `│   ├── 个人发展\n` +
             `│   ├── 工作实践\n` +
             `│   └── 社会影响\n` +
             `└── 相关延伸\n` +
             `    ├── 相关书籍\n` +
             `    ├── 实践案例\n` +
             `    └── 未来方向\n\n` +
             `💡 你可以点击"导出思维导图"按钮来下载完整的可视化图表！`
    }
    
    if (lowerInput.includes('建议') || lowerInput.includes('推荐')) {
      return `基于《${book.title}》的内容，我为你提供以下阅读建议：\n\n` +
             `📖 **阅读策略**：\n` +
             `• 先快速浏览目录和章节标题\n` +
             `• 重点阅读核心章节\n` +
             `• 做笔记时关注关键概念和例子\n\n` +
             `🎯 **重点关注**：\n` +
             `• 作者的核心观点和论证过程\n` +
             `• 书中的实际案例和应用\n` +
             `• 与你的知识体系的联系\n\n` +
             `📚 **延伸阅读**：\n` +
             `• 相关主题的其他书籍\n` +
             `• 作者的学术论文或演讲\n` +
             `• 实践应用的相关资源`
    }
    
    return `关于《${book.title}》，我理解你的问题是"${userInput}"。\n\n` +
           `让我基于这本书的内容来回答：\n\n` +
           `📖 **相关内容**：这本书在第${page || '相关'}章节中提到了...\n\n` +
           `💡 **我的理解**：根据书中的内容，我认为...\n\n` +
           `🔍 **深入思考**：你可以进一步思考...\n\n` +
           `📝 **建议**：我建议你重点关注书中的...部分，这对理解你的问题很有帮助。`
  }

  const exportConversation = () => {
    const conversationText = messages.map(msg => 
      `${msg.type === 'user' ? '你' : 'AI助手'} (${msg.timestamp.toLocaleString()}):\n${msg.content}\n\n`
    ).join('---\n\n')
    
    const blob = new Blob([conversationText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-conversation-${new Date().toISOString().split('T')[0]}.txt`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('对话已导出！')
  }

  const clearConversation = () => {
    if (confirm('确定要清空所有对话吗？')) {
      setMessages([{
        id: '1',
        type: 'ai',
        content: '对话已清空。有什么我可以帮助你的吗？',
        timestamp: new Date()
      }])
      toast.success('对话已清空')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI伴读助手</h2>
          <p className="text-gray-600 mt-1">让AI成为你的阅读伙伴，解答疑问、总结要点</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={exportConversation}
            className="btn-secondary flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>导出对话</span>
          </button>
          
          <button
            onClick={clearConversation}
            className="btn-secondary flex items-center space-x-2"
          >
            <RotateCcw className="h-4 w-4" />
            <span>清空对话</span>
          </button>
        </div>
      </div>

      {/* Book Selection */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <BookOpen className="h-5 w-5 text-primary-600" />
          <span className="text-sm font-medium text-gray-700">选择书籍：</span>
          
          <select
            value={selectedBook}
            onChange={(e) => setSelectedBook(e.target.value)}
            className="input-field w-64"
          >
            <option value="">选择一本书</option>
            {books.map(book => (
              <option key={book.id} value={book.id}>
                {book.title} - {book.author}
              </option>
            ))}
          </select>
          
          <span className="text-sm font-medium text-gray-700">页码：</span>
          <input
            type="number"
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            placeholder="可选"
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
                      {message.page && ` (第${message.page}页)`}
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
                  <span className="text-sm text-gray-500">AI正在思考...</span>
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
              placeholder="输入你的问题或请求..."
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
            <span>💡 提示：你可以问我关于书籍内容、总结要点、生成思维导图等问题</span>
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
            setInputMessage('请帮我总结这本书的主要要点')
            handleSendMessage()
          }}
          className="card hover:shadow-md transition-shadow duration-200 text-left p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Lightbulb className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">总结要点</h4>
              <p className="text-sm text-gray-600">快速了解书籍核心内容</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            setInputMessage('请为这本书生成思维导图')
            handleSendMessage()
          }}
          className="card hover:shadow-md transition-shadow duration-200 text-left p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Brain className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">思维导图</h4>
              <p className="text-sm text-gray-600">可视化知识结构</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            setInputMessage('请推荐相关的延伸阅读')
            handleSendMessage()
          }}
          className="card hover:shadow-md transition-shadow duration-200 text-left p-4"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Sparkles className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">延伸阅读</h4>
              <p className="text-sm text-gray-600">发现更多相关资源</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
