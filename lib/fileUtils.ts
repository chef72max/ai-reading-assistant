// File processing utility functions

// Supported file formats
export const SUPPORTED_FORMATS = {
  pdf: 'application/pdf',
  epub: 'application/epub+zip',
  mobi: 'application/x-mobipocket-ebook',
  azw: 'application/vnd.amazon.ebook',
  txt: 'text/plain',
  html: 'text/html',
  htm: 'text/html'
}

export const isSupportedFormat = (format: string): boolean => {
  // Handle unknown format by trying to infer from context
  if (format === 'unknown') {
    return true; // Allow unknown formats to be processed
  }
  return Object.keys(SUPPORTED_FORMATS).includes(format.toLowerCase())
}

// Enhanced format detection that tries to infer format from various sources
export const detectFileFormat = (filename: string, mimeType?: string): string => {
  // First try to get format from filename
  let detectedFormat = getFileType(filename)
  
  // If still unknown, try to infer from MIME type
  if (detectedFormat === 'unknown' && mimeType) {
    switch (mimeType) {
      case 'application/pdf':
        return 'pdf'
      case 'application/epub+zip':
        return 'epub'
      case 'application/x-mobipocket-ebook':
        return 'mobi'
      case 'application/vnd.amazon.ebook':
        return 'azw'
      case 'text/plain':
        return 'txt'
      case 'text/html':
        return 'html'
      default:
        // Try to infer from filename patterns as last resort
        if (filename.toLowerCase().includes('.pdf')) return 'pdf'
        if (filename.toLowerCase().includes('.epub')) return 'epub'
        if (filename.toLowerCase().includes('.mobi')) return 'mobi'
        if (filename.toLowerCase().includes('.txt')) return 'txt'
        if (filename.toLowerCase().includes('.html') || filename.toLowerCase().includes('.htm')) return 'html'
        if (filename.toLowerCase().includes('.azw')) return 'azw'
        
        return 'unknown'
    }
  }
  
  return detectedFormat
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

export function getFileType(filename: string): string {
  if (!filename) return 'unknown';
  
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return 'pdf';
    case 'epub':
      return 'epub';
    case 'mobi':
      return 'mobi';
    case 'txt':
      return 'txt';
    case 'html':
    case 'htm':
      return 'html';
    case 'azw':
      return 'azw';
    default:
      // Try to infer from filename patterns
      if (filename.toLowerCase().includes('.pdf')) return 'pdf';
      if (filename.toLowerCase().includes('.epub')) return 'epub';
      if (filename.toLowerCase().includes('.mobi')) return 'mobi';
      if (filename.toLowerCase().includes('.txt')) return 'txt';
      if (filename.toLowerCase().includes('.html') || filename.toLowerCase().includes('.htm')) return 'html';
      if (filename.toLowerCase().includes('.azw')) return 'azw';
      
      return 'unknown';
  }
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
