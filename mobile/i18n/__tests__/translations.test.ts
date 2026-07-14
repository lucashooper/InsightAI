import { describe, expect, it } from 'vitest';
import { translate } from '..';
import { LANGUAGES } from '../languages';

describe('translation registry', () => {
  it.each(LANGUAGES)('resolves settings and profile labels for $code', ({ code }) => {
    for (const key of [
      'language.settingLabel',
      'language.selectTitle',
      'auxiliary.profile.title',
      'auxiliary.personalize.title',
      'onboarding.welcome',
    ]) {
      expect(translate(code, key)).not.toBe(key);
    }
  });
});
