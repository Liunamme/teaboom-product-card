import { Lightbox } from '../lightbox/lightbox.js';

const FADE_MS = 150;
const FADING_CLASS = 'product-gallery__img--fading';
const ACTIVE_CLASS = 'product-gallery__thumb--active';

const srcset = (base, ext) => `${base}-480.${ext} 480w, ${base}-970.${ext} 970w`;

export class ProductGallery {
  constructor(root) {
    this.thumbs = [...root.querySelectorAll('[data-gallery-thumb]')];
    this.slides = this.thumbs.map(({ dataset }) => ({ base: dataset.base, alt: dataset.alt }));
    this.index = 0;

    this.open = root.querySelector('[data-gallery-open]');
    this.img = root.querySelector('[data-gallery-img]');
    this.avif = root.querySelector('[data-gallery-avif]');
    this.webp = root.querySelector('[data-gallery-webp]');

    this.thumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', () => this.select(index));
    });

    const dialog = document.querySelector('[data-lightbox]');
    if (Lightbox.isSupported(dialog)) {
      this.lightbox = new Lightbox(dialog, {
        slides: this.slides,
        onChange: (index) => this.select(index, { animate: false }),
      });
      this.open.addEventListener('click', () => this.lightbox.open(this.index));
    } else {
      this.open.disabled = true;
    }
  }

  select(index, { animate = true } = {}) {
    if (index === this.index) return;
    this.index = index;
    const { base, alt } = this.slides[index];

    this.thumbs.forEach((thumb, i) => {
      thumb.classList.toggle(ACTIVE_CLASS, i === index);
      thumb.toggleAttribute('aria-current', i === index);
    });

    const swap = () => {
      this.avif.srcset = srcset(base, 'avif');
      this.webp.srcset = srcset(base, 'webp');
      this.img.srcset = srcset(base, 'jpg');
      this.img.src = `${base}-970.jpg`;
      this.img.alt = alt;
      this.img.classList.remove(FADING_CLASS);
    };

    if (animate) {
      this.img.classList.add(FADING_CLASS);
      setTimeout(swap, FADE_MS);
    } else {
      swap();
    }

    this.open.setAttribute('aria-label', `Открыть фото ${index + 1} из ${this.slides.length} в полном размере`);
  }
}
