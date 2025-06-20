import React, { useState, useEffect } from 'react';
import styles from './EncryptionModal.module.css';

function EncryptionModal({ onSubmit, label, onCancel, error }) {
  const [pwd, setPwd] = useState('');

  useEffect(() => {
    if (!error) setPwd(''); // clear input only if not error (so user can retry)
  }, [error]);

  const handleSubmit = e => {
    e.preventDefault();
    if (pwd) onSubmit(pwd);
  };

  return (
    <div className={styles.modalOverlay}>
      <form className={styles.modal} onSubmit={handleSubmit}>
        <label>
          Password:
          <input
            type="password"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            className={styles.input}
            autoFocus
          />
        </label>
        {error && <div style={{ color: 'red', marginTop: 8, fontWeight: 600 }}>{error}</div>}
        <div className={styles.buttonRow}>
          <button className={styles.submitBtn} type="submit">{label}</button>
          {onCancel && (
            <button className={styles.cancelBtn} type="button" onClick={onCancel}>Cancel</button>
          )}
        </div>
      </form>
    </div>
  );
}

export default EncryptionModal; 