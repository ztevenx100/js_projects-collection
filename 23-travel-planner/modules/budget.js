/**
 * Módulo de Presupuesto
 * Maneja la gestión y visualización del presupuesto y gastos del viaje
 */
const BudgetModule = {
  // Referencias a elementos del DOM
  budgetContainer: null,
  entriesContainer: null,
  
  // Estado interno del módulo
  currentTrip: null,
  currentExpenses: [],
  
  // Inicializar el módulo
  init: function() {
    this.budgetContainer = document.querySelector('.budget-categories');
    this.entriesContainer = document.getElementById('budget-entries-container');
    
    // Configurar eventos
    this.setupEventListeners();
  },
  
  // Configurar escuchadores de eventos
  setupEventListeners: function() {
    // Botón de añadir gasto
    document.getElementById('add-budget-entry-btn').addEventListener('click', () => {
      this.openAddExpenseModal();
    });
    
    // Formulario de nuevo gasto
    document.getElementById('new-budget-entry-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleNewExpense();
    });
  },
  
  // Cargar presupuesto y gastos de un viaje
  loadTripBudget: function(tripId) {
    // Obtener datos del viaje
    const trip = StorageModule.getTripById(tripId);
    if (!trip) return;
    
    this.currentTrip = trip;
    
    // Obtener gastos del viaje
    this.currentExpenses = StorageModule.getTripExpenses(tripId);
    
    // Actualizar UI
    this.updateBudgetSummary();
    this.updateExpenseList();
  },
  
  // Actualizar resumen de presupuesto
  updateBudgetSummary: function() {
    if (!this.currentTrip) return;
    
    // Calcular total gastado
    const totalSpent = this.currentExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calcular porcentaje de presupuesto gastado
    const spentPercentage = this.currentTrip.budget > 0 
      ? (totalSpent / this.currentTrip.budget) * 100 
      : 0;
    
    // Actualizar barra de progreso y cantidades
    document.querySelector('.budget-total .progress-fill').style.width = `${Math.min(spentPercentage, 100)}%`;
    document.getElementById('spent-amount').textContent = this.formatCurrency(totalSpent, this.currentTrip.currency);
    document.getElementById('total-budget').textContent = this.formatCurrency(this.currentTrip.budget, this.currentTrip.currency);
    
    // Cambiar color de la barra según el porcentaje
    const progressBar = document.querySelector('.budget-total .progress-fill');
    if (spentPercentage > 90) {
      progressBar.style.backgroundColor = 'var(--danger-color)';
    } else if (spentPercentage > 70) {
      progressBar.style.backgroundColor = 'var(--warning-color)';
    } else {
      progressBar.style.backgroundColor = 'var(--success-color)';
    }
    
    // Actualizar resumen por categorías
    this.updateCategoriesSummary();
  },
  
  // Actualizar resumen de categorías
  updateCategoriesSummary: function() {
    // Limpiar contenedor
    this.budgetContainer.innerHTML = '';
    
    // Si no hay gastos, mostrar mensaje
    if (this.currentExpenses.length === 0) {
      this.budgetContainer.innerHTML = '<p>No hay gastos registrados.</p>';
      return;
    }
    
    // Calcular totales por categoría
    const categoriesTotal = this.calculateCategoryTotals();
    
    // Estimar presupuesto por categoría (valores típicos para un viaje)
    const estimatedBudgetByCategory = this.estimateCategoryBudgets(this.currentTrip.budget);
    
    // Crear elementos para cada categoría
    for (const category in estimatedBudgetByCategory) {
      const spent = categoriesTotal[category] || 0;
      const budget = estimatedBudgetByCategory[category];
      const percentage = budget > 0 ? (spent / budget) * 100 : 0;
      
      const categoryElement = document.createElement('div');
      categoryElement.className = 'budget-category';
      categoryElement.dataset.category = category;
      
      categoryElement.innerHTML = `
        <h4>${this.getCategoryName(category)}</h4>
        <div class="category-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${Math.min(percentage, 100)}%"></div>
          </div>
          <div class="category-amounts">
            <span>${this.formatCurrency(spent, this.currentTrip.currency)}</span> / 
            <span>${this.formatCurrency(budget, this.currentTrip.currency)}</span>
          </div>
        </div>
      `;
      
      // Cambiar color según el porcentaje
      const progressBar = categoryElement.querySelector('.progress-fill');
      if (percentage > 90) {
        progressBar.style.backgroundColor = 'var(--danger-color)';
      } else if (percentage > 70) {
        progressBar.style.backgroundColor = 'var(--warning-color)';
      } else {
        progressBar.style.backgroundColor = 'var(--success-color)';
      }
      
      this.budgetContainer.appendChild(categoryElement);
    }
  },
  
  // Calcular totales por categoría
  calculateCategoryTotals: function() {
    const totals = {};
    
    this.currentExpenses.forEach(expense => {
      if (!totals[expense.category]) {
        totals[expense.category] = 0;
      }
      
      totals[expense.category] += expense.amount;
    });
    
    return totals;
  },
  
  // Estimar presupuestos por categoría
  estimateCategoryBudgets: function(totalBudget) {
    // Distribución típica del presupuesto de un viaje
    return {
      accommodation: totalBudget * 0.35, // 35% para alojamiento
      transportation: totalBudget * 0.25, // 25% para transporte
      food: totalBudget * 0.20, // 20% para comida
      activities: totalBudget * 0.10, // 10% para actividades
      shopping: totalBudget * 0.05, // 5% para compras
      other: totalBudget * 0.05 // 5% para otros gastos
    };
  },
  
  // Actualizar lista de gastos
  updateExpenseList: function() {
    // Limpiar contenedor
    this.entriesContainer.innerHTML = '';
    
    // Si no hay gastos, mostrar mensaje
    if (this.currentExpenses.length === 0) {
      this.entriesContainer.innerHTML = '<p class="no-expenses">No hay gastos registrados.</p>';
      return;
    }
    
    // Ordenar gastos por fecha (más recientes primero)
    const sortedExpenses = [...this.currentExpenses].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
    
    // Crear elemento para cada gasto
    sortedExpenses.forEach(expense => {
      const expenseElement = document.createElement('div');
      expenseElement.className = 'budget-entry';
      expenseElement.dataset.id = expense.id;
      
      expenseElement.innerHTML = `
        <div class="budget-entry-info">
          <h4>${expense.description}</h4>
          <div class="budget-entry-meta">
            <span class="entry-category">${this.getCategoryName(expense.category)}</span> · 
            <span class="entry-date">${this.formatDate(expense.date)}</span>
            ${expense.notes ? `<div class="entry-notes">${expense.notes}</div>` : ''}
          </div>
        </div>
        <div class="budget-entry-amount">${this.formatCurrency(expense.amount, this.currentTrip.currency)}</div>
        <div class="budget-entry-actions">
          <button class="edit-btn" title="Editar gasto"><i class="edit-icon">✎</i></button>
          <button class="delete-btn" title="Eliminar gasto"><i class="delete-icon">×</i></button>
        </div>
      `;
      
      // Configurar eventos de los botones
      const editBtn = expenseElement.querySelector('.edit-btn');
      editBtn.addEventListener('click', () => {
        this.editExpense(expense.id);
      });
      
      const deleteBtn = expenseElement.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', () => {
        this.deleteExpense(expense.id);
      });
      
      this.entriesContainer.appendChild(expenseElement);
    });
  },
  
  // Abrir modal para añadir nuevo gasto
  openAddExpenseModal: function() {
    // Si no hay viaje seleccionado, mostrar mensaje
    if (!App.currentTrip) {
      alert('Por favor, selecciona o crea un viaje primero.');
      return;
    }
    
    // Resetear formulario
    document.getElementById('new-budget-entry-form').reset();
    
    // Establecer fecha por defecto como hoy
    document.getElementById('expense-date').valueAsDate = new Date();
    
    // Establecer fecha mínima y máxima según el viaje
    if (this.currentTrip) {
      document.getElementById('expense-date').min = this.currentTrip.startDate;
      document.getElementById('expense-date').max = this.currentTrip.endDate;
    }
    
    // Mostrar modal
    App.openModal('new-budget-entry-modal');
  },
  
  // Manejar envío del formulario de nuevo gasto
  handleNewExpense: function() {
    // Obtener datos del formulario
    const expenseData = {
      tripId: this.currentTrip.id,
      description: document.getElementById('expense-description').value,
      amount: parseFloat(document.getElementById('expense-amount').value),
      category: document.getElementById('expense-category').value,
      date: document.getElementById('expense-date').value,
      notes: document.getElementById('expense-notes').value
    };
    
    // Crear nuevo gasto
    StorageModule.createExpense(expenseData);
    
    // Actualizar datos y UI
    this.currentExpenses = StorageModule.getTripExpenses(this.currentTrip.id);
    this.updateBudgetSummary();
    this.updateExpenseList();
    
    // Cerrar modal
    App.closeModal('new-budget-entry-modal');
  },
  
  // Editar un gasto existente
  editExpense: function(expenseId) {
    // Obtener el gasto
    const expense = StorageModule.getExpenseById(expenseId);
    if (!expense) return;
    
    // Rellenar formulario con datos del gasto
    document.getElementById('expense-description').value = expense.description;
    document.getElementById('expense-amount').value = expense.amount;
    document.getElementById('expense-category').value = expense.category;
    document.getElementById('expense-date').value = expense.date;
    document.getElementById('expense-notes').value = expense.notes || '';
    
    // Cambiar título del modal
    const modalTitle = document.querySelector('#new-budget-entry-modal .modal-content h2');
    modalTitle.textContent = 'Editar gasto';
    
    // Mostrar modal
    App.openModal('new-budget-entry-modal');
    
    // Cambiar comportamiento del formulario para actualizar en lugar de crear
    const form = document.getElementById('new-budget-entry-form');
    const originalSubmitHandler = form.onsubmit;
    
    form.onsubmit = (e) => {
      e.preventDefault();
      
      // Obtener datos actualizados
      const expenseData = {
        description: document.getElementById('expense-description').value,
        amount: parseFloat(document.getElementById('expense-amount').value),
        category: document.getElementById('expense-category').value,
        date: document.getElementById('expense-date').value,
        notes: document.getElementById('expense-notes').value
      };
      
      // Actualizar gasto
      StorageModule.updateExpense(expenseId, expenseData);
      
      // Actualizar datos y UI
      this.currentExpenses = StorageModule.getTripExpenses(this.currentTrip.id);
      this.updateBudgetSummary();
      this.updateExpenseList();
      
      // Cerrar modal
      App.closeModal('new-budget-entry-modal');
      
      // Restaurar título original
      modalTitle.textContent = 'Nueva entrada de presupuesto';
      
      // Restaurar comportamiento original del formulario
      form.onsubmit = originalSubmitHandler;
    };
  },
  
  // Eliminar un gasto
  deleteExpense: function(expenseId) {
    // Pedir confirmación
    if (!confirm('¿Estás seguro de que deseas eliminar este gasto?')) {
      return;
    }
    
    // Eliminar gasto
    StorageModule.deleteExpense(expenseId);
    
    // Actualizar datos y UI
    this.currentExpenses = StorageModule.getTripExpenses(this.currentTrip.id);
    this.updateBudgetSummary();
    this.updateExpenseList();
  },
  
  // Formatear moneda
  formatCurrency: function(amount, currency = 'USD') {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency
    }).format(amount);
  },
  
  // Formatear fecha
  formatDate: function(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  },
  
  // Obtener nombre de categoría en español
  getCategoryName: function(category) {
    const categories = {
      accommodation: 'Alojamiento',
      transportation: 'Transporte',
      food: 'Comida',
      activities: 'Actividades',
      shopping: 'Compras',
      other: 'Otros'
    };
    
    return categories[category] || 'Otros';
  }
};
