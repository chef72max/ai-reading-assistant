// Demo data - can be imported into the application
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

// Usage Instructions
export const usageInstructions = `
🎯 How to Use AI Reading Assistant:

1. 📚 Library Management
   - Click "Add Book" to add your ebooks
   - Supports PDF, EPUB, MOBI formats
   - Track reading progress and reading history

2. 🎯 Reading Goals
   - Set daily reading targets
   - Track completion status
   - Receive progress reminders

3. 📝 Note System
   - Record thoughts during reading
   - Categorize note types (notes, summaries, questions, insights)
   - Add tags for easy searching

4. 🤖 AI Companion
   - Discuss book content with AI
   - Get chapter summaries
   - Generate mind map structures

5. 📊 Data Statistics
   - View reading trends
   - Analyze reading habits
   - Export detailed reports

💡 Tips: This demo version includes sample data, you can:
- See the effects of various features
- Understand interface layout
- Test interactive functionality
- Modify and extend as needed

🚀 Start your AI reading journey now!
`
