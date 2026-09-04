const TYPES = [
  { key:'dodge', label:'Dodge', cats:['Action','Survival','Skill'], players:[1,2,3,4] },
  { key:'arena', label:'Arena Rush', cats:['Action','Multiplayer','Local Co-op'], players:[2,3,4] },
  { key:'pong', label:'Neon Pong', cats:['Sports','Classic','Multiplayer'], players:[2] },
  { key:'snake', label:'Snake Clash', cats:['Classic','Arcade','Multiplayer'], players:[1,2,3,4] },
  { key:'collect', label:'Star Sprint', cats:['Arcade','Skill','Local Co-op'], players:[1,2,3,4] },
  { key:'runner', label:'Pixel Runner', cats:['Arcade','Action','Reflex'], players:[1] },
  { key:'breakout', label:'Brick Burst', cats:['Classic','Arcade','Skill'], players:[1,2] },
  { key:'reaction', label:'Reaction Grid', cats:['Reflex','Party','Multiplayer'], players:[1,2,3,4] },
  { key:'maze', label:'Maze Dash', cats:['Puzzle','Skill','Local Co-op'], players:[1,2,3,4] },
  { key:'survive', label:'Meteor Panic', cats:['Survival','Action','Arcade'], players:[1,2,3,4] }
];

const ADJ = ['Turbo','Neon','Hyper','Pixel','Cosmic','Rapid','Shadow','Electric','Mega','Retro','Nova','Wild'];
const NOUN = ['Rush','Rumble','Blitz','Quest','Clash','Dash','Storm','Sprint','Arena','Mania'];

function hash(n) {
  let x = n | 0;
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  x = Math.imul(x ^ (x >>> 16), 0x45d9f3b);
  return (x ^ (x >>> 16)) >>> 0;
}

export function createCatalog() {
  const games = [];
  for (let i = 0; i < 1200; i++) {
    const type = TYPES[i % TYPES.length];
    const seed = hash(i + 9187);
    const players = type.players[(seed >>> 4) % type.players.length];
    const difficulty = 1 + ((seed >>> 8) % 5);
    const title = `${ADJ[(seed >>> 12) % ADJ.length]} ${type.label} ${NOUN[(seed >>> 17) % NOUN.length]} #${String(i + 1).padStart(4,'0')}`;
    const categories = [...new Set([...type.cats, `${players} Player`, players > 1 ? 'Multiplayer' : 'Single Player'])];
    games.push({
      id: `g${String(i + 1).padStart(4,'0')}`,
      index: i,
      title,
      type: type.key,
      typeLabel: type.label,
      players,
      difficulty,
      categories,
      seed,
      plays: 400 + (seed % 250000),
      rating: Number((3.8 + ((seed % 120) / 100)).toFixed(1)),
      speed: 0.8 + ((seed % 80) / 100),
      target: 8 + (seed % 18)
    });
  }
  return games;
}

const CATALOG = createCatalog();
export function getGameById(id) { return CATALOG.find(g => g.id === id) || null; }
export function getCategories() {
  const set = new Set();
  CATALOG.forEach(g => g.categories.forEach(c => set.add(c)));
  return [...set].sort((a,b) => a.localeCompare(b));
}
export { CATALOG };
