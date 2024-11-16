"use client"
import { useState, useRef } from 'react'
import { FileText, Upload, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  onError: (error: string) => void
  loading?: boolean
}

export function FileUpload({ value, onChange, onError, loading }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    await handleFile(file)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      await handleFile(file)
    }
  }

  const handleFile = async (file: File) => {
    // Validar tipo de arquivo
    const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png']
    if (!tiposPermitidos.includes(file.type)) {
      onError('Tipo de arquivo não permitido. Use PDF, JPEG ou PNG.')
      return
    }
    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      onError('Arquivo muito grande. Tamanho máximo: 5MB')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Erro ao fazer upload do arquivo')
      }

      const data = await response.json()
      onChange(data.url)
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      onError('Erro ao fazer upload do arquivo')
    }
  }

  return (
    <div className="space-y-2 ">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-colors bg-gray-50",
          isDragging ? "border-primary bg-primary/5" : "border-gray-300",
          loading && "opacity-50 cursor-not-allowed"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          className="hidden"
          disabled={loading}
        />
        <div className="flex flex-col items-center justify-center space-y-2 text-center ">
          <Upload className="w-8 h-8 text-gray-400" />
          <div className="text-sm text-gray-600">
            Arraste e solte aqui ou selecione o arquivo para upload
          </div>
          <div className="p-2 text-xs text-gray-500 bg-white border border-gray-100 rounded">
            Procure e selecione um arquivo
          </div>
          <div className="text-xs text-gray-500">
          Tamanho max:  10MB
          </div>
        </div>
      </div>

      {value && (
        <div className="flex items-center justify-between p-3 mt-4 border border-gray-200 rounded-md bg-gray-50 ">
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-blue-600 hover:text-blue-700"
            onClick={(e) => e.stopPropagation()}
          >
            <FileText className="w-4 h-4 mr-2" />
            Ver arquivo
          </a>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onChange(null)
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
} 