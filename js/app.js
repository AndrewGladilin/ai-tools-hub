let allTools = [];
let activeFilter = 'all';
let searchQuery = '';
let expanded = new Set();

const TAG_LABELS = { text: 'Текст', image: 'Изображения', video: 'Видео', audio: 'Аудио', code: 'Код' };

async function init() {
  const res = await fetch('data/tools.json');
  allTools = await res.json();
  updateStats();
  render();
  bindEvents();
}

function updateStats() {
  document.getElementById('stat-total').textContent = allTools.length;
  document.getElementById('stat-free').textContent = allTools.filter(t => t.free).length;
  const cats = new Set(allTools.flatMap(t => t.tags));
  document.getElementById('stat-cats').textContent = cats.size;
}

function getFiltered() {
  return allTools.filter(t => {
    const matchCat = activeFilter === 'all' || t.tags.includes(activeFilter);
    const q = searchQuery.toLowerCase();
    const matchQ = !q || t.name.toLowerCase().includes(q) || t.maker.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    return matchCat && matchQ;
  });
}

function render() {
  const tools = getFiltered();
  const grid = document.getElementById('tools-grid');

  if (tools.length === 0) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="emoji">🔍</div><p>Ничего не найдено. Попробуйте изменить фильтр или запрос.</p></div>`;
    return;
  }

  grid.innerHTML = tools.map(t => {
    const isExp = expanded.has(t.id);
    return `
    <div class="tool-card" data-id="${t.id}">
      <div class="tool-header">
        <div class="tool-emoji">${t.emoji}</div>
        <div>
          <div class="tool-name">${t.name}</div>
          <div class="tool-maker">${t.maker}</div>
        </div>
      </div>
      <div class="tool-desc ${isExp ? 'expanded' : ''}">${t.description}</div>
      <span class="desc-more ${isExp ? 'expanded' : ''}" data-id="${t.id}">${isExp ? 'свернуть ▴' : 'ещё ▾'}</span>
      <div class="tool-tags">
        ${t.tags.map(tag => `<span class="tag tag-${tag}">${TAG_LABELS[tag]}</span>`).join('')}
      </div>
      <div class="tool-footer">
        <span class="price">${t.price}</span>
        ${t.free ? '<span class="free-badge">Free tier</span>' : ''}
      </div>
      <a class="tool-visit-btn" href="${t.url}" target="_blank" rel="noopener">
        Открыть сайт
        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
      </a>
    </div>`;
  }).join('');

  grid.querySelectorAll('.desc-more').forEach(el => {
    el.addEventListener('click', () => toggleExpand(el.dataset.id));
  });
}

function toggleExpand(id) {
  if (expanded.has(id)) expanded.delete(id);
  else expanded.add(id);
  render();
}

function bindEvents() {
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.filter;
      render();
    });
  });

  document.getElementById('search').addEventListener('input', e => {
    searchQuery = e.target.value;
    render();
  });
}

init();
