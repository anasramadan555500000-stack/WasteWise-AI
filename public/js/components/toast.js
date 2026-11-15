// Enterprise Toast Notification System

let toastContainer = null;

function ensureContainer() {
  if (!toastContainer || !document.body.contains(toastContainer)) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function showToast(message, type = 'success', duration = 3500) {
  const container = ensureContainer();

  const toast = document.createElement('div');
  toast.className = 'pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-lg border transition-all duration-300 transform translate-x-8 opacity-0 text-sm font-medium';

  let iconSvg = '';
  let colorClasses = '';

  if (type === 'success') {
    colorClasses = 'bg-white border-emerald-200 text-slate-800 border-l-4 border-l-emerald-500';
    iconSvg = `<svg class="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>`;
  } else if (type === 'warning') {
    colorClasses = 'bg-white border-amber-200 text-slate-800 border-l-4 border-l-amber-500';
    iconSvg = `<svg class="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
  } else if (type === 'danger' || type === 'error') {
    colorClasses = 'bg-white border-red-200 text-slate-800 border-l-4 border-l-red-500';
    iconSvg = `<svg class="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
  } else {
    colorClasses = 'bg-white border-slate-200 text-slate-800 border-l-4 border-l-slate-600';
    iconSvg = `<svg class="w-5 h-5 text-slate-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
  }

  toast.className += ` ${colorClasses}`;
  toast.innerHTML = `
    ${iconSvg}
    <div class="flex-1">${message}</div>
    <button class="text-slate-400 hover:text-slate-600 focus:outline-none" aria-label="Close">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
  `;

  const closeBtn = toast.querySelector('button');
  closeBtn.addEventListener('click', () => removeToast(toast));

  container.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.remove('translate-x-8', 'opacity-0');
    toast.classList.add('translate-x-0', 'opacity-100');
  });

  const timer = setTimeout(() => {
    removeToast(toast);
  }, duration);

  function removeToast(el) {
    clearTimeout(timer);
    el.classList.add('opacity-0', 'translate-x-8');
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 300);
  }
}
