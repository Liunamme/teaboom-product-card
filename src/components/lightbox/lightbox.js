const SWIPE_THRESHOLD = 50;
const FADE_MS = 150;
const FADING_CLASS = 'lightbox__img--fading';

export const isLightboxSupported = (dialog) => Boolean(dialog) && typeof dialog.showModal === 'function';

export const initLightbox = (dialog, { slides, onChange }) => {
  const img = dialog.querySelector('[data-lightbox-img]');
  const counter = dialog.querySelector('[data-lightbox-counter]');
  const stage = dialog.querySelector('[data-lightbox-stage]');
  const count = slides.length;
  let index = 0;

  const wrap = (i) => (i + count) % count;
  const preload = (i) => { new Image().src = `${slides[wrap(i)].base}-970.webp`; };

  const go = (target, { animate = true } = {}) => {
    index = wrap(target);
    const slide = slides[index];

    const swap = () => {
      img.src = `${slide.base}-970.webp`;
      img.alt = slide.alt;
      img.classList.remove(FADING_CLASS);
    };

    if (animate) {
      img.classList.add(FADING_CLASS);
      setTimeout(swap, FADE_MS);
    } else {
      swap();
    }

    counter.textContent = `${index + 1} / ${count}`;
    preload(index + 1);
    preload(index - 1);
    onChange?.(index);
  };

  const open = (start) => {
    go(start, { animate: false });
    dialog.showModal();
  };

  dialog.querySelector('[data-lightbox-prev]').addEventListener('click', () => go(index - 1));
  dialog.querySelector('[data-lightbox-next]').addEventListener('click', () => go(index + 1));

  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') go(index - 1);
    if (event.key === 'ArrowRight') go(index + 1);
  });

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  let startX = null;
  stage.addEventListener('pointerdown', (event) => { startX = event.clientX; });
  stage.addEventListener('pointercancel', () => { startX = null; });
  stage.addEventListener('pointerup', (event) => {
    if (startX === null) return;
    const dx = event.clientX - startX;
    startX = null;
    if (Math.abs(dx) > SWIPE_THRESHOLD) go(index + (dx < 0 ? 1 : -1));
  });

  return { open };
};
