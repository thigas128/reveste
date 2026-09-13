/* ══════════════════════════════════════
   REVESTE · app.js
══════════════════════════════════════ */

const API = window.location.origin;

// ─── Utilitários ───────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

// Upload de foto → base64 comprimido via canvas
const MAX_FILE_MB = 20;
const MAX_PX = 1200; // largura/altura máxima após redimensionar

function previewImg(input, previewId, hiddenId) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    alert(`A foto deve ter no máximo ${MAX_FILE_MB}MB. Esta tem ${(file.size/1024/1024).toFixed(1)}MB.`);
    input.value = '';
    return;
  }

  const preview = $(previewId);
  preview.innerHTML = '<span>⏳ Processando...</span>';

  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      // Redimensiona via canvas para no máx 1200px (comprime muito)
      let w = img.width, h = img.height;
      if (w > MAX_PX || h > MAX_PX) {
        if (w > h) { h = Math.round(h * MAX_PX / w); w = MAX_PX; }
        else       { w = Math.round(w * MAX_PX / h); h = MAX_PX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      // Qualidade 0.82 → boa imagem, tamanho razoável
      const base64 = canvas.toDataURL('image/jpeg', 0.82);

      // Preview
      preview.innerHTML = `<img src="${base64}" alt="preview">`;
      // Salva no campo hidden
      $(hiddenId).value = base64;

      const kb = Math.round(base64.length * 0.75 / 1024);
      const info = document.createElement('span');
      info.className = 'upload-size';
      info.textContent = `✓ ${w}×${h}px · ${kb < 1024 ? kb+'KB' : (kb/1024).toFixed(1)+'MB'}`;
      preview.appendChild(info);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}
const delay = fn => setTimeout(fn, 100);

function scrollTo(sel) {
  const el = document.querySelector(sel);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function toggleNav() {
  $('mobile-nav').classList.toggle('hidden');
}

// Imagem com fallback elegante
function imgTag(src, alt = '', cls = '') {
  const fallback = `<div class="img-ph">👗</div>`;
  if (!src) return fallback;
  return `<img src="${src}" alt="${alt}" class="${cls}"
    onerror="this.parentElement.innerHTML='${fallback.replace(/'/g,"\\'")}'"
    loading="lazy">`;
}

// Stars
function stars(n) {
  n = Math.round(n);
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

// Número animado
function countUp(el, target) {
  let cur = 0;
  const step = Math.max(1, Math.ceil(target / 40));
  const t = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = cur >= 1000 ? (cur / 1000).toFixed(1) + 'k' : cur;
    if (cur >= target) clearInterval(t);
  }, 28);
}

// ─── API ───────────────────────────────────────────────────────────────────
async function apiFetch(path, method = 'GET', body = null) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) opts.body = JSON.stringify(body);
  try {
    const res = await fetch(API + path, opts);
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`HTTP ${res.status}: ${txt}`);
    }
    return res.json();
  } catch(e) {
    console.error('apiFetch error:', e);
    toast('Erro de conexão. Tente novamente.');
    throw e;
  }
}

// ─── Roteamento ────────────────────────────────────────────────────────────
const pages = ['home', 'listings', 'admin'];

function go(page) {
  pages.forEach(p => $('p-' + p).classList.add('hidden'));
  $('p-' + page).classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (page === 'home')     { loadHomeGrid(); loadStats(); loadReviews(); loadSellers(); }
  if (page === 'listings') { applyFilters(); }
  if (page === 'admin')    { loadAdminListings(); loadAdminReviews(); }
}

// ─── HOME ──────────────────────────────────────────────────────────────────
async function loadHomeGrid() {
  const items = await apiFetch('/api/listings?featured=true&sort=views');
  const grid = $('home-grid');
  if (!grid) return;
  grid.innerHTML = items.slice(0, 8).map(renderCard).join('');
  // Preenche o collage com fotos reais
  loadCollage(items);
}

