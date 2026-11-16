// WasteWise AI Theme Engine (Light / Dark Mode)
// Persists preference in localStorage ('wastewise_theme': 'light' | 'dark')

let currentTheme = 'light';

export function getTheme() {
  return currentTheme;
}

export function isDarkMode() {
  return currentTheme === 'dark';
}

export function applyTheme(theme) {
  currentTheme = theme === 'dark' ? 'dark' : 'light';
  localStorage.setItem('wastewise_theme', currentTheme);

  if (currentTheme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  window.dispatchEvent(new CustomEvent('wastewise:themeChange', { detail: { theme: currentTheme } }));
}

export function toggleTheme() {
  const next = currentTheme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  return next;
}

export function initTheme() {
  const saved = localStorage.getItem('wastewise_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved ? saved : (prefersDark ? 'dark' : 'light');
  applyTheme(initial);
}

// Auto-run on module load
if (typeof document !== 'undefined') {
  initTheme();
}
