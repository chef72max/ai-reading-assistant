// 演示数据 - 可以导入到应用中
export const demoBooks = [
  {
    id: '1',
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    filePath: 'thinking-fast-and-slow.pdf',
    fileType: 'pdf',
    totalPages: 400,
    currentPage: 150,
    progress: 37.5,
    addedAt: new Date('2024-01-15'),
    lastReadAt: new Date('2024-01-20')
  },
  {
    id: '2',
    title: 'Principles',
    author: 'Ray Dalio',
    filePath: 'principles.pdf',
    fileType: 'pdf',
    totalPages: 350,
    currentPage: 350,
    progress: 100,
    addedAt: new Date('2024-01-01'),
    lastReadAt: new Date('2024-01-18')
  },
  {
    id: '3',
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    filePath: 'sapiens.epub',
    fileType: 'epub',
    totalPages: 450,
    currentPage: 200,
    progress: 44.4,
    addedAt: new Date('2024-01-10'),
    lastReadAt: new Date('2024-01-19')
  }
]

export const demoNotes = [
  {
    id: '1',
    bookId: '1',
    page: 45,
    content: 'The difference between System 1 (fast thinking) and System 2 (slow thinking). System 1 is automatic and fast, System 2 is controlled and slow.',
    type: 'note',
    createdAt: new Date('2024-01-16'),
    tags: ['Cognitive Bias', 'Psychology', 'Key Concepts']
  },
  {
    id: '2',
    bookId: '1',
    page: 78,
    content: 'Anchoring Effect: People tend to be influenced by the first information they receive when making decisions.',
    type: 'insight',
    createdAt: new Date('2024-01-17'),
    tags: ['Anchoring Effect', 'Decision Theory']
  },
  {
    id: '3',
    bookId: '2',
    page: 120,
    content: 'Embrace reality and pain: Face reality, even if it\'s painful, this is the key to growth.',
    type: 'summary',
    createdAt: new Date('2024-01-15'),
    tags: ['Growth', 'Reality', 'Pain']
  }
]

export const demoGoals = [
  {
    id: '1',
    bookId: '1',
    targetPages: 400,
    dailyTarget: 20,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-02-15'),
    completed: false
  },
  {
    id: '2',
    bookId: '3',
    targetPages: 450,
    dailyTarget: 25,
    startDate: new Date('2024-01-10'),
    endDate: new Date('2024-02-10'),
    completed: false
  }
]

// 使用说明
export const usageInstructions = `
🎯 如何使用AI阅读助手：

1. 📚 书库管理
   - 点击"添加书籍"来添加你的电子书
   - 支持PDF、EPUB、MOBI格式
   - 跟踪阅读进度和阅读历史

2. 🎯 阅读目标
   - 设定每日阅读目标
   - 跟踪完成情况
   - 获得进度提醒

3. 📝 笔记系统
   - 记录阅读过程中的想法
   - 分类笔记类型（笔记、总结、问题、洞察）
   - 添加标签便于搜索

4. 🤖 AI伴读
   - 与AI讨论书籍内容
   - 获得章节总结
   - 生成思维导图结构

5. 📊 数据统计
   - 查看阅读趋势
   - 分析阅读习惯
   - 导出详细报告

💡 提示：这个演示版本包含了示例数据，你可以：
- 查看各种功能的效果
- 了解界面布局
- 测试交互功能
- 根据需要修改和扩展

🚀 开始你的AI阅读之旅吧！
`
