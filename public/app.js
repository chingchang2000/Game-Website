import { CATALOG, getCategories } from './game-catalog.js';

const $ = selector => document.querySelector(selector);
const grid = $('#gameGrid');
const chips = $('#categoryChips');
const search = $('#searchInput');
const sort = $('#sortSelect');
const loadMore = $('#loadMoreBtn');
const heading = $('#gamesHeading');
const empty = $('#emptyState');
const resultCount = $('#resultCount');
const favoriteCount = $('#favoriteCount');
const trendingGrid = $('#trendingGrid');
const categoryCards = $('#categoryCards');

let activeCategory = '';
let visibleCount = 48;
let featuredIndex = 0;

const favorites = new Set(JSON.parse(localStorage.getItem('arcadeforge:favorites') || '[]'));
const palettes = [
  ['#6d5dfc','#2de2e6','#0b1022'],
  ['#ff4d8d','#ffb84d','#23101d'],
  ['#19d3ae','#45aaf2','#081c1d'],
  ['#9b5cff','#ff5edb','#170b2a'],
  ['#ff7a45','#ffd35a','#261209'],
  ['#3f8cff','#62e6ff','#07162d'],
  ['#f44369','#ff8f3d','#250810'],
  ['#18d1ff','#635bff','#07142c'],
  ['#7cff6b','#1bbf9c','#071a12'],
  ['#ffcf4a','#ff6a4a','#241607']
];

const categoryConfig = [
  ['2 Player','2P','Two-player battles'],
  ['3 Player','3P','Three on one keyboard'],
  ['4 Player','4P','Full local party'],
  ['Action','⚡','Fast and chaotic'],
  ['Puzzle','◇','Think your way through'],
  ['Sports','◎','Arcade competition'],
  ['Survival','△','Stay alive'],
  ['Classic','▦','Old-school energy']
];

function paletteFor(game) {
  return palettes[game.seed % palettes.length];
}

function coverStyle(game) {
  const [a,b,c] = paletteFor(game);
  return `--cover-a:${a};--cover-b:${b};--cover-c:${c};--tilt:${(game.seed % 12) - 6}deg`;
}

function saveFavorites() {
  localStorage.setItem('arcadeforge:favorites', JSON.stringify([...favorites]));
  favoriteCount.textContent = favorites.size;
}

function formatPlays(value) {
  return Intl.NumberFormat('en', { notation:'compact', maximumFractionDigits:1 }).format(value);
}

function createCard(game, large = false) {
  const article = document.createElement('article');
  article.className = large ? 'game-card game-card-large' : 'game-card';
  article.innerHTML = `
    <a class="game-link" href="/game.html?id=${game.id}" aria-label="Play ${game.title}">
      <div class="game-cover" style="${coverStyle(game)}">
        <div class="cover-grid"></div>
        <div class="cover-shape cover-shape-a"></div>
        <div class="cover-shape cover-shape-b"></div>
        <span class="cover-genre">${game.typeLabel}</span>
        <span class="cover-player">${game.players}P</span>
        <span class="cover-play">▶</span>
      </div>
      <div class="card-copy">
        <h3 title="${game.title}">${game.title}</h3>
        <div class="card-meta"><span class="rating">★ ${game.rating}</span><span>${formatPlays(game.plays)} plays</span></div>
      </div>
    </a>
    <button class="fav-btn ${favorites.has(game.id) ? 'active' : ''}" type="button" aria-label="Toggle favorite for ${game.title}" title="Favorite">★</button>
  `;
  article.querySelector('.fav-btn').addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    favorites.has(game.id) ? favorites.delete(game.id) : favorites.add(game.id);
    event.currentTarget.classList.toggle('active', favorites.has(game.id));
    saveFavorites();
  });
  return article;
}

function filteredGames() {
  const query = search.value.trim().toLowerCase();
  let list = CATALOG.filter(game => {
    const matchesCategory = !activeCategory || game.categories.includes(activeCategory);
    const haystack = `${game.title} ${game.typeLabel} ${game.categories.join(' ')}`.toLowerCase();
    return matchesCategory && (!query || haystack.includes(query));
  });

  if (sort.value === 'popular') list.sort((a,b) => b.plays - a.plays);
  if (sort.value === 'rating') list.sort((a,b) => b.rating - a.rating || b.plays - a.plays);
  if (sort.value === 'new') list.sort((a,b) => b.index - a.index);
  if (sort.value === 'az') list.sort((a,b) => a.title.localeCompare(b.title));
  return list;
}

function syncActiveControls() {
  [...chips.children].forEach(button => button.classList.toggle('active', button.dataset.category === activeCategory));
  [...categoryCards.children].forEach(button => button.classList.toggle('active', button.dataset.category === activeCategory));
}

