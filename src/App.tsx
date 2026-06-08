import { useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { CustomTitleBar } from './components/CustomTitleBar';
import { CockpitBar } from './components/CockpitBar';
import { Sidebar } from './components/Sidebar';
import { TerminalView } from './views/TerminalView';
import { ChangesView } from './views/ChangesView';
import { SettingsView } from './views/SettingsView';
import { useGitStore } from './lib/store';

function App() {
  const currentView = useGitStore((s) => s.currentView);
  const setView = useGitStore((s) => s.setView);
  const loadInitial = useGitStore((s) => s.loadInitial);

  // Load the launch directory's repo (if any) on startup.
  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // Global Ctrl+1/2 navigation + Ctrl+T new terminal session.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.ctrlKey) return;

      if (e.key === '1') {
        e.preventDefault();
        setView('terminal');
      }
      if (e.key === '2') {
        e.preventDefault();
        setView('changes');
      }
      if (e.key === ',') {
        e.preventDefault();
        setView('settings');
      }
      if (e.key.toLowerCase() === 't' && currentView === 'terminal') {
        e.preventDefault();
        useGitStore.getState().addTerminalSession();
        toast('New terminal session');
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentView, setView]);

  function renderMain() {
    switch (currentView) {
      case 'changes':
        return <ChangesView />;
      case 'settings':
        return <SettingsView />;
      case 'terminal':
      default:
        return <TerminalView />;
    }
  }

  return (
    <div className="kanzen-app">
      <CustomTitleBar />
      <CockpitBar />

      <div className="kanzen-body">
        <Sidebar currentView={currentView} onNavigate={setView} />
        <div className="kanzen-main">
          {renderMain()}
        </div>
      </div>

      <Toaster position="top-center" richColors closeButton />
    </div>
  );
}

export default App;