async function loadCollage(items) {
  const featured = items.filter(i => i.featured).slice(0, 4);
  document.querySelectorAll('.col-card').forEach((el, idx) => {
    const item = featured[idx];
    if (!item) return;
    el.innerHTML = item.image
      ? `<img src="${item.image}" alt="${item.title}" onclick="openDetail(${item.id})">`
      : `<div class="img-ph" onclick="openDetail(${item.id})">👗</div>`;
    el.style.cursor = 'pointer';
  });
}

async function loadStats() {
  const s = await apiFetch('/api/stats');
  countUp($('s-total'), s.total);
  countUp($('s-vendas'), s.vendas);
  countUp($('s-trocas'), s.trocas);
  countUp($('s-membros'), s.membros);
}

async function loadReviews() {
  const reviews = await apiFetch('/api/reviews');
  $('reviews-grid').innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="rv-head">
        ${r.avatar
          ? `<div class="rv-avatar">${imgTag(r.avatar, r.author)}</div>`
          : `<div class="rv-initials">${(r.author||'?')[0].toUpperCase()}</div>`
        }
        <div>
          <div class="rv-name">${r.author}</div>
          <div class="rv-city">📍 ${r.city}</div>
          <div class="rv-stars">${stars(r.rating)}</div>
        </div>
      </div>
      <p class="rv-text">${r.text}</p>
    </div>`).join('');
}

async function loadSellers() {
  const items = await apiFetch('/api/listings');
  // Agrupa por vendedor único (top 6 por mais vendas)
  const map = {};
  items.forEach(i => {
    if (!map[i.seller]) {
      map[i.seller] = { name: i.seller, role: i.sellerRole, rating: i.sellerRating, sales: i.sellerSales, avatar: i.sellerAvatar };
    }
  });
  const sellers = Object.values(map).sort((a, b) => b.sales - a.sales).slice(0, 6);
  $('sellers-grid').innerHTML = sellers.map(s => `
    <div class="seller-card">
      <div class="sc-avatar">${imgTag(s.avatar, s.name)}</div>
      <div class="sc-name">${s.name}</div>
      <div class="sc-role">${s.role || 'Membro'}</div>
      <div class="sc-stars">${stars(s.rating || 5)}</div>
      <div class="sc-sales">${s.sales || 0} vendas realizadas</div>
    </div>`).join('');
}

// ─── CARD ──────────────────────────────────────────────────────────────────
function renderCard(l) {
  const isSwap = l.type === 'troca';
  return `
    <div class="card" onclick="openDetail(${l.id})">
      <div class="card-thumb">
        ${l.image ? `<img src="${l.image}" alt="${l.title}" loading="lazy"
            onerror="this.parentElement.innerHTML='<div class=\\'img-ph\\'>👗</div>'">` : '<div class="img-ph">👗</div>'}
        <span class="card-badge badge-${l.type}">${isSwap ? '🔄 Troca' : '💰 Venda'}</span>
      </div>
      <div class="card-body">
        <div class="card-title">${l.title}</div>
        <div class="card-sub">Tam. ${l.size} · ${l.city}, ${l.state}</div>
        ${isSwap
          ? `<div class="card-price swap">Disponível para troca</div>`
          : `<div class="card-price">R$ ${Number(l.price).toFixed(2).replace('.',',')}</div>`
        }
      </div>
      <div class="card-foot">
        <div class="card-avatar">${imgTag(l.sellerAvatar, l.seller)}</div>
        <span class="card-seller-name">${l.seller}</span>
        <span class="card-views">👁 ${l.views}</span>
      </div>
    </div>`;
}

// ─── DETALHE ───────────────────────────────────────────────────────────────
async function openDetail(id) {
  const l = await apiFetch('/api/listings/' + id);
  const isSwap = l.type === 'troca';
  $('detail-body').innerHTML = `
    <div class="card-thumb" style="height:360px;border-radius:16px;margin-bottom:1.5rem;overflow:hidden">
      ${l.image ? `<img src="${l.image}" alt="${l.title}" class="det-img" style="height:100%;width:100%;object-fit:cover"
          onerror="this.parentElement.innerHTML='<div class=\\'img-ph\\' style=\\'height:360px\\'>👗</div>'">` : '<div class="img-ph" style="height:360px">👗</div>'}
    </div>
    <div class="det-badges">
      <span class="det-badge badge-${l.type}">${isSwap ? '🔄 Troca' : '💰 Venda'}</span>
      <span class="det-badge" style="background:var(--sage-l);color:var(--sage-d)">Tam. ${l.size}</span>
      <span class="det-badge" style="background:var(--fog);color:var(--smoke)">${l.gender}</span>
    </div>
    <h1 class="det-title">${l.title}</h1>
    ${isSwap
      ? `<div class="det-price swap">🔄 Disponível para troca</div>`
      : `<div class="det-price">R$ ${Number(l.price).toFixed(2).replace('.',',')}</div>`
    }
    <p class="det-desc">${l.description}</p>
    <div class="det-info">
      <div class="det-info-item"><label>Categoria</label><span>${l.category}</span></div>
      <div class="det-info-item"><label>Local</label><span>📍 ${l.city}, ${l.state}</span></div>
      <div class="det-info-item"><label>Visualizações</label><span>👁 ${l.views}</span></div>
    </div>
    <div class="det-seller">
      <div class="det-seller-av">${imgTag(l.sellerAvatar, l.seller)}</div>
      <div>
        <div class="det-seller-name">${l.seller}</div>
        <div class="det-seller-meta">
          <span class="det-stars">${stars(l.sellerRating || 5)}</span>
          ${l.sellerRating || 5}/5 · ${l.sellerSales || 0} vendas · ${l.sellerRole || 'Membro'}
        </div>
      </div>
    </div>`;
  openModal('m-detail');
}

// ─── BUSCA HERO ────────────────────────────────────────────────────────────
function heroSearch() {
  const q = $('h-search').value;
  const r = $('h-region').value;
  go('listings');
  delay(() => {
    if (q) $('f-q').value = q;
    if (r) $('f-r').value = r;
    applyFilters();
  });
}

function chip(tag) {
  go('listings');
  delay(() => { $('f-q').value = tag; applyFilters(); });
}

function filterCat(cat) {
  go('listings');
  delay(() => { $('f-cat').value = cat; applyFilters(); });
}

// ─── FILTROS ───────────────────────────────────────────────────────────────
function getPill(groupId) {
  return document.querySelector(`#${groupId} .pill.active`)?.dataset.val || 'todos';
}

