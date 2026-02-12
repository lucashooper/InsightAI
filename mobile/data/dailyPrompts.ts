export interface DailyPrompt {
  id: string;
  category: 'self-discovery' | 'gratitude' | 'reflection' | 'growth' | 'relationships' | 'mindfulness';
  prompt: string;
  followUp?: string;
  emoji: string;
}

const prompts: DailyPrompt[] = [
  // Self-Discovery
  { id: 'sd1', category: 'self-discovery', prompt: "What's a belief you've changed in the last year?", followUp: "What caused the shift?", emoji: '🔮' },
  { id: 'sd2', category: 'self-discovery', prompt: "What does your ideal ordinary day look like?", followUp: "How close is today to that?", emoji: '✨' },
  { id: 'sd3', category: 'self-discovery', prompt: "What are you avoiding that you know you should do?", followUp: "What's really holding you back?", emoji: '🪞' },
  { id: 'sd4', category: 'self-discovery', prompt: "If you could tell your younger self one thing, what would it be?", emoji: '💌' },
  { id: 'sd5', category: 'self-discovery', prompt: "What's something you're really good at that you don't give yourself credit for?", emoji: '💎' },
  { id: 'sd6', category: 'self-discovery', prompt: "What would you do differently if nobody was watching?", emoji: '🎭' },
  { id: 'sd7', category: 'self-discovery', prompt: "What's a fear you've overcome? How did you do it?", emoji: '🦋' },

  // Gratitude
  { id: 'gr1', category: 'gratitude', prompt: "What's one small thing that made you smile today?", emoji: '😊' },
  { id: 'gr2', category: 'gratitude', prompt: "Who made a positive impact on your life recently?", followUp: "Have you told them?", emoji: '💛' },
  { id: 'gr3', category: 'gratitude', prompt: "What's a simple pleasure you often take for granted?", emoji: '☀️' },
  { id: 'gr4', category: 'gratitude', prompt: "What's something your body did for you today that you're thankful for?", emoji: '🙏' },
  { id: 'gr5', category: 'gratitude', prompt: "What's a challenge you're grateful for because of what it taught you?", emoji: '🌱' },

  // Reflection
  { id: 'rf1', category: 'reflection', prompt: "What's been taking up the most mental space lately?", followUp: "Is it within your control?", emoji: '🧠' },
  { id: 'rf2', category: 'reflection', prompt: "What emotion have you been feeling most this week?", followUp: "What do you think is driving it?", emoji: '🌊' },
  { id: 'rf3', category: 'reflection', prompt: "What's one thing you'd change about how today went?", emoji: '🔄' },
  { id: 'rf4', category: 'reflection', prompt: "When did you last feel truly at peace? What were you doing?", emoji: '🕊️' },
  { id: 'rf5', category: 'reflection', prompt: "What's a pattern in your life you've noticed but haven't addressed?", emoji: '🔁' },
  { id: 'rf6', category: 'reflection', prompt: "What drained your energy today? What gave you energy?", emoji: '⚡' },

  // Growth
  { id: 'gw1', category: 'growth', prompt: "What's one thing you want to accomplish this week?", followUp: "What's the first step?", emoji: '🎯' },
  { id: 'gw2', category: 'growth', prompt: "What's a skill you wish you had? What's stopping you from learning it?", emoji: '📚' },
  { id: 'gw3', category: 'growth', prompt: "What's the bravest thing you've done recently?", emoji: '🦁' },
  { id: 'gw4', category: 'growth', prompt: "Where do you see yourself in 6 months? What needs to happen to get there?", emoji: '🗺️' },
  { id: 'gw5', category: 'growth', prompt: "What's a habit you want to build? Why does it matter to you?", emoji: '🏗️' },

  // Relationships
  { id: 'rl1', category: 'relationships', prompt: "Who do you feel most yourself around? What makes that relationship special?", emoji: '👥' },
  { id: 'rl2', category: 'relationships', prompt: "Is there a conversation you've been putting off?", followUp: "What would happen if you had it?", emoji: '💬' },
  { id: 'rl3', category: 'relationships', prompt: "What's the best advice someone has given you recently?", emoji: '🗣️' },
  { id: 'rl4', category: 'relationships', prompt: "How have your relationships shaped who you are today?", emoji: '🤝' },

  // Mindfulness
  { id: 'mf1', category: 'mindfulness', prompt: "What are 5 things you can see, 4 you can hear, and 3 you can feel right now?", emoji: '👁️' },
  { id: 'mf2', category: 'mindfulness', prompt: "What does your body need right now that you've been ignoring?", emoji: '🧘' },
  { id: 'mf3', category: 'mindfulness', prompt: "Describe this exact moment using all your senses.", emoji: '🌸' },
  { id: 'mf4', category: 'mindfulness', prompt: "What's one thing you can let go of today?", emoji: '🍃' },
  { id: 'mf5', category: 'mindfulness', prompt: "Take 3 deep breaths. How do you feel now vs. before?", emoji: '🌬️' },
];

/**
 * Get today's daily prompt. Uses the day of year as a seed
 * so every user gets the same prompt on the same day,
 * but it rotates through the full list over time.
 */
export function getTodayPrompt(): DailyPrompt {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return prompts[dayOfYear % prompts.length];
}

/**
 * Get a random prompt from a specific category.
 */
export function getPromptByCategory(category: DailyPrompt['category']): DailyPrompt {
  const filtered = prompts.filter(p => p.category === category);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export default prompts;
