// «Зёрнышко» — общий скрипт интерфейса

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initForms();
  initMenuFilter();
  initBookingForm();
});

// Мобильное меню: кнопка-«бургер» до 768px
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navList = document.querySelector('.nav-list');
  if (!menuToggle || !navList) return;

  const overlay = document.createElement('div');
  overlay.className = 'nav-overlay';
  document.body.appendChild(overlay);

  const closeMenu = () => {
    navList.classList.remove('open');
    overlay.classList.remove('visible');
    document.body.classList.remove('no-scroll');
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  menuToggle.addEventListener('click', () => {
    const isOpen = navList.classList.toggle('open');
    overlay.classList.toggle('visible', isOpen);
    document.body.classList.toggle('no-scroll', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  overlay.addEventListener('click', closeMenu);

  navList.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
  });
}

// Демо-отправка форм (отзыв). В реальном проекте здесь отправка на сервер.
// Форма бронирования обрабатывается отдельно (initBookingForm).
function initForms() {
  document.querySelectorAll('form').forEach((form) => {
    if (form.id === 'booking-form') return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('button[type="submit"]');
      if (!btn) return;
      const originalText = btn.textContent;
      btn.textContent = 'Отправляется…';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = 'Отправлено!';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
          form.reset();
        }, 1200);
      }, 800);
    });
  });
}

