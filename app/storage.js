// Progress storage for the Leonida Legend tracker: earned trophies and settings
// live in localStorage only, and can be exported to a file and imported back.
// Nothing leaves the browser unless the reader chooses Export.
export const EARNED_KEY = 'leonida-legend-earned-v1';
export const SETTINGS_KEY = 'leonida-legend-settings-v1';

export function loadEarned() {
  try {
    const raw = localStorage.getItem(EARNED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((id) => Number.isInteger(id)) : []);
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return {
      spoilers: parsed.spoilers !== false,
      hideEarned: parsed.hideEarned === true,
      kind: typeof parsed.kind === 'string' ? parsed.kind : 'all',
      grade: typeof parsed.grade === 'string' ? parsed.grade : 'all',
    };
  } catch {
    return { spoilers: true, hideEarned: false, kind: 'all', grade: 'all' };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function exportProgress(earned) {
  const payload = {
    guide: 'Leonida Legend — GTA VI trophy tracker',
    game: 'Grand Theft Auto VI',
    platform: 'PlayStation 5',
    exported: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = 'gta6-trophy-progress-' + new Date().toISOString().slice(0, 10) + '.json';
  anchor.click();
  URL.revokeObjectURL(anchor.href);
}

export async function importProgressFile(file, validIds) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  const ids = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(ids)) throw new Error('That file has no earned-trophy list in it.');
  const kept = ids.filter((id) => validIds.has(id));
  if (kept.length === 0 && ids.length > 0) throw new Error('That file has no trophy ids this guide recognises.');
  return new Set(kept);
}
