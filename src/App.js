import React, { useRef, useState } from 'react';
import styles from './App.module.css';
import { NotesProvider } from './context/NotesContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import NotesList from './components/NotesList';
import NoteEditor from './components/NoteEditor';
import Toolbar from './components/Toolbar';
import InsightsPanel from './components/InsightsPanel';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={styles.themeToggle}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79z"/></svg>
      ) : (
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 6.95-1.41-1.41M6.46 6.46 5.05 5.05m12.02 0-1.41 1.41M6.46 17.54l-1.41 1.41"/></svg>
      )}
    </button>
  );
}

function App() {
  const noteEditorRef = useRef();
  const [toolbarDisabled, setToolbarDisabled] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [insightsWidth, setInsightsWidth] = useState(320);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const draggingSidebar = useRef(false);
  const draggingInsights = useRef(false);

  const handleSidebarDrag = e => {
    if (!draggingSidebar.current) return;
    setSidebarWidth(Math.max(160, Math.min(e.clientX, 500)));
  };
  const handleSidebarDragStart = () => { draggingSidebar.current = true; document.body.style.cursor = 'col-resize'; };
  const handleSidebarDragEnd = () => { draggingSidebar.current = false; document.body.style.cursor = ''; };

  const handleInsightsDrag = e => {
    if (!draggingInsights.current) return;
    const winWidth = window.innerWidth;
    setInsightsWidth(Math.max(180, Math.min(winWidth - e.clientX, 500)));
  };
  const handleInsightsDragStart = () => { draggingInsights.current = true; document.body.style.cursor = 'col-resize'; };
  const handleInsightsDragEnd = () => { draggingInsights.current = false; document.body.style.cursor = ''; };

  React.useEffect(() => {
    const onMove = e => {
      if (draggingSidebar.current) handleSidebarDrag(e);
      if (draggingInsights.current) handleInsightsDrag(e);
    };
    const onUp = () => { handleSidebarDragEnd(); handleInsightsDragEnd(); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  React.useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleSave = () => {
    if (noteEditorRef.current && noteEditorRef.current.saveNote) {
      noteEditorRef.current.saveNote();
    }
  };

  // Listen for lock/unlock state from NoteEditor
  const handleLockState = isLocked => {
    setToolbarDisabled(isLocked);
  };

  return (
    <ThemeProvider>
      <NotesProvider>
        <div className={styles.appContainer}>
          <ThemeToggle />
          <aside className={styles.sidebar} style={{ width: sidebarWidth }}>
            <NotesList />
          </aside>
          {windowWidth >= 900 && (
            <div
              className={styles.resizer}
              onMouseDown={handleSidebarDragStart}
              style={{ left: sidebarWidth - 3 }}
              aria-label="Resize sidebar"
              tabIndex={0}
              role="separator"
            />
          )}
          <main className={styles.mainArea}>
            <Toolbar onSave={handleSave} disabled={toolbarDisabled} />
            <NoteEditor ref={noteEditorRef} onLockStateChange={handleLockState} />
          </main>
          {windowWidth >= 900 && (
            <div
              className={styles.resizer}
              onMouseDown={handleInsightsDragStart}
              style={{ right: insightsWidth - 3 }}
              aria-label="Resize insights panel"
              tabIndex={0}
              role="separator"
            />
          )}
          <aside className={styles.insightsPanel} style={{ width: insightsWidth }}>
            <InsightsPanel />
          </aside>
        </div>
      </NotesProvider>
    </ThemeProvider>
  );
}

export default App; 