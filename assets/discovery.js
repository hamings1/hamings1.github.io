/* Progressive enhancements shared by static pages and Next.js navigation. */
(() => {
  if (window.__academicDiscovery) return;
  window.__academicDiscovery = true;
  function filter(form) {
    const root = form.closest('.publication-directory');
    if (!root) return;
    const query = form.elements.query.value.trim().toLowerCase();
    const year = form.elements.year.value;
    const topic = form.elements.topic.value;
    let visible = 0;
    for (const paper of root.querySelectorAll('.publication-record')) {
      const matches = (!year || paper.dataset.year === year)
        && (!topic || paper.dataset.topics.split('|').includes(topic))
        && query.split(/\s+/).every(word => paper.dataset.search.includes(word));
      paper.hidden = !matches;
      if (matches) visible++;
    }
    root.querySelector('.publication-count').textContent = `${visible} publication${visible === 1 ? '' : 's'}`;
    root.querySelector('.publication-empty').hidden = visible !== 0;
  }
  for (const name of ['input', 'change']) document.addEventListener(name, event => {
    const form = event.target.closest('.publication-filters');
    if (form) filter(form);
  });
  document.addEventListener('submit', event => {
    if (event.target.matches('.publication-filters')) { event.preventDefault(); filter(event.target); }
  });
  document.addEventListener('reset', event => {
    if (event.target.matches('.publication-filters')) requestAnimationFrame(() => filter(event.target));
  });
  document.addEventListener('click', async event => {
    const contact = event.target.closest('[data-copy-contact]');
    if (contact) {
      const status = contact.closest('.contact-panel').querySelector('.contact-status');
      try {
        await navigator.clipboard.writeText(contact.dataset.copyContact);
        status.textContent = `Copied ${contact.dataset.copyContact}`;
      } catch {
        const number = document.getElementById(contact.dataset.contactTarget);
        if (number) {
          const selection = window.getSelection(), range = document.createRange();
          range.selectNodeContents(number);
          selection.removeAllRanges();
          selection.addRange(range);
        }
        status.textContent = 'Copy unavailable. Select the number and copy it manually.';
      }
      return;
    }
    const button = event.target.closest('[data-copy-citation]');
    if (!button) return;
    const code = document.getElementById(button.dataset.copyCitation);
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code.textContent);
      button.textContent = 'Copied!';
    } catch {
      button.textContent = 'Select and copy below';
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(code);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  });
})();
