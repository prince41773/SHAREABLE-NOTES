import React, { createContext, useReducer, useEffect } from 'react';
import CryptoJS from 'crypto-js';

const NotesContext = createContext();

const initialState = {
  notes: [],
  selectedNoteId: null,
};

function notesReducer(state, action) {
  switch (action.type) {
    case 'LOAD_NOTES':
      return { ...state, notes: action.notes };
    case 'ADD_NOTE':
      return { ...state, notes: [action.note, ...state.notes], selectedNoteId: action.note.id };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(n => n.id === action.note.id ? action.note : n),
      };
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(n => n.id !== action.id),
        selectedNoteId: state.selectedNoteId === action.id ? null : state.selectedNoteId,
      };
    case 'PIN_NOTE':
      return {
        ...state,
        notes: state.notes.map(n => n.id === action.id ? { ...n, pinned: !n.pinned } : n),
      };
    case 'SELECT_NOTE':
      return { ...state, selectedNoteId: action.id };
    default:
      return state;
  }
}

export function NotesProvider({ children }) {
  const [state, dispatch] = useReducer(notesReducer, initialState);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notes');
    if (saved) {
      dispatch({ type: 'LOAD_NOTES', notes: JSON.parse(saved) });
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(state.notes));
  }, [state.notes]);

  // Encryption helpers
  const encrypt = (text, password) => CryptoJS.AES.encrypt(text, password).toString();
  const decrypt = (cipher, password) => {
    try {
      const bytes = CryptoJS.AES.decrypt(cipher, password);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return '';
    }
  };

  return (
    <NotesContext.Provider value={{ state, dispatch, encrypt, decrypt }}>
      {children}
    </NotesContext.Provider>
  );
}

export default NotesContext; 