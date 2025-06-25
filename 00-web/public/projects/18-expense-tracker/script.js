// Gestor de gastos personales
const expenseForm = document.getElementById('expense-form');
const expenseName = document.getElementById('expense-name');
const expenseAmount = document.getElementById('expense-amount');
const expenseDate = document.getElementById('expense-date');
const expenseList = document.getElementById('expense-list');
const totalAmount = document.getElementById('total-amount');

let expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
let filterFrom = '';
let filterTo = '';
let filterCategory = '';

function renderExpenses() {
  expenseList.innerHTML = '';
  let total = 0;
  let filtered = expenses.filter(exp => {
    if (filterFrom && exp.date < filterFrom) return false;
    if (filterTo && exp.date > filterTo) return false;
    if (filterCategory && exp.category !== filterCategory) return false;
    return true;
  });
  filtered.forEach((exp, idx) => {
    total += parseFloat(exp.amount);
    const li = document.createElement('li');
    li.className = 'expense-item';
    li.innerHTML = `
      <div class="expense-info">
        <span class="expense-name">${exp.name}</span>
        <span class="expense-date">${exp.date}</span>
        <span class="expense-category">${exp.category || ''}</span>
      </div>
      <span class="expense-amount">$${parseFloat(exp.amount).toFixed(2)}</span>
      <button class="delete-btn">Eliminar</button>
    `;
    li.querySelector('.delete-btn').onclick = () => deleteExpense(expenses.indexOf(exp));
    expenseList.appendChild(li);
  });
  totalAmount.textContent = total.toFixed(2);
}

function deleteExpense(idx) {
  expenses.splice(idx, 1);
  localStorage.setItem('expenses', JSON.stringify(expenses));
  renderExpenses();
}

document.getElementById('filter-btn').onclick = () => {
  filterFrom = document.getElementById('filter-from').value;
  filterTo = document.getElementById('filter-to').value;
  filterCategory = document.getElementById('filter-category').value;
  renderExpenses();
};
document.getElementById('clear-filter-btn').onclick = () => {
  filterFrom = '';
  filterTo = '';
  filterCategory = '';
  document.getElementById('filter-from').value = '';
  document.getElementById('filter-to').value = '';
  document.getElementById('filter-category').value = '';
  renderExpenses();
};

expenseForm.onsubmit = (e) => {
  e.preventDefault();
  const name = expenseName.value.trim();
  const amount = expenseAmount.value;
  const date = expenseDate.value;
  const category = document.getElementById('expense-category').value;
  if (!name || !amount || !date || !category) return;
  expenses.push({ name, amount, date, category });
  localStorage.setItem('expenses', JSON.stringify(expenses));
  expenseForm.reset();
  renderExpenses();
};

// Inicialización
renderExpenses();
