import React, { useState } from 'react';
import styles from '../EncryptionModal.module.css';

function ChangePasswordModal({ onSubmit, onCancel, error }) {
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (oldPwd && newPwd) onSubmit(oldPwd, newPwd);
  };

  return (
    <div className={styles.modalOverlay}>
      <form className={styles.modal} onSubmit={handleSubmit}>
        <label style={{ width: '100%', fontWeight: 600 }}>
          Old Password:
          <input
            type="password"
            value={oldPwd}
            onChange={e => setOldPwd(e.target.value)}
            className={styles.input}
            autoFocus
            required
            aria-label="Old Password"
          />
        </label>
        <label style={{ width: '100%', fontWeight: 600 }}>
          New Password:
          <input
            type="password"
            value={newPwd}
            onChange={e => setNewPwd(e.target.value)}
            className={styles.input}
            required
            aria-label="New Password"
          />
        </label>
        {error && <div style={{ color: 'red', marginTop: 8, fontWeight: 600 }}>{error}</div>}
        <div className={styles.buttonRow}>
          <button className={styles.submitBtn} type="submit">Change Password</button>
          {onCancel && (
            <button className={styles.cancelBtn} type="button" onClick={onCancel}>Cancel</button>
          )}
        </div>
      </form>
    </div>
  );
}

export default ChangePasswordModal; 