function setPill(btn, groupId) {
  document.querySelectorAll(`#${groupId} .pill`).forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  applyFilters();
}

async function applyFilters() {
  const params = new URLSearchParams({
    search: $('f-q')?.value || '',
    region: $('f-r')?.value || '',
    type:   getPill('fg-type'),
    gender: getPill('fg-gender'),
    size:   getPill('fg-size'),
    category: $('f-cat')?.value || 'todos',
    sort:   $('f-sort')?.value || 'newest'
  });
  const items = await apiFetch('/api/listings?' + params);
  const grid = $('explore-grid');
  const count = $('explore-count');
  if (!grid) return;
  count.textContent = `${items.length} peça${items.length !== 1 ? 's' : ''} encontrada${items.length !== 1 ? 's' : ''}`;
  grid.innerHTML = items.map(renderCard).join('') ||
    '<p style="color:var(--ash);padding:2rem 0;grid-column:1/-1">Nenhuma peça encontrada com esses filtros.</p>';
}

function clearFilters() {
  $('f-q').value = '';
  $('f-r').value = '';
  $('f-cat').value = 'todos';
  $('f-sort').value = 'newest';
  ['fg-type','fg-gender','fg-size'].forEach(g => {
    document.querySelectorAll(`#${g} .pill`).forEach(p => p.classList.remove('active'));
    document.querySelector(`#${g} .pill`)?.classList.add('active');
  });
  applyFilters();
}

