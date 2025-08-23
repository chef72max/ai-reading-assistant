// File processing utility functions

export const isSupportedFormat = (format: string): boolean => {
  return Object.keys(SUPPORTED_FORMATS).includes(format)
}

// Intelligently parse filename to extract book title and author
export const parseBookInfo = (fileName: string): { title: string; author: string } => {
  // Remove file extension
  let nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
  
  // Common separator patterns
  const patterns = [
    // Author - Title format
    /^(.+?)\s*[-–—]\s*(.+)$/,
    // Title by Author format
    /^(.+?)\s+by\s+(.+)$/i,
    // Title (Author) format
    /^(.+?)\s*\(([^)]+)\)$/,
    // Title Author format (author at the end)
    /^(.+?)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)$/,
    // Title Author format (author at the end, with period)
    /^(.+?)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)\.$/,
  ]
  
  for (const pattern of patterns) {
    const match = nameWithoutExt.match(pattern)
    if (match) {
      let title = match[1].trim()
      let author = match[2].trim()
      
      // Clean title of additional information
      title = title.replace(/\([^)]*\)/g, '').trim() // Remove parentheses content
      title = title.replace(/\[[^\]]*\]/g, '').trim() // Remove square bracket content
      title = title.replace(/第.*版/, '').trim() // Remove version information
      title = title.replace(/\d+$/, '').trim() // Remove trailing numbers
      
      // Clean author name
      author = author.replace(/\([^)]*\)/g, '').trim() // Remove parentheses content
      author = author.replace(/\[[^\]]*\]/g, '').trim() // Remove square bracket content
      author = author.replace(/\.$/, '').trim() // Remove trailing period
      
      // If title or author is too short, it might be misidentified
      if (title.length > 2 && author.length > 2) {
        return { title, author }
      }
    }
  }
  
  // If no pattern matches, try intelligent splitting
  const words = nameWithoutExt.split(/[\s\-_]+/)
  if (words.length >= 3) {
    // Assume last 2-3 words are author name
    const authorWords = words.slice(-2)
    const titleWords = words.slice(0, -2)
    
    const author = authorWords.join(' ')
    const title = titleWords.join(' ')
    
    // Validate reasonableness
    if (title.length > 3 && author.length > 3) {
      return { title, author }
    }
  }
  
  // If all fails, return filename as title, author as empty
  return { 
    title: nameWithoutExt.replace(/[_-]/g, ' ').trim(),
    author: ''
  }
}

// Clean and format book title
export const cleanBookTitle = (title: string): string => {
  return title
    .replace(/\([^)]*\)/g, '') // Remove parentheses content
    .replace(/\[[^\]]*\]/g, '') // Remove square bracket content
    .replace(/第.*版/, '') // Remove version information
    .replace(/\d+$/, '') // Remove trailing numbers
    .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
    .replace(/\s+/g, ' ') // Merge multiple spaces
    .trim()
}

// Clean and format author name
export const cleanAuthorName = (author: string): string => {
  return author
    .replace(/\([^)]*\)/g, '') // Remove parentheses content
    .replace(/\[[^\]]*\]/g, '') // Remove square bracket content
    .replace(/\.$/, '') // Remove trailing period
    .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
    .replace(/\s+/g, ' ') // Merge multiple spaces
    .trim()
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 200 * 1024 * 1024 // 200MB
  const allowedTypes = [
    'application/pdf',
    'application/epub+zip',
    'application/x-mobipocket-ebook',
    'application/vnd.amazon.ebook',
    'text/plain',
    'text/html',
    'application/octet-stream' // Some MOBI files may use this type
  ]
  
  // Check file extension
  const fileName = file.name.toLowerCase()
  const allowedExtensions = ['.pdf', '.epub', '.mobi', '.azw', '.txt', '.html', '.htm']
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size cannot exceed 200MB' }
  }
  
  // If MIME type doesn't match but extension is correct, still allow
  if (!allowedTypes.includes(file.type) && !hasValidExtension) {
    return { valid: false, error: 'Unsupported file type, please select PDF, EPUB, MOBI, AZW, TXT or HTML files' }
  }
  
  return { valid: true }
}

export const createFileURL = (file: File): string => {
  return URL.createObjectURL(file)
}

export const revokeFileURL = (url: string): void => {
  URL.revokeObjectURL(url)
}

// Simulate file upload to server
export const uploadFile = async (file: File): Promise<{ success: boolean; filePath?: string; error?: string }> => {
  return new Promise((resolve) => {
    // Simulate upload delay
    setTimeout(() => {
      // In actual application, this would upload to server
      // For now, return a simulated file path
      const filePath = `uploads/${Date.now()}-${file.name}`
      resolve({ success: true, filePath })
    }, 1000)
  })
}
