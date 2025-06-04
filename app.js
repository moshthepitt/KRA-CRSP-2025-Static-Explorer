const q      = document.getElementById("q");
const sheet  = document.getElementById("sheet");
const head   = document.querySelector("#grid thead");
const body   = document.querySelector("#grid tbody");
let rows     = [];
let sortState = { key: null, asc: true }; // To track current sort column and direction
const tableFigure = document.getElementById("table-figure");
// let  rows    = []; // This was the redundant declaration, now removed.
let  debounceTimer;

// Helper to set aria-busy for loading indication
function setBusy(isBusy) {
  if (tableFigure) {
    tableFigure.setAttribute('aria-busy', String(isBusy));
    tableFigure.style.opacity = isBusy ? '0.7' : '1'; // Dim when busy
  }
  document.body.style.cursor = isBusy ? 'wait' : 'default'; // Change cursor
}

sheet.addEventListener("change", () => load(sheet.value));
q.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => render(), 300); // Debounce with 300ms delay
});

async function load(name){
  setBusy(true);
  try {
    const res = await fetch(`data/${name}.json.gz`);
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status} for ${name}.json.gz`);
    }
    const arrayBuffer = await res.arrayBuffer();
    const decompressed = pako.inflate(new Uint8Array(arrayBuffer), { to: 'string' });
    rows = JSON.parse(decompressed);
    render(true);
  } catch (error) {
    console.error("Failed to load or process data for " + name + ":", error.message, error.stack, error);
    body.innerHTML = `<tr><td colspan="100%">Error loading data for ${name}. Check console.</td></tr>`;
    head.innerHTML = ""; // Clear head on error too
    rows = []; // Clear rows to prevent stale data issues
  } finally {
    setBusy(false);
  }
}

function render(rebuildHead = false) {
  setBusy(true);
  const term = q.value.trim().toLowerCase();
  let view = rows;
  if (term) {
    view = rows.filter(r =>
      Object.values(r).some(v => String(v).toLowerCase().includes(term))
    );
  }

  const columnOrder = (rows && rows.length > 0 && typeof rows[0] === 'object' && rows[0] !== null)
    ? Object.keys(rows[0])
    : [];
  if (rebuildHead) {
    head.innerHTML = "";
    const tr = head.insertRow();
    if (columnOrder.length > 0) {
      columnOrder.forEach(k => {
        const th = document.createElement("th");
        th.textContent = k.replace(/_/g, " ");
        th.dataset.sortKey = k; // Store the original key for indicator updates
        th.onclick = () => sortBy(k);
        tr.appendChild(th);
      });
      updateSortIndicators(); // Apply indicators to newly built head
    } else {
      const th = document.createElement("th");
      if (rows && rows.length === 0) {
        th.textContent = "No data found for this sheet.";
      } else {
        th.textContent = "No columns to display or data format error.";
      }
      tr.appendChild(th);
      body.innerHTML = ""; // Clear body if header fails
    }
  }

  body.innerHTML = "";
  if (columnOrder.length > 0) {
    view.forEach(r => {
      const tr = body.insertRow();
      columnOrder.forEach(key => {
        const cell = tr.insertCell();
        const value = r[key];

        if (key === 'crsp') {
          let numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            numValue = Math.round(numValue * 100) / 100; // Round to 2 decimal places
            cell.textContent = numValue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            });
            cell.classList.add('currency');
          } else {
            cell.textContent = value ?? ""; // Fallback for non-numeric values
          }
        } else {
          cell.textContent = value ?? "";
        }
      });
    });
  }
  setBusy(false);
}

function updateSortIndicators() {
  const ths = head.querySelectorAll("th");
  ths.forEach(th => {
    // Remove existing text indicators and classes
    th.textContent = th.textContent.replace(/ [▲▼]$/, "");
    th.classList.remove('sorted-asc', 'sorted-desc');

    if (th.dataset.sortKey === sortState.key) {
      th.textContent += sortState.asc ? " ▲" : " ▼";
      th.classList.add(sortState.asc ? 'sorted-asc' : 'sorted-desc');
    }
  });
}

function sortBy(key) {
  setBusy(true); // Indicate loading during sort operation
  if (sortState.key === key) {
    sortState.asc = !sortState.asc; // Toggle direction
  } else {
    sortState.key = key;
    sortState.asc = true; // Default to ascending for new column
  }

  const direction = sortState.asc ? 1 : -1;

  rows.sort((a, b) => {
    const valA = a[key];
    const valB = b[key];

    // Push null/undefined to the bottom, otherwise compare
    if ((valA === null || typeof valA === 'undefined') && (valB !== null && typeof valB !== 'undefined')) return 1;
    if ((valB === null || typeof valB === 'undefined') && (valA !== null && typeof valA !== 'undefined')) return -1;
    if ((valA === null || typeof valA === 'undefined') && (valB === null || typeof valB === 'undefined')) return 0;

    if (typeof valA === 'string' && typeof valB === 'string') {
      return valA.localeCompare(valB) * direction;
    } else {
      // Numeric or other comparison
      if (valA < valB) return -1 * direction;
      if (valA > valB) return 1 * direction;
      return 0;
    }
  });

  updateSortIndicators();
  render(false); // Re-render body only, head indicators are already set.
}

load("vehicle");      // default view
