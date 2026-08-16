/** Close unpaired markdown tokens so partial streams render cleanly (no raw `**`). */
export function sanitizePartialMarkdown(text: string): string {
  if (!text) return text;

  let result = text;

  // Unclosed bold **
  const boldMarkers = (result.match(/\*\*/g) || []).length;
  if (boldMarkers % 2 !== 0) {
    result += '**';
  }

  // Unclosed inline code `
  const backticks = (result.match(/(?<!\\)`/g) || []).length;
  if (backticks % 2 !== 0) {
    result += '`';
  }

  // Unclosed italic * (single, not part of **)
  const withoutBold = result.replace(/\*\*/g, '');
  const singles = (withoutBold.match(/\*/g) || []).length;
  if (singles % 2 !== 0) {
    result += '*';
  }

  return result;
}
