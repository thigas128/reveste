    title: 'Moletom Básico Preto',
      price: 89.00,
      size: 'GG',
      gender: 'unissex',
      category: 'moletons',
      city: 'Porto Alegre', state: 'RS',
      description: 'Moletom preto quentinho, 100% algodão. Pouquíssimo uso. Ideal para o inverno gaúcho.',
      seller: 'Gabriel Pereira',
      sellerRole: 'Negociante',
      sellerRating: 4.6,
      sellerSales: 8,
      image: 'imgs/roupa-placeholder-7.jpg',
      sellerAvatar: 'imgs/user-placeholder-7.jpg',
      date: '2025-04-04', views: 95, featured: false
    },
    {
      id: 8,
      type: 'troca',
      title: 'Camiseta Streetwear Grafite',
      price: 0,
      size: 'G',
      gender: 'masculino',
      category: 'camisetas',
      city: 'Salvador', state: 'BA',
      description: 'Camiseta oversized com estampa grafite street art. Troco por tênis ou calças tam G.',
      seller: 'Diego Lima',
      sellerRole: 'Membro',
      sellerRating: 4.4,
      sellerSales: 4,
      image: 'imgs/roupa-placeholder-8.jpg',
      sellerAvatar: 'imgs/user-placeholder-8.jpg',
      date: '2025-04-03', views: 61, featured: false
    }
  ],

  reviews: [
    { id: 1, author: 'Isabela Fontes', city: 'São Paulo', rating: 5, avatar: 'imgs/user-placeholder-1.jpg', text: 'Melhor plataforma de moda circular que já usei! Encontrei peças incríveis perto de casa. A busca por região é perfeita.', date: '2025-04-01' },
    { id: 2, author: 'Mateus Oliveira', city: 'Rio de Janeiro', rating: 5, avatar: 'imgs/user-placeholder-2.jpg', text: 'Fiz 3 trocas em menos de uma semana. Comunidade muito receptiva e as peças chegaram exatamente como descritas.', date: '2025-03-28' },
    { id: 3, author: 'Priscila Ramos', city: 'Curitiba', rating: 5, avatar: 'imgs/user-placeholder-3.jpg', text: 'O sistema de avaliação dos vendedores me deu muita segurança. Já indiquei para todas as amigas!', date: '2025-03-22' },
    { id: 4, author: 'Vinícius Castro', city: 'Belo Horizonte', rating: 4, avatar: 'imgs/user-placeholder-4.jpg', text: 'Excelente custo-benefício. Renovei o guarda-roupa inteiro gastando menos do que compraria uma peça nova.', date: '2025-03-18' },
    { id: 5, author: 'Amanda Nogueira', city: 'Fortaleza', rating: 5, avatar: 'imgs/user-placeholder-5.jpg', text: 'Moda sustentável de verdade! Adoro saber que estou ajudando o planeta enquanto renovo meu estilo.', date: '2025-03-12' },
    { id: 6, author: 'Henrique Souza', city: 'Porto Alegre', rating: 5, avatar: 'imgs/user-placeholder-6.jpg', text: 'Interface linda, super fácil de usar no celular. Encontrei um blazer incrível a 3 bairros de distância.', date: '2025-03-05' }
  ],

  nextId: 9
};

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function json(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json', ...CORS });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', c => raw += c);
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}); }
      catch (e) { reject(e); }
    });
  });
}

