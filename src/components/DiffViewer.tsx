interface DiffViewerProps {
  diff: string | null;
}

export function DiffViewer({ diff }: DiffViewerProps) {
  if (!diff) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
        Select a file to view its diff
      </div>
    );
  }

  if (!diff.trim()) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500 text-sm">
        No changes to show
      </div>
    );
  }

  const lines = diff.split('\n');

  return (
    <div className="font-mono text-[11px] bg-black/40 rounded-lg border border-zinc-800 overflow-auto h-full p-2 leading-[1.35]">
      {lines.map((line, idx) => {
        let cls = 'diff-line';
        if (line.startsWith('+') && !line.startsWith('+++')) cls += ' diff-add';
        else if (line.startsWith('-') && !line.startsWith('---')) cls += ' diff-del';
        else if (line.startsWith('@@')) cls += ' diff-hunk';

        return (
          <div key={idx} className={cls}>
            {line || ' '}
          </div>
        );
      })}
    </div>
  );
}
