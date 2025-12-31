import { useState, useRef, useEffect } from 'react'
import { Paperclip, Upload, X, Download, FileText, Image, File, Loader2 } from 'lucide-react'
import { useTaskStore, Attachment } from '../../stores/taskStore'
import { api } from '../../api/client'

interface TaskAttachmentsProps {
    taskId: string
}

const ALLOWED_EXTENSIONS = [
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt',
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.zip', '.rar'
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

function getFileIcon(mimeType: string) {
    if (mimeType.startsWith('image/')) return <Image size={16} className="text-blue-400" />
    if (mimeType === 'application/pdf') return <FileText size={16} className="text-red-400" />
    return <File size={16} className="text-zinc-400" />
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function TaskAttachments({ taskId }: TaskAttachmentsProps) {
    const { uploadAttachment, deleteAttachment, fetchAttachments } = useTaskStore()
    const [attachments, setAttachments] = useState<Attachment[]>([])
    const [isUploading, setIsUploading] = useState(false)
    const [isDragging, setIsDragging] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const loadAttachments = async () => {
            try {
                const data = await fetchAttachments(taskId)
                setAttachments(data)
            } catch (err) {
                console.error('Failed to load attachments:', err)
            }
        }
        loadAttachments()
    }, [taskId, fetchAttachments])

    const validateFile = (file: File): string | null => {
        const ext = '.' + file.name.split('.').pop()?.toLowerCase()
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return `Tipo de arquivo não permitido. Tipos permitidos: ${ALLOWED_EXTENSIONS.join(', ')}`
        }
        if (file.size > MAX_FILE_SIZE) {
            return `Arquivo muito grande. Tamanho máximo: 10MB`
        }
        return null
    }

    const handleUpload = async (file: File) => {
        const validationError = validateFile(file)
        if (validationError) {
            setError(validationError)
            return
        }

        setError(null)
        setIsUploading(true)
        try {
            const attachment = await uploadAttachment(taskId, file)
            setAttachments(prev => [...prev, attachment])
        } catch (err) {
            console.error('Upload failed:', err)
            setError('Falha no upload do arquivo')
        } finally {
            setIsUploading(false)
        }
    }

    const handleDelete = async (attachmentId: string) => {
        if (!confirm('Excluir este anexo?')) return
        try {
            await deleteAttachment(taskId, attachmentId)
            setAttachments(prev => prev.filter(a => a.id !== attachmentId))
        } catch (err) {
            console.error('Delete failed:', err)
            setError('Falha ao excluir anexo')
        }
    }

    const handleDownload = async (attachmentId: string, filename: string) => {
        try {
            const response = await api.get(`/attachments/${attachmentId}/download`, {
                responseType: 'blob'
            })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.download = filename
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (err) {
            console.error('Download failed:', err)
            setError('Falha ao baixar arquivo')
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        const files = Array.from(e.dataTransfer.files)
        files.forEach(handleUpload)
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        files.forEach(handleUpload)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1 flex items-center gap-2">
                <Paperclip size={14} />
                Anexos
            </label>

            {/* Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all
                    ${isDragging
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-zinc-600 bg-zinc-900/50'}
                `}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    accept={ALLOWED_EXTENSIONS.join(',')}
                    className="hidden"
                    multiple
                />
                {isUploading ? (
                    <div className="flex items-center justify-center gap-2 text-zinc-400">
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-sm">Enviando...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-1">
                        <Upload size={20} className="text-zinc-500" />
                        <span className="text-sm text-zinc-500">
                            Arraste arquivos ou clique para selecionar
                        </span>
                        <span className="text-[10px] text-zinc-600">
                            PDF, DOC, XLS, PPT, TXT, Imagens, ZIP (máx. 10MB)
                        </span>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="text-red-400 text-xs bg-red-500/10 px-3 py-2 rounded-lg">
                    {error}
                </div>
            )}

            {/* Attachments List */}
            {attachments.length > 0 && (
                <div className="space-y-2">
                    {attachments.map((attachment) => (
                        <div
                            key={attachment.id}
                            className="flex items-center gap-3 bg-zinc-900 rounded-xl px-3 py-2.5 group"
                        >
                            {getFileIcon(attachment.mimeType)}
                            <div className="flex-1 min-w-0">
                                <div className="text-sm text-white truncate">
                                    {attachment.filename}
                                </div>
                                <div className="text-[10px] text-zinc-500">
                                    {formatFileSize(attachment.size)}
                                </div>
                            </div>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDownload(attachment.id, attachment.filename)
                                    }}
                                    className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                                    title="Download"
                                >
                                    <Download size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleDelete(attachment.id)
                                    }}
                                    className="p-1.5 hover:bg-red-500/10 rounded-lg text-zinc-400 hover:text-red-400 transition-colors"
                                    title="Excluir"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
