// ============================================================================
// Robbi Berkah Teknik — Product Loader with Dynamic Sidebar
// Sidebar kategori & sub-kategori di-generate otomatis dari products.json
// ============================================================================

let products = [];
let currentFilter = { category: 'all', subcategory: null };
let currentSearch = '';

const container = document.getElementById('product-list');
const categoryNav = document.getElementById('categoryNav');
const currentFilterLabel = document.getElementById('currentFilter');
const productCount = document.getElementById('productCount');

// ============================================================================
// HELPERS
// ============================================================================

// Konversi 'sepatu-safety' → 'Sepatu Safety'
function prettyLabel(str) {
  if (!str) return '';
  return str.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Fallback image — dipanggil via onerror jika gambar gagal load
// Generate SVG inline berwarna hijau dengan nama produk sebagai teks
function handleImageError(img, productName) {
  img.onerror = null; // Prevent infinite loop
  const safeName = (productName || 'Produk')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#2AF716"/>
        <stop offset="1" stop-color="#0A3D24"/>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#g)"/>
    <text x="50%" y="50%" font-family="sans-serif" font-size="22" font-weight="600" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${safeName}</text>
  </svg>`;
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

// Buat icon SVG untuk kategori (berdasarkan kata kunci di nama kategori)
function categoryIcon(cat) {
  const c = cat.toLowerCase();
  // Helm / Head Protection
  if (
    c.includes('helm') ||
    c.includes('helmet') ||
    c.includes('head') ||
    c.includes('kepala')
  ) {
    // Hard hat icon — kubah + brim lurus + tombol ventilasi (clean dome style)
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 18h20"/><path d="M4 18c0-5 3.5-9 8-9s8 4 8 9"/><path d="M12 9V6"/><path d="M9 6h6"/></svg>`;
  }
  // Sepatu / boot
  if (c.includes('sepatu') || c.includes('shoe') || c.includes('boot')) {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17h18v3H3zM5 17V9a3 3 0 0 1 3-3h2l2 4h2a4 4 0 0 1 4 4v3"></path></svg>`;
  }
  // Rompi / vest
  if (c.includes('rompi') || c.includes('vest')) {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3l4 4 4-4h3v18H5V3z"></path></svg>`;
  }
  // Sarung tangan
  if (c.includes('sarung') || c.includes('glove')) {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 21V10a2 2 0 0 1 4 0v3M11 9V5a2 2 0 0 1 4 0v7M15 8a2 2 0 0 1 4 0v8a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5"></path></svg>`;
  }
  // Kacamata
  if (c.includes('kaca') || c.includes('glasses') || c.includes('goggle')) {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="14" r="4"></circle><circle cx="18" cy="14" r="4"></circle><line x1="10" y1="14" x2="14" y2="14"></line></svg>`;
  }
  // Masker
  if (c.includes('masker') || c.includes('mask')) {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10v4a2 2 0 0 0 1 1.7l7 4a2 2 0 0 0 2 0l7-4a2 2 0 0 0 1-1.7v-4"></path><path d="M3 10l9-5 9 5"></path></svg>`;
  }
  // Harness
  if (
    c.includes('harness') ||
    c.includes('safety belt') ||
    c.includes('body')
  ) {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M6 6l12 12M18 6L6 18"></path></svg>`;
  }
  // Default: tag icon
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>`;
}

// ============================================================================
// BUILD CATEGORY TREE FROM PRODUCTS
// Struktur hasil:
// {
//   "helm": { count: 3, subcategories: { "MSA": 2 } },
//   "sepatu-safety": { count: 2, subcategories: { "King's": 2 } },
//   ...
// }
// ============================================================================
function buildCategoryTree(data) {
  const tree = {};

  data.forEach((p) => {
    if (!p.category) return;
    if (!tree[p.category]) {
      tree[p.category] = { count: 0, subcategories: {} };
    }
    tree[p.category].count++;

    if (p.subcategory) {
      if (!tree[p.category].subcategories[p.subcategory]) {
        tree[p.category].subcategories[p.subcategory] = 0;
      }
      tree[p.category].subcategories[p.subcategory]++;
    }
  });

  return tree;
}

// ============================================================================
// RENDER SIDEBAR (AUTO from JSON)
// ============================================================================
function renderSidebar() {
  const tree = buildCategoryTree(products);
  const totalCount = products.length;

  let html = `
    <button class="cat-item cat-main active" data-category="all" data-subcategory="">
      <span class="cat-icon">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
      </span>
      <span class="cat-label">Semua Produk</span>
      <span class="cat-count">${totalCount}</span>
    </button>
  `;

  // Loop kategori (urutan dari data / alfabet)
  const sortedCats = Object.keys(tree).sort();

  sortedCats.forEach((cat) => {
    const info = tree[cat];
    const subs = Object.keys(info.subcategories).sort();
    const hasSubs = subs.length > 0;

    html += `
      <div class="cat-group ${hasSubs ? 'has-subs' : ''}">
        <button class="cat-item cat-main" data-category="${cat}" data-subcategory="">
          <span class="cat-icon">${categoryIcon(cat)}</span>
          <span class="cat-label">${prettyLabel(cat)}</span>
          <span class="cat-count">${info.count}</span>
          ${
            hasSubs
              ? `<span class="cat-chevron">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
          </span>`
              : ''
          }
        </button>
    `;

    if (hasSubs) {
      html += `<div class="cat-sub-list">`;
      subs.forEach((sub) => {
        html += `
          <button class="cat-item cat-sub" data-category="${cat}" data-subcategory="${sub}">
            <span class="cat-sub-dot"></span>
            <span class="cat-label">${sub}</span>
            <span class="cat-count">${info.subcategories[sub]}</span>
          </button>
        `;
      });
      html += `</div>`;
    }

    html += `</div>`;
  });

  categoryNav.innerHTML = html;
  bindSidebarEvents();
}

// ============================================================================
// SIDEBAR EVENTS
// ============================================================================
function bindSidebarEvents() {
  // Category click
  categoryNav.querySelectorAll('.cat-item').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const cat = btn.dataset.category;
      const sub = btn.dataset.subcategory || null;

      // Kalau user klik kategori utama yang punya sub & sedang dalam kondisi expanded → toggle expand/collapse saja
      const group = btn.closest('.cat-group');
      if (
        btn.classList.contains('cat-main') &&
        group &&
        group.classList.contains('has-subs')
      ) {
        // Toggle expansion — tapi juga tetap filter
        group.classList.toggle('expanded');
      }

      // Update filter state
      currentFilter = { category: cat, subcategory: sub };
      currentSearch = document
        .getElementById('search')
        .value.toLowerCase()
        .trim();

      // Update active state
      categoryNav
        .querySelectorAll('.cat-item')
        .forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // Expand parent group if sub clicked
      if (btn.classList.contains('cat-sub') && group) {
        group.classList.add('expanded');
      }

      // Update label
      if (cat === 'all') {
        currentFilterLabel.textContent = 'Semua Produk';
      } else if (sub) {
        currentFilterLabel.textContent = `${prettyLabel(cat)} › ${sub}`;
      } else {
        currentFilterLabel.textContent = prettyLabel(cat);
      }

      applyFilters();

      // Close sidebar on mobile
      if (window.innerWidth < 992) closeSidebar();
    });
  });

  // Auto-expand group that has an active sub — pada first load pertama tidak relevan
}

// ============================================================================
// FILTER & RENDER PRODUCTS
// ============================================================================
function applyFilters() {
  let filtered = products;

  // Filter by category
  if (currentFilter.category !== 'all') {
    filtered = filtered.filter((p) => p.category === currentFilter.category);
  }

  // Filter by subcategory
  if (currentFilter.subcategory) {
    filtered = filtered.filter(
      (p) => p.subcategory === currentFilter.subcategory,
    );
  }

  // Filter by search keyword
  if (currentSearch) {
    filtered = filtered.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(currentSearch)) ||
        (p.category && p.category.toLowerCase().includes(currentSearch)) ||
        (p.subcategory &&
          p.subcategory.toLowerCase().includes(currentSearch)) ||
        (p.desc && p.desc.toLowerCase().includes(currentSearch)),
    );
  }

  renderProducts(filtered);
}

function renderProducts(data) {
  // Update count
  productCount.textContent = `${data.length} produk`;

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="col-12">
        <div class="no-products">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--gray-400); margin-bottom: 16px;">
            <circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <h5>Produk Tidak Ditemukan</h5>
          <p>Coba kata kunci atau filter kategori yang lain.</p>
        </div>
      </div>`;
    return;
  }

  const html = data
    .map(
      (p, idx) => `
    <div class="col-6 col-sm-4 col-md-3 col-xl-5th">
      <div class="product-card">

        <a href="product.html?id=${p.id}" class="product-img-wrap">
          <span class="product-cat-badge">${p.subcategory || prettyLabel(p.category)}</span>
          <img src="${p.image}" loading="lazy" alt="${p.name}" onerror="handleImageError(this, '${p.name.replace(/'/g, "\\'")}')">
        </a>

        <div class="product-info">
          <h5 class="product-name">${p.name}</h5>
          <div class="product-meta">
            <span class="product-meta-dot"></span>
            Ready Stock · Original
          </div>

          <a href="product.html?id=${p.id}" class="product-detail-btn">
            Lihat Detail
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
        </div>

      </div>
    </div>
  `,
    )
    .join('');

  container.innerHTML = html;
  if (typeof AOS !== 'undefined') AOS.refresh();
}

