let allTools = [];
let selected = [];
let activeFilter = 'all';

const TAG_LABELS = { text: 'Текст', image: 'Изображения', video: 'Видео', audio: 'Аудио', code: 'Код' };

async function init() {
  const res = await fetch('data/tools.json');
  allTools = await res.json();
  render();
  bindEvents();
}

function getFiltered() {
  return activeFilter === 'all' ? allTools : allTools.filter(t => t.tags.includes(activeFilter));
}

function render() {
  const grid = document.getElementById('picker-grid');
  grid.innerHTML = getFiltered().map(t => {
    const isSel = selected.includes(t.id);
    return `
    <div class="tool-card ${isSel ? 'selected' : ''}" data-id="${t.id}" style="cursor:pointer">
      <div class="select-indicator" title="Выбрать для сравнения">${isSel ? '✓' : '+'}</div>
      <div class="tool-header">
        <div class="tool-emoji">${t.emoji}</div>
        <div>
          <div class="tool-name">${t.name}</div>
          <div class="tool-maker">${t.maker}</div>
        </div>
      </div>
      <div class="tool-tags" style="margin-top:8px">
        ${t.tags.map(tag => `<span class="tag tag-${tag}">${TAG_LABELS[tag]}</span>`).join('')}
      </div>
      <div class="tool-footer" style="margin-top:8px">
        <span class="price">${t.price}</span>
        ${t.free ? '<span class="free-badge">Free tier</span>' : ''}
      </div>
    </div>`;
  }).join('');

  grid.querySelectorAll('.tool-card').forEach(el => {
    el.addEventListener('click', () => toggleSelect(el.dataset.id));
  });
}

function toggleSelect(id) {
  if (selected.includes(id)) {
    selected = selected.filter(s => s !== id);
  } else {
    if (selected.length >= 4) {
      showNotice('Можно выбрать не более 4 нейросетей');
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

  document.getElementById('btn-compare').addEventListener('click', buildCompareTable);
  document.getElementById('btn-clear').addEventListener('click', () => {
    selected = [];
    render();
    updateCompareBar();
  });
}

init();
