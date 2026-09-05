(() => {
  const fallback = 'ArcadeForge';

  function applyName(siteName) {
    const name = String(siteName || '').trim().slice(0, 80);
    if (!name || name === fallback) return;

    document.title = document.title.replaceAll(fallback, name);

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      if (node.nodeValue.includes(fallback)) {
        node.nodeValue = node.nodeValue.replaceAll(fallback, name);
      }
    }

    for (const element of document.querySelectorAll('[aria-label],[title]')) {
      for (const attribute of ['aria-label', 'title']) {
        const value = element.getAttribute(attribute);
        if (value?.includes(fallback)) element.setAttribute(attribute, value.replaceAll(fallback, name));
      }
    }

    const words = name.split(/\s+/).filter(Boolean);
    const first = words.length > 1 ? words.slice(0, -1).join(' ') : name;
    const last = words.length > 1 ? words.at(-1) : '';
    for (const brand of document.querySelectorAll('.brand-copy')) {
      const strong = document.createElement('strong');
      strong.textContent = first;
      const accent = document.createElement('b');
      accent.textContent = last ? ` ${last}` : '';
      brand.replaceChildren(strong, accent);
    }

    const initials = words.length > 1
      ? (words[0][0] + words.at(-1)[0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
    document.querySelectorAll('.brand-mark').forEach(mark => { mark.textContent = initials; });
  }

  fetch('/api/config', { cache: 'no-store' })
    .then(response => response.ok ? response.json() : null)
    .then(config => config && applyName(config.siteName))
    .catch(() => {});
})();
