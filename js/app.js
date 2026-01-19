const STORAGE_KEYS = {
  AUTH: 'alke_auth',
  BALANCE: 'alke_balance',
  TXS: 'alke_transactions',
  CONTACTS: 'alke_contacts'
};

// Estado inicial
function initState() {
  if (!localStorage.getItem(STORAGE_KEYS.BALANCE)) {
    localStorage.setItem(STORAGE_KEYS.BALANCE, '0');
  }
  if (!localStorage.getItem(STORAGE_KEYS.TXS)) {
    localStorage.setItem(STORAGE_KEYS.TXS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CONTACTS)) {
    localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify([
      'Ana Pérez', 'Carlos Soto', 'Daniela Ríos'
    ]));
  }
}
initState();

function getBalance() {
  return parseInt(localStorage.getItem(STORAGE_KEYS.BALANCE) || '0', 10);
}
function setBalance(value) {
  localStorage.setItem(STORAGE_KEYS.BALANCE, String(value));
}
function addTransaction({ type, detail, amount }) {
  const txs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TXS) || '[]');
  const newBalance = getBalance();
  const tx = {
    date: new Date().toLocaleString(),
    type, detail,
    amount: Number(amount),
    balance: newBalance
  };
  txs.unshift(tx);
  localStorage.setItem(STORAGE_KEYS.TXS, JSON.stringify(txs));
}
function formatCurrency(n) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);
}

// Login
$(function () {
  $('#loginForm').on('submit', function (e) {
    e.preventDefault();
    const email = $('#email').val().trim();
    const password = $('#password').val().trim();

    if (!this.checkValidity()) {
      $(this).addClass('was-validated');
      return;
    }

    if (email && password.length >= 4) {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({ email }));
      $('#loginMessage').html('<div class="alert alert-success">Inicio de sesión exitoso. Redirigiendo...</div>');
      setTimeout(() => location.href = 'menu.html', 800);
    } else {
      $('#loginMessage').html('<div class="alert alert-danger">Ingresa un correo válido y contraseña de al menos 4 caracteres.</div>');
    }
  });

  // Logout
  $('#logoutBtn').on('click', function (e) {
    e.preventDefault();
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    location.href = 'index.html';
  });

  // Mostrar saldo en menú
  if ($('#balanceText').length) {
    $('#balanceText').text(formatCurrency(getBalance()));
  }

  // Depósito
  $('#depositForm').on('submit', function (e) {
    e.preventDefault();
    if (!this.checkValidity()) {
      $(this).addClass('was-validated');
      return;
    }
    const amount = parseInt($('#depositAmount').val(), 10);
    const note = $('#depositNote').val().trim();
    const newBalance = getBalance() + amount;
    setBalance(newBalance);
    addTransaction({ type: 'Depósito', detail: note || 'Depósito', amount });
    $('#depositMessage').html(`<div class="alert alert-success">Depósito realizado. Nuevo saldo: ${formatCurrency(newBalance)}</div>`);
    $('#depositForm')[0].reset();
    $(this).removeClass('was-validated');
  });

  // Autocompletar contactos
  const contacts = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTACTS) || '[]');
  $('#contactSearch').on('input', function () {
    const q = $(this).val().toLowerCase();
    const results = contacts.filter(c => c.toLowerCase().includes(q)).slice(0, 5);
    const $list = $('#contactList').empty();
    results.forEach(r => {
      $('<li class="list-group-item list-group-item-action">').text(r).appendTo($list).on('click', () => {
        $('#contactSearch').val(r);
        $list.empty();
      });
    });
  });

  // Agregar nuevo contacto
  $('#newContactForm').on('submit', function (e) {
    e.preventDefault();
    const newContact = $('#newContactName').val().trim();
    if (newContact) {
      contacts.push(newContact);
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
      $('#newContactMessage').html(`<div class="alert alert-success">Contacto ${newContact} agregado.</div>`);
      $('#newContactForm')[0].reset();
    }
  });

  // Enviar dinero
  $('#sendForm').on('submit', function (e) {
    e.preventDefault();
    if (!this.checkValidity()) {
      $(this).addClass('was-validated');
      return;
    }
    const to = $('#contactSearch').val().trim();
    const amount = parseInt($('#sendAmount').val(), 10);

    if (!to) {
      $('#sendMessage').html('<div class="alert alert-danger">Selecciona un contacto válido.</div>');
      return;
    }
    if (amount <= 0) {
      $('#sendMessage').html('<div class="alert alert-danger">Ingresa un monto válido.</div>');
      return;
    }
    if (amount > getBalance()) {
      $('#sendMessage').html('<div class="alert alert-warning">Saldo insuficiente.</div>');
      return;
    }

    const newBalance = getBalance() - amount;
    setBalance(newBalance);
    addTransaction({ type: 'Transferencia', detail: `Enviado a ${to}`, amount: -amount });
    $('#sendMessage').html(`<div class="alert alert-success">Transferencia realizada. Nuevo saldo: ${formatCurrency(newBalance)}</div>`);
    $('#sendForm')[0].reset();
    $(this).removeClass('was-validated');
  });

  // Historial de transacciones
  if ($('#transactionsTable').length) {
    const txs = JSON.parse(localStorage.getItem(STORAGE_KEYS.TXS) || '[]');
    const $tbody = $('#transactionsTable').empty();
    if (txs.length === 0) {
      $tbody.append('<tr><td colspan="5" class="text-center text-muted">Sin transacciones aún.</td></tr>');
    } else {
      txs.forEach(tx => {
        const amountColor = tx.amount >= 0 ? 'text-success' : 'text-danger';
        $tbody.append(`
          <tr>
            <td>${tx.date}</td>
            <td>${tx.type}</td>
            <td>${tx.detail}</td>
            <td class="${amountColor}">${formatCurrency(tx.amount)}</td>
            <td>${formatCurrency(tx.balance)}</td>
          </tr>
        `);
      });
    }
  }
});