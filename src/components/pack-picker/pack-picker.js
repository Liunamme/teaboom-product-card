const ACTIVE_CLASS = 'pack-picker__item--active';

const readPack = (input) => {
  const price = Number(input.dataset.price);
  const oldPrice = Number(input.dataset.oldPrice) || null;

  return {
    sku: input.value,
    label: input.dataset.label,
    weight: Number(input.dataset.weight),
    price,
    oldPrice: oldPrice > price ? oldPrice : null,
  };
};

export class PackPicker {
  constructor(root, { onChange }) {
    this.inputs = [...root.querySelectorAll('[data-pack]')];

    root.addEventListener('change', (event) => {
      if (!event.target.matches('[data-pack]')) return;
      this.render();
      event.target.closest('.pack-picker__item').scrollIntoView({ block: 'nearest', inline: 'nearest' });
      onChange(this.current);
    });

    this.render();
  }

  get current() {
    return readPack(this.inputs.find((input) => input.checked) ?? this.inputs[0]);
  }

  render() {
    this.inputs.forEach((input) => {
      input.closest('.pack-picker__item').classList.toggle(ACTIVE_CLASS, input.checked);
    });
  }
}
