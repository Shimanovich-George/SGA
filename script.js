(() => {
  // Year
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Tabs
  const tabs = Array.from(document.querySelectorAll('.tab'));
  const panels = Array.from(document.querySelectorAll('.panel'));

  function activate(tabId){
    tabs.forEach(t => t.setAttribute('aria-selected', String(t.dataset.tab === tabId)));
    panels.forEach(p => p.classList.toggle('is-active', p.id === tabId));
  }

  tabs.forEach(t => {
    t.addEventListener('click', () => activate(t.dataset.tab));
  });

  // Lightbox
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbClose = document.getElementById('lightboxClose');

  function openLb(src){
    if (!lb || !lbImg) return;
    lbImg.src = src;
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
  }
  function closeLb(){
    if (!lb) return;
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    if (lbImg) lbImg.src = '';
  }

  document.querySelectorAll('.thumb').forEach(btn => {
    btn.addEventListener('click', () => openLb(btn.dataset.img));
  });

  if (lbClose) lbClose.addEventListener('click', closeLb);
  if (lb) lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLb(); });
})();
