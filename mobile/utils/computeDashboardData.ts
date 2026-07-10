import { groupPatternItems, groupsToDisplayItems } from './patternGrouping';

function capitalizeFirst(str: string) {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : str;
}

function personalizeText(text: string) {
  return capitalizeFirst(
    text
      .replace(/The user/g, 'You')
      .replace(/the user/g, 'you')
      .replace(/their /g, 'your ')
      .replace(/Their /g, 'Your ')
      .replace(/they /g, 'you ')
      .replace(/They /g, 'You ')
      .replace(/them /g, 'you ')
      .replace(/his\/her/g, 'your'),
  );
}

function getOriginLabel(n: any) {
  const title = n.title || n.content || '';
  const cleaned = title.replace(/^["']|["']$/g, '').trim();
  return cleaned.length > 50 ? cleaned.substring(0, 47) + '...' : cleaned;
}

export function notesSignature(notes: any[] | null | undefined): string {
  if (!notes?.length) return '0';
  const analyzed = notes.filter((n) => n.ai_structured_insights).length;
  const head = notes[0];
  return `${notes.length}:${analyzed}:${head?.id ?? ''}:${head?.updated_at || head?.created_at || ''}`;
}

export function computePatternsData(notes: any[]) {
  const rawPatterns: Array<{ text: string; entryId: string; originLabel: string; date: string }> = [];
  const rawStrengths: Array<{ text: string; entryId: string; originLabel: string; date: string }> = [];

  for (const n of notes) {
    if (!n.ai_structured_insights) continue;
    const insights = n.ai_structured_insights;
    const entryDate = new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const originLabel = getOriginLabel(n);

    const addRawPattern = (text: string) => {
      if (!text || text === '{}' || text.length < 5) return;
      rawPatterns.push({ text: text.substring(0, 300), entryId: n.id, originLabel, date: entryDate });
    };
    const addRawStrength = (text: string) => {
      if (!text || text === '{}' || text.length < 5) return;
      rawStrengths.push({ text: text.substring(0, 300), entryId: n.id, originLabel, date: entryDate });
    };

    if (insights.progress_indicators?.areas_for_growth) {
      const areas = Array.isArray(insights.progress_indicators.areas_for_growth)
        ? insights.progress_indicators.areas_for_growth
        : [];
      areas.forEach((area: any) => {
        const text = typeof area === 'string' ? area : String(area.description || area.area || JSON.stringify(area));
        addRawPattern(text);
      });
    }

    if (insights.coping_strategies?.suggested) {
      const suggested = Array.isArray(insights.coping_strategies.suggested)
        ? insights.coping_strategies.suggested
        : [];
      suggested.forEach((s: any) => {
        const text = typeof s === 'string' ? s : String(s.strategy || s.description || JSON.stringify(s));
        addRawPattern(text);
      });
    }

    if (insights.insights_report?.insightCards) {
      const cards = Array.isArray(insights.insights_report.insightCards)
        ? insights.insights_report.insightCards
        : [];
      cards.forEach((card: any) => {
        if (card.type === 'growth' || card.type === 'reflection') {
          const text = typeof card === 'string' ? card : String(card.text || card.description || '');
          addRawPattern(text);
        }
      });
    }

    if (Array.isArray(insights.thought_patterns)) {
      insights.thought_patterns.forEach((tp: any) => {
        const text = typeof tp === 'string' ? tp : String(tp.pattern || tp.description || '');
        addRawPattern(text);
      });
    }

    if (insights.progress_indicators?.positive_signals) {
      const signals = Array.isArray(insights.progress_indicators.positive_signals)
        ? insights.progress_indicators.positive_signals
        : [];
      signals.forEach((signal: any) => {
        const text = typeof signal === 'string' ? signal : String(signal.description || JSON.stringify(signal));
        addRawStrength(text);
      });
    }

    if (insights.insights_report?.insightCards) {
      const cards = Array.isArray(insights.insights_report.insightCards)
        ? insights.insights_report.insightCards
        : [];
      cards.forEach((card: any) => {
        if (card.type === 'strength' || card.type === 'win') {
          const text = typeof card === 'string' ? card : String(card.text || card.description || '');
          addRawStrength(text);
        }
      });
    }

    if (insights.coping_strategies?.current) {
      const current = Array.isArray(insights.coping_strategies.current)
        ? insights.coping_strategies.current
        : [];
      current.forEach((c: any) => {
        const text = typeof c === 'string' ? c : String(c.strategy || c.description || JSON.stringify(c));
        addRawStrength(text);
      });
    }
  }

  const patternGroups = groupPatternItems(rawPatterns, personalizeText);
  const strengthGroups = groupPatternItems(rawStrengths, personalizeText);

  return {
    patternsToAddress: groupsToDisplayItems(patternGroups, 'pattern', 15),
    whatsWorking: groupsToDisplayItems(strengthGroups, 'strength', 12),
  };
}

export function computeAggregateInsights(notes: any[]) {
  const strengthsMap: { [key: string]: { count: number; text: string; entries: string[] } } = {};
  const growthMap: { [key: string]: { count: number; text: string; entries: string[] } } = {};

  for (const n of notes) {
    if (!n.ai_structured_insights) continue;
    const insights = n.ai_structured_insights;

    const posSignals = insights.progress_indicators?.positive_signals;
    if (Array.isArray(posSignals)) {
      posSignals.forEach((signal: any) => {
        const text = typeof signal === 'string' ? signal : String(signal.description || JSON.stringify(signal));
        const key = text.toLowerCase().substring(0, 30);
        if (!strengthsMap[key]) strengthsMap[key] = { count: 0, text, entries: [] };
        strengthsMap[key].count++;
        strengthsMap[key].entries.push(n.id);
      });
    }

    const currentStrats = insights.coping_strategies?.current;
    if (Array.isArray(currentStrats)) {
      currentStrats.forEach((c: any) => {
        const text = typeof c === 'string' ? c : String(c.strategy || c.description || JSON.stringify(c));
        const key = text.toLowerCase().substring(0, 30);
        if (!strengthsMap[key]) strengthsMap[key] = { count: 0, text, entries: [] };
        strengthsMap[key].count++;
        strengthsMap[key].entries.push(n.id);
      });
    }

    const insightCards = insights.insights_report?.insightCards;
    if (Array.isArray(insightCards)) {
      insightCards.forEach((card: any) => {
        if (card.type === 'strength' || card.type === 'win') {
          const text = typeof card === 'string' ? card : String(card.text || card.description || '');
          if (text) {
            const key = text.toLowerCase().substring(0, 30);
            if (!strengthsMap[key]) strengthsMap[key] = { count: 0, text, entries: [] };
            strengthsMap[key].count++;
            strengthsMap[key].entries.push(n.id);
          }
        }
      });
    }

    const areasForGrowth = insights.progress_indicators?.areas_for_growth;
    if (Array.isArray(areasForGrowth)) {
      areasForGrowth.forEach((area: any) => {
        const text = typeof area === 'string' ? area : String(area.description || area.area || JSON.stringify(area));
        const key = text.toLowerCase().substring(0, 30);
        if (!growthMap[key]) growthMap[key] = { count: 0, text, entries: [] };
        growthMap[key].count++;
        growthMap[key].entries.push(n.id);
      });
    }

    const suggestedStrats = insights.coping_strategies?.suggested;
    if (Array.isArray(suggestedStrats)) {
      suggestedStrats.forEach((s: any) => {
        const text = typeof s === 'string' ? s : String(s.strategy || s.description || JSON.stringify(s));
        const key = text.toLowerCase().substring(0, 30);
        if (!growthMap[key]) growthMap[key] = { count: 0, text, entries: [] };
        growthMap[key].count++;
        growthMap[key].entries.push(n.id);
      });
    }

    if (Array.isArray(insightCards)) {
      insightCards.forEach((card: any) => {
        if (card.type === 'growth' || card.type === 'reflection') {
          const text = typeof card === 'string' ? card : String(card.text || card.description || '');
          if (text) {
            const key = text.toLowerCase().substring(0, 30);
            if (!growthMap[key]) growthMap[key] = { count: 0, text, entries: [] };
            growthMap[key].count++;
            growthMap[key].entries.push(n.id);
          }
        }
      });
    }

    if (Array.isArray(insights.thought_patterns)) {
      insights.thought_patterns.forEach((tp: any) => {
        const text = typeof tp === 'string' ? tp : String(tp.pattern || tp.description || '');
        if (text) {
          const key = text.toLowerCase().substring(0, 30);
          if (!growthMap[key]) growthMap[key] = { count: 0, text, entries: [] };
          growthMap[key].count++;
          growthMap[key].entries.push(n.id);
        }
      });
    }
  }

  const topStrengths = Object.values(strengthsMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((s, i) => ({
      id: `strength_${i}`,
      text: s.text,
      count: s.count,
      frequency: s.count > 3 ? 'Recurring strength' : 'Emerging pattern',
      entryIds: s.entries,
    }));

  const topGrowth = Object.values(growthMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map((g, i) => ({
      id: `growth_${i}`,
      text: g.text,
      count: g.count,
      frequency: g.count > 2 ? 'Pattern to address' : 'Area to explore',
      entryIds: g.entries,
    }));

  const monthlyStrengthsData = Object.values(strengthsMap)
    .filter((s) => s.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((s) => ({ summary: s.text, count: s.count, entries: s.entries }));

  const monthlyGrowthData = Object.values(growthMap)
    .filter((g) => g.count >= 2)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((g) => ({ summary: g.text, count: g.count, entries: g.entries }));

  return {
    aggregateStrengths: topStrengths,
    aggregateGrowth: topGrowth,
    monthlyStrengths: monthlyStrengthsData,
    monthlyGrowthAreas: monthlyGrowthData,
  };
}

export function computeDeferredDashboardData(notes: any[]) {
  const patterns = computePatternsData(notes);
  const aggregates = computeAggregateInsights(notes);
  return { ...patterns, ...aggregates };
}
