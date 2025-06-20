import React, { useContext, useState } from 'react';
import styles from './NotesList.module.css';
import NotesContext from '../context/NotesContext';

function NotesList() {
  const { state, dispatch } = useContext(NotesContext);
  const { notes, selectedNoteId } = state;

  const [search, setSearch] = useState('');

  const sortedNotes = [
    ...notes.filter(n => n.pinned),
    ...notes.filter(n => !n.pinned),
  ];

  // Filter notes by search (case-insensitive, partial match)
  const filteredNotes = sortedNotes.filter(note =>
    note.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.listContainer}>
      <button className={styles.addBtn} onClick={() => {
        const id = Date.now().toString();
        dispatch({ type: 'ADD_NOTE', note: { id, title: 'Untitled', content: '', pinned: false, encrypted: false } });
      }}>+ New Note</button>
      <input
        type="text"
        className={styles.searchBar}
        placeholder="Search notes..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          marginBottom: 12,
          padding: '8px 12px',
          borderRadius: 7,
          border: '1.5px solid #e0e0e0',
          fontSize: '1.05em',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
          background: '#f3f6fd',
          color: '#2563eb',
          fontWeight: 600,
        }}
        aria-label="Search notes"
      />
      <ul className={styles.notesList}>
        {filteredNotes.map(note => (
          <li
            key={note.id}
            className={note.id === selectedNoteId ? styles.selected : ''}
            onClick={() => dispatch({ type: 'SELECT_NOTE', id: note.id })}
          >
            <span className={styles.title}>{note.title}</span>
            <button
              className={styles.pinBtn}
              aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
              title={note.pinned ? 'Unpin' : 'Pin'}
              onClick={e => { e.stopPropagation(); dispatch({ type: 'PIN_NOTE', id: note.id }); }}
            >
              {note.pinned ? (
                <span className={`${styles.pinIcon} ${styles.pinned}`}>📌</span>
              ) : (
                <span className={styles.pinIcon}>📍</span>
              )}
            </button>
            <button
              className={styles.deleteBtn}
              aria-label="Delete note"
              title="Delete"
              onClick={e => { e.stopPropagation(); dispatch({ type: 'DELETE_NOTE', id: note.id }); }}
            >
              🗑️
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotesList; 