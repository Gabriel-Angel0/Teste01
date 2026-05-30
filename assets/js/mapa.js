const egressosDemo = [
  {
    nome: 'Ana Souza',
    curso: 'Medicina',
    anoConclusao: 2018,
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    area: 'Saúde',
    cargo: 'Cardiologista',
    empresa: 'Hospital Universitário',
    linkedin: 'https://www.linkedin.com',
    lat: -22.9068,
    lng: -43.1729
  },
  {
    nome: 'Carlos Mendes',
    curso: 'Engenharia Civil',
    anoConclusao: 2014,
    cidade: 'São Paulo',
    estado: 'SP',
    area: 'Engenharia',
    cargo: 'Gerente de Projetos',
    empresa: 'Construtora Horizonte',
    linkedin: 'https://www.linkedin.com',
    lat: -23.5505,
    lng: -46.6333
  },
  {
    nome: 'Rafael Fonseca',
    curso: 'Direito',
    anoConclusao: 2011,
    cidade: 'Juiz de Fora',
    estado: 'MG',
    area: 'Jurídico',
    cargo: 'Advogado Trabalhista',
    empresa: 'TBR Advogados',
    linkedin: 'https://www.linkedin.com',
    lat: -21.7642,
    lng: -43.3503
  },
  {
    nome: 'Larissa Borges',
    curso: 'Letras',
    anoConclusao: 2020,
    cidade: 'Lisboa',
    estado: 'Portugal',
    area: 'Educação',
    cargo: 'Professora e pesquisadora',
    empresa: 'Universidade de Lisboa',
    linkedin: 'https://www.linkedin.com',
    lat: 38.7223,
    lng: -9.1393
  },
  {
    nome: 'Bruno Almeida',
    curso: 'Economia',
    anoConclusao: 2022,
    cidade: 'Belo Horizonte',
    estado: 'MG',
    area: 'Finanças',
    cargo: 'Analista financeiro',
    empresa: 'Banco Mineiro',
    linkedin: 'https://www.linkedin.com',
    lat: -19.9167,
    lng: -43.9345
  },
  {
    nome: 'Marina Costa',
    curso: 'Ciência da Computação',
    anoConclusao: 2021,
    cidade: 'Florianópolis',
    estado: 'SC',
    area: 'Tecnologia',
    cargo: 'Engenheira de Software',
    empresa: 'GovTech Brasil',
    linkedin: 'https://www.linkedin.com',
    lat: -27.5949,
    lng: -48.5482
  },
  {
    nome: 'Felipe Rocha',
    curso: 'Administração',
    anoConclusao: 2019,
    cidade: 'Brasília',
    estado: 'DF',
    area: 'Gestão',
    cargo: 'Consultor de operações',
    empresa: 'Setor Público',
    linkedin: 'https://www.linkedin.com',
    lat: -15.7939,
    lng: -47.8828
  },
  {
    nome: 'Camila Torres',
    curso: 'Enfermagem',
    anoConclusao: 2017,
    cidade: 'Curitiba',
    estado: 'PR',
    area: 'Saúde',
    cargo: 'Coordenadora de enfermagem',
    empresa: 'Clínica Vida',
    linkedin: 'https://www.linkedin.com',
    lat: -25.4284,
    lng: -49.2733
  }
];

const map = L.map('mapa-egressos', {
  scrollWheelZoom: true
}).setView([-15.7, -47.9], 4);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 18,
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

const markersLayer = L.layerGroup().addTo(map);

const cursoFiltro = document.getElementById('filtro-curso');
const areaFiltro = document.getElementById('filtro-area');
const buscaFiltro = document.getElementById('filtro-busca');
const lista = document.getElementById('lista-egressos');
const totalEgressos = document.getElementById('total-egressos');
const totalCidades = document.getElementById('total-cidades');
const totalCursos = document.getElementById('total-cursos');

function preencherFiltros() {
  const cursos = [...new Set(egressosDemo.map(e => e.curso))].sort();
  const areas = [...new Set(egressosDemo.map(e => e.area))].sort();

  cursos.forEach(curso => {
    const option = document.createElement('option');
    option.value = curso;
    option.textContent = curso;
    cursoFiltro.appendChild(option);
  });

  areas.forEach(area => {
    const option = document.createElement('option');
    option.value = area;
    option.textContent = area;
    areaFiltro.appendChild(option);
  });
}

function filtrarEgressos() {
  const curso = cursoFiltro.value;
  const area = areaFiltro.value;
  const busca = buscaFiltro.value.toLowerCase().trim();

  return egressosDemo.filter(egresso => {
    const correspondeCurso = !curso || egresso.curso === curso;
    const correspondeArea = !area || egresso.area === area;
    const texto = `${egresso.nome} ${egresso.curso} ${egresso.cidade} ${egresso.estado} ${egresso.area} ${egresso.empresa}`.toLowerCase();
    const correspondeBusca = !busca || texto.includes(busca);
    return correspondeCurso && correspondeArea && correspondeBusca;
  });
}

function renderizarMapa() {
  const egressos = filtrarEgressos();
  markersLayer.clearLayers();

  egressos.forEach(egresso => {
    const marker = L.circleMarker([egresso.lat, egresso.lng], {
      radius: 9,
      color: '#005E83',
      weight: 2,
      fillColor: '#FFD900',
      fillOpacity: 0.9
    });

    marker.bindPopup(`
      <strong>${egresso.nome}</strong><br>
      ${egresso.curso} · ${egresso.anoConclusao}<br>
      ${egresso.cidade}, ${egresso.estado}<br>
      ${egresso.cargo}<br>
      <a href="${egresso.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
    `);

    marker.addTo(markersLayer);
  });

  renderizarLista(egressos);
  atualizarIndicadores(egressos);

  if (egressos.length > 0) {
    const bounds = L.latLngBounds(egressos.map(e => [e.lat, e.lng]));
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 5 });
  }
}

function renderizarLista(egressos) {
  lista.innerHTML = '';

  if (!egressos.length) {
    lista.innerHTML = '<p>Nenhum egresso encontrado com os filtros selecionados.</p>';
    return;
  }

  egressos.forEach(egresso => {
    const card = document.createElement('article');
    card.className = 'map-profile-card';
    card.innerHTML = `
      <div class="map-profile-avatar">${egresso.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}</div>
      <div>
        <h3>${egresso.nome}</h3>
        <p>${egresso.curso} · ${egresso.anoConclusao}</p>
        <p>${egresso.cargo} — ${egresso.empresa}</p>
        <span>${egresso.cidade}, ${egresso.estado} · ${egresso.area}</span>
      </div>
    `;

    card.addEventListener('click', () => {
      map.setView([egresso.lat, egresso.lng], 8);
    });

    lista.appendChild(card);
  });
}

function atualizarIndicadores(egressos) {
  totalEgressos.textContent = egressos.length;
  totalCidades.textContent = new Set(egressos.map(e => `${e.cidade}-${e.estado}`)).size;
  totalCursos.textContent = new Set(egressos.map(e => e.curso)).size;
}

[cursoFiltro, areaFiltro, buscaFiltro].forEach(elemento => {
  elemento.addEventListener('input', renderizarMapa);
});

preencherFiltros();
renderizarMapa();
