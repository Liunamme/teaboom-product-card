const region = () => document.querySelector('[data-announcer]');

export const announce = (text) => {
  const el = region();
  if (el) el.textContent = text;
};