// ============================================================================
// SEARCH
// ============================================================================
function searchProduct() {
  currentSearch = document.getElementById('search').value.toLowerCase().trim();
  applyFilters();
}

// ============================================================================
// MOBILE SIDEBAR TOGGLE
// ============================================================================
function openSidebar() {
  document.getElementById('categorySidebar').classList.add('show');
  document.getElementById('sidebarBackdrop').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  document.getElementById('categorySidebar').classList.remove('show');
  document.getElementById('sidebarBackdrop').classList.remove('show');
  document.body.style.overflow = '';
}

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('sidebarToggle');
  const closeBtn = document.getElementById('sidebarClose');
  const backdrop = document.getElementById('sidebarBackdrop');

  if (toggleBtn) toggleBtn.addEventListener('click', openSidebar);
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  if (backdrop) backdrop.addEventListener('click', closeSidebar);

  // Close on window resize (if goes back to desktop)
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 992) closeSidebar();
  });
});

// ============================================================================
// NAVBAR & NAV LINK SCROLL EFFECTS
// ============================================================================
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.custom-navbar');
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);

  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
  let current = '';
  sections.forEach((sec) => {
    const top = sec.offsetTop - 120;
    if (pageYOffset >= top) current = sec.getAttribute('id');
  });
  navLinks.forEach((link) => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current)
      link.classList.add('active');
  });
});

// ============================================================================
// FETCH DATA & INIT
// ============================================================================
fetch('products.json')
  .then((res) => {
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  })
  .then((data) => {
    products = data;
    renderSidebar();
    applyFilters();
  })
  .catch((err) => {
    container.innerHTML = `
      <div class="col-12">
        <div class="no-products">
          <h5>Gagal Memuat Data Produk</h5>
          <p>Silakan coba muat ulang halaman.</p>
        </div>
      </div>`;
    console.error(err);
  });