function render(reset = true) {
  if (reset) visibleCount = 48;
  const list = filteredGames();
  const visible = list.slice(0, visibleCount);
  grid.replaceChildren(...visible.map(game => createCard(game)));
  loadMore.hidden = visibleCount >= list.length;
  empty.hidden = list.length > 0;
  heading.textContent = activeCategory || (search.value ? 'Search results' : 'All games');
  resultCount.textContent = `${list.length.toLocaleString('en')} game${list.length === 1 ? '' : 's'}`;
  syncActiveControls();
}

function setCategory(category) {
  activeCategory = activeCategory === category ? '' : category;
  render();
  $('#games').scrollIntoView({ behavior:'smooth', block:'start' });
}

function buildCategories() {
  categoryCards.replaceChildren(...categoryConfig.map(([name,icon,desc]) => {
    const count = CATALOG.filter(game => game.categories.includes(name)).length;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'category-card';
    button.dataset.category = name;
    button.innerHTML = `<span class="category-icon">${icon}</span><strong>${name}</strong><small>${desc}</small><em>${count} games</em>`;
    button.addEventListener('click', () => setCategory(name));
    return button;
  }));

  ['Favorites', ...getCategories()].forEach(name => {
    const button = document.createElement('button');
    button.className = 'chip';
    button.type = 'button';
    button.dataset.category = name;
    button.textContent = name;
    button.addEventListener('click', () => {
      if (name === 'Favorites') {
        activeCategory = '';
        search.value = '';
        const list = CATALOG.filter(game => favorites.has(game.id));
        grid.replaceChildren(...list.map(game => createCard(game)));
        heading.textContent = 'Favorites';
        resultCount.textContent = `${list.length} saved game${list.length === 1 ? '' : 's'}`;
        empty.hidden = list.length > 0;
        loadMore.hidden = true;
        [...chips.children].forEach(c => c.classList.toggle('active', c === button));
        [...categoryCards.children].forEach(c => c.classList.remove('active'));
        $('#games').scrollIntoView({ behavior:'smooth' });
        return;
      }
      setCategory(name);
    });
    chips.append(button);
  });
}

function buildTrending() {
  const top = [...CATALOG].sort((a,b) => b.plays - a.plays).slice(0,6);
  trendingGrid.replaceChildren(...top.map(game => createCard(game, true)));
}

function setFeatured(game) {
  const [a,b,c] = paletteFor(game);
  $('#featuredTitle').textContent = game.title;
  $('#featuredMeta').textContent = `${game.typeLabel} · ${game.players} Player${game.players > 1 ? 's' : ''} · Difficulty ${game.difficulty}/5 · ${formatPlays(game.plays)} plays`;
  $('#featuredPlayBtn').href = `/game.html?id=${game.id}`;
  $('#featuredPlayers').textContent = `${game.players}P`;
  $('#featuredRating').textContent = game.rating;
  $('#featuredArt').style.cssText = `--hero-a:${a};--hero-b:${b};--hero-c:${c};--hero-tilt:${(game.seed % 10)-5}deg`;
  const bars = [...document.querySelectorAll('.hero-progress span')];
  bars.forEach((bar,i) => bar.classList.toggle('active', i === featuredIndex % bars.length));
}

function nextFeatured() {
  const picks = [...CATALOG].sort((a,b) => (b.rating * 10000 + b.plays) - (a.rating * 10000 + a.plays)).slice(0,80);
  featuredIndex = (featuredIndex + 1) % Math.min(4,picks.length);
  setFeatured(picks[featuredIndex]);
}

search.addEventListener('input', () => render());
sort.addEventListener('change', () => render());
loadMore.addEventListener('click', () => { visibleCount += 48; render(false); });
$('#clearFilter').addEventListener('click', () => {
  activeCategory = '';
  search.value = '';
  render();
});
$('#randomBtn').addEventListener('click', () => {
  const game = CATALOG[Math.floor(Math.random() * CATALOG.length)];
  location.href = `/game.html?id=${game.id}`;
});
$('#featuredNextBtn').addEventListener('click', nextFeatured);
$('#favoritesBtn').addEventListener('click', () => {
  activeCategory = '';
  search.value = '';
  const list = CATALOG.filter(game => favorites.has(game.id));
  grid.replaceChildren(...list.map(game => createCard(game)));
  heading.textContent = 'Favorites';
  resultCount.textContent = `${list.length} saved game${list.length === 1 ? '' : 's'}`;
  empty.hidden = list.length > 0;
  loadMore.hidden = true;
  $('#games').scrollIntoView({ behavior:'smooth' });
});
addEventListener('keydown', event => {
  if (event.key === '/' && document.activeElement !== search) {
    event.preventDefault();
    search.focus();
  }
});

saveFavorites();
buildCategories();
buildTrending();
const featuredPool = [...CATALOG].sort((a,b) => (b.rating * 10000 + b.plays) - (a.rating * 10000 + a.plays)).slice(0,80);
setFeatured(featuredPool[0]);
render();
