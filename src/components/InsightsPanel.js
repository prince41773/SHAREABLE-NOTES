import React, { useContext, useEffect, useState } from 'react';
import NotesContext from '../context/NotesContext';
import styles from './InsightsPanel.module.css';

const GEMINI_API_KEY = 'AIzaSyCIN_nmD5kEvUHY8cIij97RyivkdqWRXz4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Global unlocked notes state (shared between NoteEditor and InsightsPanel)
if (!window.unlockedNotes) window.unlockedNotes = {};

function InsightsPanel() {
  const { state } = useContext(NotesContext);
  const { notes, selectedNoteId } = state;
  const note = notes.find(n => n.id === selectedNoteId);
  const [version, setVersion] = useState(0);
  const [summary, setSummary] = useState('');
  const [keyPoints, setKeyPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Listen for note-unlocked event to force re-render
  useEffect(() => {
    const handler = () => setVersion(v => v + 1);
    window.addEventListener('note-unlocked', handler);
    return () => window.removeEventListener('note-unlocked', handler);
  }, []);
  useEffect(() => {
    setSummary('');
    setKeyPoints([]);
    setError('');
    if (!note) return;
    let content = note.content;
    if (note.encrypted && window.unlockedNotes[note.id]) {
      content = window.unlockedNotes[note.id];
    } else if (note.encrypted) {
      setSummary('[Locked: Unlock this note to see insights]');
      setKeyPoints([]);
      return;
    }
    content = content.replace(/<[^>]+>/g, '').trim();
    if (!content) {
      setSummary('No content to analyze.');
      setKeyPoints([]);
      return;
    }
    setLoading(true);
    fetch(GEMINI_API_URL + '?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Summarize and extract 3 key points from the following note. Respond as JSON: {"summary": "...", "keyPoints": ["...", "...", "..."]}. Note: ${content}` }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 256 }
      })
    })
      .then(res => res.json())
      .then(data => {
        let text = '';
        try {
          text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const json = JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
          setSummary(json.summary || '');
          setKeyPoints(json.keyPoints || []);
        } catch {
          setSummary('Could not parse AI response.');
          setKeyPoints([]);
        }
      })
      .catch(() => {
        setSummary('Error fetching AI insights.');
        setKeyPoints([]);
        setError('AI API error');
      })
      .finally(() => setLoading(false));
  }, [note?.id, note?.encrypted, version]);

  if (!note) return <div className={styles.panel}>No note selected.</div>;

  const currentWords = new Set(note.title.trim().toLowerCase().split(/\s+/));
  const related = notes.filter(n => {
    if (n.id === note.id) return false;
    const otherWords = new Set(n.title.trim().toLowerCase().split(/\s+/));
    for (let word of currentWords) {
      if (word && otherWords.has(word)) return true;
    }
    return false;
  });

  return (
    <div className={styles.panel}>
      <h3>AI Insights</h3>
      <div className={styles.section}>
        <b>Summary:</b>
        <div className={styles.summary}>{loading ? 'Loading...' : summary}</div>
      </div>
      <div className={styles.section}>
        <b>Key Points:</b>
        {loading ? <div>Loading...</div> : (
          <ul className={styles.keyPoints}>
            {keyPoints.map((pt, i) => <li key={i}>{pt}</li>)}
          </ul>
        )}
      </div>
      <div className={styles.section}>
        <b>Related Notes:</b>
        <ul className={styles.related}>
          {related.map(n => <li key={n.id}>{n.title}</li>)}
        </ul>
      </div>
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  );
}

export default InsightsPanel; 