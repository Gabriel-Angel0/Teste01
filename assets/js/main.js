document.addEventListener('DOMContentLoaded', () => {
  loadQuantEconTheme();
  initScrollAnimations();
  initSmoothScroll();
  initCadastroDestino();
  initPosCadastro();
});

function loadQuantEconTheme() {
  if (document.querySelector('link[data-quantecon-theme]')) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = getAssetPrefix() + 'assets/css/quantecon-theme.css?v=1';
  link.dataset.quanteconTheme = 'true';
  document.head.appendChild(link);
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

function initCadastroDestino() {
  const form = document.getElementById('form-cadastro');
  if (!form) return;

  garantirCamposCompatibilidade(form);

  const path = document.location.pathname;
  let destino = '';
  let tipo = '';

  if (path.includes('cadastro-placement.html')) {
    destino = 'dashboard-placement.html';
    tipo = 'placement';
  }

  if (path.includes('cadastro-alumni.html')) {
    destino = 'dashboard-alumni.html';
    tipo = 'alumni';
  }

  if (path.includes('cadastro-parceiro.html')) {
    destino = 'dashboard-parceiro.html';
    tipo = 'parceiro';
  }

  if (!destino) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();

    garantirCamposCompatibilidade(form);

    const email = form.elements.email?.value?.trim().toLowerCase();
    const mensagem = document.getElementById('mensagem');

    sessionStorage.setItem('dashboardDestinoConexoesUfjf', destino);

    if (email && tipo) {
      localStorage.setItem('conexoes_ufjf_tipo_' + email, tipo);
      salvarCadastroPrototipo(form, tipo, email);
    }

    if (mensagem) mensagem.textContent = 'Cadastro registrado com sucesso! Redirecionando...';

    setTimeout(() => {
      window.location.href = destino;
    }, 700);
  }, true);
}

function salvarCadastroPrototipo(form, tipo, email) {
  const dados = {
    tipo,
    email,
    criadoEm: new Date().toISOString()
  };

  Array.from(form.elements).forEach(campo => {
    if (!campo.name) return;
    if (campo.type === 'password') return;
    if (campo.type === 'checkbox') {
      dados[campo.name] = campo.checked;
    } else {
      dados[campo.name] = campo.value;
    }
  });

  const chave = 'conexoes_ufjf_cadastro_' + email;
  localStorage.setItem(chave, JSON.stringify(dados));
}

function garantirCamposCompatibilidade(form) {
  const camposObrigatoriosParaAuthAntigo = {
    matricula: '',
    curso: '',
    anoIngresso: '',
    situacao: '',
    anoConclusao: '',
    linkedin: '',
    fotoUrl: '',
    cidade: '',
    estado: '',
    areaAtuacao: '',
    empresaAtual: '',
    cargoAtual: '',
    bio: ''
  };

  Object.entries(camposObrigatoriosParaAuthAntigo).forEach(([nome, valor]) => {
    if (form.elements[nome]) return;

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = nome;
    input.value = valor;
    form.appendChild(input);
  });

  if (form.elements.tipoVinculo && !form.elements.situacao.value) {
    const tipo = form.elements.tipoVinculo.value;
    form.elements.situacao.value = tipo === 'placement' ? 'cursando' : tipo === 'parceiro' ? 'parceiro' : 'concluido';
  }

  if (form.elements.tipoVinculo?.value === 'parceiro') {
    if (!form.elements.anoIngresso.value) form.elements.anoIngresso.value = new Date().getFullYear();
    if (!form.elements.curso.value) form.elements.curso.value = 'Parceiro externo';
    if (!form.elements.matricula.value) form.elements.matricula.value = 'Parceiro externo';
  }
}

function initPosCadastro() {
  const path = document.location.pathname;
  if (!path.includes('perfil.html')) return;

  const destino = sessionStorage.getItem('dashboardDestinoConexoesUfjf');
  if (!destino) return;

  sessionStorage.removeItem('dashboardDestinoConexoesUfjf');
  const link = document.createElement('a');
  link.href = destino;
  document.body.appendChild(link);
  link.click();
}
