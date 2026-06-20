let allNodes = [];
let activeCategory = 'all';
let searchQuery = '';

const CAT_LABELS = {
  all: 'Все',
  loaders: 'Загрузчики',
  conditioning: 'Кондиционирование',
  samplers: 'Сэмплеры',
  latent: 'Латентное',
  image: 'Изображения',
  upscale: 'Апскейл',
  controlnet: 'ControlNet',
  utils: 'Утилиты'
};

const CAT_COLORS = {
  loaders: 'type-model',
  conditioning: 'type-conditioning',
  samplers: 'type-clip',
  latent: 'type-latent',
  image: 'type-image',
  upscale: 'type-upscale_model',
  controlnet: 'type-control_net',
  utils: 'type-any'
};

async function init() {
  const res = await fetch('data/comfyui-nodes.json');
  allNodes = await res.json();
  renderNodes();
  bindEvents();
  initOSTabs();
  initScrollSpy();
}

function getFiltered() {
  return allNodes.filter(n => {
    const matchCat = activeCategory === 'all' || n.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchQ = !q || n.name.toLowerCase().includes(q) || n.name_ru.toLowerCase().includes(q) || n.what_it_does.toLowerCase().includes(q);
    return matchCat && matchQ;
  });
}

function renderNodes() {
  const filtered = getFiltered();
  const grid = document.getElementById('node-grid');

  document.getElementById('node-count').textContent = `${filtered.length} нод`;

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--color-text-muted)">🔍 Ничего не найдено</div>`;
    return;
  }

  grid.innerHTML = filtered.map(n => {
    const catColor = CAT_COLORS[n.category] || 'type-any';
    const catLabel = CAT_LABELS[n.category] || n.category;

    const inputsHtml = n.inputs.length
      ? n.inputs.map(i => `
          <div class="io-item">
            <span class="io-name ${getTypeClass(i.type)}">${i.name}</span>
            <span class="io-desc">${i.desc}</span>
          </div>`).join('')
      : `<div class="empty-io">Нет входов</div>`;

    const outputsHtml = n.outputs.length
      ? n.outputs.map(o => `
          <div class="io-item">
            <span class="io-name ${getTypeClass(o.type)}">${o.name}</span>
            <span class="io-desc">${o.desc}</span>
          </div>`).join('')
      : `<div class="empty-io">Нет выходов</div>`;

    const paramsHtml = n.params.length
      ? n.params.map(p => `
          <div class="param-item">
            <span class="param-name">${p.name}</span>
            <span class="param-desc">${p.desc}</span>
          </div>`).join('')
      : `<div class="empty-io">Нет параметров</div>`;

    return `
    <div class="node-card" data-id="${n.id}">
      <div class="node-card-header" onclick="toggleNode('${n.id}')">
        <div class="node-emoji">${n.emoji}</div>
        <div class="node-names">
          <div class="node-name-en">${n.name}</div>
          <div class="node-name-ru">${n.name_ru}</div>
        </div>
        <span class="node-cat-badge ${catColor}">${catLabel}</span>
        <span class="node-toggle">▾</span>
      </div>
      <div class="node-card-body">
        <div class="node-what">${n.what_it_does}</div>
        <div class="node-tables">
          <div class="node-table-wrap">
            <h4>Входы</h4>
            <div class="io-list">${inputsHtml}</div>
          </div>
          <div class="node-table-wrap">
            <h4>Выходы</h4>
            <div class="io-list">${outputsHtml}</div>
          </div>
        </div>
        ${n.params.length ? `<div class="node-table-wrap"><h4>Параметры</h4><div class="params-list">${paramsHtml}</div></div>` : ''}
      </div>
    </div>`;
  }).join('');
}

function getTypeClass(type) {
  const map = {
    model: 'type-model', clip: 'type-clip', vae: 'type-vae',
    latent: 'type-latent', image: 'type-image', conditioning: 'type-conditioning',
    control_net: 'type-control_net', upscale_model: 'type-upscale_model',
    mask: 'type-image', any: 'type-any'
  };
  return map[type] || 'type-any';
}

function toggleNode(id) {
  const card = document.querySelector(`.node-card[data-id="${id}"]`);
  if (card) card.classList.toggle('open');
}

function bindEvents() {
  document.querySelectorAll('.node-filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.node-filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.dataset.cat;
      renderNodes();
    });
  });

  document.getElementById('node-search').addEventListener('input', e => {
    searchQuery = e.target.value;
    renderNodes();
  });
}

function initOSTabs() {
  document.querySelectorAll('.os-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const os = tab.dataset.os;
      document.querySelectorAll('.os-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.os-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(`os-${os}`).classList.add('active');
    });
  });
}

function initScrollSpy() {
  const sections = document.querySelectorAll('.cf-section');
  const navLinks = document.querySelectorAll('.cf-nav a[href^="#"]');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
        });
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });

  sections.forEach(s => observer.observe(s));
}

init();
