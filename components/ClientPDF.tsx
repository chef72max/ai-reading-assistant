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
  onPageRenderSuccess?: () => void
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
  onPageRenderSuccess,
}: Props) {
  // Configure worker synchronously on first render for reliability
  try {
    const anyPdfjs = pdfjs as any
    anyPdfjs.disableWorker = false
    const ver = typeof anyPdfjs.version === 'string' && anyPdfjs.version ? anyPdfjs.version : '3.11.174'
    const isV3 = ver.startsWith('3.')
    const workerFile = isV3 ? 'pdf.worker.min.js' : 'pdf.worker.min.mjs'
    const desired = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${ver}/build/${workerFile}`
    if (anyPdfjs.GlobalWorkerOptions?.workerSrc !== desired) {
      anyPdfjs.GlobalWorkerOptions.workerSrc = desired
    }
    // eslint-disable-next-line no-console
    console.log('[ClientPDF] workerSrc =', anyPdfjs.GlobalWorkerOptions.workerSrc)
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('❌ PDF worker configuration error:', err)
  }

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
        key={`${pageNumber}-${Math.round(scale * 100)}-${rotate}`}
        pageNumber={pageNumber}
        scale={scale}
        rotate={rotate}
        className={className}
        renderTextLayer={true}
        renderAnnotationLayer={true}
        onLoadSuccess={onPageLoadSuccess}
        onLoadError={onPageLoadError}
        loading={<div style={{ padding: 24, color: '#6b7280' }}>Loading page…</div>}
        onRenderSuccess={onPageRenderSuccess as any}
      />
    </Document>
  )
}


