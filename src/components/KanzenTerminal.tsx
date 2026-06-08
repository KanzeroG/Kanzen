import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { invoke, Channel } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { useGitStore } from '../lib/store';

interface Props {
  sessionId: string;
}

export function KanzenTerminal({ sessionId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const fitRef = useRef<FitAddon | null>(null);
  const ptyIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      theme: {
        background: '#0b0b0d',
        foreground: '#e4e4e7',
        cursor: '#a1a1aa',
        cursorAccent: '#0b0b0d',
        selectionBackground: '#3b82f640',
        black: '#1f1f23',
        red: '#ef4444',
        green: '#22c55e',
        yellow: '#eab308',
        blue: '#3b82f6',
        magenta: '#a78bfa',
        cyan: '#22d3ee',
        white: '#e4e4e7',
        brightBlack: '#3f3f46',
        brightRed: '#f87171',
        brightGreen: '#4ade80',
        brightYellow: '#fde047',
        brightBlue: '#60a5fa',
        brightMagenta: '#c084fc',
        brightCyan: '#67e8f9',
        brightWhite: '#f4f4f5',
      },
      fontFamily: '"Cascadia Mono", Consolas, ui-monospace, monospace',
      fontSize: useGitStore.getState().terminalFontSize,
      lineHeight: 1.25,
      cursorBlink: useGitStore.getState().cursorBlink,
      allowProposedApi: true,
    });

    const fit = new FitAddon();

    term.loadAddon(fit);
    term.open(containerRef.current);

    termRef.current = term;
    fitRef.current = fit;

    let exitUnlisten: (() => void) | null = null;

    const startPty = async () => {
      // Fit first so we can pass real dimensions to the PTY
      requestAnimationFrame(() => requestAnimationFrame(async () => {
        try { fit.fit(); } catch {}

        const cols = term.cols || 80;
        const rows = term.rows || 24;

        // Low-latency streaming channel for PTY output (faster than events).
        const onData = new Channel<string>();
        onData.onmessage = (chunk) => term.write(chunk);

        try {
          const id = await invoke<string>('pty_spawn', {
            id: sessionId,
            cols,
            rows,
            cwd: useGitStore.getState().repoPath,
            onData,
          });
          ptyIdRef.current = id;

          exitUnlisten = await listen<null>(`pty://exit/${id}`, () => {
            term.writeln('\r\n\x1b[33m[process exited]\x1b[0m');
          });

          // Forward all keystrokes to PTY
          term.onData((data) => {
            invoke('pty_write', { id, data }).catch(() => {});
          });
        } catch (err) {
          term.writeln(`\x1b[31m[pty error] ${err}\x1b[0m`);
        }
      }));
    };

    startPty();

    // Resize observer — keep PTY dimensions in sync with the container
    const resize = () => {
      try { fit.fit(); } catch {}
      if (ptyIdRef.current) {
        invoke('pty_resize', {
          id: ptyIdRef.current,
          cols: term.cols,
          rows: term.rows,
        }).catch(() => {});
      }
    };

    const ro = new ResizeObserver(resize);
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      exitUnlisten?.();
      if (ptyIdRef.current) {
        invoke('pty_kill', { id: ptyIdRef.current }).catch(() => {});
      }
      term.dispose();
    };
  }, [sessionId]);

  // Live-apply terminal settings (font size, cursor blink) without respawning.
  useEffect(() => {
    return useGitStore.subscribe((state) => {
      const term = termRef.current;
      if (!term) return;
      let changed = false;
      if (term.options.fontSize !== state.terminalFontSize) {
        term.options.fontSize = state.terminalFontSize;
        changed = true;
      }
      if (term.options.cursorBlink !== state.cursorBlink) {
        term.options.cursorBlink = state.cursorBlink;
      }
      if (changed) {
        try { fitRef.current?.fit(); } catch {}
        if (ptyIdRef.current) {
          invoke('pty_resize', {
            id: ptyIdRef.current,
            cols: term.cols,
            rows: term.rows,
          }).catch(() => {});
        }
      }
    });
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        background: '#0b0b0d',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid #27272a',
      }}
    />
  );
}
