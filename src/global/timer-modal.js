// src/global/timer-modal.js
const EXCLUDED_PATHS = [
  '/contact-flow/01',
  '/contact-flow/02',
  '/contact-flow/03',
  '/contact-flow/time-to-book-a-call',
  '/contact-flow/thank-you-for-hiring',
  '/form/growthconsult',
  '/form/contact',
  '/form/book-a-call',
  '/form/giveaway',
];

export function initTimerModal() {
  const path = window.location.pathname.replace(/\/$/, '');
  if (EXCLUDED_PATHS.includes(path)) return;

  const MODAL_NAME = 'welcome';
  const DELAY_MS = 5000;
  const STORAGE_KEY = 'timer-modal-shown';

  if (sessionStorage.getItem(STORAGE_KEY) === '1') return;

  const modalGroup = document.querySelector('[data-modal-group-status]');
  const modal = document.querySelector(`[data-modal-name="${MODAL_NAME}"]`);
  if (!modalGroup || !modal) return;

  const closeBtns = document.querySelectorAll('[data-modal-close]');
  let modalOpened = false;
  let timerId = null;

  const lockScroll = () => {
    if (window.lenis) {
      window.lenis.stop();
    } else {
      document.body.style.overflow = 'hidden';
    }
  };

  const unlockScroll = () => {
    if (window.lenis) {
      window.lenis.start();
    } else {
      document.body.style.overflow = '';
    }
  };

  const openModal = () => {
    if (modalOpened) return;
    modalOpened = true;
    if (timerId) clearTimeout(timerId);

    modal.setAttribute('data-modal-status', 'active');
    modalGroup.setAttribute('data-modal-group-status', 'active');
    lockScroll();
    sessionStorage.setItem(STORAGE_KEY, '1');
    document.removeEventListener('mouseout', handleExitIntent);
  };

  const closeModal = () => {
    modal.setAttribute('data-modal-status', 'not-active');
    modalGroup.setAttribute('data-modal-group-status', 'not-active');
    unlockScroll();
  };

  const handleExitIntent = (e) => {
    if (e.relatedTarget === null && e.clientY <= 0) openModal();
  };

  closeBtns.forEach((btn) => btn.addEventListener('click', closeModal));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalGroup.getAttribute('data-modal-group-status') === 'active') {
      closeModal();
    }
  });

  timerId = setTimeout(openModal, DELAY_MS);

  if (window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mouseout', handleExitIntent);
  }
}