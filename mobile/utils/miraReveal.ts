import {
  DISCOVERY_PROMPTS,
  MiraRevealPayload,
  MiraRevealType,
  REVEAL_TYPE_LABELS,
} from '../constants/miraReveal';

const GENERIC_ANSWER_PATTERNS: RegExp[] = [
  /^a pattern worth noticing\.?$/i,
  /^pattern worth noticing\.?$/i,
  /^still learning about you\.?$/i,
  /^worth noticing\.?$/i,
  /^(a |an )?(pattern|trait|strength|weakness|blind spot) worth (noticing|exploring)\.?$/i,
];

const GENERIC_EVIDENCE_PATTERNS: RegExp[] = [
  /drawn from themes in your recent journal entries/i,
  /precise counts unavailable/i,
  /not enough journal detail yet for precise receipts/i,
  /keep writing and insight will get sharper/i,
];

const DISCOVERY_REGEXES: RegExp[] = [
  /biggest\s+weakness/i,
  /greatest\s+strength|biggest\s+strength/i,
  /holding\s+me\s+back/i,
  /emotional\s+pattern|keeps?\s+repeating|recurring\s+pattern/i,
  /improved\s+most|biggest\s+improvement|what'?s\s+changed/i,
  /surprises?\s+you\s+about\s+me/i,
  /what\s+do\s+i\s+avoid|what\s+am\s+i\s+avoiding/i,
  /focus\s+on\s+next|should\s+i\s+(focus|work\s+on)/i,
  /blind\s+spot/i,
  /lying\s+to\s+myself/i,
  /hidden\s+trait/i,
  /emotional\s+trigger/i,
  /what\s+should\s+i\s+stop\s+doing/i,
];

/** True when the user message should use the reveal-card pipeline. */
export function isDiscoveryQuery(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (
    DISCOVERY_PROMPTS.some(
      (p) =>
        p.text.toLowerCase() === trimmed.toLowerCase() ||
        p.label.toLowerCase() === trimmed.toLowerCase(),
    )
  ) {
    return true;
  }
  return DISCOVERY_REGEXES.some((re) => re.test(trimmed));
}

export function preferredRevealTypeForQuery(text: string): MiraRevealType | undefined {
  const match = DISCOVERY_PROMPTS.find(
    (p) =>
      p.text.toLowerCase() === text.trim().toLowerCase() ||
      p.label.toLowerCase() === text.trim().toLowerCase(),
  );
  return match?.preferredType;
}

/** Contextual emoji for evidence lines — matches premium reveal card design */
export function evidenceIconFor(line: string): string {
  const t = line.toLowerCase();
  if (/sleep|insomnia|rest|tired|night|bed|dream/.test(t)) return '🌙';
  if (/anxiet|worry|stress|overwhelm|panic|fear/.test(t)) return '💭';
  if (/strength|confident|proud|resilien|courage/.test(t)) return '💪';
  if (/weak|avoid|procrastin|stuck|doubt/.test(t)) return '🪞';
  if (/relationship|friend|partner|family|people|social/.test(t)) return '👥';
  if (/work|career|job|deadline|productiv/.test(t)) return '💼';
  if (/habit|routine|pattern|repeat|always/.test(t)) return '🔄';
  if (/emotion|feel|mood|anger|sad|happy/.test(t)) return '💜';
  if (/growth|improv|progress|better|learn/.test(t)) return '🌱';
  if (/time|schedule|late|morning|hour/.test(t)) return '⏰';
  if (/journal|wrote|mention|entry|said/.test(t)) return '📝';
  return '✨';
}

/** @deprecated Prefer full evidence text + evidenceIconFor */
export function shortenEvidenceLine(line: string): { icon: string; text: string } {
  return {
    icon: evidenceIconFor(line),
    text: line.replace(/^[-•·]\s*/, '').replace(/\.$/, '').trim(),
  };
}

function isGenericAnswer(answer: string): boolean {
  const trimmed = answer.trim();
  if (!trimmed) return true;
  return GENERIC_ANSWER_PATTERNS.some((pattern) => pattern.test(trimmed));
}

function isGenericEvidence(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;
  return GENERIC_EVIDENCE_PATTERNS.some((pattern) => pattern.test(trimmed));
}

/** Only show the premium card when the model returned a specific, evidenced finding. */
export function isRevealCardWorthy(reveal: MiraRevealPayload): boolean {
  if (reveal.type === 'insufficient_data') return false;
  if (isGenericAnswer(reveal.answer)) return false;

  const substantiveEvidence = reveal.evidence.filter(
    (line) => !isGenericEvidence(line) && line.trim().length >= 18,
  );

  if (substantiveEvidence.length >= 2) return true;

  if (substantiveEvidence.length === 1) {
    const line = substantiveEvidence[0];
    return /\d+|"\w|mentioned|wrote|entries?|times|often|when you/i.test(line);
  }

  return false;
}

/** Plain-text reply when a card would be misleading or empty. */
export function buildRevealFallbackText(
  parsed: MiraRevealPayload | null,
  raw: string,
): string {
  if (parsed?.explanation?.trim()) return parsed.explanation.trim();
  const trimmed = raw.trim();
  if (trimmed && !trimmed.startsWith('{')) return trimmed;
  return '';
}

