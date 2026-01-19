const STORAGE_KEYS = {
  AUTH: 'alke_auth',
  BALANCE: 'alke_balance',
  TXS: 'alke_transactions'
};

// Estado inicial
function initState() {
  if (!localStorage.getItem(STORAGE_KEYS.BALANCE)) {
    localStorage.setItem(STORAGE_KEYS.BALANCE, '0');
  }
  if (!localStorage.getItem(STORAGE_KEYS.TXS)) {
    localStorage.setItem(STORAGE_KEYS.TXS, JSON.stringify([]));
  }
}
initState();

function getBalance() {
  return parseInt(localStorage.getItem(STORAGE_KEYS.BALANCE) || '0', 10);
}
function setBalance(value) {
  localStorage.setItem(STORAGE_KEYS.BALANCE, String(value));
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

    // Login abierto: cualquier correo válido y contraseña >= 4 caracteres
    if (email && password.length >= 4) {
      localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify({ email }));
      $('#loginMessage').html('<span class="text-success">Inicio de sesión exitoso. Redirigiendo...</span>');
      setTimeout(() => location.href = 'menu.html', 800);
    } else {
      $('#loginMessage').html('<span class="text-danger">Ingresa un correo válido y una contraseña de al menos 4 caracteres.</span>');
    }
  });
});