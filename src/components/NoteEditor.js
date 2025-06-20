import React, { useContext, useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import NotesContext from '../context/NotesContext';
import styles from './NoteEditor.module.css';
import EncryptionModal from './EncryptionModal';
import GlossaryHighlight from './ai/GlossaryHighlight';
import GrammarCheck from './ai/GrammarCheck';
import ChangePasswordModal from './ai/ChangePasswordModal';
import { FaEye, FaEyeSlash, FaLock } from 'react-icons/fa';

const NoteEditor = forwardRef((props, ref) => {
  const { onLockStateChange } = props;
  const { state, dispatch, encrypt, decrypt } = useContext(NotesContext);
  const { notes, selectedNoteId } = state;
  const note = notes.find(n => n.id === selectedNoteId);
  const editorRef = useRef();
  const [showEncrypt, setShowEncrypt] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [password, setPassword] = useState(''); // last used password for this session
  const [decrypted, setDecrypted] = useState(null); // null = locked, string = unlocked
  const [unlockError, setUnlockError] = useState('');
  const [pendingContent, setPendingContent] = useState('');
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [changePwdError, setChangePwdError] = useState('');
  const [showEncrypted, setShowEncrypted] = useState(false);

  // Reset all state when switching notes
  useEffect(() => {
    setShowEncrypt(false);
    setShowUnlockModal(false);
    setPassword('');
    setDecrypted(null);
    setUnlockError('');
    setPendingContent(note && !note.encrypted ? note.content : '');
    if (editorRef.current && note && !note.encrypted) {
      editorRef.current.innerHTML = note.content;
    } else if (editorRef.current) {
      editorRef.current.innerHTML = '';
    }
    // Remove unlocked content for previous note
    if (window.unlockedNotes) {
      Object.keys(window.unlockedNotes).forEach(id => {
        if (id !== (note && note.id)) delete window.unlockedNotes[id];
      });
    }
  }, [note?.id]);

  // Set content on decrypt
  useEffect(() => {
    if (!note || !editorRef.current) return;
    if (note.encrypted && decrypted !== null) {
      editorRef.current.innerHTML = decrypted;
      setPendingContent(decrypted);
    } else if (!note.encrypted) {
      editorRef.current.innerHTML = note.content;
      setPendingContent(note.content);
    }
  }, [note?.encrypted, decrypted]);

  // Notify parent of lock state
  useEffect(() => {
    if (onLockStateChange) onLockStateChange(note && note.encrypted && decrypted === null);
  }, [note?.id, note?.encrypted, decrypted, onLockStateChange]);

  useImperativeHandle(ref, () => ({
    saveNote: () => {
      if (!note || !editorRef.current) return;
      const html = editorRef.current.innerHTML;
      if (note.encrypted) {
        if (!password) {
          alert('Please unlock the note before saving.');
          return;
        }
        const cipher = encrypt(html, password);
        dispatch({ type: 'UPDATE_NOTE', note: { ...note, content: cipher, encrypted: true } });
      } else {
        dispatch({ type: 'UPDATE_NOTE', note: { ...note, content: html } });
      }
      setPendingContent(html);
    }
  }));

  if (!note) {
    return <div className={styles.empty}>Select or create a note to get started.</div>;
  }

  const isLocked = note.encrypted && decrypted === null;
  const isUnlocked = note.encrypted ? decrypted !== null : true;

  const handleInput = e => {
    setPendingContent(e.currentTarget.innerHTML);
  };

  const handleTitleChange = e => {
    if (isLocked) return;
    dispatch({ type: 'UPDATE_NOTE', note: { ...note, title: e.target.value } });
  };

  const handleEncrypt = pwd => {
    const cipher = encrypt(editorRef.current.innerHTML, pwd);
    dispatch({ type: 'UPDATE_NOTE', note: { ...note, content: cipher, encrypted: true } });
    setShowEncrypt(false);
    setPassword(pwd); // set password for this session
    setDecrypted(null);
    setUnlockError('');
  };

  const handleUnlockClick = () => {
    setShowUnlockModal(true);
    setPassword('');
    setUnlockError('');
  };

  const handleDecrypt = pwd => {
    const plain = decrypt(note.content, pwd);
    if (plain && typeof plain === 'string' && plain.trim() !== '') {
      setDecrypted(plain);
      setShowUnlockModal(false);
      setPassword(pwd); // store password for this session
      setUnlockError('');
      if (!window.unlockedNotes) window.unlockedNotes = {};
      window.unlockedNotes[note.id] = plain;
      window.dispatchEvent(new Event('note-unlocked'));
    } else {
      setUnlockError('Incorrect password.');
      setDecrypted(null);
    }
  };

  const handleCancel = () => {
    setShowUnlockModal(false);
    setShowEncrypt(false);
    setPassword('');
    setUnlockError('');
  };

  const handleChangePassword = (oldPwd, newPwd) => {
    const plain = decrypt(note.content, oldPwd);
    if (plain !== null && plain !== undefined && plain !== '') {
      const cipher = encrypt(plain, newPwd);
      dispatch({ type: 'UPDATE_NOTE', note: { ...note, content: cipher, encrypted: true } });
      setShowChangePwd(false);
      setPassword(newPwd);
      setDecrypted(plain);
      setChangePwdError('');
      if (!window.unlockedNotes) window.unlockedNotes = {};
      window.unlockedNotes[note.id] = plain;
    } else {
      setChangePwdError('Old password is incorrect.');
    }
  };

  return (
    <div className={styles.editorContainer} style={{ position: 'relative' }}>
      {/* Encrypted text toggle, only if unlocked and encrypted */}
      {note.encrypted && isUnlocked && (
        <button
          onClick={() => setShowEncrypted(v => !v)}
          title={showEncrypted ? 'Hide Encrypted Text' : 'Show Encrypted Text'}
          style={{
            position: 'absolute',
            top: 18,
            right: 18,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            zIndex: 10,
            padding: 0,
            fontSize: '1.25em',
            color: '#647dee',
            opacity: 0.85,
            transition: 'opacity 0.18s',
          }}
          aria-label={showEncrypted ? 'Hide Encrypted Text' : 'Show Encrypted Text'}
        >
          {showEncrypted ? <FaEyeSlash /> : <FaLock />}
        </button>
      )}
      {/* Encrypted text box, scrollable, only if unlocked and toggled */}
      {note.encrypted && isUnlocked && showEncrypted && (
        <div
          style={{
            position: 'absolute',
            top: 54,
            right: 18,
            background: '#181c24',
            color: '#fff',
            border: '1.5px solid #647dee',
            borderRadius: 8,
            padding: '8px 12px',
            fontSize: '0.98em',
            wordBreak: 'break-all',
            maxWidth: 420,
            maxHeight: 120,
            overflowY: 'auto',
            overflowX: 'auto',
            userSelect: 'all',
            zIndex: 20,
            boxShadow: '0 2px 12px rgba(100,125,222,0.18)',
          }}
          title="Encrypted text stored in localStorage"
        >
          {note.content}
        </div>
      )}
      <input
        className={styles.titleInput}
        value={note.title}
        onChange={handleTitleChange}
        placeholder="Note title..."
        maxLength={100}
        disabled={isLocked}
      />
      {isLocked ? (
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <button className={styles.encryptBtn} onClick={handleUnlockClick}>Unlock Note</button>
        </div>
      ) : (
        <>
          <div
            className={styles.editor}
            contentEditable
            dir="ltr"
            suppressContentEditableWarning
            ref={editorRef}
            onInput={handleInput}
          />
          <div className={styles.actions}>
            {!note.encrypted && (
              <button className={styles.encryptBtn} onClick={() => setShowEncrypt(true)}>
                Encrypt
              </button>
            )}
            {note.encrypted && isUnlocked && (
              <button className={styles.encryptBtn} onClick={() => setShowChangePwd(true)}>
                Change Password
              </button>
            )}
          </div>
          {isUnlocked && (
            <div className={styles.aiPanel}>
              <h4>Glossary Highlights</h4>
              <GlossaryHighlight content={pendingContent} />
              <h4>Grammar Suggestions</h4>
              <GrammarCheck content={pendingContent} />
            </div>
          )}
        </>
      )}
      {showUnlockModal && (
        <>
          <EncryptionModal
            onSubmit={handleDecrypt}
            label="Unlock Note"
            onCancel={handleCancel}
            error={unlockError}
            onTryAgain={() => setUnlockError('')}
          />
        </>
      )}
      {showEncrypt && isUnlocked && <EncryptionModal onSubmit={handleEncrypt} label="Set Password" onCancel={handleCancel} />}
      {showChangePwd && isUnlocked && (
        <ChangePasswordModal
          onSubmit={handleChangePassword}
          onCancel={() => { setShowChangePwd(false); setChangePwdError(''); }}
          error={changePwdError}
        />
      )}
    </div>
  );
});

export default NoteEditor; 