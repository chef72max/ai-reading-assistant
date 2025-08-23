import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Fallback UUID generator for environments where crypto.randomUUID is not available
const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback to a simple ID generator
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// IndexedDB operations for file storage
const DB_NAME = 'reading-assistant-files'
const DB_VERSION = 1
const STORE_NAME = 'files'

// Initialize IndexedDB
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
  })
}

// Store file in IndexedDB
const storeFileInIndexedDB = async (bookId: string, file: File): Promise<void> => {
  try {
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    await store.put({ id: bookId, file })
    console.log(`File stored in IndexedDB for book: ${bookId}`)
  } catch (error) {
    console.error('Failed to store file in IndexedDB:', error)
  }
}

// Retrieve file from IndexedDB
export const getFileFromIndexedDB = async (bookId: string): Promise<File | null> => {
  try {
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    
    const request = store.get(bookId)
    return new Promise((resolve, reject) => {
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const result = request.result
        resolve(result ? result.file : null)
      }
    })
  } catch (error) {
    console.error('Failed to retrieve file from IndexedDB:', error)
    return null
  }
}

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

// Serializable version of Book for storage
export interface SerializableBook {
  id: string
  title: string
  author: string
  filePath: string
  originalFileName?: string
  fileType: 'pdf' | 'epub' | 'mobi' | 'azw' | 'txt' | 'html'
  totalPages?: number
  currentPage: number
  progress: number
  addedAt: string // ISO string for Date
  lastReadAt: string // ISO string for Date
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
  
  // Clear all data
  clearAllData: () => void
  
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
          id: generateId(),
          addedAt: new Date(),
          lastReadAt: new Date(),
          currentPage: 1,
          progress: 0,
        }
        
        // Store the file in IndexedDB for persistence
        if (bookData.fileData) {
          storeFileInIndexedDB(newBook.id, bookData.fileData)
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
          id: generateId(),
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
          id: generateId(),
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
          id: generateId(),
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
          id: generateId(),
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
      
      clearAllData: () => {
        set(() => ({
          books: [],
          currentBook: null,
          sessions: [],
          currentSession: null,
          notes: [],
          highlights: [],
          goals: []
        }))
      },
    }),
    {
      name: 'reading-store',
      // Custom serialization to handle File objects and Dates
      serialize: (state) => {
        const serializableState = {
          ...state,
          books: (state.books || []).map(book => ({
            ...book,
            addedAt: book.addedAt.toISOString(),
            lastReadAt: book.lastReadAt.toISOString(),
            // Remove fileData as it can't be serialized
            fileData: undefined
          })),
          sessions: (state.sessions || []).map(session => ({
            ...session,
            startTime: session.startTime.toISOString(),
            endTime: session.endTime?.toISOString()
          })),
          notes: (state.notes || []).map(note => ({
            ...note,
            createdAt: note.createdAt.toISOString()
          })),
          highlights: (state.highlights || []).map(highlight => ({
            ...highlight,
            createdAt: highlight.createdAt.toISOString()
          })),
          goals: (state.goals || []).map(goal => ({
            ...goal,
            startDate: goal.startDate.toISOString(),
            endDate: goal.endDate?.toISOString()
          }))
        }
        return JSON.stringify(serializableState)
      },
      // Custom deserialization to restore Date objects
      deserialize: (str) => {
        try {
          const parsed = JSON.parse(str)
          return {
            ...parsed,
            books: (parsed.books || []).map((book: any) => ({
              ...book,
              addedAt: new Date(book.addedAt),
              lastReadAt: new Date(book.lastReadAt)
            })),
            sessions: (parsed.sessions || []).map((session: any) => ({
              ...session,
              startTime: new Date(session.startTime),
              endTime: session.endTime ? new Date(session.endTime) : undefined
            })),
            notes: (parsed.notes || []).map((note: any) => ({
              ...note,
              createdAt: new Date(note.createdAt)
            })),
            highlights: (parsed.highlights || []).map((highlight: any) => ({
              ...highlight,
              createdAt: new Date(highlight.createdAt)
            })),
            goals: (parsed.goals || []).map((goal: any) => ({
              ...goal,
              startDate: new Date(goal.startDate),
              endDate: goal.endDate ? new Date(goal.endDate) : undefined
            }))
          }
        } catch (error) {
          console.error('Failed to deserialize state:', error)
          // Return default state if deserialization fails
          return {
            books: [],
            currentBook: null,
            sessions: [],
            currentSession: null,
            notes: [],
            highlights: [],
            goals: []
          }
        }
      }
    }
  )
)
