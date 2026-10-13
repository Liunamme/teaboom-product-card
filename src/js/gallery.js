/**
 * Галерея товара: главное фото, миниатюры и просмотр с листанием.
 *
 * Кадры описаны в миниатюрах: data-base это путь без размера и расширения,
 * от него собираем 480/970 в avif, webp и jpg. data-alt это подпись для фото.
 */

const SWIPE_THRESHOLD = 50;
const FADE_MS = 150;

const srcset = (base, ext) => `${base}-480.${ext} 480w, ${base}-970.${ext} 970w`;

class Lightbox {
  constructor(dialog, slides, onChange) {
    this.dialog = dialog;
    this.slides = slides;
    this.onChange = onChange;
    this.index = 0;

    this.img = dialog.querySelector('[data-lightbox-img]');
    this.counter = dialog.querySelector('[data-lightbox-counter]');
    this.stage = dialog.querySelector('[data-lightbox-stage]');

    this.bind();
  }

  bind() {
    this.dialog.querySelector('[data-lightbox-prev]').addEventListener('click', () => this.go(this.index - 1));
    this.dialog.querySelector('[data-lightbox-next]').addEventListener('click', () => this.go(this.index + 1));

    // Стрелки слушаем только на самом диалоге, а не на всей странице
    this.dialog.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') this.go(this.index - 1);
      if (event.key === 'ArrowRight') this.go(this.index + 1);
    });

    // Клик по затемнению вокруг фото закрывает просмотр
    this.dialog.addEventListener('click', (event) => {
      if (event.target === this.dialog) this.dialog.close();
    });

    // Свайп: запоминаем, где палец коснулся, и смотрим, куда его увели
    let startX = null;
    this.stage.addEventListener('pointerdown', (event) => { startX = event.clientX; });
    this.stage.addEventListener('pointerup', (event) => {
      if (startX === null) return;
      const dx = event.clientX - startX;
      startX = null;
      if (Math.abs(dx) > SWIPE_THRESHOLD) this.go(this.index + (dx < 0 ? 1 : -1));
    });
    this.stage.addEventListener('pointercancel', () => { startX = null; });
  }

  open(index) {
    this.go(index, false);
    this.dialog.showModal();
  }

  go(index, animate = true) {
    const count = this.slides.length;
    // Листаем по кругу: после последнего снова первый
    this.index = (index + count) % count;
    const slide = this.slides[this.index];

    const swap = () => {
      this.img.src = `${slide.base}-970.webp`;
      this.img.alt = slide.alt;
      this.img.classList.remove('lightbox__img--fading');
    };

    if (animate) {
      this.img.classList.add('lightbox__img--fading');
      setTimeout(swap, FADE_MS);
    } else {
      swap();
    }

    this.counter.textContent = `${this.index + 1} / ${count}`;
    this.preload(this.index + 1);
    this.preload(this.index - 1);
    this.onChange?.(this.index);
  }

  // Соседние кадры грузим заранее, чтобы листание было без задержки
  preload(index) {
    const slide = this.slides[(index + this.slides.length) % this.slides.length];
    new Image().src = `${slide.base}-970.webp`;
  }
}

export class Gallery {
  constructor(root) {
    this.root = root;
    this.thumbs = [...root.querySelectorAll('[data-gallery-thumb]')];
    this.slides = this.thumbs.map((thumb) => ({ base: thumb.dataset.base, alt: thumb.dataset.alt }));
    this.index = 0;

    this.open = root.querySelector('[data-gallery-open]');
    this.img = root.querySelector('[data-gallery-img]');
    this.avif = root.querySelector('[data-gallery-avif]');
    this.webp = root.querySelector('[data-gallery-webp]');

    const dialog = document.querySelector('[data-lightbox]');
    // Старые браузеры без <dialog> просто не получат просмотр, фото и миниатюры работают
    if (dialog && typeof dialog.showModal === 'function') {
      this.lightbox = new Lightbox(dialog, this.slides, (index) => this.select(index, false));
      this.open.addEventListener('click', () => this.lightbox.open(this.index));
    } else {
      this.open.disabled = true;
    }

    this.thumbs.forEach((thumb, index) => {
      thumb.addEventListener('click', () => this.select(index));
    });
  }

  select(index, animate = true) {
    if (index === this.index) return;
    this.index = index;
    const { base, alt } = this.slides[index];

    this.thumbs.forEach((thumb, i) => {
      const active = i === index;
      thumb.classList.toggle('product-gallery__thumb--active', active);
      if (active) thumb.setAttribute('aria-current', 'true');
      else thumb.removeAttribute('aria-current');
    });

    const swap = () => {
      this.avif.srcset = srcset(base, 'avif');
      this.webp.srcset = srcset(base, 'webp');
      this.img.srcset = srcset(base, 'jpg');
      this.img.src = `${base}-970.jpg`;
      this.img.alt = alt;
      this.img.classList.remove('product-gallery__img--fading');
    };

    // После закрытия просмотра главное фото уже показывает последний кадр, без анимации
    if (animate) {
      this.img.classList.add('product-gallery__img--fading');
      setTimeout(swap, FADE_MS);
    } else {
      swap();
    }

    this.open.setAttribute('aria-label', `Открыть фото ${index + 1} из ${this.slides.length} в полном размере`);
  }
}
