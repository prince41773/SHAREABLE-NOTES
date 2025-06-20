import React, { useEffect, useState } from 'react';
import styles from './GlossaryHighlight.module.css';

const GEMINI_API_KEY = 'AIzaSyCIN_nmD5kEvUHY8cIij97RyivkdqWRXz4';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

function GlossaryHighlight({ content }) {
  const [terms, setTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!content || !content.trim()) {
      setTerms([]);
      setError('');
      return;
    }
    setLoading(true);
    setError('');
    setTerms([]);
    fetch(GEMINI_API_URL + '?key=' + GEMINI_API_KEY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Extract up to 8 important technical or domain-specific terms from the following note and provide a short definition for each. Respond as JSON: [{"term": "...", "definition": "..."}, ...]. Note: ${content.replace(/<[^>]+>/g, '')}` }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 256 }
      })
    })
      .then(res => res.json())
      .then(data => {
        let text = '';
        try {
          text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
          const json = JSON.parse(text.match(/\[.*\]/s)?.[0] || '[]');
          setTerms(Array.isArray(json) ? json : []);
        } catch {
          setError('Could not parse AI response.');
          setTerms([]);
        }
      })
      .catch(() => {
        setError('Error fetching glossary terms.');
        setTerms([]);
      })
      .finally(() => setLoading(false));
  }, [content]);

  return (
    <div className={styles.glossaryContainer}>
      {loading && <div>Loading glossary terms...</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!loading && !error && terms.length === 0 && <div style={{ color: '#888' }}>No glossary terms found.</div>}
      <ul style={{ margin: 0, padding: 0, listStyle: 'none', maxHeight: 100, overflowY: 'auto' }}>
        {terms.map((t, i) => (
          <li key={i} style={{ marginBottom: 8 }}>
            <span className={styles.highlight} style={{ fontWeight: 600 }}>{t.term}</span>: <span>{t.definition}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default GlossaryHighlight; 