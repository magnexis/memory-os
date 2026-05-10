import type { MemoryRecord } from "../data/memoryData";

export type MemoryLink = {
  id: string;
  sourceId: string;
  targetId: string;
  label: string;
  strength: number;
};

export type LinkSuggestion = {
  source: MemoryRecord;
  target: MemoryRecord;
  reasons: string[];
  strength: number;
};

const dayMs = 24 * 60 * 60 * 1000;

export function dateDistanceDays(a: string, b: string) {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / dayMs;
}

export function findLinkSuggestions(records: MemoryRecord[], links: MemoryLink[]): LinkSuggestion[] {
  const existing = new Set(links.flatMap((link) => [`${link.sourceId}:${link.targetId}`, `${link.targetId}:${link.sourceId}`]));

  return records.flatMap((source, sourceIndex) =>
    records.slice(sourceIndex + 1).map((target) => {
      const pairKey = `${source.id}:${target.id}`;
      if (existing.has(pairKey)) return null;
      const sharedTags = source.tags.filter((tag) => target.tags.includes(tag));
      const sameLocation = source.location && target.location && source.location === target.location;
      const sameEmotion = source.emotion === target.emotion;
      const nearbyDate = dateDistanceDays(source.date, target.date) <= 45;
      const titleNameOverlap = source.title.split(" ").some((part) => part.length > 3 && target.summary.toLowerCase().includes(part.toLowerCase()));
      const reasons = [
        sharedTags.length ? `shared tags: ${sharedTags.join(", ")}` : "",
        sameLocation ? `same location: ${source.location}` : "",
        sameEmotion ? `same emotional tone: ${source.emotion}` : "",
        nearbyDate ? "nearby dates" : "",
        titleNameOverlap ? "title appears in related notes" : ""
      ].filter(Boolean);
      const strength = sharedTags.length * 24 + (sameLocation ? 28 : 0) + (sameEmotion ? 14 : 0) + (nearbyDate ? 18 : 0) + (titleNameOverlap ? 16 : 0);
      return reasons.length && strength >= 28 ? { source, target, reasons, strength } : null;
    })
  ).filter((suggestion): suggestion is LinkSuggestion => Boolean(suggestion))
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 8);
}

export function buildHeatmap(records: MemoryRecord[]) {
  const months = Array.from({ length: 12 }, (_, month) => ({
    month,
    count: 0,
    creative: 0,
    locations: new Set<string>()
  }));

  records.forEach((record) => {
    const month = new Date(record.date).getMonth();
    months[month].count += 1;
    if (["project", "idea", "dream"].includes(record.kind)) months[month].creative += 1;
    if (record.location) months[month].locations.add(record.location);
  });

  const max = Math.max(...months.map((item) => item.count), 1);
  return months.map((item) => ({
    label: new Date(2026, item.month, 1).toLocaleString("en", { month: "short" }),
    activity: item.count / max,
    creative: item.creative,
    places: item.locations.size
  }));
}

export function createMemoryLink(sourceId: string, targetId: string, label: string, strength: number): MemoryLink {
  return {
    id: `link-${sourceId}-${targetId}-${Date.now()}`,
    sourceId,
    targetId,
    label,
    strength
  };
}
