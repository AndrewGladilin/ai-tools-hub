let allTools = [];
let selected = [];
let activeFilter = 'all';
let searchQuery = '';
let expanded = new Set();

const TAG_LABELS = { text: 'Текст', image: 'Изображения', video: 'Видео', audio: 'Аудио', code: 'Код' };
const TAG_DOTS   = { text: '#378ADD', image: '#639922', video: '#BA7517', audio: '#D4537E', code: '#7F77DD' };

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
    const isSel = selected.includes(t.id);
    const isExp = expanded.has(t.id);
    return `
    <div class="tool-card ${isSel ? 'selected' : ''}" data-id="${t.id}">
      <div class="select-indicator" title="Добавить к сравнению">${isSel ? '✓' : '+'}</div>
      <div class="tool-card-body">
        <div class="tool-header">
          <div class="tool-emoji">${t.emoji}</div>
          <div>
            <div class="tool-name">${t.name}</div>
            <div class="tool-maker">${t.maker}</div>
          </div>
        </div>
        <div class="tool-desc ${isExp ? 'expanded' : ''}">${t.description}</div>
        ${!isExp ? `<span class="desc-more">ещё ▾</span>` : `<span class="desc-more expanded">свернуть ▴</span>`}
        <div class="tool-tags">
          ${t.tags.map(tag => `<span class="tag tag-${tag}">${TAG_LABELS[tag]}</span>`).join('')}
        </div>
        <div class="tool-footer">
          <span class="price">${t.price}</span>
          ${t.free ? '<span class="free-badge">Free tier</span>' : ''}
        </div>
      </div>
    </div>`;
  }).join('');

  grid.querySelectorAll('.tool-card').forEach(el => {
    const id = el.dataset.id;

    el.querySelector('.select-indicator').addEventListener('click', e => {
      e.stopPropagation();
      toggleSelect(id);
    });

    el.querySelector('.tool-card-body').addEventListener('click', () => {
      toggleExpand(id);
    });
  });
}

function toggleExpand(id) {
  if (expanded.has(id)) {
    expanded.delete(id);
  } else {
    expanded.add(id);
  }
  render();
}

function toggleSelect(id) {
  if (selected.includes(id)) {
    selected = selected.filter(s => s !== id);
  } else {
    if (selected.length >= 4) {
      showNotice('Можно выбрать не более 4 нейросетей для сравнения');
      return;
    }
    selected.push(id);
  }
  render();
  updateCompareBar();
}

function updateCompareBar() {
  const bar = document.getElementById('compare-bar');
  const badges = document.getElementById('selected-badges');
  const section = document.getElementById('compare-section');

  if (selected.length < 2) {
    bar.style.display = 'none';
    section.style.display = 'none';
    return;
  }

  bar.style.display = 'block';
  badges.innerHTML = selected.map(id => {
    const t = allTools.find(x => x.id === id);
    return `<div class="sel-badge">${t.emoji} ${t.name}<span class="rm" data-id="${id}">×</span></div>`;
  }).join('');

  badges.querySelectorAll('.rm').forEach(el => {
    el.addEventListener('click', e => { e.stopPropagation(); toggleSelect(el.dataset.id); });
  });
}

function buildCompareTable() {
  const sel = selected.map(id => allTools.find(t => t.id === id));
  const section = document.getElementById('compare-section');
  section.style.display = 'block';

  const rows = [
    ['Производитель', t => t.maker],
    ['Планы и цены', t => t.plans
      ? t.plans.map(p => `<span class="plan-badge">${p.name}<span class="plan-price">${p.price}</span></span>`).join('')
      : `<strong>${t.price}</strong>`],
    ['Бесплатный план', t => t.free ? '<span class="yes">✓ Есть</span>' : '<span class="no">✗ Нет</span>'],
    ['Русский язык', t => t.ru ? '<span class="yes">✓ Да</span>' : '<span class="no">✗ Нет</span>'],
    ['Категории', t => t.tags.map(tag => `<span class="tag tag-${tag}" style="display:inline-block">${TAG_LABELS[tag]}</span>`).join(' ')],
    ['Контекст', t => t.context],
    ['Мультимодальность', t => t.multimodal ? '<span class="yes">✓</span>' : '<span class="no">✗</span>'],
    ['Голосовой режим', t => t.voice ? '<span class="yes">✓</span>' : '<span class="no">✗</span>'],
    ['Поиск в интернете', t => t.web ? '<span class="yes">✓</span>' : '<span class="no">✗</span>'],
    ['API', t => t.api ? '<span class="yes">✓ Есть</span>' : '<span class="no">✗ Нет</span>'],
    ['Год выпуска', t => t.released],
    ['Сайт', t => `<a href="${t.url}" target="_blank" rel="noopener" style="color:var(--color-accent)">${t.url.replace('https://','')}</a>`],
  ];

  const thead = `<thead><tr>
    <th>Параметр</th>
    ${sel.map(t => `<th>${t.emoji} ${t.name}</th>`).join('')}
  </tr></thead>`;

  const tbody = `<tbody>${rows.map(([label, fn]) => `
    <tr><td>${label}</td>${sel.map(t => `<td>${fn(t)}</td>`).join('')}</tr>
  `).join('')}</tbody>`;

  document.getElementById('compare-table').innerHTML = thead + tbody;
  section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function showNotice(msg) {
  const n = document.getElementById('notice');
  n.textContent = msg;
  n.style.opacity = '1';
  setTimeout(() => { n.style.opacity = '0'; }, 2500);
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

  document.getElementById('btn-compare').addEventListener('click', buildCompareTable);

  document.getElementById('btn-clear').addEventListener('click', () => {
    selected = [];
    render();
    updateCompareBar();
  });
}

init();
