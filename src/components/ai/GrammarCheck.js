import React, { useEffect, useState } from 'react';
import styles from './GrammarCheck.module.css';

const GEMINI_API_KEY = 'AIzaSyCIN_nmD5kEvUHY8cIij97RyivkdqWRXz4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function GrammarCheck({ content }) {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!content || !content.trim()) {
      setErrors([]);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    setErrors([]);
    fetch(GEMINI_API_URL + '?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Find the grammar or spelling errors in the following note and provide a suggestion for each. Respond as JSON: [{"error": "...", "suggestion": "..."}, ...]. Note: ${content.replace(/<[^>]+>/g, '')}` }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 256 }
      })
    })
      .then(res => res.json())
      .then(data => {
        let text = '';
        try {
          text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const json = JSON.parse(text.match(/\[.*\]/s)?.[0] || '[]');
          setErrors(Array.isArray(json) ? json : []);
        } catch {
          setError('Could not parse AI response.');
          setErrors([]);
        }
      })
      .catch(() => {
        setError('Error fetching grammar suggestions.');
        setErrors([]);
      })
      .finally(() => setLoading(false));
  }, [content]);

  return (
    <div className={styles.grammarContainer}>
      {loading && <div>Loading grammar suggestions...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && errors.length === 0 && <div style={{ color: '#888' }}>No grammar issues found.</div>}
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', maxHeight: 100, overflowY: 'auto' }}>
        {errors.map((e, i) => (
          <li key={i} style={{ marginBottom: 8 }}>
            <span className={styles.grammarError} style={{ fontWeight: 600 }}>{e.error}</span>: <span>{e.suggestion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GrammarCheck; 