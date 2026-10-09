import { useState } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import php from 'react-syntax-highlighter/dist/esm/languages/prism/php';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import styles from './CodeBlock.module.css';

SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('php', php);
SyntaxHighlighter.registerLanguage('yaml', yaml);

const theme: { [key: string]: React.CSSProperties } = {
  'code[class*="language-"]': {
    color: '#cdd6f4',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.85rem',
    lineHeight: '1.7',
    background: 'none',
  },
  'pre[class*="language-"]': {
    background: 'none',
    margin: 0,
    padding: 0,
    overflow: 'auto',
  },
  keyword:   { color: '#cba6f7' },
  string:    { color: '#a6e3a1' },
  comment:   { color: '#585b70', fontStyle: 'italic' },
  number:    { color: '#fab387' },
  function:  { color: '#89b4fa' },
  operator:  { color: '#89dceb' },
  punctuation: { color: '#cdd6f4' },
  'class-name': { color: '#f9e2af' },
  variable:  { color: '#cdd6f4' },
  property:  { color: '#89dceb' },
  tag:       { color: '#f38ba8' },
  builtin:   { color: '#89b4fa' },
};

interface CodeBlockProps {
  code: string;
  language?: string;
  label?: string;
}

export default function CodeBlock({ code, language = 'bash', label }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.dots}>
          <span /><span /><span />
        </div>
        {label && <span className={styles.label}>{label}</span>}
        <button className={styles.copy} onClick={handleCopy} title="Copy to clipboard">
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <div className={styles.body}>
        <SyntaxHighlighter language={language} style={theme} wrapLines>
          {code.trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
