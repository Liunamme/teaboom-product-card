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

export const initPackPicker = (root, { onChange }) => {
  const inputs = [...root.querySelectorAll('[data-pack]')];

  const getCurrent = () => readPack(inputs.find((input) => input.checked) ?? inputs[0]);

  const render = () => {
    inputs.forEach((input) => {
      input.closest('.pack-picker__item').classList.toggle(ACTIVE_CLASS, input.checked);
    });
  };

  root.addEventListener('change', (event) => {
    if (!event.target.matches('[data-pack]')) return;
    render();
    event.target.closest('.pack-picker__item').scrollIntoView({ block: 'nearest', inline: 'nearest' });
    onChange(getCurrent());
  });

  render();

  return { getCurrent };
};
