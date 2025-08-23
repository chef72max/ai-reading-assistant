// 文件处理工具函数

export const getFileType = (fileName: string): 'pdf' | 'epub' | 'mobi' | 'azw' | 'txt' | 'html' => {
  const extension = fileName.toLowerCase().split('.').pop()
  switch (extension) {
    case 'pdf':
      return 'pdf'
    case 'epub':
      return 'epub'
    case 'mobi':
      return 'mobi'
    case 'azw':
      return 'azw'
    case 'txt':
      return 'txt'
    case 'html':
    case 'htm':
      return 'html'
    default:
      return 'pdf'
  }
}

// 智能解析文件名，提取书籍标题和作者
export const parseBookInfo = (fileName: string): { title: string; author: string } => {
  // 移除文件扩展名
  let nameWithoutExt = fileName.replace(/\.[^/.]+$/, '')
  
  // 常见的分隔符模式
  const patterns = [
    // 作者 - 标题 格式
    /^(.+?)\s*[-–—]\s*(.+)$/,
    // 标题 by 作者 格式
    /^(.+?)\s+by\s+(.+)$/i,
    // 标题 (作者) 格式
    /^(.+?)\s*\(([^)]+)\)$/,
    // 标题 作者 格式（作者在最后）
    /^(.+?)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)$/,
    // 标题 作者 格式（作者在最后，带点）
    /^(.+?)\s+([A-Z][a-z]+\s+[A-Z][a-z]+)\.$/,
  ]
  
  for (const pattern of patterns) {
    const match = nameWithoutExt.match(pattern)
    if (match) {
      let title = match[1].trim()
      let author = match[2].trim()
      
      // 清理标题中的额外信息
      title = title.replace(/\([^)]*\)/g, '').trim() // 移除括号内容
      title = title.replace(/\[[^\]]*\]/g, '').trim() // 移除方括号内容
      title = title.replace(/第.*版/, '').trim() // 移除版本信息
      title = title.replace(/\d+$/, '').trim() // 移除末尾数字
      
      // 清理作者名
      author = author.replace(/\([^)]*\)/g, '').trim() // 移除括号内容
      author = author.replace(/\[[^\]]*\]/g, '').trim() // 移除方括号内容
      author = author.replace(/\.$/, '').trim() // 移除末尾点号
      
      // 如果标题或作者太短，可能是误判
      if (title.length > 2 && author.length > 2) {
        return { title, author }
      }
    }
  }
  
  // 如果没有匹配到模式，尝试智能分割
  const words = nameWithoutExt.split(/[\s\-_]+/)
  if (words.length >= 3) {
    // 假设最后2-3个词是作者名
    const authorWords = words.slice(-2)
    const titleWords = words.slice(0, -2)
    
    const author = authorWords.join(' ')
    const title = titleWords.join(' ')
    
    // 验证合理性
    if (title.length > 3 && author.length > 3) {
      return { title, author }
    }
  }
  
  // 如果都失败了，返回文件名作为标题，作者为空
  return { 
    title: nameWithoutExt.replace(/[_-]/g, ' ').trim(),
    author: ''
  }
}

// 清理和格式化书籍标题
export const cleanBookTitle = (title: string): string => {
  return title
    .replace(/\([^)]*\)/g, '') // 移除括号内容
    .replace(/\[[^\]]*\]/g, '') // 移除方括号内容
    .replace(/第.*版/, '') // 移除版本信息
    .replace(/\d+$/, '') // 移除末尾数字
    .replace(/[_-]/g, ' ') // 替换下划线和横线为空格
    .replace(/\s+/g, ' ') // 合并多个空格
    .trim()
}

// 清理和格式化作者名
export const cleanAuthorName = (author: string): string => {
  return author
    .replace(/\([^)]*\)/g, '') // 移除括号内容
    .replace(/\[[^\]]*\]/g, '') // 移除方括号内容
    .replace(/\.$/, '') // 移除末尾点号
    .replace(/[_-]/g, ' ') // 替换下划线和横线为空格
    .replace(/\s+/g, ' ') // 合并多个空格
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
    'application/octet-stream' // 某些MOBI文件可能使用这个类型
  ]
  
  // 检查文件扩展名
  const fileName = file.name.toLowerCase()
  const allowedExtensions = ['.pdf', '.epub', '.mobi', '.azw', '.txt', '.html', '.htm']
  const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext))
  
  if (file.size > maxSize) {
    return { valid: false, error: '文件大小不能超过200MB' }
  }
  
  // 如果MIME类型不匹配，但扩展名正确，仍然允许
  if (!allowedTypes.includes(file.type) && !hasValidExtension) {
    return { valid: false, error: '不支持的文件类型，请选择PDF、EPUB、MOBI、AZW、TXT或HTML文件' }
  }
  
  return { valid: true }
}

export const createFileURL = (file: File): string => {
  return URL.createObjectURL(file)
}

export const revokeFileURL = (url: string): void => {
  URL.revokeObjectURL(url)
}

// 模拟文件上传到服务器
export const uploadFile = async (file: File): Promise<{ success: boolean; filePath?: string; error?: string }> => {
  return new Promise((resolve) => {
    // 模拟上传延迟
    setTimeout(() => {
      // 在实际应用中，这里会上传到服务器
      // 现在我们先返回一个模拟的文件路径
      const filePath = `uploads/${Date.now()}-${file.name}`
      resolve({ success: true, filePath })
    }, 1000)
  })
}
