export type Locale = 'en' | 'zh';

export interface Strings {
  brand: string;
  settings: string;
  back: string;
  minimize: string;
  hide: string;
  placeholders: string[];
  pickCategory: string;
  uncategorized: string;
  add: string;
  tabActive: string;
  tabWaiting: string;
  tabDone: string;
  emptyDone: string;
  emptyWaiting: string;
  emptyActiveWithWaiting: string;
  emptyActive: string;
  footerToday: string;
  footerActive: string;
  footerWaiting: string;
  clearDone: string;
  rowOnHold: string;
  rowDays: (n: number) => string;
  rowEditTitle: string;
  rowMoveTitle: string;
  rowHoldTitle: string;
  rowResumeTitle: string;
  rowDeleteTitle: string;
  rowMarkDoneTitle: string;
  rowUnmarkDoneTitle: string;
  rowEditTooltip: string;
  composerCatTooltip: string;
  settingsCategories: string;
  settingsCategoriesHintMain: string;
  settingsCategoriesHintNote: string;
  settingsNewCatPlaceholder: string;
  settingsNewCatTitle: string;
  settingsRenameTitle: string;
  settingsCycleColorTitle: string;
  settingsData: string;
  settingsDataLocationLabel: string;
  settingsDataBackupNote: string;
  settingsLanguage: string;
  langEN: string;
  langZH: string;
  defaultCategoryWork: string;
  defaultCategoryPersonal: string;
}

export const STRINGS: Record<Locale, Strings> = {
  en: {
    brand: 'JobDone',
    settings: 'Settings',
    back: 'Back',
    minimize: 'Minimize',
    hide: 'Hide to tray',
    placeholders: [
      "What's on your plate?",
      'One small thing — write it down.',
      'What do you want to ship?',
      "Don't overthink, just type.",
      "Today's next step is…",
    ],
    pickCategory: 'Pick a category (default: Work)',
    uncategorized: 'Uncategorized',
    add: 'Add',
    tabActive: 'Active',
    tabWaiting: 'On Hold',
    tabDone: 'Done',
    emptyDone: 'Nothing done yet — go knock one out!',
    emptyWaiting: 'Nothing on hold — everything is moving.',
    emptyActiveWithWaiting: 'Everything is on hold. Pick one back up.',
    emptyActive: 'Empty. Write something down.',
    footerToday: 'Today',
    footerActive: 'Active',
    footerWaiting: 'Hold',
    clearDone: 'Clear done',
    rowOnHold: 'on hold',
    rowDays: (n) => `${n}d`,
    rowEditTitle: 'Edit',
    rowMoveTitle: 'Move category',
    rowHoldTitle: 'Put on hold',
    rowResumeTitle: 'Resume',
    rowDeleteTitle: 'Delete',
    rowMarkDoneTitle: 'Mark done',
    rowUnmarkDoneTitle: 'Mark active',
    rowEditTooltip: 'Double-click or click ✎ to edit',
    composerCatTooltip: 'Pick category (default: Work)',
    settingsCategories: 'Categories',
    settingsCategoriesHintMain:
      'Click the dot to cycle color. Click ✎ or double-click the name to rename.',
    settingsCategoriesHintNote:
      'Deleting a category keeps the tasks (they become uncategorized).',
    settingsNewCatPlaceholder: 'New category name…',
    settingsNewCatTitle: 'Add category',
    settingsRenameTitle: 'Rename',
    settingsCycleColorTitle: 'Cycle color',
    settingsData: 'Data',
    settingsDataLocationLabel: 'Location',
    settingsDataBackupNote: 'Copy this file to back up everything.',
    settingsLanguage: 'Language',
    langEN: 'English',
    langZH: '中文',
    defaultCategoryWork: 'Work',
    defaultCategoryPersonal: 'Personal',
  },
  zh: {
    brand: 'JobDone',
    settings: '设置',
    back: '返回',
    minimize: '最小化',
    hide: '隐藏到托盘',
    placeholders: [
      '想做点什么？',
      '一件小事，写下来吧。',
      '这次想搞定什么？',
      '别犹豫，先写下来。',
      '今天的下一步是…',
    ],
    pickCategory: '选择分类（默认：工作）',
    uncategorized: '未分类',
    add: '加',
    tabActive: '进行',
    tabWaiting: '搁置',
    tabDone: '完成',
    emptyDone: '还没完成 — 去搞定一个！',
    emptyWaiting: '没有搁置项 — 一切都在推进。',
    emptyActiveWithWaiting: '都搁置了？把一个捡回来。',
    emptyActive: '空空如也，写下一件事吧。',
    footerToday: '今',
    footerActive: '行',
    footerWaiting: '搁',
    clearDone: '清空已完成',
    rowOnHold: '搁置',
    rowDays: (n) => `${n}天`,
    rowEditTitle: '编辑',
    rowMoveTitle: '切换分类',
    rowHoldTitle: '搁置',
    rowResumeTitle: '继续做',
    rowDeleteTitle: '删除',
    rowMarkDoneTitle: '标记已完成',
    rowUnmarkDoneTitle: '取消完成',
    rowEditTooltip: '双击或点 ✎ 编辑',
    composerCatTooltip: '选择分类（默认：工作）',
    settingsCategories: '分类',
    settingsCategoriesHintMain: '点小圆点切换颜色，点 ✎ 或双击名字来重命名。',
    settingsCategoriesHintNote: '删除分类不会删任务，原任务会变成「未分类」。',
    settingsNewCatPlaceholder: '新建分类名…',
    settingsNewCatTitle: '新建',
    settingsRenameTitle: '重命名',
    settingsCycleColorTitle: '切换颜色',
    settingsData: '数据',
    settingsDataLocationLabel: '位置',
    settingsDataBackupNote: '把这一个文件拷走就是完整备份。',
    settingsLanguage: '语言',
    langEN: 'English',
    langZH: '中文',
    defaultCategoryWork: '工作',
    defaultCategoryPersonal: '生活',
  },
};

export function getLocaleFromSystem(): Locale {
  if (typeof navigator !== 'undefined') {
    const lang = navigator.language || '';
    if (lang.toLowerCase().startsWith('zh')) return 'zh';
  }
  return 'en';
}
