// Custom Tailwind Confirmation Modal
// Replaces all native browser confirm() dialogs with modern, styled modal

export function showConfirmModal({
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'danger', // 'danger' | 'primary' | 'warning'
  onConfirm = () => {},
  onCancel = () => {}
}) {
  const container = document.getElementById('confirm-modal-container') || document.body;

  let btnClasses = 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500';
  if (confirmVariant === 'primary') {
    btnClasses = 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500';
  } else if (confirmVariant === 'warning') {
    btnClasses = 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500';
  }

  const modalHtml = `
    <div id="active-confirm-modal" class="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true">
      <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"></div>
      
      <div class="flex min-h-screen items-center justify-center p-4 text-center">
        <div class="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
          <div class="bg-white p-6">
            <div class="flex items-start gap-4">
              <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full ${confirmVariant === 'danger' ? 'bg-red-100 text-red-600' : (confirmVariant === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600')}">
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div class="flex-1 text-left">
                <h3 class="text-base font-bold text-slate-900">${title}</h3>
                <div class="mt-2 text-sm text-slate-600">
                  <p>${message}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-slate-50 px-6 py-4 flex flex-row-reverse gap-3 border-t border-slate-100">
            <button type="button" id="confirm-modal-ok-btn" class="inline-flex w-full justify-center rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto ${btnClasses}">
              ${confirmText}
            </button>
            <button type="button" id="confirm-modal-cancel-btn" class="inline-flex w-full justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 hover:bg-slate-50 sm:w-auto">
              ${cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Clean existing modal
  const existing = document.getElementById('active-confirm-modal');
  if (existing) existing.remove();

  const wrapper = document.createElement('div');
  wrapper.innerHTML = modalHtml;
  const modalEl = wrapper.firstElementChild;
  container.appendChild(modalEl);

  function cleanup() {
    modalEl.remove();
    document.removeEventListener('keydown', handleKey);
  }

  function handleKey(e) {
    if (e.key === 'Escape') {
      cleanup();
      onCancel();
    }
  }

  document.addEventListener('keydown', handleKey);

  modalEl.querySelector('#confirm-modal-ok-btn').addEventListener('click', () => {
    cleanup();
    onConfirm();
  });

  modalEl.querySelector('#confirm-modal-cancel-btn').addEventListener('click', () => {
    cleanup();
    onCancel();
  });
}
