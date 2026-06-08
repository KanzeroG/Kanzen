import { cn } from '../../lib/utils';

interface BadgeProps {
  status: string; // git status code: 'M' | 'A' | 'D' | 'R' | '??' ...
  children?: React.ReactNode;
  className?: string;
}

const statusMap: Record<string, string> = {
  M: 'badge-modified',
  A: 'badge-added',
  D: 'badge-deleted',
  R: 'badge-modified',
  '??': 'badge-untracked',
};

export function Badge({ status, children, className }: BadgeProps) {
  const cls = statusMap[status] || 'badge-untracked';
  const label = children || status.toUpperCase();

  return (
    <span className={cn('badge', cls, className)}>
      {label}
    </span>
  );
}
