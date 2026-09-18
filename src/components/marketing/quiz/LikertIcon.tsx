type LikertIconName = 'down2' | 'down' | 'unsure' | 'up' | 'up2';

export function LikertIcon({ name }: { name: LikertIconName | string }) {
  if (name === 'down2') {
    return (
      <span className="quiz-likert-glyph quiz-likert-glyph--down" aria-hidden="true">
        <ThumbDown />
        <ThumbDown />
      </span>
    );
  }
  if (name === 'down') {
    return (
      <span className="quiz-likert-glyph quiz-likert-glyph--down" aria-hidden="true">
        <ThumbDown />
      </span>
    );
  }
  if (name === 'unsure') {
    return (
      <span className="quiz-likert-glyph quiz-likert-glyph--neutral" aria-hidden="true">
        <QuestionMark />
      </span>
    );
  }
  if (name === 'up') {
    return (
      <span className="quiz-likert-glyph quiz-likert-glyph--up" aria-hidden="true">
        <ThumbUp />
      </span>
    );
  }
  return (
    <span className="quiz-likert-glyph quiz-likert-glyph--up" aria-hidden="true">
      <ThumbUp sparkle />
    </span>
  );
}

function ThumbDown() {
  return (
    <svg viewBox="0 0 32 32" width="22" height="22" fill="currentColor">
      <path d="M10.2 6.2h9.1c1.4 0 2.5 1.2 2.4 2.6l-.6 8.2c0 .7-.6 1.2-1.3 1.2h-3.1l.6 3.4c.2 1.1-.6 2.2-1.7 2.4-.9.2-1.8-.4-2.1-1.3L12 17.4H8.8c-1.2 0-2.1-1-2.1-2.2V8.4c0-1.2 1-2.2 2.1-2.2h1.4z" />
      <path d="M6.4 6.4h2.2v10.6H6.4A1.6 1.6 0 0 1 4.8 15.4V8a1.6 1.6 0 0 1 1.6-1.6z" opacity="0.9" />
    </svg>
  );
}

function ThumbUp({ sparkle = false }: { sparkle?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" width="22" height="22" fill="currentColor">
      <path d="M21.8 25.8h-9.1c-1.4 0-2.5-1.2-2.4-2.6l.6-8.2c0-.7.6-1.2 1.3-1.2h3.1l-.6-3.4c-.2-1.1.6-2.2 1.7-2.4.9-.2 1.8.4 2.1 1.3L20 14.6h3.2c1.2 0 2.1 1 2.1 2.2v6.8c0 1.2-1 2.2-2.1 2.2h-1.4z" />
      <path d="M25.6 25.6h-2.2V15h2.2A1.6 1.6 0 0 1 27.2 16.6v7.4a1.6 1.6 0 0 1-1.6 1.6z" opacity="0.9" />
      {sparkle ? (
        <>
          <circle cx="8" cy="8" r="1.4" />
          <path d="M6.2 4.4h1.2v3.2H6.2z" opacity="0.85" />
          <path d="M4.6 6h3.2v1.2H4.6z" opacity="0.85" />
        </>
      ) : null}
    </svg>
  );
}

function QuestionMark() {
  return (
    <svg viewBox="0 0 32 32" width="22" height="22" fill="currentColor">
      <circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <text x="16" y="21" textAnchor="middle" fontSize="14" fontWeight="700" fontFamily="system-ui">?</text>
    </svg>
  );
}
