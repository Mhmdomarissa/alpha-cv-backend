'use client'

import React, { useCallback } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { cn, formatFileSize, generateId, getFileExtension } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Progress } from '@/components/ui/Progress'
import { 
  DocumentTextIcon, 
  DocumentIcon,
  XMarkIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'
import type { FileWithId } from '@/stores/appStore'

interface FileUploadProps {
  onFilesSelected: (files: FileWithId[]) => void
  uploadedFiles: FileWithId[]
  onRemoveFile: (id: string) => void
  uploadProgress?: Record<string, number>
  uploadStatus?: Record<string, 'uploading' | 'success' | 'error'>
  maxFiles?: number
  maxSize?: number
  acceptedFileTypes?: string[]
  title?: string
  description?: string
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  uploadedFiles,
  onRemoveFile,
  uploadProgress = {},
  uploadStatus = {},
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedFileTypes = ['pdf', 'doc', 'docx', 'txt'],
  title = 'Upload Files',
  description = 'Drag and drop files here, or click to select files'
}) => {
  const getFileIcon = (file: File) => {
    const extension = getFileExtension(file.name)
    const fileType = file.type || ''
    
    if (fileType.includes('pdf') || extension === 'pdf') {
      return <DocumentTextIcon className="h-5 w-5 text-error-600" />
    } else if (
      fileType.includes('word') || 
      extension === 'doc' || 
      extension === 'docx'
    ) {
      return <DocumentTextIcon className="h-5 w-5 text-primary-600" />
    } else if (fileType.includes('text') || extension === 'txt') {
      return <DocumentIcon className="h-5 w-5 text-secondary-600" />
    }
    return <DocumentIcon className="h-5 w-5 text-secondary-400" />
  }

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    console.log('📁 Files dropped:', { accepted: acceptedFiles.length, rejected: rejectedFiles.length })
    
    if (rejectedFiles.length > 0) {
      console.warn('❌ Rejected files:', rejectedFiles)
      // Could show toast notification here
    }

    const filesWithIds: FileWithId[] = acceptedFiles.map(file => 
      Object.assign(file, { id: generateId() })
    )
    
    console.log('✅ Processing files with IDs:', filesWithIds)
    onFilesSelected(filesWithIds)
  }, [onFilesSelected])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize,
    accept: acceptedFileTypes.reduce((acc, type) => {
      const mimeTypes: Record<string, string[]> = {
        pdf: ['application/pdf'],
        doc: ['application/msword'],
        docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        txt: ['text/plain'],
      }
      if (mimeTypes[type]) {
        mimeTypes[type].forEach(mime => {
          acc[mime] = [`.${type}`]
        })
      }
      return acc
    }, {} as Record<string, string[]>),
  })

  return (
    <div className="w-full">
      <h3 className="text-lg font-medium text-secondary-900 mb-2">{title}</h3>
      
      <div
        {...getRootProps()}
        className={cn(
          'relative flex flex-col items-center justify-center w-full p-8',
          'border-2 border-dashed rounded-lg cursor-pointer',
          'transition-all duration-200',
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-secondary-300 bg-secondary-50 hover:bg-secondary-100 hover:border-secondary-400'
        )}
      >
        <input 
          {...getInputProps()} 
          id="file-upload"
          name="file-upload"
          aria-label={title}
        />
        
        <CloudArrowUpIcon className={cn(
          'h-12 w-12 mb-4 transition-colors',
          isDragActive ? 'text-primary-600' : 'text-secondary-400'
        )} />
        
        <p className="text-sm text-secondary-700 text-center">
          {isDragActive ? 'Drop the files here...' : description}
        </p>
        
        <p className="text-xs text-secondary-500 mt-2">
          Supported: {acceptedFileTypes.join(', ').toUpperCase()} (Max {formatFileSize(maxSize)})
        </p>
      </div>

      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-secondary-700">
            Uploaded Files ({uploadedFiles.length}/{maxFiles})
          </h4>
          
          {uploadedFiles.map((file) => {
            const progress = uploadProgress[file.id] || 0
            const status = uploadStatus[file.id]
            
            return (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-secondary-200"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(file)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900 truncate">
                      {file.name || 'Unknown file'}
                    </p>
                    <p className="text-xs text-secondary-500">
                      {file.size ? formatFileSize(file.size) : 'Unknown size'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {status === 'uploading' && (
                    <div className="w-24">
                      <Progress value={progress} />
                    </div>
                  )}
                  
                  {status === 'success' && (
                    <CheckCircleIcon className="h-5 w-5 text-success-600" />
                  )}
                  
                  {status === 'error' && (
                    <ExclamationCircleIcon className="h-5 w-5 text-error-600" />
                  )}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveFile(file.id)}
                    className="h-8 w-8"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default FileUpload