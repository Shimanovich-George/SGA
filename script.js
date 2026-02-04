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
  tabs.forEach(t => t.addEventListener('click', () => activate(t.dataset.tab)));

  // ---------- Projects: Variant B (show only existing images) ----------
  const galleries = Array.from(document.querySelectorAll('.gallery[data-project]'));

  function probeImage(url){
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ ok:true, url });
      img.onerror = () => resolve({ ok:false, url });
      img.src = url + (url.includes('?') ? '&' : '?') + 'probe=' + Date.now();
    });
  }

  async function buildGallery(galleryEl){
    const project = galleryEl.dataset.project;
    const max = parseInt(galleryEl.dataset.max || '0', 10);
    const found = [];

    for (let i = 1; i <= max; i++){
      const url = `assets/images/project${project}_${i}.jpg`;
      // eslint-disable-next-line no-await-in-loop
      const res = await probeImage(url);
      if (res.ok) found.push(url);
    }

    galleryEl.dataset.images = JSON.stringify(found);

    if (found.length === 0){
      galleryEl.innerHTML = `<div class="muted">No images yet. Add files like <code>project${project}_1.jpg</code> into <code>assets/images/</code>.</div>`;
      return;
    }

    galleryEl.innerHTML = found.map((url, idx) => `
      <button class="thumb" data-idx="${idx}" data-img="${url}" aria-label="Open image ${idx+1}">
        <img loading="lazy" decoding="async" src="${url}" alt="Project ${project} image ${idx+1}">
      </button>
    `).join('');

    galleryEl.querySelectorAll('.thumb').forEach(btn => {
      btn.addEventListener('click', () => {
        const images = JSON.parse(galleryEl.dataset.images || '[]');
        const idx = parseInt(btn.dataset.idx || '0', 10);
        openLb(images, idx);
      });
    });
  }

  (async () => {
    for (const g of galleries){
      // eslint-disable-next-line no-await-in-loop
      await buildGallery(g);
    }
  })();

  // ---------- Lightbox with prev/next + keyboard + swipe ----------
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightboxImg');
  const lbClose = document.getElementById('lightboxClose');
  const lbPrev = document.getElementById('lightboxPrev');
  const lbNext = document.getElementById('lightboxNext');

  let currentImages = [];
  let currentIndex = 0;

  function setNavVisibility(){
    if (!lbPrev || !lbNext) return;
    const many = currentImages.length > 1;
    lbPrev.style.display = many ? 'flex' : 'none';
    lbNext.style.display = many ? 'flex' : 'none';
  }

  function showIndex(idx){
    if (!lb || !lbImg) return;
    if (currentImages.length === 0) return;
    const n = currentImages.length;
    currentIndex = ((idx % n) + n) % n;
    lbImg.src = currentImages[currentIndex];
    setNavVisibility();
  }

  function openLb(images, idx){
    if (!lb || !lbImg) return;
    currentImages = images || [];
    currentIndex = idx || 0;
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
    showIndex(currentIndex);
  }

  function closeLb(){
    if (!lb) return;
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    if (lbImg) lbImg.src = '';
    currentImages = [];
    currentIndex = 0;
  }

  function prev(){ showIndex(currentIndex - 1); }
  function next(){ showIndex(currentIndex + 1); }

  if (lbClose) lbClose.addEventListener('click', closeLb);
  if (lbPrev) lbPrev.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
  if (lbNext) lbNext.addEventListener('click', (e) => { e.stopPropagation(); next(); });

  if (lb) lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });

  document.addEventListener('keydown', (e) => {
    if (!lb || !lb.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  // Swipe support (mobile)
  let touchStartX = 0;
  let touchStartY = 0;
  let touchActive = false;
  const SWIPE_THRESHOLD = 40;

  if (lb){
    lb.addEventListener('touchstart', (e) => {
      if (!lb.classList.contains('is-open')) return;
      if (!e.touches || e.touches.length !== 1) return;
      touchActive = true;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }, { passive: true });

    lb.addEventListener('touchend', (e) => {
      if (!touchActive) return;
      touchActive = false;
      if (!e.changedTouches || e.changedTouches.length !== 1) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > SWIPE_THRESHOLD){
        if (dx > 0) prev(); else next();
      }
    }, { passive: true });
  }
})();
