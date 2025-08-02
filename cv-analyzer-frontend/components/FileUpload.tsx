'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { cn, formatFileSize, isValidDocumentType } from '@/lib/utils';
import { CloudArrowUpIcon, DocumentIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  acceptedFileTypes?: string[];
  maxFileSize?: number; // in bytes
  maxFiles?: number;
  multiple?: boolean;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function FileUpload({
  onFilesSelected,
  acceptedFileTypes = ['.pdf', '.doc', '.docx', '.txt', '.rtf'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  multiple = true,
  label = 'Upload Files',
  className,
  disabled = false,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      // Handle rejected files
      if (rejectedFiles.length > 0) {
        rejectedFiles.forEach((file) => {
          const errors = file.errors || [];
          errors.forEach((error: any) => {
            if (error.code === 'file-too-large') {
              toast.error(`${file.file.name} is too large. Max size is ${formatFileSize(maxFileSize)}`);
            } else if (error.code === 'file-invalid-type') {
              toast.error(`${file.file.name} has an invalid file type`);
            } else {
              toast.error(`${file.file.name}: ${error.message}`);
            }
          });
        });
      }

      // Validate file types
      const validFiles = acceptedFiles.filter((file) => {
        if (!isValidDocumentType(file.name)) {
          toast.error(`${file.name} is not a valid document type`);
          return false;
        }
        return true;
      });

      if (validFiles.length > 0) {
        const newFiles = multiple ? [...files, ...validFiles] : validFiles;
        
        // Check max files limit
        if (newFiles.length > maxFiles) {
          toast.error(`Maximum ${maxFiles} files allowed`);
          return;
        }

        setFiles(newFiles);
        onFilesSelected(newFiles);
        toast.success(`${validFiles.length} file(s) added successfully`);
      }
    },
    [files, maxFileSize, maxFiles, multiple, onFilesSelected]
  );

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles);
    toast.success('File removed');
  };

  const clearAll = () => {
    setFiles([]);
    onFilesSelected([]);
    toast.success('All files cleared');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes.reduce((acc, type) => {
      const mimeTypes: { [key: string]: string[] } = {
        '.pdf': ['application/pdf'],
        '.doc': ['application/msword'],
        '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        '.txt': ['text/plain'],
        '.rtf': ['application/rtf'],
      };
      return { ...acc, [mimeTypes[type]?.[0] || type]: [type] };
    }, {}),
    maxSize: maxFileSize,
    multiple,
    disabled,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false),
  });

  return (
    <div className={cn('w-full', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 cursor-pointer',
          isDragActive || isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-secondary-300 hover:border-secondary-400 hover:bg-secondary-50',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        
        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
        
        {isDragActive ? (
          <p className="text-primary-600 font-medium">Drop the files here...</p>
        ) : (
          <div>
            <p className="text-secondary-900 font-medium mb-1">
              {label}
            </p>
            <p className="text-sm text-secondary-600">
              Drag & drop files here, or click to select
            </p>
            <p className="text-xs text-secondary-500 mt-2">
              Supported formats: {acceptedFileTypes.join(', ')} • Max size: {formatFileSize(maxFileSize)}
            </p>
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-secondary-900">
              Selected Files ({files.length})
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
          
          <AnimatePresence>
            <div className="space-y-2">
              {files.map((file, index) => (
                <motion.div
                  key={`${file.name}-${index}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <DocumentIcon className="h-5 w-5 text-secondary-500" />
                    <div>
                      <p className="text-sm font-medium text-secondary-900 truncate max-w-xs">
                        {file.name || 'Unknown file'}
                      </p>
                      <p className="text-xs text-secondary-600">
                        {file.size ? formatFileSize(file.size) : 'Unknown size'}
                      </p>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="text-error-600 hover:text-error-700 hover:bg-error-50"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}