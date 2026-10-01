'use strict';
const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
// Ícones de interface simples. As imagens de veículos ficam em assets/.
const paths = {
  car: '<path d="m5 10 2-5h10l2 5M4 10h16v8H4zM7 18v2m10-2v2M7 13h2m6 0h2"/>',
  shield: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6zM8 12l3 3 5-6"/>',
  key: '<circle cx="8" cy="8" r="5"/><path d="m12 12 9 9m-4-4 3-3m-6 0 3-3"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 5h4m-3 14h2"/>',
  document: '<path d="M5 3h10l4 4v14H5zM14 3v5h5M8 12h8m-8 4h6"/>',
  tool: '<path d="M14 4a6 6 0 0 0-7 8l-4 6a2 2 0 0 0 3 3l6-5a6 6 0 0 0 8-7l-4 4-5-5z"/>',
  tire: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/><path d="M12 3v5m0 8v5M3 12h5m8 0h5"/>',
  chat: '<path d="M21 11a9 9 0 0 1-13 8l-5 2 1-6a9 9 0 1 1 17-4Z"/><path d="M8 10h8m-8 4h5"/>'
};
function icon(name) { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.car}</svg>`; }
$$('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon));
const config = window.SITE_CONFIG;
// Use textContent para manter os textos editáveis separados da marcação.
function renderCars(filter = 'todos') {
  const grid = $('#car-grid'); grid.replaceChildren();
  config.cars.filter(c => filter === 'todos' || c.id === filter).forEach(car => {
    const card = document.createElement('article'); card.className = 'car-card';
    const visual = document.createElement('div'); visual.className = 'car-visual';
    const img = document.createElement('img'); img.src = `assets/${car.image}`; img.alt = car.example; img.loading = 'lazy'; visual.append(img);
    const body = document.createElement('div'); body.className = 'car-body';
    const title = document.createElement('h3'); title.textContent = car.name;
    const description = document.createElement('p'); description.textContent = car.description;
    const button = document.createElement('button'); button.className = 'button outline'; button.textContent = 'Explorar categoria'; button.setAttribute('aria-label', `Explorar ${car.name}`); button.addEventListener('click', () => openQuote(car.id));
    body.append(title, description, button); card.append(visual, body); grid.append(card);
  });
}
renderCars();
config.benefits.forEach(b => {
  const card = document.createElement('article');
  const symbol = document.createElement('span'); symbol.className = 'benefit-symbol'; symbol.innerHTML = icon(b.icon);
  const title = document.createElement('h3'); title.textContent = b.title;
  const text = document.createElement('p'); text.textContent = b.text;
  card.append(symbol, title, text); $('#advantages-grid').append(card);
});
config.cars.forEach(c => { const option = document.createElement('option'); option.value = c.id; option.textContent = c.name; $('#category').append(option); });
$$('[data-filter]').forEach(button => button.addEventListener('click', () => {
  $$('[data-filter]').forEach(b => { b.classList.toggle('selected', b === button); b.setAttribute('aria-pressed', String(b === button)); });
  renderCars(button.dataset.filter);
}));
let slide = 0;
function showSlide(next) {
  slide = (next + 2) % 2;
  $$('[data-slide]').forEach(s => { s.hidden = Number(s.dataset.slide) !== slide; });
  $$('[data-go-slide]').forEach(dot => { const active = Number(dot.dataset.goSlide) === slide; dot.classList.toggle('active', active); dot.setAttribute('aria-current', String(active)); });
}
$('#previous').addEventListener('click', () => showSlide(slide - 1));
$('#next').addEventListener('click', () => showSlide(slide + 1));
$$('[data-go-slide]').forEach(b => b.addEventListener('click', () => showSlide(Number(b.dataset.goSlide))));
const menu = $('.menu-toggle');
menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(open)); menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu'); $('#navigation').classList.toggle('open', open); });
$$('#navigation a').forEach(a => a.addEventListener('click', closeMenu));
function closeMenu() { menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Abrir menu'); $('#navigation').classList.remove('open'); }
document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
const dialog = $('#quote-dialog');
function openQuote(category) { if (category) $('#category').value = category; $('#quote-form').hidden = false; $('#plan-result').hidden = true; dialog.showModal(); }
$$('[data-quote]').forEach(button => button.addEventListener('click', () => openQuote()));
$$('[data-about]').forEach(button => button.addEventListener('click', () => $('#about-dialog').showModal()));
$$('[data-close]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
let summary = '';
$('#quote-form').addEventListener('submit', event => {
  event.preventDefault();
  const car = config.cars.find(c => c.id === $('#category').value);
  summary = `${car.name} · ${$('#duration').value} · ${$('#mileage').value} por mês`;
  $('#plan-text').textContent = summary; $('#quote-form').hidden = true; $('#plan-result').hidden = false; $('#download-plan').focus();
});
$('#edit-plan').addEventListener('click', () => { $('#quote-form').hidden = false; $('#plan-result').hidden = true; $('#category').focus(); });
$('#download-plan').addEventListener('click', () => {
  const blob = new Blob([`RESUMO DE PREFERÊNCIAS\n\n${summary}\n\nDemonstração sem valor de proposta comercial. Nenhum pedido foi enviado.\n`], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'meu-plano.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
});
