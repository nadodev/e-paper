"use client"
import { Download } from 'lucide-react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import type { Document } from '@/lib/api/contract'

interface DocumentViewerProps {
  document: Document
  onClose: () => void
}

export function DocumentViewer({ document, onClose }: DocumentViewerProps) {
  const isPDF = document.arquivo_url?.endsWith('.pdf')
  const isImage = document.arquivo_url?.match(/\.(jpg|jpeg|png|gif)$/i)

  const handleDownload = () => {
    if (document.arquivo_url) {
      const link = window.document.createElement('a')
      link.href = document.arquivo_url
      link.download = `documento-${document.codigo}${document.arquivo_url.substring(document.arquivo_url.lastIndexOf('.'))}`
      window.document.body.appendChild(link)
      link.click()
      window.document.body.removeChild(link)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] h-[95vh] sm:h-[90vh] flex flex-col p-0 mx-2">
        <DialogHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 border-b">
          <div className="mb-2 sm:mb-0">
            <DialogTitle className="text-base sm:text-lg">
              Visualizar Documento - {document.codigo}
            </DialogTitle>
            <DialogDescription className="text-sm">
              Visualize ou faça o download do documento
            </DialogDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            className="gap-2 w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            Baixar
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-hidden bg-gray-100">
          {isPDF ? (
            <>
              {/* Visualizador para Desktop */}
              <div className="w-full h-full hidden md:block">
                <iframe
                  src={document.arquivo_url || undefined}
                  className="w-full h-full border-none"
                  style={{ 
                    WebkitOverflowScrolling: 'touch'
                  }}
                  allow="fullscreen"
                  title={`PDF do documento ${document.codigo}`}
                />
              </div>
              {/* Mensagem para Mobile */}
              <div className="w-full h-full flex items-center justify-center md:hidden p-4">
                <div className="text-center">
                  <p className="text-gray-500 mb-4">
                    Para melhor visualização do PDF, por favor, faça o download do arquivo.
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleDownload}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Baixar PDF
                  </Button>
                </div>
              </div>
            </>
          ) : isImage ? (
            <div className="flex items-center justify-center w-full h-full p-2 sm:p-4">
              <img
                src={document.arquivo_url || ''}
                alt={`Documento ${document.codigo}`}
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center w-full h-full p-4">
              <p className="text-gray-500">
                Tipo de arquivo não suportado para visualização
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 