// Фильтрация меню по категориям
function initMenuFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const menuCards = document.querySelectorAll('.menu-card');
  if (!filterBtns.length || !menuCards.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.getAttribute('data-category');

      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      menuCards.forEach((card) => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

// ========================
// Форма бронирования
// ========================
function initBookingForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  const confirmation = document.getElementById('booking-confirmation');
  const confirmationTitle = document.getElementById('confirmation-title');
  const confirmationText = document.getElementById('confirmation-text');
  const confirmationClose = document.getElementById('confirmation-close');

  // Маска телефона: +7 (XXX) XXX-XX-XX
  const phoneInput = document.getElementById('guest-phone');
  phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length === 0) {
      e.target.value = '';
      return;
    }
    // Если начинается с 8 или 7, приводим к 7
    if (value[0] === '8') value = '7' + value.slice(1);
    if (value[0] !== '7') value = '7' + value;

    let formatted = '+7';
    if (value.length > 1) formatted += ' (' + value.slice(1, 4);
    if (value.length > 4) formatted += ') ' + value.slice(4, 7);
    if (value.length > 7) formatted += '-' + value.slice(7, 9);
    if (value.length > 9) formatted += '-' + value.slice(9, 11);

    e.target.value = formatted;
  });

  // Счётчик символов комментария
  const commentInput = document.getElementById('guest-comment');
  const charCurrent = document.getElementById('char-current');
  if (commentInput && charCurrent) {
    commentInput.addEventListener('input', () => {
      charCurrent.textContent = commentInput.value.length;
    });
  }

  // Установка минимальной даты (сегодня) и максимальной (сегодня + 30 дней)
  const dateInput = document.getElementById('booking-date');
  if (dateInput) {
    const today = new Date();
    const minDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 30);

    dateInput.min = minDate.toISOString().split('T')[0];
    dateInput.max = maxDate.toISOString().split('T')[0];
  }

  // Очистка ошибок при вводе
  const allInputs = form.querySelectorAll('input, select, textarea');
  allInputs.forEach((input) => {
    input.addEventListener('input', () => clearError(input));
    input.addEventListener('change', () => clearError(input));
  });

  // Закрытие подтверждения
  if (confirmationClose) {
    confirmationClose.addEventListener('click', () => {
      confirmation.hidden = true;
      form.reset();
      // Сброс счётчика
      if (charCurrent) charCurrent.textContent = '0';
    });
  }

  // Валидация и отправка
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const errors = validateBookingForm();

    if (errors.length > 0) {
      // Показать ошибки
      errors.forEach(({ field, message }) => {
        showFieldError(field, message);
      });
      // Прокрутить к первой ошибке
      const firstError = form.querySelector('.invalid');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Успех
    const name = document.getElementById('guest-name').value.trim();
    const date = formatDate(document.getElementById('booking-date').value);
    const time = document.getElementById('booking-time').value;

    confirmationTitle.textContent = `Спасибо, ${name}!`;
    confirmationText.textContent = `Ждём вас ${date} в ${time}`;
    confirmation.hidden = false;

    form.reset();
    if (charCurrent) charCurrent.textContent = '0';

    confirmation.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  function validateBookingForm() {
    const errors = [];

    // Имя
    const nameInput = document.getElementById('guest-name');
    const nameVal = nameInput.value.trim();
    if (!nameVal) {
      errors.push({ field: nameInput, message: 'Пожалуйста, введите ваше имя.' });
    } else if (!/^[A-Za-zА-Яа-яЁё\s\-']{2,40}$/.test(nameVal)) {
      errors.push({ field: nameInput, message: 'Имя: 2–40 букв (кириллица, латиница, пробелы, дефис, апостроф).' });
    }

    // Телефон
    const phoneInput = document.getElementById('guest-phone');
    const phoneVal = phoneInput.value.replace(/\D/g, '');
    if (!phoneVal) {
      errors.push({ field: phoneInput, message: 'Пожалуйста, введите номер телефона.' });
    } else if (phoneVal.length !== 11) {
      errors.push({ field: phoneInput, message: 'Телефон: формат +7 (XXX) XXX-XX-XX (11 цифр).' });
    }

    // Дата
    const dateInput = document.getElementById('booking-date');
    const dateVal = dateInput.value;
    if (!dateVal) {
      errors.push({ field: dateInput, message: 'Пожалуйста, выберите дату.' });
    } else {
      const selected = new Date(dateVal);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const max = new Date();
      max.setDate(max.getDate() + 30);
      if (selected < today) {
        errors.push({ field: dateInput, message: 'Дата не может быть раньше сегодняшней.' });
      } else if (selected > max) {
        errors.push({ field: dateInput, message: 'Дата не может быть позже чем через 30 дней.' });
      }
    }

    // Время
    const timeInput = document.getElementById('booking-time');
    const timeVal = timeInput.value;
    if (!timeVal) {
      errors.push({ field: timeInput, message: 'Пожалуйста, выберите время.' });
    } else if (timeVal < '09:00' || timeVal > '21:00') {
      errors.push({ field: timeInput, message: 'Время: с 09:00 до 21:00.' });
    }

    // Гости
    const guestsInput = document.getElementById('guests-count');
    const guestsVal = guestsInput.value;
    if (!guestsVal) {
      errors.push({ field: guestsInput, message: 'Пожалуйста, выберите число гостей.' });
    } else if (parseInt(guestsVal, 10) < 1 || parseInt(guestsVal, 10) > 8) {
      errors.push({ field: guestsInput, message: 'Число гостей: от 1 до 8.' });
    }

    // Комментарий
    const commentInput = document.getElementById('guest-comment');
    const commentVal = commentInput.value;
    if (commentVal.length > 200) {
      errors.push({ field: commentInput, message: 'Комментарий: не более 200 символов.' });
    }

    return errors;
  }

  function showFieldError(input, message) {
    input.classList.add('invalid');
    const errorId = input.id + '-error';
    const errorSpan = document.getElementById(errorId);
    if (errorSpan) {
      errorSpan.textContent = message;
    }
  }

  function clearError(input) {
    input.classList.remove('invalid');
    const errorId = input.id + '-error';
    const errorSpan = document.getElementById(errorId);
    if (errorSpan) {
      errorSpan.textContent = '';
    }
  }

  function formatDate(dateStr) {
    const months = [
      'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
      'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    const d = new Date(dateStr);
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()} г.`;
  }
}
