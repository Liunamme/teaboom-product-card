const SWIPE_THRESHOLD = 50;
const FADE_MS = 150;
const FADING_CLASS = 'lightbox__img--fading';

export class Lightbox {
  constructor(dialog, { slides, onChange }) {
    this.dialog = dialog;
    this.slides = slides;
    this.onChange = onChange;
    this.index = 0;

    this.img = dialog.querySelector('[data-lightbox-img]');
    this.counter = dialog.querySelector('[data-lightbox-counter]');
    this.stage = dialog.querySelector('[data-lightbox-stage]');

    this.bindNavigation();
    this.bindSwipe();
  }

  static isSupported(dialog) {
    return Boolean(dialog) && typeof dialog.showModal === 'function';
  }

  bindNavigation() {
    this.dialog.querySelector('[data-lightbox-prev]').addEventListener('click', () => this.go(this.index - 1));
    this.dialog.querySelector('[data-lightbox-next]').addEventListener('click', () => this.go(this.index + 1));

    this.dialog.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') this.go(this.index - 1);
      if (event.key === 'ArrowRight') this.go(this.index + 1);
    });

    this.dialog.addEventListener('click', (event) => {
      if (event.target === this.dialog) this.dialog.close();
    });
  }

  bindSwipe() {
    let startX = null;

    this.stage.addEventListener('pointerdown', (event) => { startX = event.clientX; });
    this.stage.addEventListener('pointercancel', () => { startX = null; });
    this.stage.addEventListener('pointerup', (event) => {
      if (startX === null) return;
      const dx = event.clientX - startX;
      startX = null;
      if (Math.abs(dx) > SWIPE_THRESHOLD) this.go(this.index + (dx < 0 ? 1 : -1));
    });
  }

  open(index) {
    this.go(index, { animate: false });
    this.dialog.showModal();
  }

  go(index, { animate = true } = {}) {
    const count = this.slides.length;
    this.index = (index + count) % count;
    const slide = this.slides[this.index];

    const swap = () => {
      this.img.src = `${slide.base}-970.webp`;
      this.img.alt = slide.alt;
      this.img.classList.remove(FADING_CLASS);
    };

    if (animate) {
      this.img.classList.add(FADING_CLASS);
      setTimeout(swap, FADE_MS);
    } else {
      swap();
    }

    this.counter.textContent = `${this.index + 1} / ${count}`;
    this.preload(this.index + 1);
    this.preload(this.index - 1);
    this.onChange?.(this.index);
  }

  preload(index) {
    const count = this.slides.length;
    new Image().src = `${this.slides[(index + count) % count].base}-970.webp`;
  }
}
