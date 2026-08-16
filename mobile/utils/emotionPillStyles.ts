/** Premium per-emotion pill palette — distinct tints like the recap reference design. */

export type EmotionPillStyle = {
  emoji: string;
  lightBg: string;
  darkBg: string;
  lightBorder: string;
  darkBorder: string;
  lightText: string;
  darkText: string;
};

const P = (emoji: string, hue: string, rgb: string): EmotionPillStyle => ({
  emoji,
  lightBg: `rgba(${rgb}, 0.22)`,
  darkBg: `rgba(${rgb}, 0.28)`,
  lightBorder: `rgba(${rgb}, 0.32)`,
  darkBorder: `rgba(${rgb}, 0.38)`,
  lightText: hue,
  darkText: '#F4F2FA',
});

export const EMOTION_PILL_STYLES: Record<string, EmotionPillStyle> = {
  // Positive — greens & golds
  happy: P('😊', '#1F9E6A', '16, 185, 129'),
  joyful: P('😄', '#1F9E6A', '16, 185, 129'),
  excited: P('🤩', '#1F9E6A', '16, 185, 129'),
  grateful: P('🙏', '#1F9E6A', '16, 185, 129'),
  content: P('😌', '#1F9E6A', '16, 185, 129'),
  peaceful: P('😇', '#1F9E6A', '16, 185, 129'),
  hopeful: P('🌟', '#C9A227', '245, 200, 66'),
  proud: P('💪', '#D97706', '244, 162, 97'),
  relieved: P('😮‍💨', '#35B9AD', '53, 185, 173'),
  confident: P('😎', '#D97706', '244, 162, 97'),
  optimistic: P('☀️', '#C9A227', '245, 200, 66'),
  optimism: P('☀️', '#C9A227', '245, 200, 66'),
  energy: P('⚡', '#1F9E6A', '52, 211, 153'),
  energetic: P('⚡', '#1F9E6A', '52, 211, 153'),

  // Calm / reflective — cool purples & teals (clearly distinct)
  calm: P('🧘', '#7B5EA7', '123, 94, 167'),
  relaxed: P('🌿', '#35B9AD', '53, 185, 173'),
  neutral: P('😐', '#8B8FA8', '139, 143, 168'),
  thoughtful: P('🤔', '#7B5EA7', '123, 94, 167'),
  reflective: P('💭', '#8B6BB8', '155, 142, 196'),
  curious: P('🧐', '#6B8EC4', '107, 142, 196'),
  tired: P('😴', '#8B8FA8', '139, 143, 168'),
  bored: P('😑', '#8B8FA8', '139, 143, 168'),

  // Negative — warm corals & roses
  sad: P('😢', '#DC6B6B', '248, 113, 113'),
  anxious: P('😰', '#DC6B6B', '248, 113, 113'),
  stressed: P('😫', '#DC6B6B', '248, 113, 113'),
  worried: P('😟', '#DC6B6B', '248, 113, 113'),
  frustrated: P('😤', '#C97A4A', '232, 149, 109'),
  angry: P('😠', '#DC6B6B', '248, 113, 113'),
  overwhelmed: P('😵', '#C97A4A', '232, 149, 109'),
  lonely: P('😔', '#DC6B6B', '248, 113, 113'),
  disappointed: P('😞', '#DC6B6B', '248, 113, 113'),
  fearful: P('😨', '#DC6B6B', '248, 113, 113'),
  guilty: P('😣', '#DC6B6B', '248, 113, 113'),
  ashamed: P('😳', '#DC6B6B', '248, 113, 113'),
};

const DEFAULT_PILL: EmotionPillStyle = P('💭', '#8B8FA8', '139, 143, 168');

export function getEmotionPillStyle(emotion: string): EmotionPillStyle {
  const key = emotion.toLowerCase().trim();
  if (EMOTION_PILL_STYLES[key]) return EMOTION_PILL_STYLES[key];

  for (const [name, style] of Object.entries(EMOTION_PILL_STYLES)) {
    if (key.includes(name)) return style;
  }

  return DEFAULT_PILL;
}
