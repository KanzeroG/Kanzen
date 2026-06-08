import { FileText, Plus, Minus, Trash2 } from 'lucide-react';
import type { FileChange } from '../lib/types';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { cn, formatPath } from '../lib/utils';

interface FileRowProps {
  file: FileChange;
  selected?: boolean;
  onSelect: (file: FileChange) => void;
  onStage: (path: string) => void;
  onUnstage: (path: string) => void;
  onDiscard: (path: string) => void;
}

export function FileRow({ file, selected, onSelect, onStage, onUnstage, onDiscard }: FileRowProps) {
  return (
    <div
      className={cn('file-row text-sm', selected && 'selected')}
      onClick={() => onSelect(file)}
    >
      <div className="flex-1 min-w-0 flex items-center gap-2">
        {file.status === 'A' || file.status === '??' ? (
          <Plus size={14} className="text-emerald-400 flex-shrink-0" />
        ) : file.status === 'D' ? (
          <Minus size={14} className="text-red-400 flex-shrink-0" />
        ) : (
          <FileText size={14} className="text-zinc-400 flex-shrink-0" />
        )}
        <span className="truncate font-mono text-xs">{formatPath(file.path)}</span>
      </div>

      <div className="flex items-center gap-2">
        <Badge status={file.status} />

        {file.staged ? (
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onUnstage(file.path); }}>
            Unstage
          </Button>
        ) : (
          <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); onStage(file.path); }}>
            Stage
          </Button>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onDiscard(file.path); }}
          className="text-red-400/70 hover:text-red-400 p-1"
          title="Discard"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
