import type { AppData, Category } from './types';

const STORAGE_KEY = 'jobdone:data';

// Default categories use English-friendly names; the i18n layer never renames
// existing user data, so people who came in via a Chinese build keep their
// original Chinese names — only fresh installs get these defaults.
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'Work', color: '#7c5cff' },
  { id: 'personal', name: 'Personal', color: '#19d39c' },
];

const empty: AppData = {
  tasks: [],
  categories: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
  settings: { alwaysOnTop: true },
};

function normalize(data: Partial<AppData> | null | undefined): AppData {
  const cats = data?.categories && data.categories.length > 0
    ? data.categories
    : DEFAULT_CATEGORIES.map((c) => ({ ...c }));
  return {
    tasks: data?.tasks || [],
    categories: cats,
    settings: { ...empty.settings, ...(data?.settings || {}) },
  };
}

export async function loadData(): Promise<AppData> {
  if (window.jobdone) {
    try {
      const data = await window.jobdone.read();
      return normalize(data);
    } catch {
      return normalize(null);
    }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return normalize(null);
    return normalize(JSON.parse(raw) as AppData);
  } catch {
    return normalize(null);
  }
}

export async function saveData(data: AppData): Promise<void> {
  if (window.jobdone) {
    await window.jobdone.write(data);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export const CATEGORY_PALETTE = [
  '#7c5cff', '#19d39c', '#ffb547', '#ff5f87',
  '#4dd0ff', '#a78bfa', '#06d6a0', '#f472b6',
];
