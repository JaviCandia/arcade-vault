export interface SavedScoreEntry {
  game: string;
  score: number;
  name: string;
  at: number;
}

const STORAGE_KEY = "av_scores";

export function saveScore(entry: Omit<SavedScoreEntry, "at">) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: SavedScoreEntry[] = raw ? JSON.parse(raw) : [];
    all.push({ ...entry, at: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  } catch {
    // localStorage unavailable — nothing to persist.
  }
}
