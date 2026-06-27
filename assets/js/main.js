document.addEventListener('DOMContentLoaded', () => {
  loadQuantEconTheme();
  initScrollAnimations();
  initSmoothScroll();
});

function loadQuantEconTheme() {
  if (document.querySelector('link[data-quantecon-theme]')) return;

  const prefix = getAssetPrefix();

  const theme = document.createElement('link');
  theme.rel = 'stylesheet';
  theme.href = prefix + 'assets/css/quantecon-theme.css?v=2';
  theme.dataset.quanteconTheme = 'true';
  document.head.appendChild(theme);

  const bgFix = document.createElement('link');
  bgFix.rel = 'stylesheet';
  bgFix.href = prefix + 'assets/css/quantecon-bg-fix.css?v=1';
  bgFix.dataset.quanteconBgFix = 'true';
  document.head.appendChild(bgFix);
}

function getAssetPrefix() {
  const path = window.location.pathname;
  return path.includes('/pages/') ? '../' : '';
}

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