function clampConfidence(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  const rounded = Math.round(n);
  if (rounded < 55) return null; // too weak to display as a score
  return Math.max(0, Math.min(100, rounded));
}

function asStringArray(value: unknown, max = 4): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .filter(Boolean)
    .slice(0, max);
}

function normalizeType(raw: unknown): MiraRevealType {
  const s = String(raw || '')
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
  const allowed = Object.keys(REVEAL_TYPE_LABELS) as MiraRevealType[];
  if (allowed.includes(s as MiraRevealType)) return s as MiraRevealType;
  return 'recurring_pattern';
}

function extractJsonObject(text: string): unknown | null {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    // continue
  }
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) {
    try {
      return JSON.parse(fence[1].trim());
    } catch {
      // continue
    }
  }
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    try {
      return JSON.parse(trimmed.slice(start, end + 1));
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Parse structured JSON from the model (including insufficient_data).
 * May return payloads that are not card-worthy — use parseMiraRevealResponse for cards only.
 */
export function parseMiraRevealPayload(raw: string): MiraRevealPayload | null {
  const parsed = extractJsonObject(raw);
  if (!parsed || typeof parsed !== 'object') return null;

  const obj = parsed as Record<string, unknown>;
  const type = normalizeType(obj.type);
  const answer =
    (typeof obj.answer === 'string' && obj.answer.trim()) ||
    (typeof obj.title === 'string' && obj.title.trim()) ||
    '';

  const explanation =
    (typeof obj.explanation === 'string' && obj.explanation.trim()) ||
    (typeof obj.analysis === 'string' && obj.analysis.trim()) ||
    '';

  if (type === 'insufficient_data') {
    return {
      type,
      headline: REVEAL_TYPE_LABELS.insufficient_data,
      answer: answer || '',
      confidence: null,
      evidence: [],
      recommendation: '',
      explanation:
        explanation ||
        'I need a few more journal entries before I can name a specific pattern with confidence. Keep writing — especially when something feels off — and ask me again.',
    };
  }

  if (!answer) {
    if (!explanation) return null;
    return {
      type: 'insufficient_data',
      headline: REVEAL_TYPE_LABELS.insufficient_data,
      answer: '',
      confidence: null,
      evidence: [],
      recommendation: '',
      explanation,
    };
  }

  const headline =
    (typeof obj.headline === 'string' && obj.headline.trim()) ||
    REVEAL_TYPE_LABELS[type];

  const evidence = asStringArray(obj.evidence, 4).filter((line) => !isGenericEvidence(line));
  const recommendation =
    (typeof obj.recommendation === 'string' && obj.recommendation.trim()) ||
    '';

  let confidence = clampConfidence(obj.confidence);
  if (evidence.length === 0) confidence = null;

  return {
    type,
    headline,
    answer,
    confidence,
    evidence,
    recommendation,
    explanation,
  };
}

/** Parse only when the payload meets card quality bar. */
export function parseMiraRevealResponse(raw: string): MiraRevealPayload | null {
  const parsed = parseMiraRevealPayload(raw);
  if (!parsed || !isRevealCardWorthy(parsed)) return null;
  return parsed;
}

export function formatRevealShareText(
  reveal: MiraRevealPayload,
  prefix: string,
): string {
  const conf =
    reveal.confidence != null ? `\n${reveal.confidence}% confidence` : '';
  const evidence = reveal.evidence.map((e) => `• ${e}`).join('\n');
  return `${prefix}\n\n${reveal.headline}\n${reveal.answer}${conf}\n\nEvidence\n${evidence}\n\nRecommendation\n${reveal.recommendation}`;
}

/** @deprecated Cards are no longer synthesized from failed JSON — use buildRevealFallbackText. */
export function softRevealFromPlainText(
  plain: string,
  preferredType?: MiraRevealType,
): MiraRevealPayload {
  void preferredType;
  return {
    type: 'insufficient_data',
    headline: REVEAL_TYPE_LABELS.insufficient_data,
    answer: '',
    confidence: null,
    evidence: [],
    recommendation: '',
    explanation: plain.trim() || buildRevealFallbackText(null, plain),
  };
}

/** Normalize a persisted chat message so reveal cards survive reload. */
export function normalizePersistedReveal(raw: unknown): MiraRevealPayload | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.answer !== 'string' || !obj.answer.trim()) return undefined;
  const type = normalizeType(obj.type);
  const reveal: MiraRevealPayload = {
    type,
    headline:
      (typeof obj.headline === 'string' && obj.headline.trim()) ||
      REVEAL_TYPE_LABELS[type],
    answer: obj.answer.trim(),
    confidence: clampConfidence(obj.confidence),
    evidence: asStringArray(obj.evidence, 4),
    recommendation:
      (typeof obj.recommendation === 'string' && obj.recommendation.trim()) || '',
    explanation:
      (typeof obj.explanation === 'string' && obj.explanation.trim()) || '',
  };

  if (!isRevealCardWorthy(reveal)) return undefined;
  return reveal;
}