function setView(v) {
  $('explore-grid').classList.toggle('lv', v === 'list');
  $('vb-grid').classList.toggle('active', v === 'grid');
  $('vb-list').classList.toggle('active', v === 'list');
}

// ─── ADMIN ─────────────────────────────────────────────────────────────────
async function loadAdminListings() {
  const q = $('admin-q')?.value || '';
  const items = await apiFetch('/api/listings?search=' + encodeURIComponent(q));
  $('admin-tbody').innerHTML = items.map(l => `
    <tr>
      <td>${l.image ? `<img src="${l.image}" onerror="this.style.display='none'">` : '—'}</td>
      <td><strong>${l.title}</strong></td>
      <td><span class="card-badge badge-${l.type}" style="position:static;font-size:.7rem">${l.type}</span></td>
      <td>${l.type === 'troca' ? '—' : 'R$ ' + Number(l.price).toFixed(2)}</td>
      <td>${l.seller}</td>
      <td>${l.city}, ${l.state}</td>
      <td>👁 ${l.views}</td>
      <td><div class="act">
        <button class="btn-edit" onclick="editListing(${l.id})">✏ Editar</button>
        <button class="btn-del" onclick="delListing(${l.id})">🗑 Remover</button>
      </div></td>
    </tr>`).join('');
}

async function loadAdminReviews() {
  const reviews = await apiFetch('/api/reviews');
  $('reviews-admin').innerHTML = reviews.map(r => `
    <div class="review-a-card">
      <button class="btn-del" onclick="delReview(${r.id})">🗑</button>
      <div class="rv-head">
        ${r.avatar
          ? `<div class="rv-avatar">${imgTag(r.avatar, r.author)}</div>`
          : `<div class="rv-initials">${(r.author||'?')[0].toUpperCase()}</div>`}
        <div>
          <div class="rv-name">${r.author}</div>
          <div class="rv-city">📍 ${r.city}</div>
          <div class="rv-stars">${stars(r.rating)}</div>
        </div>
      </div>
      <p class="rv-text">${r.text}</p>
    </div>`).join('');
}

