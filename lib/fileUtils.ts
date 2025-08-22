// 文件处理工具函数

export const getFileType = (fileName: string): 'pdf' | 'epub' | 'mobi' => {
  const extension = fileName.toLowerCase().split('.').pop()
  switch (extension) {
    case 'pdf':
      return 'pdf'
    case 'epub':
      return 'epub'
    case 'mobi':
      return 'mobi'
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
  const maxSize = 100 * 1024 * 1024 // 100MB
  const allowedTypes = ['application/pdf', 'application/epub+zip', 'application/x-mobipocket-ebook']
  
  if (file.size > maxSize) {
    return { valid: false, error: '文件大小不能超过100MB' }
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: '不支持的文件类型，请选择PDF、EPUB或MOBI文件' }
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
