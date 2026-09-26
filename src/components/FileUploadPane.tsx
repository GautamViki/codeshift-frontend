import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import '../styles/FileUploadPane.css'

interface FileUploadPaneProps {
  file: File | null
  onChange: (file: File | null) => void
}

export function FileUploadPane({ file, onChange }: FileUploadPaneProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) onChange(droppedFile)
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave() {
    setDragOver(false)
  }

  function handleFileSelect(e: ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) onChange(selectedFile)
  }

  function handleClear() {
    onChange(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const byteCount = file ? file.size : 0

  return (
    <section className="pane" aria-labelledby="upload-title">
      <div className="pane-head">
        <h2 id="upload-title">Source file</h2>
        {file && (
          <span className="meta">
            {file.name} · {byteCount.toLocaleString()} bytes
          </span>
        )}
      </div>
      <div className="upload-body">
        {!file ? (
          <div
            className={`dropzone${dragOver ? ' active' : ''}`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
          >
            <div className="drop-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 32V16M24 16L18 22M24 16L30 22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 30V36C8 38.2091 9.79086 40 12 40H36C38.2091 40 40 38.2091 40 36V30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <strong>Drop a source file here</strong>
            <span>or click to browse</span>
            <input
              ref={inputRef}
              type="file"
              className="sr"
              onChange={handleFileSelect}
              aria-label="Choose a source file"
            />
          </div>
        ) : (
          <div className="file-info">
            <div className="file-card">
              <div className="file-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 4H19L26 11V28C26 29.1046 25.1046 30 24 30H8C6.89543 30 6 29.1046 6 28V6C6 4.89543 6.89543 4 8 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M19 4V11H26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M11 18H21M11 22H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="file-details">
                <strong>{file.name}</strong>
                <span>{(file.size / 1024).toFixed(1)} KB</span>
              </div>
              <button type="button" className="ghost file-remove" onClick={handleClear} aria-label="Remove file">
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
