// «Зёрнышко» — общий скрипт интерфейса

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initForms();
  initMenuFilter();
});

// Мобильное меню: кнопка-«бургер» до 768px
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const navList = document.querySelector('.nav-list');
  if (!menuToggle || !navList) return;

  // Затемнение фона за выезжающей панелью
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

  // Закрытие по клику на затемнение
  overlay.addEventListener('click', closeMenu);

  // Закрытие при клике на ссылку
  navList.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  // Закрытие по Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  // Сброс состояния при возврате к десктопной ширине
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) closeMenu();
  });
}

// Демо-отправка форм (бронирование / отзыв). В реальном проекте здесь отправка на сервер.
function initForms() {
  document.querySelectorAll('form').forEach((form) => {
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

      // Активная кнопка
      filterBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // Показать/скрыть карточки
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
