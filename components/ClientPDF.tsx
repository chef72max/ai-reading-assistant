'use client'

import { useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'

type DocumentOptions = {
  cMapUrl: string
  cMapPacked: boolean
  standardFontDataUrl: string
}

type Props = {
  file: string | File
  pageNumber: number
  scale: number
  rotate: number
  options: DocumentOptions
  loading: React.ReactNode
  error: React.ReactNode
  className?: string
  onDocumentLoadSuccess: (pdf: { numPages: number }) => void
  onDocumentLoadError: (error: Error) => void
  onPageLoadSuccess: () => void
  onPageLoadError: (error: Error) => void
}

export default function ClientPDF({
  file,
  pageNumber,
  scale,
  rotate,
  options,
  loading,
  error,
  className,
  onDocumentLoadSuccess,
  onDocumentLoadError,
  onPageLoadSuccess,
  onPageLoadError,
}: Props) {
  useEffect(() => {
    try {
      try {
        // pdfjs.version is available; prefer modern worker
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${(pdfjs as any).version}/build/pdf.worker.min.mjs`
      } catch {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`
      }
      // eslint-disable-next-line no-console
      console.log('✅ ClientPDF worker set to:', (pdfjs as any).GlobalWorkerOptions.workerSrc)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('❌ Failed to set PDF worker in ClientPDF:', err)
    }
  }, [])

  return (
    <Document
      file={file}
      options={options}
      loading={loading}
      error={error}
      onLoadSuccess={onDocumentLoadSuccess as any}
      onLoadError={onDocumentLoadError as any}
    >
      <Page
        pageNumber={pageNumber}
        scale={scale}
        rotate={rotate}
        className={className}
        renderTextLayer={true}
        renderAnnotationLayer={true}
        onLoadSuccess={onPageLoadSuccess}
        onLoadError={onPageLoadError}
      />
    </Document>
  )
}


