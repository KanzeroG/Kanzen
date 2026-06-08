import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPath(path: string): string {
  if (path.length > 42) {
    const parts = path.split('/');
    if (parts.length > 2) {
      return `${parts[0]}/.../${parts[parts.length - 1]}`;
    }
    return path.slice(0, 20) + '…' + path.slice(-18);
  }
  return path;
}
