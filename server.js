const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// ─────────────────────────────────────────────
// BANCO DE DADOS EM MEMÓRIA
// Substitua os campos "image" pelas fotos reais
// quando você enviá-las
// ─────────────────────────────────────────────
let db = {
  listings: [
    {
      id: 1,
      type: 'venda',
      title: 'Jaqueta Jeans Oversized',
      price: 95.00,
      size: 'M',
      gender: 'feminino',
      category: 'casacos',
      city: 'São Paulo', state: 'SP',
      description: 'Jaqueta jeans oversized em ótimo estado. Estilo vintage, combina com tudo. Comprada em brechó europeu.',
      seller: 'Camila Reis',
      sellerRole: 'Vendedora verificada',
      sellerRating: 4.9,
      sellerSales: 42,
      // ⬇ Troque pela foto real quando enviar
      image: 'imgs/roupa-placeholder-1.jpg',
      sellerAvatar: 'imgs/user-placeholder-1.jpg',
      date: '2025-04-10', views: 218, featured: true
    },
    {
      id: 2,
      type: 'troca',
      title: 'Vestido Midi Floral',
      price: 0,
      size: 'P',
      gender: 'feminino',
      category: 'vestidos',
      city: 'Campinas', state: 'SP',
      description: 'Vestido floral midi levíssimo, perfeito para o calor. Aceito troca por blusas ou calças tam. P.',
      seller: 'Letícia Mano',
      sellerRole: 'Negociante',
      sellerRating: 5.0,
      sellerSales: 17,
      image: 'imgs/roupa-placeholder-2.jpg',
      sellerAvatar: 'imgs/user-placeholder-2.jpg',
      date: '2025-04-09', views: 134, featured: true
    },
    {
      id: 3,
      type: 'venda',
      title: 'Tênis Chunky Branco',
      price: 189.00,
      size: '38',
      gender: 'feminino',
      category: 'calcados',
      city: 'Rio de Janeiro', state: 'RJ',
      description: 'Tênis chunky branco estilo dad shoe. Usado 3x. Acompanha caixa original e nota fiscal.',
      seller: 'Fernanda Cruz',
      sellerRole: 'Vendedora verificada',
      sellerRating: 4.8,
      sellerSales: 29,
      image: 'imgs/roupa-placeholder-3.jpg',
      sellerAvatar: 'imgs/user-placeholder-3.jpg',
      date: '2025-04-08', views: 301, featured: true
    },
    {
      id: 4,
      type: 'venda',
      title: 'Blazer Alfaiataria Caramelo',
      price: 175.00,
      size: 'G',
      gender: 'unissex',
      category: 'blazers',
      city: 'Belo Horizonte', state: 'MG',
      description: 'Blazer de alfaiataria tom caramelo. Fechamento com botões dourados. Elegante e versátil.',
      seller: 'Rafael Torres',
      sellerRole: 'Negociante',
      sellerRating: 4.7,
      sellerSales: 11,
      image: 'imgs/roupa-placeholder-4.jpg',
      sellerAvatar: 'imgs/user-placeholder-4.jpg',
      date: '2025-04-07', views: 189, featured: false
    },
    {
      id: 5,
      type: 'troca',
      title: 'Calça Cargo Verde Oliva',
      price: 0,
      size: 'M',
      gender: 'masculino',
      category: 'calcas',
      city: 'Curitiba', state: 'PR',
      description: 'Calça cargo verde oliva streetwear. Troco por camisas ou moletons tam M.',
      seller: 'Bruno Salave',
      sellerRole: 'Membro',
      sellerRating: 4.5,
      sellerSales: 6,
      image: 'imgs/roupa-placeholder-5.jpg',
      sellerAvatar: 'imgs/user-placeholder-5.jpg',
      date: '2025-04-06', views: 77, featured: false
    },
    {
      id: 6,
      type: 'venda',
      title: 'Conjunto Cropped + Saia',
      price: 120.00,
      size: 'PP',
      gender: 'feminino',
      category: 'conjuntos',
      city: 'Fortaleza', state: 'CE',
      description: 'Conjunto cropped + saia midi em tecido canelado rosé. Nunca usado, tag original.',
      seller: 'Yasmin Alves',
      sellerRole: 'Vendedora verificada',
      sellerRating: 5.0,
      sellerSales: 23,
      image: 'imgs/roupa-placeholder-6.jpg',
      sellerAvatar: 'imgs/user-placeholder-6.jpg',
      date: '2025-04-05', views: 260, featured: true
    },
    {
      id: 7,
      type: 'venda',
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
    },

    // ── SOCIAL ──────────────────────────────────
    {
      id: 9,
      type: 'venda',
      title: 'Camisa Social Oxford Branca',
      price: 79.00,
      size: 'M',
      gender: 'masculino',
      category: 'social',
      city: 'São Paulo', state: 'SP',
      description: 'Camisa social Oxford 100% algodão, cor branca. Perfeita para reuniões, entrevistas e eventos. Usada 2x, impecável.',
      seller: 'André Moreira',
      sellerRole: 'Vendedor verificado',
      sellerRating: 4.8,
      sellerSales: 19,
      image: 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=600&q=80',
      sellerAvatar: '',
      date: '2025-04-11', views: 144, featured: true
    },
    {
      id: 10,
      type: 'venda',
      title: 'Terno Slim Fit Cinza Chumbo',
      price: 320.00,
      size: 'G',
      gender: 'masculino',
      category: 'social',
      city: 'Brasília', state: 'DF',
      description: 'Terno slim fit cinza chumbo, duas peças (paletó + calça). Tecido de alta qualidade, forro completo. Usado em apenas um evento.',
      seller: 'Marcelo Ávila',
      sellerRole: 'Negociante',
      sellerRating: 4.9,
      sellerSales: 7,
      image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&q=80',
      sellerAvatar: '',
      date: '2025-04-10', views: 203, featured: true
    },
    {
      id: 11,
      type: 'troca',
      title: 'Vestido Social Midi Preto',
      price: 0,
      size: 'M',
      gender: 'feminino',
      category: 'social',
      city: 'Rio de Janeiro', state: 'RJ',
      description: 'Vestido midi preto social, decote V com detalhe de botões. Ideal para trabalho ou eventos formais. Troco por vestidos ou blusas sociais tam. M.',
      seller: 'Bianca Torres',
      sellerRole: 'Membro',
      sellerRating: 4.7,
      sellerSales: 11,
      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&q=80',
      sellerAvatar: '',
      date: '2025-04-09', views: 178, featured: false
    },
    {
      id: 12,
      type: 'venda',
      title: 'Calça Social Reta Preta',
      price: 110.00,
      size: 'G',
      gender: 'unissex',
      category: 'social',
      city: 'Curitiba', state: 'PR',
      description: 'Calça social reta preta, tecido de alfaiataria com caimento perfeito. Combina com blazer, camisa ou blusa. Zero uso.',
      seller: 'Tatiane Melo',
      sellerRole: 'Vendedora verificada',
      sellerRating: 5.0,
      sellerSales: 34,
      image: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80',
      sellerAvatar: '',
      date: '2025-04-08', views: 132, featured: false
    },
    {
      id: 13,
      type: 'venda',
      title: 'Blazer Social Azul Marinho',
      price: 195.00,
      size: 'M',
      gender: 'masculino',
      category: 'social',
      city: 'Porto Alegre', state: 'RS',
      description: 'Blazer social azul marinho slim, botões dourados. Perfeito para o dia a dia no trabalho ou jantares. Excelente estado.',
      seller: 'Felipe Nunes',
      sellerRole: 'Negociante',
      sellerRating: 4.6,
      sellerSales: 15,
      image: 'https://images.unsplash.com/photo-1555069519-127aadecd574?w=600&q=80',
      sellerAvatar: '',
      date: '2025-04-07', views: 167, featured: true
    },

    // ── STREETWEAR ───────────────────────────────
    {
      id: 14,
      type: 'venda',
      title: 'Moletom Canguru Off-White',
      price: 149.00,
      size: 'G',
      gender: 'unissex',
      category: 'moletons',
      city: 'São Paulo', state: 'SP',
      description: 'Moletom canguru estilo off-white, logo bordado no peito. Tecido pesado e quentinho. Streetwear autêntico, pouquíssimo uso.',
      seller: 'Kaio Ramos',
      sellerRole: 'Negociante',
      sellerRating: 4.8,
      sellerSales: 22,
      image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80',
      sellerAvatar: '',
      date: '2025-04-11', views: 289, featured: true
    },
    {
      id: 15,
      type: 'troca',
      title: 'Calça Baggy Wide Leg Preta',
      price: 0,
      size: 'M',
      gender: 'unissex',
      category: 'calcas',
      city: 'Belo Horizonte', state: 'MG',
      description: 'Calça baggy wide leg preta, estilo japonês streetwear. Cintura alta, corte amplo. Troco por tênis ou camisetas oversize tam. M.',
      seller: 'Nathalia Gomes',
      sellerRole: 'Membro',
      sellerRating: 4.5,
      sellerSales: 9,
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=80',
      sellerAvatar: '',
      date: '2025-04-10', views: 198, featured: false
    },
    {
      id: 16,
      type: 'venda',
      title: 'Jaqueta Corta-Vento Refletiva',
      price: 210.00,
      size: 'M',
      gender: 'unissex',
      category: 'casacos',
      city: 'Recife', state: 'PE',
      description: 'Jaqueta corta-vento com detalhes refletivos, estilo streetwear técnico. Impermeável, leve. Perfeita para o visual urbano.',
      seller: 'Érick Barbosa',
      sellerRole: 'Vendedor verificado',
      sellerRating: 4.9,
      sellerSales: 31,
      image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
      sellerAvatar: '',
      date: '2025-04-09', views: 241, featured: true
    },
    {
      id: 17,
      type: 'venda',
      title: 'Camiseta Oversized Grafite NYC',
      price: 65.00,
      size: 'GG',
      gender: 'unissex',
      category: 'camisetas',
      city: 'Manaus', state: 'AM',
      description: 'Camiseta oversized com estampa NYC grafite em silk. Tecido pesado drop shoulder. Estética hip-hop/streetwear clássica.',
      seller: 'Wesley Dias',
      sellerRole: 'Membro',
      sellerRating: 4.4,
      sellerSales: 6,
      image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80',
      sellerAvatar: '',
      date: '2025-04-08', views: 115, featured: false
    },
    {
      id: 18,
      type: 'troca',
      title: 'Tênis Plataforma Chunky Preto',
      price: 0,
      size: '40',
      gender: 'unissex',
      category: 'calcados',
      city: 'Florianópolis', state: 'SC',
      description: 'Tênis chunky plataforma preto, solado grosso estilo Y2K streetwear. Usado 4x. Troco por tênis colorido ou roupas oversize.',
      seller: 'Jéssica Leal',
      sellerRole: 'Negociante',
      sellerRating: 4.7,
      sellerSales: 14,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
      sellerAvatar: '',
      date: '2025-04-07', views: 176, featured: false
    },
    {
      id: 19,
      type: 'venda',
      title: 'Boné Snapback Preto Aba Reta',
      price: 45.00,
      size: 'único',
      gender: 'unissex',
      category: 'acessorios',
      city: 'Goiânia', state: 'GO',
      description: 'Boné snapback aba reta preto com bordado lateral. Estilo hip-hop clássico. Regulagem traseira, serve em todos. Perfeito estado.',
      seller: 'Samuel Freitas',
      sellerRole: 'Membro',
      sellerRating: 4.3,
      sellerSales: 3,
      image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80',
      sellerAvatar: '',
      date: '2025-04-06', views: 88, featured: false
    },
    {
      id: 20,
      type: 'venda',
      title: 'Conjunto Streetwear Agasalho',
      price: 185.00,
      size: 'M',
      gender: 'masculino',
      category: 'conjuntos',
      city: 'Salvador', state: 'BA',
      description: 'Conjunto agasalho streetwear: blusa de moletom + calça jogger combinando. Tecido plush grosso. Visual completo para o inverno urbano.',
      seller: 'Igor Santana',
      sellerRole: 'Vendedor verificado',
      sellerRating: 4.8,
      sellerSales: 27,
      image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=600&q=80',
      sellerAvatar: '',
      date: '2025-04-05', views: 223, featured: true
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

  nextId: 21
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
    const chunks = [];
    let size = 0;
    const MAX = 40 * 1024 * 1024; // 40MB (base64 e ~33% maior)
    req.on('data', c => {
      size += c.length;
      if (size > MAX) { reject(new Error('Payload too large')); return; }
      chunks.push(typeof c === 'string' ? Buffer.from(c) : c);
    });
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) { reject(e); }
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
  // Tenta primeiro na pasta public/, depois na raiz
  let reqPath = pathname === '/' ? '/index.html' : pathname;
  // Remove /public/ do início se vier assim
  if (reqPath.startsWith('/public/')) reqPath = reqPath.replace('/public/', '/');

  const tryPaths = [
    path.join(__dirname, 'public', reqPath),
    path.join(__dirname, reqPath)
  ];

  function tryNext(paths) {
    if (!paths.length) { res.writeHead(404); return res.end('Not found'); }
    fs.readFile(paths[0], (err, data) => {
      if (err) return tryNext(paths.slice(1));
      res.writeHead(200, { 'Content-Type': MIME[path.extname(paths[0])] || 'application/octet-stream' });
      res.end(data);
    });
  }
  tryNext(tryPaths);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n✅ Reveste rodando em http://localhost:${PORT}\n`);
});
