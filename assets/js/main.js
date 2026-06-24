document.addEventListener('DOMContentLoaded', () => {
  initScrollAnimations();
  initSmoothScroll();
  initCadastroDestino();
});

function initScrollAnimations() {
  const animatedElements = document.querySelectorAll('.fade-up');

  if (!animatedElements.length) return;

  if (!('IntersectionObserver' in window)) {
    animatedElements.forEach(element => element.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
  });

  animatedElements.forEach((element, index) => {
    element.style.transitionDelay = `${(index % 4) * 0.08}s`;
    observer.observe(element);
  });
}

function initSmoothScroll() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]');

  anchorLinks.forEach(link => {
    link.addEventListener('click', event => {
      const href = link.getAttribute('href');

      if (!href || href === '#') return;

      const target = document.querySelector(href);

      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  });
}

function initCadastroDestino() {
  const form = document.getElementById('form-cadastro');
  if (!form) return;

  const path = document.location.pathname;
  let destino = '';

  if (path.includes('cadastro-placement.html')) destino = 'dashboard-placement.html';
  if (path.includes('cadastro-alumni.html')) destino = 'dashboard-alumni.html';
  if (path.includes('cadastro-parceiro.html')) destino = 'dashboard-parceiro.html';

  if (!destino) return;

  form.addEventListener('submit', () => {
    sessionStorage.setItem('dashboardDestinoConexoesUfjf', destino);
  });
}
