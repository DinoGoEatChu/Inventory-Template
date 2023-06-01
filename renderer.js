const tableBody = document.getElementById('invoice-table-body');
const handleRowInputDebounced = debounce(handleRowInput, 500);
tableBody.addEventListener('input', handleRowInputDebounced);


function handleRowInput(event) {
  const target = event.target;
  const tr = target.closest('tr');

  if (target.tagName === 'INPUT' && (target.name === 'quantity' || target.name === 'item-Cost')) {
    const columns = tr.children;

    const quantity = parseInt(columns[2].firstElementChild.value);
    let itemCost = columns[3].firstElementChild.value;

    if (itemCost.startsWith('$')) {
      itemCost = itemCost.slice(1);
    }

    itemCost = parseFloat(itemCost);

    if (!isNaN(quantity) && !isNaN(itemCost)) {
      const totalCost = quantity * itemCost;
      columns[4].firstElementChild.value = ("$" + totalCost.toFixed(2));
    }

    // Add the $ symbol to the itemCost input field
    if (target.name === 'item-Cost') {
      const value = target.value;
      if (value && !value.startsWith('$')) {
        target.value = `$${value}`;
      }
    }

    // Check if the current row is the last row
    if (tr === tr.parentNode.lastElementChild) {
      const isRowCompleted = [1, 2, 3].every(index => {
        const input = columns[index].firstElementChild;
        return input.value.trim() !== '';
      });

      if (isRowCompleted) {
        const newRow = createEmptyRow();
        tableBody.appendChild(newRow);
        updateRowNumbers();
      }
    }
  }
}

tableBody.addEventListener('input', handleRowInput);


// Function to update the row numbers
function updateRowNumbers() {
  const rows = Array.from(tableBody.children);

  // Assign row numbers to each row
  rows.forEach((row, index) => {
    const rowNumberCell = row.firstElementChild;
    rowNumberCell.textContent = index + 1;
  });
}

// Event listener for changes in the table
tableBody.addEventListener('input', updateRowNumbers);


function createEmptyRow() {
  const row = tableBody.lastElementChild.cloneNode(true);
  const inputs = row.querySelectorAll('input');
  inputs.forEach(input => input.value = '');
  inputs[inputs.length - 1].readOnly = true;
  return row;
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const { ipcRenderer } = require('electron');

// Get the invoice number input element
const invoiceNumberInput = document.getElementById('invoice-number');


// Listen for the invoice number generated event
ipcRenderer.on('invoice-number-generated', (event, invoiceNumber) => {
  // Set the invoice number in the input field
  invoiceNumberInput.value = invoiceNumber;
});

function getFormattedDate() {
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${month}/${day}/${year}`;
}

window.onload = function() {
  document.getElementById("invoice-date").value = getFormattedDate();
}

// Handle form submission
const form = document.querySelector('#invoice-form');
form.addEventListener('submit', (event) => {
  console.log("Form submit event triggered");
  event.preventDefault();
  const formData = new FormData(form);
  ipcRenderer.send('save-invoice', Object.fromEntries(formData));
});

// Listen for the response from the main process
ipcRenderer.on('save-invoice-response', (event, filePath) => {
  console.log("Response reveived from main process");
  alert(`Invoice saved to ${filePath}`);
});
