'use client';

import React, { useCallback } from 'react';
import { useDropzone, FileRejection } from 'react-dropzone';
import { cn, formatFileSize } from '@/lib/utils';
import { XMarkIcon, DocumentTextIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFileTypes?: Record<string, string[]>;
  maxFiles?: number;
  maxSize?: number;
  files?: File[];
  onRemoveFile?: (index: number) => void;
  label?: string;
  helperText?: string;
  className?: string;
}

export function FileUpload({
  onFilesSelected,
  acceptedFileTypes = {
    'application/pdf': ['.pdf'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'text/plain': ['.txt'],
  },
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  files = [],
  onRemoveFile,
  label,
  helperText,
  className,
}: FileUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      if (rejectedFiles.length > 0) {
        const errors = rejectedFiles.map((file) => {
          const error = file.errors[0];
          return `${file.file.name}: ${error.message}`;
        });
        alert(`File upload errors:\n${errors.join('\n')}`);
      }

      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles,
    maxSize,
    multiple: maxFiles > 1,
  });

  const getFileIcon = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'docx':
      case 'doc':
        return '📝';
      case 'txt':
        return '📃';
      default:
        return '📎';
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-secondary-700 mb-2">
          {label}
        </label>
      )}

      <div
        {...getRootProps()}
        className={cn(
          'relative rounded-lg border-2 border-dashed transition-all cursor-pointer',
          'hover:border-primary-400 hover:bg-primary-50/50',
          isDragActive
            ? 'border-primary-500 bg-primary-50'
            : 'border-secondary-300 bg-white',
          'p-8'
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center text-center">
          <CloudArrowUpIcon className="h-12 w-12 text-secondary-400 mb-4" />
          
          <p className="text-sm text-secondary-600 mb-2">
            {isDragActive ? (
              <span className="text-primary-600 font-medium">Drop files here</span>
            ) : (
              <>
                <span className="font-medium">Click to upload</span> or drag and drop
              </>
            )}
          </p>
          
          <p className="text-xs text-secondary-500">
            {Object.values(acceptedFileTypes)
              .flat()
              .join(', ')
              .toUpperCase()}{' '}
            files up to {formatFileSize(maxSize)}
          </p>
        </div>
      </div>

      {helperText && (
        <p className="mt-2 text-sm text-secondary-500">{helperText}</p>
      )}

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-secondary-700">
            Uploaded files ({files.length}/{maxFiles})
          </h4>
          
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileIcon(file)}</span>
                  <div>
                    <p className="text-sm font-medium text-secondary-900">
                      {file.name}
                    </p>
                    <p className="text-xs text-secondary-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                
                {onRemoveFile && (
                  <button
                    onClick={() => onRemoveFile(index)}
                    className="p-1 hover:bg-secondary-200 rounded transition-colors"
                    aria-label={`Remove ${file.name}`}
                  >
                    <XMarkIcon className="h-5 w-5 text-secondary-600" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}