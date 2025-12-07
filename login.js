function hashPassword(pw) {
  return btoa(unescape(encodeURIComponent(pw)));
}

function enforceAuth() {
  const authed = localStorage.getItem('memelens-session');
  if (!authed) {
    if (!location.pathname.endsWith('login.html')) {
      window.location.href = 'login.html';
    }
  } else {
    const logout = document.getElementById('logoutBtn');
    if (logout) {
      logout.addEventListener('click', () => {
        localStorage.removeItem('memelens-session');
        window.location.href = 'login.html';
      });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('authForm');
  const createBtn = document.getElementById('createBtn');
  const message = document.getElementById('authMessage');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();
      if (!username || !password) {
        setMessage('Both fields fam.');
        return;
      }
      const storedUser = localStorage.getItem('memelens-user');
      const storedPass = localStorage.getItem('memelens-pass');
      const hashed = hashPassword(password);
      if (storedUser && storedPass) {
        if (username === storedUser && hashed === storedPass) {
          completeLogin();
        } else {
          setMessage('Wrong sauce. Try again.');
        }
      } else {
        setMessage('No account yet. Smash Create Account.');
      }
    });
  }

  if (createBtn) {
    createBtn.addEventListener('click', () => {
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();
      if (!username || !password) {
        setMessage('Need a username + password to mint access.');
        return;
      }
      localStorage.setItem('memelens-user', username);
      localStorage.setItem('memelens-pass', hashPassword(password));
      completeLogin();
    });
  }

  function setMessage(text) {
    if (message) {
      message.textContent = text;
    }
  }

  function completeLogin() {
    localStorage.setItem('memelens-session', 'true');
    document.body.classList.add('fade-slide-out');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 350);
  }
});
