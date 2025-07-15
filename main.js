let data = [];

function renderCatalog(filteredData) {
  const container = document.getElementById('catalog');
  container.innerHTML = '';
  filteredData.forEach(row => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <strong>${row["Name"] || row[0]}</strong><br>
      <img src="${row["Image URL"] || row[1]}" alt="Image"><br>
      Price: ${row["Price"] || row[2]}<br>
      ${Object.entries(row).map(([k, v]) => `${k}: ${v}`).join('<br>')}
    `;
    container.appendChild(div);
  });
}

function setupSearch() {
  const searchBox = document.getElementById('searchBox');
  searchBox.addEventListener('input', () => {
    const query = searchBox.value.toLowerCase();
    const filtered = data.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(query)
      )
    );
    renderCatalog(filtered);
  });
}

Papa.parse('catalogue.csv', {
  download: true,
  header: true,
  complete: results => {
    data = results.data;
    renderCatalog(data);
    setupSearch();
  }
});
