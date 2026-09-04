import { CATALOG, getCategories } from './game-catalog.js';

const grid = document.querySelector('#gameGrid');
const chips = document.querySelector('#categoryChips');
const search = document.querySelector('#searchInput');
const sort = document.querySelector('#sortSelect');
const loadMore = document.querySelector('#loadMoreBtn');
const heading = document.querySelector('#gamesHeading');
const empty = document.querySelector('#emptyState');
let activeCategory = '';
let visibleCount = 60;

const favorites = new Set(JSON.parse(localStorage.getItem('arcadeforge:favorites') || '[]'));
const palette = [
  'linear-gradient(135deg,#5433ff,#20bdff 52%,#a5fecb)',
  'linear-gradient(135deg,#ff4e50,#f9d423)',
  'linear-gradient(135deg,#11998e,#38ef7d)',
  'linear-gradient(135deg,#7f00ff,#e100ff)',
  'linear-gradient(135deg,#fc4a1a,#f7b733)',
  'linear-gradient(135deg,#00c6ff,#0072ff)',
  'linear-gradient(135deg,#ee0979,#ff6a00)',
  'linear-gradient(135deg,#00f2fe,#4facfe)'
];

function filtered() {
  const q = search.value.trim().toLowerCase();
  let list = CATALOG.filter(g => (!activeCategory || g.categories.includes(activeCategory)) && (!q || `${g.title} ${g.typeLabel} ${g.categories.join(' ')}`.toLowerCase().includes(q)));
  if (sort.value === 'popular') list.sort((a,b) => b.plays - a.plays);
  if (sort.value === 'rating') list.sort((a,b) => b.rating - a.rating || b.plays - a.plays);
  if (sort.value === 'az') list.sort((a,b) => a.title.localeCompare(b.title));
  if (sort.value === 'new') list.sort((a,b) => b.index - a.index);
  return list;
}

function card(g) {
  const el = document.createElement('article');
  el.className = 'game-card';
  el.innerHTML = `<button class="fav-btn ${favorites.has(g.id)?'active':''}" aria-label="Favorite ${g.title}" title="Favorite">★</button><a href="/game.html?id=${g.id}"><div class="thumb" style="--thumb:${palette[g.seed % palette.length]}"><span class="type-badge">${g.typeLabel}</span><span class="player-badge">${g.players}P</span></div><div class="card-body"><div class="card-title" title="${g.title}">${g.title}</div><div class="meta"><span>★ ${g.rating}</span><span>${Intl.NumberFormat('en',{notation:'compact'}).format(g.plays)} plays</span></div></div></a>`;
  el.querySelector('.fav-btn').addEventListener('click', e => {
    e.preventDefault();
    favorites.has(g.id) ? favorites.delete(g.id) : favorites.add(g.id);
    localStorage.setItem('arcadeforge:favorites', JSON.stringify([...favorites]));
    e.currentTarget.classList.toggle('active', favorites.has(g.id));
  });
  return el;
}

function render(reset=true) {
  if (reset) visibleCount = 60;
  const list = filtered();
  grid.replaceChildren(...list.slice(0,visibleCount).map(card));
  loadMore.hidden = visibleCount >= list.length;
  empty.hidden = list.length > 0;
  heading.textContent = activeCategory || (search.value ? 'Search results' : 'All games');
}

['Favorites', ...getCategories()].forEach(name => {
  const btn = document.createElement('button');
  btn.className = 'chip'; btn.type = 'button'; btn.textContent = name;
  btn.addEventListener('click', () => {
    if (name === 'Favorites') {
      activeCategory = '';
      search.value = '';
      const list = CATALOG.filter(g => favorites.has(g.id));
      grid.replaceChildren(...list.map(card));
      heading.textContent = 'Favorites'; empty.hidden = list.length > 0; loadMore.hidden = true;
      [...chips.children].forEach(c => c.classList.toggle('active', c === btn));
      return;
    }
    activeCategory = activeCategory === name ? '' : name;
    [...chips.children].forEach(c => c.classList.toggle('active', c.textContent === activeCategory));
    render(); document.querySelector('#games').scrollIntoView({behavior:'smooth'});
  });
  chips.append(btn);
});

search.addEventListener('input', () => render());
sort.addEventListener('change', () => render());
loadMore.addEventListener('click', () => { visibleCount += 60; render(false); });
document.querySelector('#clearFilter').addEventListener('click', () => { activeCategory=''; search.value=''; [...chips.children].forEach(c=>c.classList.remove('active')); render(); });
document.querySelector('#randomBtn').addEventListener('click', () => { const g = CATALOG[Math.floor(Math.random()*CATALOG.length)]; location.href=`/game.html?id=${g.id}`; });
const root = document.documentElement;
if (localStorage.getItem('arcadeforge:theme') === 'light') root.classList.add('light');
document.querySelector('#themeBtn').addEventListener('click', () => { root.classList.toggle('light'); localStorage.setItem('arcadeforge:theme', root.classList.contains('light')?'light':'dark'); });
render();
