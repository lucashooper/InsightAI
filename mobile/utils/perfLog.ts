export function perfLog(tag: string, message: string, startMs?: number) {
  if (startMs !== undefined) {
    console.log(`[Perf:${tag}] ${message} (+${Date.now() - startMs}ms)`);
    return;
  }
  console.log(`[Perf:${tag}] ${message}`);
}

export function perfStart(tag: string, message: string): number {
  const start = Date.now();
  console.log(`[Perf:${tag}] ${message} (start)`);
  return start;
}
