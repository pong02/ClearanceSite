let data = [];
let currentCategory = "";
const cache = {};
let loaderStartTime = 0;

function selectCategory(category) {
  if (currentCategory === category) return;
  currentCategory = category;

  document.getElementById('searchBox').value = "";
  highlightActiveTab(category);
  showLoader(true);
  loaderStartTime = performance.now();

  if (cache[category]) {
    data = cache[category];
    renderCatalog(data);
    hideLoaderAfterMinimumDelay();
    return;
  }

  Papa.parse(`data/${category}.csv`, {
    download: true,
    header: true,
    complete: results => {
      data = results.data.filter(row => Object.values(row).some(cell => cell !== ""));
      cache[category] = data;
      renderCatalog(data);
      hideLoaderAfterMinimumDelay();
    },
    error: err => {
      console.error(`Failed to load ${category}.csv:`, err);
      document.getElementById('catalog').innerText = `Failed to load ${category}.csv`;
      hideLoaderAfterMinimumDelay();
    }
  });
}

function renderCatalog(filteredData) {
  const container = document.getElementById('catalog');
  container.innerHTML = '';

  filteredData.forEach(row => {
    if (row["Status"]?.toLowerCase() === "sold out") return;

    const div = document.createElement('div');
    div.className = 'productCard';

    const imageField = row["IMAGES"] || "";
    const imageUrls = imageField
      .split("|")
      .map(url => url.trim())
      .filter(url => url.length > 0);

    let imageGalleryHtml = "";
    if (imageUrls.length > 0) {
      imageGalleryHtml = `
        <div style="display: flex; overflow-x: auto; gap: 10px; padding: 5px 0;">
          ${imageUrls.map(url =>
            `<img loading="lazy" src="${url}" alt="Item Image">`
          ).join('')}
        </div>`;
    }

    const hasVariantInfo = row["variant_group_id"] && row["variant_group_id"].trim() !== "";

    div.innerHTML = `
      <div class="identifierDiv">
        <div class="title">${row["PRODUCT_TITLE"] || "Unnamed Item"}</div>
        <div class="sku">${row["PRODUCT_SKU"] || ""}</div>
      </div>

      <div class="imagesDiv">
        ${imageGalleryHtml}
      </div>

      <div class="infoDiv">
        <div><strong>Price:</strong> ${row["PRICE"] || "N/A"}</div>
        <div><strong>RRP:</strong> ${row["rrp"] || "-"}</div>
        <div><strong>Brand:</strong> ${row["BRAND"] || "-"}</div>
      </div>

      ${hasVariantInfo ? `
      <div class="variationDiv">
        <div><strong>Group ID:</strong> ${row["variant_group_id"]}</div>
        <div><strong>Title:</strong> ${row["variant_group_title"] || ""}</div>
        <div><strong>Type:</strong> ${row["variant_facet_type"] || ""}</div>
        <div><strong>Group:</strong> ${row["variant_facet_group"] || ""}</div>
        <div><strong>Value:</strong> ${row["variant_facet_value"] || ""}</div>
      </div>
      ` : ""}

      <div class="descDiv">
        ${row["PRODUCT_DESCRIPTION"] || ""}
      </div>
    `;

    container.appendChild(div);
  });
}

function setupSearch() {
  const searchBox = document.getElementById('searchBox');
  const searchBtn = document.getElementById('searchBtn');

  function performSearch() {
    const query = searchBox.value.trim().toLowerCase();
    const filtered = data.filter(row =>
      row["Status"]?.toLowerCase() !== "sold out" &&
      Object.values(row).some(val => String(val).toLowerCase().includes(query))
    );
    renderCatalog(filtered);
  }

  searchBtn.addEventListener('click', performSearch);

  searchBox.addEventListener('keydown', e => {
    if (e.key === 'Enter') performSearch();
  });
}

function showLoader(visible) {
  document.getElementById('loadingBar').style.display = visible ? 'block' : 'none';
}

function hideLoaderAfterMinimumDelay() {
  const elapsed = performance.now() - loaderStartTime;
  const remaining = 500 - elapsed;
  if (remaining > 0) {
    setTimeout(() => showLoader(false), remaining);
  } else {
    showLoader(false);
  }
}

function highlightActiveTab(category) {
  const buttons = document.querySelectorAll("#tabs button");
  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.textContent.toLowerCase() === category);
  });
}

function setupBackToTop() {
  const backToTopBtn = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    backToTopBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
  });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupSearch();
  setupBackToTop();
  selectCategory('case'); 
});

document.addEventListener("DOMContentLoaded", function () {
  fetch('data/booking.txt')
    .then(res => {
      if (!res.ok) throw new Error("Could not load booking URL");
      return res.text();
    })
    .then(url => {
      const bookingBtn = document.getElementById("bookingBtn");
      bookingBtn.addEventListener("click", () => {
        window.open(url.trim(), '_blank');
      });
    })
    .catch(err => {
      console.error("Booking link error:", err);
      const bookingBtn = document.getElementById("bookingBtn");
      bookingBtn.disabled = true;
      bookingBtn.textContent = "Unavailable";
    });
});
