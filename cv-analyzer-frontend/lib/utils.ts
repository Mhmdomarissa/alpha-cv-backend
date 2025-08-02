import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Tailwind CSS class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Format date
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

// Truncate text
export function truncateText(text: string | null | undefined, maxLength: number = 100): string {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Calculate match percentage color
export function getMatchScoreColor(score: number): string {
  if (score >= 80) return 'text-success-600';
  if (score >= 60) return 'text-warning-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-error-600';
}

// Calculate match percentage background color
export function getMatchScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-success-100';
  if (score >= 60) return 'bg-warning-100';
  if (score >= 40) return 'bg-yellow-100';
  return 'bg-error-100';
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Extract file extension
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
}

// Check if file is valid document type
export function isValidDocumentType(filename: string): boolean {
  const validExtensions = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
  const extension = getFileExtension(filename);
  return validExtensions.includes(extension);
}

// Format percentage
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Sleep function for async operations
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Parse error message
export function parseErrorMessage(error: any): string {
  if (typeof error === 'string') return error;
  if (error?.message) return error.message;
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  return 'An unexpected error occurred';
}

// Capitalize first letter
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Generate random color
export function generateRandomColor(): string {
  const colors = [
    'bg-primary-100',
    'bg-secondary-100',
    'bg-success-100',
    'bg-warning-100',
    'bg-error-100',
    'bg-purple-100',
    'bg-pink-100',
    'bg-indigo-100',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Check if running on client side
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

// Get initials from name
export function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
}

// Sort array by property
export function sortByProperty<T>(array: T[], property: keyof T, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aValue = a[property];
    const bValue = b[property];
    
    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

// Group array by property
export function groupByProperty<T>(array: T[], property: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const key = String(item[property]);
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}