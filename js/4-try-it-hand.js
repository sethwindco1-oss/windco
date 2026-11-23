// WindCO website: The little "try it" hand that shows people they can drag on the windows
// hide the demo hand once someone starts cleaning; it stays gone after that
document.querySelectorAll('[data-try]').forEach(h => {
  const pane = h.parentElement;
  pane.addEventListener('pointerdown', () => h.classList.add('gone'), true);
});
