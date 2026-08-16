import AsyncStorage from '@react-native-async-storage/async-storage';

const QUIZ_INDEX_KEY = 'ONBOARDING_QUIZ_INDEX';
const QUIZ_ANSWERS_KEY = 'ONBOARDING_QUIZ_ANSWERS';
const LAST_SCREEN_KEY = 'ONBOARDING_LAST_SCREEN';

export async function saveOnboardingQuizProgress(index: number, answers: Record<string, string>) {
  await AsyncStorage.multiSet([
    [QUIZ_INDEX_KEY, String(index)],
    [QUIZ_ANSWERS_KEY, JSON.stringify(answers)],
    [LAST_SCREEN_KEY, 'OnboardingQuestion'],
  ]);
}

export async function loadOnboardingQuizProgress(): Promise<{
  index: number;
  answers: Record<string, string>;
} | null> {
  const [indexRaw, answersRaw] = await AsyncStorage.multiGet([QUIZ_INDEX_KEY, QUIZ_ANSWERS_KEY]);
  const indexStr = indexRaw[1];
  const answersStr = answersRaw[1];
  if (!indexStr) return null;
  const index = parseInt(indexStr, 10);
  if (Number.isNaN(index) || index < 0) return null;
  let answers: Record<string, string> = {};
  if (answersStr) {
    try {
      answers = JSON.parse(answersStr);
    } catch {
      answers = {};
    }
  }
  return { index, answers };
}

export async function saveOnboardingLastScreen(screen: string) {
  await AsyncStorage.setItem(LAST_SCREEN_KEY, screen);
}

export async function getOnboardingLastScreen(): Promise<string | null> {
  return AsyncStorage.getItem(LAST_SCREEN_KEY);
}

export async function clearOnboardingProgress() {
  await AsyncStorage.multiRemove([QUIZ_INDEX_KEY, QUIZ_ANSWERS_KEY, LAST_SCREEN_KEY]);
}
