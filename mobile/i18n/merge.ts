import { TranslationTree } from './types';

export function mergeTranslationTrees(...trees: Array<TranslationTree | undefined>): TranslationTree {
  const result: TranslationTree = {};

  for (const tree of trees) {
    if (!tree) continue;

    for (const [key, value] of Object.entries(tree)) {
      const existing = result[key];
      if (
        typeof value === 'object' &&
        value !== null &&
        typeof existing === 'object' &&
        existing !== null
      ) {
        result[key] = mergeTranslationTrees(existing, value);
      } else if (typeof value === 'object' && value !== null) {
        result[key] = mergeTranslationTrees(value);
      } else {
        result[key] = value;
      }
    }
  }

  return result;
}

export function listTranslationLeaves(tree: TranslationTree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? [path] : listTranslationLeaves(value, path);
  });
}
