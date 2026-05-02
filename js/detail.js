// ============================================================================
// Robbi Berkah Teknik — Product Detail Loader
// ============================================================================

const WA_NUMBER = '6285258746088';

// Format nama kategori dari slug (e.g. 'sepatu-safety' -> 'Sepatu Safety')
// Tidak pakai mapping hardcoded — agar kategori baru otomatis ter-format rapi
function prettyLabel(str) {
  if (!str) return '';
  return str.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Ambil ID dari URL
const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const detailContainer = document.getElementById('detail');

// Ambil data dari JSON
fetch('products.json')
  .then((res) => {
    if (!res.ok) throw new Error('Network response was not ok');
    return res.json();
  })
  .then((data) => {
    const product = data.find((p) => p.id == id);

    if (!product) {
      const bc = document.getElementById('breadcrumbCurrent');
      if (bc) bc.textContent = 'Tidak Ditemukan';
      detailContainer.innerHTML = `
        <div class="no-products text-center py-5">
          <h3 class="mb-3" style="font-family: var(--font-display); color: var(--forest-700);">Produk Tidak Ditemukan</h3>
          <p class="mb-4">Produk yang Anda cari tidak tersedia.</p>
          <a href="index.html#produk" class="btn-primary-elegant">
            ← Kembali ke Katalog
          </a>
        </div>`;
      return;
    }

    renderDetail(product);
  })
  .catch((err) => {
    const bc = document.getElementById('breadcrumbCurrent');
    if (bc) bc.textContent = 'Error';
    detailContainer.innerHTML = `
      <div class="no-products text-center py-5">
        <h3 class="mb-3" style="font-family: var(--font-display); color: #c53030;">Gagal Memuat Data</h3>
        <p>Silakan coba muat ulang halaman.</p>
      </div>`;
    console.error(err);
  });

// 🔥 Render detail produk
function renderDetail(p) {
  // Update page title
  document.title = `${p.name} — Robbi Berkah Teknik`;

  // Update breadcrumb
  const breadcrumbCurrent = document.getElementById('breadcrumbCurrent');
  if (breadcrumbCurrent) breadcrumbCurrent.textContent = p.name;

  const waText = encodeURIComponent(
    `Halo admin Robbi Berkah Teknik, saya tertarik dengan produk *${p.name}*. Bisakah saya mendapatkan informasi lebih lanjut?`,
  );

  detailContainer.innerHTML = `
    <div class="detail-grid">

      <!-- LEFT: IMAGE -->
      <div data-aos="fade-right">
        <div class="detail-image-box">
          <div class="detail-image-inner">
            <img src="${p.image}" alt="${p.name}">
          </div>
        </div>
      </div>

      <!-- RIGHT: CONTENT -->
      <div class="detail-content" data-aos="fade-left">

        <div class="detail-badges">
          <span class="detail-badge badge-ready">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Ready Stock
          </span>
          <span class="detail-badge badge-original">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            Original Product
          </span>
        </div>

        <span class="detail-category">${p.subcategory ? `${prettyLabel(p.category)} › ${p.subcategory}` : prettyLabel(p.category)}</span>
        <h1 class="detail-title">${p.name}</h1>

        <!-- Specs -->
        <div class="detail-spec-box">
          <h4 class="detail-spec-title">Spesifikasi Produk</h4>

          <div class="spec-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span class="spec-label">Kategori:</span>
            <strong>${prettyLabel(p.category)}</strong>
          </div>
          ${
            p.subcategory
              ? `
          <div class="spec-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span class="spec-label">Sub Kategori:</span>
            <strong>${p.subcategory}</strong>
          </div>`
              : ''
          }

          <div class="spec-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span class="spec-label">Kondisi:</span>
            <strong>Baru · 100% Original</strong>
          </div>

          <div class="spec-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span class="spec-label">Pengiriman:</span>
            <strong>Seluruh Indonesia</strong>
          </div>

          <div class="spec-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span class="spec-label">Garansi:</span>
            <strong>Produk Resmi & Terjamin</strong>
          </div>
        </div>

        <!-- Description -->
        <div class="detail-desc-box">
          <div class="detail-desc-label">Deskripsi Produk</div>
          <p class="detail-desc">${p.desc}</p>
        </div>

        <!-- Actions -->
        <div class="detail-actions">
          <a href="https://wa.me/${WA_NUMBER}?text=${waText}"
             target="_blank"
             rel="noopener"
             class="btn-wa-elegant">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345m-5.446 7.443h-.016c-1.77 0-3.524-.48-5.055-1.38l-.36-.214-3.75.975 1.005-3.645-.239-.375a9.869 9.869 0 0 1-1.51-5.26c.002-5.45 4.436-9.884 9.887-9.884 2.639 0 5.116 1.031 6.98 2.898a9.825 9.825 0 0 1 2.898 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.142 1.595 5.945L0 24l6.335-1.652a12.062 12.062 0 0 0 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411"/>
            </svg>
            Beli via WhatsApp
          </a>

          <a href="index.html#produk" class="btn-back-elegant">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Kembali ke Katalog
          </a>
        </div>

      </div>
    </div>
  `;

  // Refresh AOS setelah konten ter-render
  if (typeof AOS !== 'undefined') AOS.refresh();
}
