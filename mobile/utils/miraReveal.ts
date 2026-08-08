import {
  DISCOVERY_PROMPTS,
  MiraRevealPayload,
  MiraRevealType,
  REVEAL_TYPE_LABELS,
} from '../constants/miraReveal';

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
 * Parse a model response into a reveal payload.
 * Returns null if the response is not usable structured JSON.
 */
export function parseMiraRevealResponse(raw: string): MiraRevealPayload | null {
  const parsed = extractJsonObject(raw);
  if (!parsed || typeof parsed !== 'object') return null;

  const obj = parsed as Record<string, unknown>;
  const type = normalizeType(obj.type);
  const answer =
    (typeof obj.answer === 'string' && obj.answer.trim()) ||
    (typeof obj.title === 'string' && obj.title.trim()) ||
    '';
  if (!answer && type !== 'insufficient_data') return null;

  const headline =
    (typeof obj.headline === 'string' && obj.headline.trim()) ||
    REVEAL_TYPE_LABELS[type];

  const evidence = asStringArray(obj.evidence, 4);
  const recommendation =
    (typeof obj.recommendation === 'string' && obj.recommendation.trim()) ||
    'Keep journaling — Insight gets sharper with every entry.';
  const explanation =
    (typeof obj.explanation === 'string' && obj.explanation.trim()) ||
    (typeof obj.analysis === 'string' && obj.analysis.trim()) ||
    '';

  // Soften fake precision: if evidence looks invented-empty, drop confidence
  let confidence = clampConfidence(obj.confidence);
  if (evidence.length === 0) confidence = null;

  return {
    type,
    headline,
    answer: answer || 'Still learning about you',
    confidence,
    evidence:
      evidence.length > 0
        ? evidence
        : [
            'Not enough journal detail yet for precise receipts — keep writing and Insight will get sharper.',
          ],
    recommendation,
    explanation:
      explanation ||
      'I looked through what you have shared so far. Ask a follow-up and we can go deeper.',
  };
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

/** Soft fallback when the model fails to return JSON. */
export function softRevealFromPlainText(
  plain: string,
  preferredType?: MiraRevealType,
): MiraRevealPayload {
  const type = preferredType || 'recurring_pattern';
  return {
    type,
    headline: REVEAL_TYPE_LABELS[type],
    answer: 'A pattern worth noticing',
    confidence: null,
    evidence: [
      'Drawn from themes in your recent journal entries',
      'Precise counts unavailable for this response',
    ],
    recommendation: 'Ask Insight a follow-up to go deeper on this.',
    explanation: plain.trim(),
  };
}

/** Normalize a persisted chat message so reveal cards survive reload. */
export function normalizePersistedReveal(raw: unknown): MiraRevealPayload | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.answer !== 'string' || !obj.answer.trim()) return undefined;
  const type = normalizeType(obj.type);
  return {
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
}
