import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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
    console.log('🔧 Initializing IndexedDB...')
    
    // Check if IndexedDB is supported
    if (typeof window === 'undefined' || !window.indexedDB) {
      const error = new Error('IndexedDB is not supported in this browser')
      console.error('❌ IndexedDB not supported:', error)
      reject(error)
      return
    }
    
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    
    request.onerror = (event) => {
      console.error('❌ IndexedDB open error:', request.error)
      reject(request.error)
    }
    
    request.onsuccess = (event) => {
      console.log('✅ IndexedDB opened successfully')
      resolve(request.result)
    }
    
    request.onupgradeneeded = (event) => {
      console.log('🔄 IndexedDB upgrade needed, creating stores...')
      const db = (event.target as IDBOpenDBRequest).result
      
      // Create files store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        console.log('📁 Creating files store...')
        const filesStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        console.log('✅ Files store created')
      }
    }
  })
}

// Store file in IndexedDB
export const storeFileInIndexedDB = async (bookId: string, file: File): Promise<void> => {
  try {
    console.log(`🔧 Storing file in IndexedDB for book: ${bookId}`, file.name)
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    
    const result = await store.put({ id: bookId, file })
    console.log(`✅ File stored successfully in IndexedDB:`, result)
    
    // Verify storage
    const verifyRequest = store.get(bookId)
    verifyRequest.onsuccess = () => {
      if (verifyRequest.result) {
        console.log(`✅ File verification successful:`, verifyRequest.result.file.name)
      } else {
        console.error(`❌ File verification failed: no file found after storage`)
      }
    }
  } catch (error) {
    console.error('❌ Failed to store file in IndexedDB:', error)
    throw error
  }
}

// Retrieve file from IndexedDB
export const getFileFromIndexedDB = async (bookId: string): Promise<File | null> => {
  try {
    console.log(`🔍 Retrieving file from IndexedDB for book: ${bookId}`)
    const db = await initDB()
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    
    const request = store.get(bookId)
    return new Promise((resolve, reject) => {
      request.onerror = () => {
        console.error(`❌ IndexedDB retrieval error:`, request.error)
        reject(request.error)
      }
      request.onsuccess = () => {
        const result = request.result
        if (result && result.file) {
          console.log(`✅ File retrieved successfully:`, result.file.name, result.file.size, 'bytes')
          resolve(result.file)
        } else {
          console.log(`❌ No file found in IndexedDB for book: ${bookId}`)
          resolve(null)
        }
      }
    })
  } catch (error) {
    console.error(`❌ Failed to retrieve file from IndexedDB:`, error)
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
  fileType: 'pdf' | 'epub' | 'mobi' | 'azw' | 'azw3' | 'txt' | 'html'
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
  fileType: 'pdf' | 'epub' | 'mobi' | 'azw' | 'azw3' | 'txt' | 'html'
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
  rects?: { x: number; y: number; width: number; height: number }[]
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
      
      addBook: async (bookData) => {
        const newBook: Book = {
          ...bookData,
          id: generateId(),
          addedAt: new Date(),
          lastReadAt: new Date(),
          currentPage: 1,
          progress: 0,
        }
        
        console.log(`📚 Adding new book:`, newBook.id, newBook.title)
        
        // Store the file in IndexedDB for persistence
        if (bookData.fileData) {
          try {
            console.log(`💾 Storing file data for book:`, newBook.id, bookData.fileData.name)
            await storeFileInIndexedDB(newBook.id, bookData.fileData)
            
            // Verify storage immediately
            const storedFile = await getFileFromIndexedDB(newBook.id)
            if (storedFile) {
              console.log(`✅ File storage verification successful:`, storedFile.name)
            } else {
              console.error(`❌ File storage verification failed for book:`, newBook.id)
            }
          } catch (error) {
            console.error('❌ Failed to store file in IndexedDB:', error)
            // Don't add book if file storage fails
            throw new Error(`Failed to store file: ${error}`)
          }
        } else {
          console.log(`⚠️ No file data provided for book:`, newBook.id)
        }
        
        set((state) => ({ books: [...state.books, newBook] }))
        
        console.log(`✅ Book added successfully:`, newBook.id, newBook.title)
        return newBook
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
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        return {
          ...state,
          books: (state.books || []).map((book: any) => ({
            ...book,
            addedAt: book.addedAt instanceof Date ? book.addedAt.toISOString() : new Date(book.addedAt).toISOString(),
            lastReadAt: book.lastReadAt instanceof Date ? book.lastReadAt.toISOString() : new Date(book.lastReadAt).toISOString(),
            fileData: undefined,
          })),
          sessions: (state.sessions || []).map((s: any) => ({
            ...s,
            startTime: s.startTime instanceof Date ? s.startTime.toISOString() : new Date(s.startTime).toISOString(),
            endTime: s.endTime ? (s.endTime instanceof Date ? s.endTime.toISOString() : new Date(s.endTime).toISOString()) : undefined,
          })),
          notes: (state.notes || []).map((n: any) => ({
            ...n,
            createdAt: n.createdAt instanceof Date ? n.createdAt.toISOString() : new Date(n.createdAt).toISOString(),
          })),
          highlights: (state.highlights || []).map((h: any) => ({
            ...h,
            createdAt: h.createdAt instanceof Date ? h.createdAt.toISOString() : new Date(h.createdAt).toISOString(),
          })),
          goals: (state.goals || []).map((g: any) => ({
            ...g,
            startDate: g.startDate instanceof Date ? g.startDate.toISOString() : new Date(g.startDate).toISOString(),
            endDate: g.endDate ? (g.endDate instanceof Date ? g.endDate.toISOString() : new Date(g.endDate).toISOString()) : undefined,
          })),
        }
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return
        // revive Date instances after hydration
        state.books = (state.books || []).map((b: any) => ({
          ...b,
          addedAt: new Date(b.addedAt),
          lastReadAt: new Date(b.lastReadAt),
        }))
        state.sessions = (state.sessions || []).map((s: any) => ({
          ...s,
          startTime: new Date(s.startTime),
          endTime: s.endTime ? new Date(s.endTime) : undefined,
        }))
        state.notes = (state.notes || []).map((n: any) => ({
          ...n,
          createdAt: new Date(n.createdAt),
        }))
        state.highlights = (state.highlights || []).map((h: any) => ({
          ...h,
          createdAt: new Date(h.createdAt),
        }))
        state.goals = (state.goals || []).map((g: any) => ({
          ...g,
          startDate: new Date(g.startDate),
          endDate: g.endDate ? new Date(g.endDate) : undefined,
        }))
      },
    }
  )
)
