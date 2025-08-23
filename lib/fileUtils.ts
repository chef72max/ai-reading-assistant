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