// ─────────────────────────────────────────────
// SERVER
// ─────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const { pathname, query: q } = url.parse(req.url, true);
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, CORS);
    return res.end();
  }

  // ── GET /api/listings ──────────────────────
  if (pathname === '/api/listings' && method === 'GET') {
    let r = [...db.listings];
    if (q.type && q.type !== 'todos') r = r.filter(l => l.type === q.type);
    if (q.region) {
      const s = q.region.toLowerCase();
      r = r.filter(l =>
        l.city.toLowerCase().includes(s) ||
        l.state.toLowerCase().includes(s)
      );
    }
    if (q.category && q.category !== 'todos') r = r.filter(l => l.category === q.category);
    if (q.size && q.size !== 'todos') r = r.filter(l => l.size === q.size);
    if (q.gender && q.gender !== 'todos') r = r.filter(l => l.gender === q.gender);
    if (q.search) {
      const s = q.search.toLowerCase();
      r = r.filter(l =>
        l.title.toLowerCase().includes(s) ||
        l.description.toLowerCase().includes(s) ||
        l.seller.toLowerCase().includes(s)
      );
    }
    if (q.featured === 'true') r = r.filter(l => l.featured);
    if (q.sort === 'price_asc') r.sort((a, b) => a.price - b.price);
    else if (q.sort === 'price_desc') r.sort((a, b) => b.price - a.price);
    else if (q.sort === 'views') r.sort((a, b) => b.views - a.views);
    else r.sort((a, b) => new Date(b.date) - new Date(a.date));
    return json(res, r);
  }

  // ── GET /api/listings/:id ──────────────────
  const lMatch = pathname.match(/^\/api\/listings\/(\d+)$/);
  if (lMatch && method === 'GET') {
    const item = db.listings.find(l => l.id === +lMatch[1]);
    if (!item) return json(res, { error: 'Not found' }, 404);
    item.views++;
    return json(res, item);
  }

  // ── POST /api/listings ─────────────────────
  if (pathname === '/api/listings' && method === 'POST') {
    const data = await parseBody(req);
    const listing = { ...data, id: db.nextId++, date: new Date().toISOString().split('T')[0], views: 0 };
    db.listings.push(listing);
    return json(res, listing, 201);
  }

  // ── PUT /api/listings/:id ──────────────────
  if (lMatch && method === 'PUT') {
    const idx = db.listings.findIndex(l => l.id === +lMatch[1]);
    if (idx === -1) return json(res, { error: 'Not found' }, 404);
    const data = await parseBody(req);
    db.listings[idx] = { ...db.listings[idx], ...data, id: +lMatch[1] };
    return json(res, db.listings[idx]);
  }

  // ── DELETE /api/listings/:id ───────────────
  if (lMatch && method === 'DELETE') {
    const idx = db.listings.findIndex(l => l.id === +lMatch[1]);
    if (idx === -1) return json(res, { error: 'Not found' }, 404);
    db.listings.splice(idx, 1);
    return json(res, { ok: true });
  }

  // ── GET /api/reviews ───────────────────────
  if (pathname === '/api/reviews' && method === 'GET') {
    return json(res, db.reviews);
  }

  // ── POST /api/reviews ──────────────────────
  if (pathname === '/api/reviews' && method === 'POST') {
    const data = await parseBody(req);
    const review = { ...data, id: db.reviews.length + 1, date: new Date().toISOString().split('T')[0] };
    db.reviews.push(review);
    return json(res, review, 201);
  }

  // ── DELETE /api/reviews/:id ────────────────
  const rMatch = pathname.match(/^\/api\/reviews\/(\d+)$/);
  if (rMatch && method === 'DELETE') {
    const idx = db.reviews.findIndex(r => r.id === +rMatch[1]);
    if (idx === -1) return json(res, { error: 'Not found' }, 404);
    db.reviews.splice(idx, 1);
    return json(res, { ok: true });
  }

  // ── GET /api/stats ─────────────────────────
  if (pathname === '/api/stats' && method === 'GET') {
    return json(res, {
      total: db.listings.length,
      vendas: db.listings.filter(l => l.type === 'venda').length,
      trocas: db.listings.filter(l => l.type === 'troca').length,
      estados: [...new Set(db.listings.map(l => l.state))].length,
      membros: 1240
    });
  }

  // ── Arquivos estáticos ─────────────────────
  let filePath = path.join(__dirname, 'public', pathname === '/' ? '/index.html' : pathname);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n✅ Reveste rodando em http://localhost:${PORT}\n`);
});
