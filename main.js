let data = [];
let currentCategory = "";
const cache = {}; // To store already loaded CSVs

function selectCategory(category) {
  currentCategory = category;
  document.getElementById('searchBox').value = ""; // Clear previous search

  if (cache[category]) {
    data = cache[category];
    renderCatalog(data);
    return;
  }

  Papa.parse(`data/${category}.csv`, {
    download: true,
    header: true,
    complete: results => {
      data = results.data.filter(row => Object.values(row).some(cell => cell !== "")); // Clean empty rows
      cache[category] = data;
      renderCatalog(data);
    },
    error: err => {
      console.error(`Failed to load ${category}.csv:`, err);
      document.getElementById('catalog').innerText = `Failed to load ${category}.csv`;
    }
  });
}

function renderCatalog(filteredData) {
  const container = document.getElementById('catalog');
  container.innerHTML = '';

  filteredData.forEach(row => {
    if (row["Status"] && row["Status"].toLowerCase() === "sold out") return;

    const div = document.createElement('div');
    div.className = 'item';

    const imageField = row["IMAGES"] || "";
    const imageUrls = imageField
      .split("|")
      .map(url => url.trim())
      .filter(url => url.length > 0);

    let imageGalleryHtml = "";
    if (imageUrls.length > 0) {
      imageGalleryHtml = `
        <div style="display: flex; overflow-x: auto; gap: 10px; padding: 5px 0;">
          ${imageUrls.map(url => `<img src="${url}" alt="Item Image" style="max-height: 100px; border: 1px solid #ccc;">`).join('')}
        </div>
      `;
    }

    div.innerHTML = `
      <strong>${row["PRODUCT_TITLE"] || "Unnamed Item"}</strong><br>
      ${imageGalleryHtml}
      <strong>Price:</strong> ${row["PRICE"] || "N/A"}<br>
      ${Object.entries(row)
        .filter(([key]) => !["IMAGES", "Status", "PRODUCT_TITLE", "PRICE"].includes(key))
        .map(([key, val]) => `<strong>${key}:</strong> ${val}`)
        .join("<br>")}
    `;

    container.appendChild(div);
  });
}

function setupSearch() {
  const searchBox = document.getElementById('searchBox');
  searchBox.addEventListener('input', () => {
    const query = searchBox.value.trim().toLowerCase();

    const filtered = data.filter(row =>
      row["Status"]?.toLowerCase() !== "sold out" &&
      Object.values(row).some(val => String(val).toLowerCase().includes(query))
    );

    renderCatalog(filtered);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupSearch();
  selectCategory('case'); // Default tab
});
