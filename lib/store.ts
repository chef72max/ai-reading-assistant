import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Book {
  id: string
  title: string
  author: string
  filePath: string
  originalFileName?: string // Original filename for blob URL format detection
  fileData?: File // Actual file object for direct access
  fileType: 'pdf' | 'epub' | 'mobi' | 'azw' | 'txt' | 'html'
  totalPages?: number
  currentPage: number
  progress: number
  addedAt: Date
  lastReadAt: Date
}

export interface ReadingSession {
  id: string
  bookId: string
  startTime: Date
  endTime?: Date
  pagesRead: number
  notes: Note[]
  highlights: Highlight[]
}

export interface Note {
  id: string
  bookId: string
  page: number
  content: string
  type: 'note' | 'summary' | 'question' | 'insight'
  createdAt: Date
  tags: string[]
}

export interface Highlight {
  id: string
  bookId: string
  page: number
  text: string
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple'
  note?: string
  createdAt: Date
}

export interface ReadingGoal {
  id: string
  bookId: string
  targetPages: number
  dailyTarget: number
  startDate: Date
  endDate?: Date
  completed: boolean
}

interface ReadingStore {
  // Books
  books: Book[]
  currentBook: Book | null
  
  // Reading sessions
  sessions: ReadingSession[]
  currentSession: ReadingSession | null
  
  // Notes and highlights
  notes: Note[]
  highlights: Highlight[]
  
  // Goals
  goals: ReadingGoal[]
  
  // Actions
  addBook: (book: Omit<Book, 'id' | 'addedAt' | 'lastReadAt' | 'currentPage' | 'progress'>) => void
  setCurrentBook: (book: Book | null) => void
  updateBookProgress: (bookId: string, page: number, progress: number) => void
  deleteBook: (bookId: string) => void
  
  startSession: (bookId: string) => void
  endSession: () => void
  updateSession: (sessionId: string, updates: Partial<ReadingSession>) => void
  
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => void
  updateNote: (noteId: string, updates: Partial<Note>) => void
  deleteNote: (noteId: string) => void
  
  addHighlight: (highlight: Omit<Highlight, 'id' | 'createdAt'>) => void
  updateHighlight: (highlightId: string, updates: Partial<Highlight>) => void
  deleteHighlight: (highlightId: string) => void
  
  addGoal: (goal: Omit<ReadingGoal, 'id'>) => void
  updateGoal: (goalId: string, updates: Partial<ReadingGoal>) => void
  deleteGoal: (goalId: string) => void
}

export const useReadingStore = create<ReadingStore>()(
  persist(
    (set, get) => ({
      books: [],
      currentBook: null,
      sessions: [],
      currentSession: null,
      notes: [],
      highlights: [],
      goals: [],
      
      addBook: (bookData) => {
        const newBook: Book = {
          ...bookData,
          id: crypto.randomUUID(),
          addedAt: new Date(),
          lastReadAt: new Date(),
          currentPage: 1,
          progress: 0,
        }
        set((state) => ({ books: [...state.books, newBook] }))
      },
      
      setCurrentBook: (book) => {
        set({ currentBook: book })
      },
      
      updateBookProgress: (bookId, page, progress) => {
        set((state) => {
          const newBooks = state.books.map((book) =>
            book.id === bookId
              ? { ...book, currentPage: page, progress, lastReadAt: new Date() }
              : book
          )

          const newGoals = state.goals.map((goal) => {
            if (goal.bookId === bookId && progress >= 100) {
              return { ...goal, completed: true }
            }
            return goal
          })

          return { books: newBooks, goals: newGoals }
        })
      },
      
      deleteBook: (bookId) => {
        set((state) => ({
          books: state.books.filter((book) => book.id !== bookId),
        }))
      },
      
      startSession: (bookId) => {
        const session: ReadingSession = {
          id: crypto.randomUUID(),
          bookId,
          startTime: new Date(),
          pagesRead: 0,
          notes: [],
          highlights: [],
        }
        set((state) => ({
          sessions: [...state.sessions, session],
          currentSession: session,
        }))
      },
      
      endSession: () => {
        set((state) => ({
          currentSession: state.currentSession
            ? { ...state.currentSession, endTime: new Date() }
            : null,
        }))
      },
      
      updateSession: (sessionId, updates) => {
        set((state) => ({
          sessions: state.sessions.map((session) =>
            session.id === sessionId ? { ...session, ...updates } : session
          ),
          currentSession: state.currentSession?.id === sessionId
            ? { ...state.currentSession, ...updates }
            : state.currentSession,
        }))
      },
      
      addNote: (noteData) => {
        const newNote: Note = {
          ...noteData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        }
        set((state) => ({ notes: [...state.notes, newNote] }))
      },
      
      updateNote: (noteId, updates) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId ? { ...note, ...updates } : note
          ),
        }))
      },
      
      deleteNote: (noteId) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== noteId),
        }))
      },
      
      addHighlight: (highlightData) => {
        const newHighlight: Highlight = {
          ...highlightData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        }
        set((state) => ({ highlights: [...state.highlights, newHighlight] }))
      },
      
      updateHighlight: (highlightId, updates) => {
        set((state) => ({
          highlights: state.highlights.map((highlight) =>
            highlight.id === highlightId ? { ...highlight, ...updates } : highlight
          ),
        }))
      },
      
      deleteHighlight: (highlightId) => {
        set((state) => ({
          highlights: state.highlights.filter((highlight) => highlight.id !== highlightId),
        }))
      },
      
      addGoal: (goalData) => {
        const newGoal: ReadingGoal = {
          ...goalData,
          id: crypto.randomUUID(),
        }
        set((state) => ({ goals: [...state.goals, newGoal] }))
      },
      
      updateGoal: (goalId, updates) => {
        set((state) => ({
          goals: state.goals.map((goal) =>
            goal.id === goalId ? { ...goal, ...updates } : goal
          ),
        }))
      },
      
      deleteGoal: (goalId) => {
        set((state) => ({
          goals: state.goals.filter((goal) => goal.id !== goalId),
        }))
      },
    }),
    {
      name: 'reading-store',
    }
  )
)
