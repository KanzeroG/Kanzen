import { Plus, Split, X } from 'lucide-react';
import { KanzenTerminal } from '../components/KanzenTerminal';
import { useGitStore } from '../lib/store';
import { Button } from '../components/ui/Button';

export function TerminalView() {
  const {
    terminalSessions,
    activeSessionId,
    splitMode,
    addTerminalSession,
    setActiveSession,
    closeSession,
    setSplitMode,
  } = useGitStore();

  const active = terminalSessions.find((s) => s.id === activeSessionId) || terminalSessions[0];

  const sessionsToRender = splitMode
    ? terminalSessions.slice(0, 2)
    : [active];

  return (
    <div className="kanzen-view">
      {/* Terminal toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800 bg-[#111113]">
        <div className="flex-1 flex items-center gap-1 overflow-x-auto">
          {terminalSessions.map((sess) => (
            <div
              key={sess.id}
              onClick={() => setActiveSession(sess.id)}
              className={`tab ${sess.id === activeSessionId ? 'active' : ''}`}
            >
              {sess.title}
              {terminalSessions.length > 1 && (
                <span
                  className="close ml-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeSession(sess.id);
                  }}
                >
                  <X size={12} />
                </span>
              )}
            </div>
          ))}
        </div>

        <Button size="sm" variant="ghost" onClick={addTerminalSession} title="New session (Ctrl+T)">
          <Plus size={15} /> New
        </Button>

        <Button
          size="sm"
          variant="ghost"
          onClick={() => setSplitMode(!splitMode)}
          title="Toggle split pane"
        >
          <Split size={15} /> Split
        </Button>
      </div>

      {/* Terminal area */}
      <div className="kanzen-terminal-area">
        {splitMode ? (
          <div className="kanzen-split-grid">
            {sessionsToRender.map((s, idx) => (
              <KanzenTerminal key={s.id + idx} sessionId={s.id} />
            ))}
            {sessionsToRender.length === 1 && (
              <div className="border border-zinc-800 rounded-lg flex items-center justify-center text-zinc-500 text-sm">
                Add another session to use the second pane
              </div>
            )}
          </div>
        ) : (
          <KanzenTerminal sessionId={activeSessionId} />
        )}
      </div>

      <div className="px-3 py-1 text-[10px] text-zinc-600 border-t border-zinc-800">
        Real PTY • pwsh / PowerShell
      </div>
    </div>
  );
}