function aTab(tab, btn) {
  $('a-anuncios').classList.toggle('hidden', tab !== 'anuncios');
  $('a-avaliacoes').classList.toggle('hidden', tab !== 'avaliacoes');
  document.querySelectorAll('.atab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (tab === 'avaliacoes') loadAdminReviews();
}

async function editListing(id) {
  const l = await apiFetch('/api/listings/' + id);
  $('m-add-title').textContent = 'Editar Anúncio';
  $('e-id').value    = l.id;
  $('e-title').value = l.title;
  $('e-type').value  = l.type;
  $('e-price').value = l.price;
  $('e-size').value  = l.size;
  $('e-gender').value  = l.gender;
  $('e-cat').value   = l.category;
  $('e-city').value  = l.city || '';
  $('e-state').value = l.state || '';
  $('e-seller').value  = l.seller;
  $('e-rating').value  = l.sellerRating;
  $('e-image').value  = l.image || '';
  $('e-avatar').value = l.sellerAvatar || '';
  // Mostra imagem atual no preview se existir
  if (l.image) $('e-image-preview').innerHTML = `<img src="${l.image}" alt="foto roupa">`;
  if (l.sellerAvatar) $('e-avatar-preview').innerHTML = `<img src="${l.sellerAvatar}" alt="foto vendedor">`;
  $('e-desc').value    = l.description;
  $('e-featured').value = l.featured ? 'true' : 'false';
  openModal('m-add');
}

async function delListing(id) {
  if (!confirm('Remover este anúncio?')) return;
  await apiFetch('/api/listings/' + id, 'DELETE');
  toast('Anúncio removido ✓');
  loadAdminListings(); loadHomeGrid(); loadStats();
}

async function delReview(id) {
  if (!confirm('Remover esta avaliação?')) return;
  await apiFetch('/api/reviews/' + id, 'DELETE');
  toast('Avaliação removida ✓');
  loadAdminReviews(); loadReviews();
}

// ─── SALVAR ANÚNCIO ────────────────────────────────────────────────────────
async function saveListing() {
  const title = $('e-title').value.trim();
  const desc  = $('e-desc').value.trim();
  if (!title || !desc) return toast('Preencha título e descrição!');
  const id = $('e-id').value;
  const data = {
    title, description: desc,
    type: $('e-type').value,
    price: parseFloat($('e-price').value) || 0,
    size: $('e-size').value,
    gender: $('e-gender').value,
    category: $('e-cat').value,
    city: $('e-city').value.trim(),
    state: $('e-state').value.trim().toUpperCase(),
    seller: $('e-seller').value || 'Anunciante',
    sellerRating: parseFloat($('e-rating').value) || 5,
    sellerSales: 0,
    image: $('e-image').value.trim(),
    sellerAvatar: $('e-avatar').value.trim(),
    featured: $('e-featured').value === 'true',
    sellerRole: 'Membro'
  };
  if (id) {
    await apiFetch('/api/listings/' + id, 'PUT', data);
    toast('Anúncio atualizado ✓');
  } else {
    await apiFetch('/api/listings', 'POST', data);
    toast('Anúncio publicado ✓');
  }
  closeModal('m-add');
  resetAddForm();
  loadAdminListings(); loadHomeGrid(); loadStats();
}

function resetAddForm() {
  $('m-add-title').textContent = 'Novo Anúncio';
  ['e-id','e-title','e-price','e-city','e-state','e-seller','e-image','e-avatar','e-desc'].forEach(id => {
    const el = $(id); if (el) el.value = '';
  });
  $('e-rating').value = 5;
  $('e-featured').value = 'false';
  // Limpa previews de upload
  const ip = $('e-image-preview');
  if (ip) ip.innerHTML = '<span>📷 Clique para selecionar a foto da roupa</span>';
  const ap = $('e-avatar-preview');
  if (ap) ap.innerHTML = '<span>👤 Clique para selecionar sua foto</span>';
  const ef = $('e-image-file'); if (ef) ef.value = '';
  const af = $('e-avatar-file'); if (af) af.value = '';
}

// ─── SALVAR AVALIAÇÃO ──────────────────────────────────────────────────────
async function saveReview() {
  const author = $('r-name').value.trim();
  const text   = $('r-text').value.trim();
  if (!author || !text) return toast('Preencha nome e texto!');
  await apiFetch('/api/reviews', 'POST', {
    author,
    city: $('r-city').value || 'Brasil',
    rating: parseInt($('r-rating').value) || 5,
    avatar: $('r-avatar').value.trim(),
    text
  });
  toast('Avaliação publicada ✓');
  closeModal('m-review');
  ['r-name','r-city','r-avatar','r-text'].forEach(id => { const el=$(id); if(el) el.value=''; });
  $('r-rating').value = 5;
  loadAdminReviews(); loadReviews();
}

// ─── MODAIS ────────────────────────────────────────────────────────────────
function openModal(id) {
  $(id).classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeModal(id) {
  $(id).classList.add('hidden');
  document.body.style.overflow = '';
  if (id === 'm-add') resetAddForm();
}
function bgClose(e, id) {
  if (e.target.classList.contains('overlay')) closeModal(id);
}

// ─── TOAST ─────────────────────────────────────────────────────────────────
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.add('hidden'), 2800);
}

// ─── INIT ───────────────────────────────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  loadHomeGrid();
  loadStats();
  loadReviews();
  loadSellers();
});
