import React from 'react';
import styles from './Toolbar.module.css';

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32];

function Toolbar({ onSave, disabled }) {
  const exec = (cmd, value = null) => {
    if (disabled) return;
    document.execCommand(cmd, false, value);
  };

  // Font size: robust for multiline, caret, and partial selection
  const handleFontSize = e => {
    if (disabled) return;
    const px = e.target.value;
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (selection.isCollapsed) {
      // Insert a styled span at caret
      const span = document.createElement('span');
      span.style.fontSize = px + 'px';
      span.appendChild(document.createTextNode('\u200B'));
      range.insertNode(span);
      // Move caret inside the span
      range.setStart(span.firstChild, 1);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
    } else {
      // For each text node in the selection, wrap the selected part in a span
      const editor = range.commonAncestorContainer.closest
        ? range.commonAncestorContainer.closest('[contenteditable]')
        : document.querySelector('[contenteditable]');
      if (!editor) return;
      // Split the range into multiple ranges for each text node
      const walker = document.createTreeWalker(
        range.commonAncestorContainer,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: node => {
            // Only text nodes that intersect the selection
            const nodeRange = document.createRange();
            nodeRange.selectNodeContents(node);
            return (range.compareBoundaryPoints(Range.END_TO_START, nodeRange) < 0 &&
                    range.compareBoundaryPoints(Range.START_TO_END, nodeRange) > 0)
              ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
          }
        }
      );
      const textNodes = [];
      let node;
      while ((node = walker.nextNode())) {
        textNodes.push(node);
      }
      textNodes.forEach(textNode => {
        const nodeRange = document.createRange();
        nodeRange.selectNodeContents(textNode);
        // Find intersection with selection
        const start = Math.max(range.startOffset, 0);
        const end = Math.min(range.endOffset, textNode.length);
        if (start < end) {
          nodeRange.setStart(textNode, start);
          nodeRange.setEnd(textNode, end);
          const span = document.createElement('span');
          span.style.fontSize = px + 'px';
          span.textContent = textNode.textContent.slice(start, end);
          nodeRange.deleteContents();
          nodeRange.insertNode(span);
        }
      });
    }
  };

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Formatting toolbar">
      <button disabled={disabled} onMouseDown={e => { e.preventDefault(); exec('bold'); }} title="Bold" className={styles.btn}><b>B</b></button>
      <button disabled={disabled} onMouseDown={e => { e.preventDefault(); exec('italic'); }} title="Italic" className={styles.btn}><i>I</i></button>
      <button disabled={disabled} onMouseDown={e => { e.preventDefault(); exec('underline'); }} title="Underline" className={styles.btn}><u>U</u></button>
      <span className={styles.divider} />
      <button disabled={disabled} onMouseDown={e => { e.preventDefault(); exec('justifyLeft'); }} title="Align Left" className={styles.btn}>⯇</button>
      <button disabled={disabled} onMouseDown={e => { e.preventDefault(); exec('justifyCenter'); }} title="Align Center" className={styles.btn}>≡</button>
      <button disabled={disabled} onMouseDown={e => { e.preventDefault(); exec('justifyRight'); }} title="Align Right" className={styles.btn}>⯈</button>
      <span className={styles.divider} />
      <select
        className={styles.fontSize}
        onChange={handleFontSize}
        onClick={e => e.stopPropagation()}
        title="Font Size"
        defaultValue="16"
        disabled={disabled}
      >
        {FONT_SIZES.map(size => (
          <option key={size} value={size}>{size}px</option>
        ))}
      </select>
      <span className={styles.divider} />
      <button disabled={disabled} onMouseDown={e => { e.preventDefault(); if (onSave) onSave(); }} title="Save" className={`${styles.btn} ${styles.save}`}>💾 Save</button>
    </div>
  );
}

export default Toolbar; 