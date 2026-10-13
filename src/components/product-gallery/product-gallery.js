import { initLightbox, isLightboxSupported } from '../lightbox/lightbox.js';

const FADE_MS = 150;
const FADING_CLASS = 'product-gallery__img--fading';
const ACTIVE_CLASS = 'product-gallery__thumb--active';

const srcset = (base, ext) => `${base}-480.${ext} 480w, ${base}-970.${ext} 970w`;

export const initProductGallery = (root) => {
  const thumbs = [...root.querySelectorAll('[data-gallery-thumb]')];
  const slides = thumbs.map(({ dataset }) => ({ base: dataset.base, alt: dataset.alt }));
  const openButton = root.querySelector('[data-gallery-open]');
  const img = root.querySelector('[data-gallery-img]');
  const avif = root.querySelector('[data-gallery-avif]');
  const webp = root.querySelector('[data-gallery-webp]');
  let current = 0;

  const select = (index, { animate = true } = {}) => {
    if (index === current) return;
    current = index;
    const { base, alt } = slides[index];

    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle(ACTIVE_CLASS, i === index);
      thumb.toggleAttribute('aria-current', i === index);
    });

    const swap = () => {
      avif.srcset = srcset(base, 'avif');
      webp.srcset = srcset(base, 'webp');
      img.srcset = srcset(base, 'jpg');
      img.src = `${base}-970.jpg`;
      img.alt = alt;
      img.classList.remove(FADING_CLASS);
    };

    if (animate) {
      img.classList.add(FADING_CLASS);
      setTimeout(swap, FADE_MS);
    } else {
      swap();
    }

    openButton.setAttribute('aria-label', `Открыть фото ${index + 1} из ${slides.length} в полном размере`);
  };

  thumbs.forEach((thumb, index) => {
    thumb.addEventListener('click', () => select(index));
  });

  const dialog = document.querySelector('[data-lightbox]');
  if (!isLightboxSupported(dialog)) {
    openButton.disabled = true;
    return;
  }

  const lightbox = initLightbox(dialog, {
    slides,
    onChange: (index) => select(index, { animate: false }),
  });

  openButton.addEventListener('click', () => lightbox.open(current));
};
