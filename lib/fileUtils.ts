// File processing utility functions

// Supported file formats
export const SUPPORTED_FORMATS = {
  pdf: 'application/pdf',
  epub: 'application/epub+zip',
  mobi: 'application/x-mobipocket-ebook',
  azw: 'application/vnd.amazon.ebook',
  azw3: 'application/vnd.amazon.mobi8-ebook',
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
  console.log('🔧 detectFileFormat called with:', { filename, mimeType });
  console.log('📝 Filename type:', typeof filename);
  console.log('📝 Filename length:', filename?.length);
  
  // Clean and preprocess filename
  if (typeof filename === 'string') {
    // Remove any URL encoding or special characters
    const cleanFilename = decodeURIComponent(filename).trim();
    console.log('🧹 Cleaned filename:', cleanFilename);
    
    // First try to get format from cleaned filename
    let detectedFormat = getFileType(cleanFilename)
    console.log('📋 Format from cleaned filename:', detectedFormat);
    
    // If we got a valid format, return it
    if (detectedFormat !== 'unknown') {
      console.log('✅ Format detected from cleaned filename:', detectedFormat);
      return detectedFormat;
    }
  }
  
  // Fallback to original filename if cleaning didn't help
  let detectedFormat = getFileType(filename)
  console.log('📋 Format from original filename:', detectedFormat);
  
  // If still unknown, try to infer from MIME type
  if (detectedFormat === 'unknown' && mimeType) {
    console.log('🔄 Trying MIME type detection...', mimeType);
    switch (mimeType) {
      case 'application/pdf':
        console.log('✅ MIME type indicates PDF');
        return 'pdf'
      case 'application/epub+zip':
        console.log('✅ MIME type indicates EPUB');
        return 'epub'
      case 'application/x-mobipocket-ebook':
        console.log('✅ MIME type indicates MOBI');
        return 'mobi'
      case 'application/vnd.amazon.ebook':
        console.log('✅ MIME type indicates AZW');
        return 'azw'
      case 'application/vnd.amazon.mobi8-ebook':
        console.log('✅ MIME type indicates AZW3');
        return 'azw3'
      case 'text/plain':
        console.log('✅ MIME type indicates TXT');
        return 'txt'
      case 'text/html':
        console.log('✅ MIME type indicates HTML');
        return 'html'
      default:
        console.log('⚠️ Unknown MIME type, trying filename patterns as last resort...');
        // Try to infer from filename patterns as last resort
        const lowerFilename = filename.toLowerCase();
        if (lowerFilename.includes('.pdf')) {
          console.log('✅ Found .pdf in filename');
          return 'pdf';
        }
        if (lowerFilename.includes('.epub')) {
          console.log('✅ Found .epub in filename');
          return 'epub';
        }
        if (lowerFilename.includes('.mobi')) {
          console.log('✅ Found .mobi in filename');
          return 'mobi';
        }
        if (lowerFilename.includes('.txt')) {
          console.log('✅ Found .txt in filename');
          return 'txt';
        }
        if (lowerFilename.includes('.html') || lowerFilename.includes('.htm')) {
          console.log('✅ Found .html/.htm in filename');
          return 'html';
        }
        if (lowerFilename.includes('.azw')) {
          console.log('✅ Found .azw in filename');
          return 'azw';
        }
        if (lowerFilename.includes('.azw3')) {
          console.log('✅ Found .azw3 in filename');
          return 'azw3';
        }
        
        console.log('❌ All detection methods failed');
        return 'unknown'
    }
  }
  
  console.log('📄 Final detected format:', detectedFormat);
  return detectedFormat
}

// Intelligently parse filename to extract book title and author
export const parseBookInfo = (fileName: string): { title: string; author: string } => {
  // Remove extension
  let name = fileName.replace(/\.[^/.]+$/, '').trim()

  // Drop trailing site/vendor suffix like " - libgen.li" or similar
  name = name.replace(/\s+-\s+(libgen(\.\w+)?|z-?lib(rary)?|bookzz|annas-archive).*$/i, '').trim()

  // Try "Authors - Title" first
  const dashSplit = name.split(/\s+-\s+/)
  if (dashSplit.length >= 2) {
    const authorsPart = dashSplit[0]
    const titlePartRaw = dashSplit.slice(1).join(' - ')

    // Authors are sometimes separated by underscores
    const rawAuthors = authorsPart.split(/[_]+/).map(s => s.trim()).filter(Boolean)
    const author = cleanAuthorName(
      rawAuthors
        .map(a => a.replace(/\s{2,}/g, ' ').replace(/\s*,\s*/g, ', '))
        .join(', ')
    )

    // Title sometimes uses underscores for subtitle separators
    let title = titlePartRaw
      .replace(/_/ , ': ') // first underscore as subtitle delimiter
      .replace(/_/g, ' ')
      .replace(/\([^)]*\)/g, '') // remove parentheses content like years/publisher
      .replace(/\[[^\]]*\]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
    title = cleanBookTitle(title)

    if (title.length > 0 && author.length > 0) {
      return { title, author }
    }
  }

  // Fallback patterns
  const nameWithoutExt = name
  const patterns = [
    /^(.+?)\s*[-–—]\s*(.+)$/,
    /^(.+?)\s+by\s+(.+)$/i,
    /^(.+?)\s*\(([^)]+)\)$/,
  ]
  for (const pattern of patterns) {
    const match = nameWithoutExt.match(pattern)
    if (match) {
      const title = cleanBookTitle(match[2] ? match[2].trim() : match[1].trim())
      const author = cleanAuthorName(match[2] ? match[1].trim() : '')
      if (title) return { title, author }
    }
  }

  // Last resort
  return {
    title: cleanBookTitle(nameWithoutExt.replace(/[_-]/g, ' ').trim()),
    author: ''
  }
}

export function getFileType(filename: string): string {
  if (!filename) return 'unknown'
  const lower = filename.toLowerCase()
  const ext = lower.split('.').pop() || ''
  const extByDot = lower.slice(lower.lastIndexOf('.') + 1)
  const primary = (ext || extByDot).toLowerCase()
  switch (primary) {
    case 'pdf': return 'pdf'
    case 'epub': return 'epub'
    case 'mobi': return 'mobi'
    case 'azw3': return 'azw3'
    case 'txt': return 'txt'
    case 'html':
    case 'htm': return 'html'
    case 'azw': return 'azw'
    default: {
      if (lower.includes('.pdf') || lower.endsWith('pdf')) return 'pdf'
      if (lower.includes('.epub') || lower.endsWith('epub')) return 'epub'
      if (lower.includes('.mobi') || lower.endsWith('mobi')) return 'mobi'
      if (lower.includes('.txt') || lower.endsWith('txt')) return 'txt'
      if (lower.includes('.html') || lower.includes('.htm') || lower.endsWith('html') || lower.endsWith('htm')) return 'html'
      if (lower.includes('.azw') || lower.endsWith('azw')) return 'azw'
      if (lower.includes('.azw3') || lower.endsWith('azw3')) return 'azw3'
      return 'unknown'
    }
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