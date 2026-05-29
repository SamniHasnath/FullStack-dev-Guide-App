// js/app.js — UI logic for the Fullstack Dev Guide
// Depends on: js/data.js (DB, DIFF_STYLES, SECTION_META)

/* ── Theme ── */
window.toggleTheme = function () {
  const html    = document.documentElement;
  const next    = html.dataset.theme === 'dark' ? 'light' : 'dark';
  html.dataset.theme = next;
  localStorage.setItem('theme', next);
};

/* ── State ── */
let currentSection = 'html';
let currentFilter  = 'All';
let searchQ        = '';
let activeIdx      = -1;
let seen           = {};  // "section:name" → true

/* ── Helpers ── */
function getItems() {
  return DB[currentSection].filter(item => {
    const matchCat    = currentFilter === 'All' || item.cat === currentFilter;
    const matchSearch = !searchQ
      || item.name.toLowerCase().includes(searchQ)
      || item.desc.toLowerCase().includes(searchQ)
      || item.cat.toLowerCase().includes(searchQ);
    return matchCat && matchSearch;
  });
}

function cats() {
  return ['All', ...new Set(DB[currentSection].map(i => i.cat))];
}

/* ── Syntax Highlighter ── */
function hl(code) {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(#[^\n]*|\/\/[^\n]*)/g, '<span class="cmt">$1</span>')
    .replace(/('(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*")/g, '<span class="str">$1</span>')
    .replace(/\b(const|let|var|function|return|import|export|default|from|async|await|try|catch|finally|throw|new|class|extends|if|else|for|while|switch|case|break|this|null|true|false|undefined|require|module|SELECT|FROM|WHERE|JOIN|GROUP|ORDER|BY|HAVING|INSERT|UPDATE|DELETE|SET|INTO|VALUES|ON|INNER|LEFT|RIGHT|AS|AND|OR|NOT|IN|LIKE|BETWEEN|DISTINCT|COUNT|SUM|AVG|MAX|MIN|CREATE|INDEX|UNIQUE|BEGIN|COMMIT|ROLLBACK|INTERVAL)\b/g,
      '<span class="kw">$1</span>')
    .replace(/\b(\d+\.?\d*)\b/g, '<span class="num">$1</span>');
}

/* ── Render: Filter Tags ── */
function renderFilters() {
  const fr = document.getElementById('filter-row');
  fr.innerHTML = '';
  cats().forEach(c => {
    const b = document.createElement('button');
    b.className = 'ftag' + (c === currentFilter ? ' on' : '');
    b.textContent = c;
    b.onclick = () => { currentFilter = c; renderFilters(); renderGrid(); };
    fr.appendChild(b);
  });
}

/* ── Render: Concept Grid ── */
function renderGrid() {
  const grid  = document.getElementById('grid');
  const items = getItems();
  grid.innerHTML = '';

  if (!items.length) {
    grid.innerHTML = '<div class="empty">No concepts match your search</div>';
    return;
  }

  items.forEach((item, i) => {
    const key = currentSection + ':' + item.name;
    const ds  = DIFF_STYLES[item.diff] || DIFF_STYLES.beginner;
    const card = document.createElement('div');
    card.className = 'concept-card'
      + (activeIdx === i ? ' active' : '')
      + (seen[key]      ? ' seen'   : '');
    card.innerHTML = `
      <div class="cc-tag" style="background:${item.color};color:${item.tc}">
        <i class="ti ${item.icon}" style="font-size:11px"></i>${item.cat}
      </div>
      <div class="cc-name">${item.name}</div>
      <div class="cc-desc">${item.desc}</div>
      <div class="cc-diff" style="background:${ds.bg};color:${ds.c}">${item.diff}</div>
    `;
    card.onclick = () => { activeIdx = i; openDetail(item, key, items, i); renderGrid(); };
    grid.appendChild(card);
  });

  updateProgress();
}

/* ── Progress Bar ── */
function updateProgress() {
  const total = DB[currentSection].length;
  const done  = DB[currentSection].filter(i => seen[currentSection + ':' + i.name]).length;
  document.getElementById('progress-bar').style.width = total ? (done / total * 100) + '%' : '0%';
  document.getElementById('progress-text').textContent = done + ' / ' + total;
  const btn = document.querySelector(`.nav-btn[data-s="${currentSection}"]`);
  if (btn) btn.classList.toggle('done', done > 0);
}

/* ── Open Detail Panel ── */
function openDetail(item, key, items, idx) {
  document.getElementById('d-title').textContent = item.name;
  document.getElementById('d-cat').textContent   = item.cat + ' · ' + item.diff;

  const iconEl = document.getElementById('d-icon');
  iconEl.innerHTML = `<i class="ti ${item.icon}" style="font-size:18px;color:${item.tc}"></i>`;
  iconEl.style.background = item.color;

  document.getElementById('d-explain').textContent = item.explain;

  // Key points
  document.getElementById('d-keypoints').innerHTML =
    item.points.map(p => `<div class="kp-item"><div class="kp-dot"></div><span>${p}</span></div>`).join('');

  // Code
  document.getElementById('d-code').innerHTML = hl(item.code);

  // Use cases
  document.getElementById('d-uses').innerHTML =
    item.uses.map(u => `<div class="use-case"><div class="uc-title">${u.t}</div><div class="uc-text">${u.d}</div></div>`).join('');

  // Gotchas
  document.getElementById('d-gotchas').innerHTML =
    item.gotchas.map(g => `<div class="gotcha"><i class="ti ti-alert-triangle"></i><span>${g}</span></div>`).join('');

  // Related
  document.getElementById('d-related').innerHTML =
    (item.related || []).map(r => `<span class="rel-tag" onclick="jumpTo('${r}')">${r}</span>`).join('');

  // Ask button
  document.getElementById('d-ask').onclick = () => {
    // If embedded in Claude, use sendPrompt; otherwise open a new tab
    const query = encodeURIComponent(`Tell me more about ${item.name} in ${SECTION_META[currentSection].label}`);
    if (typeof sendPrompt === 'function') {
      sendPrompt(`Tell me more about ${item.name} in ${SECTION_META[currentSection].label}`);
    } else {
      window.open('https://claude.ai/chat?q=' + query, '_blank');
    }
  };

  // Mark button
  const mb = document.getElementById('mark-btn');
  mb.className = 'd-act-btn' + (seen[key] ? ' marked' : '');
  mb.innerHTML = seen[key]
    ? '<i class="ti ti-check"></i> Learned!'
    : '<i class="ti ti-check"></i> Mark learned';

  // Prev / Next
  document.getElementById('prev-btn').disabled = idx === 0;
  document.getElementById('next-btn').disabled = idx === items.length - 1;

  // Show overview tab
  switchTab(document.querySelector('.d-tab[data-t="overview"]'));
  document.getElementById('detail').classList.add('open');
  document.getElementById('detail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ── Toggle Learned ── */
window.toggleMark = function () {
  const items = getItems();
  if (activeIdx < 0 || activeIdx >= items.length) return;
  const key  = currentSection + ':' + items[activeIdx].name;
  seen[key]  = !seen[key];
  openDetail(items[activeIdx], key, items, activeIdx);
  renderGrid();
};

/* ── Previous / Next concept ── */
window.navConcept = function (dir) {
  const items = getItems();
  const ni    = activeIdx + dir;
  if (ni < 0 || ni >= items.length) return;
  activeIdx   = ni;
  const key   = currentSection + ':' + items[ni].name;
  openDetail(items[ni], key, items, ni);
  renderGrid();
};

/* ── Close Detail ── */
window.closeDetail = function () {
  document.getElementById('detail').classList.remove('open');
  activeIdx = -1;
  renderGrid();
};

/* ── Switch Tabs ── */
window.switchTab = function (el) {
  document.querySelectorAll('.d-tab').forEach(t  => t.classList.remove('on'));
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('on'));
  el.classList.add('on');
  document.getElementById('tab-' + el.dataset.t).classList.add('on');
};

/* ── Jump To Related ── */
window.jumpTo = function (name) {
  const items = DB[currentSection];
  const idx   = items.findIndex(i => i.name === name);
  if (idx < 0) return;
  currentFilter = 'All';
  searchQ       = '';
  document.getElementById('search').value = '';
  activeIdx     = idx;
  const key     = currentSection + ':' + items[idx].name;
  renderFilters();
  renderGrid();
  openDetail(items[idx], key, items, idx);
};

/* ── Sidebar Navigation ── */
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentSection = btn.dataset.s;
    currentFilter  = 'All';
    searchQ        = '';
    activeIdx      = -1;
    document.getElementById('search').value  = '';
    document.getElementById('sec-title').textContent = SECTION_META[currentSection].label;
    document.getElementById('sec-sub').textContent   = '— ' + SECTION_META[currentSection].sub;
    document.getElementById('detail').classList.remove('open');
    renderFilters();
    renderGrid();
  };
});

/* ── Search ── */
document.getElementById('search').oninput = e => {
  searchQ       = e.target.value.toLowerCase();
  currentFilter = 'All';
  renderFilters();
  renderGrid();
};

/* ── Init ── */
renderFilters();
renderGrid();
