let data = [];

// Render catalog items
function renderCatalog(filteredData) {
  const container = document.getElementById('catalog');
  container.innerHTML = '';

  filteredData.forEach(row => {
    // Skip items marked as sold out
    if (row["Status"] && row["Status"].toLowerCase() === "sold out") return;

    const div = document.createElement('div');
    div.className = 'item';

    // Parse image URLs from IMAGES field
    const imageField = row["IMAGES"] || "";
    const imageUrls = imageField
      .split("|")
      .map(url => url.trim())
      .filter(url => url.length > 0);

    // Build scrollable gallery HTML
    let imageGalleryHtml = "";
    if (imageUrls.length > 0) {
      imageGalleryHtml = `
        <div style="display: flex; overflow-x: auto; gap: 10px; padding: 5px 0;">
          ${imageUrls
            .map(url => `<img src="${url}" alt="Item Image" style="max-height: 100px; border: 1px solid #ccc;">`)
            .join('')}
        </div>
      `;
    }

    // Compose full item block
    div.innerHTML = `
      <strong>${row["PRODUCT_TITLE"] || "Unnamed Item"}</strong><br>
      ${imageGalleryHtml}
      <strong>Price:</strong> ${row["PRICE"] || "N/A"}<br>
      ${Object.entries(row)
        .filter(([key]) =>
          !["IMAGES", "Status", "PRODUCT_TITLE", "PRICE"].includes(key)
        )
        .map(([key, val]) => `<strong>${key}:</strong> ${val}`)
        .join("<br>")}
    `;

    container.appendChild(div);
  });
}

// Setup search functionality
function setupSearch() {
  const searchBox = document.getElementById('searchBox');
  searchBox.addEventListener('input', () => {
    const query = searchBox.value.trim().toLowerCase();

    const filtered = data.filter(row =>
      row["Status"]?.toLowerCase() !== "sold out" &&
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(query)
      )
    );

    renderCatalog(filtered);
  });
}

// Load and parse CSV
Papa.parse('catalogue.csv', {
  download: true,
  header: true,
  complete: results => {
    data = results.data;
    renderCatalog(data);
    setupSearch();
  },
  error: err => {
    console.error("Failed to load CSV:", err);
    document.getElementById('catalog').innerText = "Failed to load catalogue.";
  }
});
