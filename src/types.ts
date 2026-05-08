export type TaskStatus = 'active' | 'waiting' | 'done';

export interface Task {
  id: string;
  text: string;
  status: TaskStatus;
  createdAt: number;
  updatedAt: number;
  doneAt?: number;
  note?: string;
  categoryId?: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export type Locale = 'en' | 'zh';

export interface Settings {
  alwaysOnTop?: boolean;
  activeCategoryId?: string;
  locale?: Locale;
}

export interface AppData {
  tasks: Task[];
  categories: Category[];
  settings: Settings;
}

declare global {
  interface Window {
    jobdone?: {
      read: () => Promise<AppData>;
      write: (data: AppData) => Promise<boolean>;
      hide: () => Promise<void>;
      minimize: () => Promise<void>;
      setAlwaysOnTop: (flag: boolean) => Promise<boolean>;
    };
  }
}
