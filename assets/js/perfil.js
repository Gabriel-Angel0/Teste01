import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loading = document.getElementById('perfil-loading');
const conteudo = document.getElementById('perfil-conteudo');
const erro = document.getElementById('perfil-erro');
const sairBtn = document.getElementById('btn-sair');
const salvarBtn = document.getElementById('btn-salvar');
const form = document.getElementById('form-perfil');

let usuarioAtual = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  usuarioAtual = user;
  await carregarPerfil(user.uid);
});

async function carregarPerfil(uid) {
  try {
    const ref = doc(db, 'egressos', uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      mostrarErro('Perfil não encontrado. Faça o cadastro novamente ou entre em contato com o suporte.');
      return;
    }

    const dados = snap.data();
    preencherTela(dados);
    preencherFormulario(dados);

    loading.style.display = 'none';
    conteudo.style.display = 'grid';
    abrirAbaPerfil('overview');
  } catch (error) {
    console.error(error);
    mostrarErro('Não foi possível carregar seu perfil. Verifique as regras do Firestore e tente novamente.');
  }
}

function preencherTela(dados) {
  setText('perfil-nome', dados.nome || 'Egresso UFJF');
  setText('perfil-curso', dados.curso || 'Curso não informado');
  setText('perfil-email', dados.email || usuarioAtual?.email || '');
  setText('perfil-matricula', dados.matricula || 'Não informada');
  setText('perfil-ingresso', dados.anoIngresso || '—');
  setText('perfil-conclusao', dados.anoConclusao || (dados.situacao === 'cursando' ? 'Cursando' : '—'));
  setText('perfil-localizacao', [dados.cidade, dados.estado].filter(Boolean).join(', ') || 'Não informada');
  setText('perfil-area', dados.areaAtuacao || 'Não informada');
  setText('perfil-empresa', dados.empresaAtual || 'Não informada');
  setText('perfil-cargo', dados.cargoAtual || 'Não informado');
  setText('perfil-bio', dados.bio || 'Nenhuma bio cadastrada ainda.');
  setText('perfil-status', dados.statusVerificacao === 'verificado' ? 'Egresso verificado' : 'Verificação pendente');

  const linkedin = document.getElementById('perfil-linkedin');
  if (linkedin) {
    if (dados.linkedin) {
      linkedin.href = dados.linkedin;
      linkedin.textContent = 'Ver LinkedIn';
      linkedin.style.display = 'inline-flex';
    } else {
      linkedin.style.display = 'none';
    }
  }

  const avatar = document.getElementById('perfil-avatar');
  if (avatar) {
    avatar.textContent = gerarIniciais(dados.nome || 'Egresso UFJF');
    avatar.style.backgroundImage = '';

    if (dados.fotoUrl) {
      avatar.style.backgroundImage = `url('${dados.fotoUrl}')`;
      avatar.style.backgroundSize = 'cover';
      avatar.style.backgroundPosition = 'center';
      avatar.textContent = '';
    }
  }

  atualizarPreferencia('pref-mapa', dados.aparecerNoMapa);
  atualizarPreferencia('pref-contato', dados.aceitarContato);
  atualizarPreferencia('pref-oportunidades', dados.receberOportunidades);
  atualizarPreferencia('pref-mentoria', dados.participarMentoria);
  atualizarPreferencia('pref-newsletter', dados.receberNewsletter);
}

function preencherFormulario(dados) {
  if (!form) return;

  form.nome.value = dados.nome || '';
  form.curso.value = dados.curso || '';
  form.matricula.value = dados.matricula || '';
  form.anoIngresso.value = dados.anoIngresso || '';
  form.anoConclusao.value = dados.anoConclusao || '';
  form.linkedin.value = dados.linkedin || '';
  form.fotoUrl.value = dados.fotoUrl || '';
  form.cidade.value = dados.cidade || '';
  form.estado.value = dados.estado || '';
  form.areaAtuacao.value = dados.areaAtuacao || '';
  form.empresaAtual.value = dados.empresaAtual || '';
  form.cargoAtual.value = dados.cargoAtual || '';
  form.bio.value = dados.bio || '';
  form.aparecerNoMapa.checked = Boolean(dados.aparecerNoMapa);
  form.aceitarContato.checked = Boolean(dados.aceitarContato);
  form.receberOportunidades.checked = Boolean(dados.receberOportunidades);
  form.participarMentoria.checked = Boolean(dados.participarMentoria);
  form.receberNewsletter.checked = Boolean(dados.receberNewsletter);
}

if (form) {
  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!usuarioAtual) return;

    salvarBtn.textContent = 'Salvando...';
    salvarBtn.disabled = true;

    const dadosAtualizados = {
      nome: form.nome.value.trim(),
      curso: form.curso.value.trim(),
      matricula: form.matricula.value.trim(),
      anoIngresso: Number(form.anoIngresso.value) || null,
      anoConclusao: Number(form.anoConclusao.value) || null,
      linkedin: form.linkedin.value.trim(),
      fotoUrl: form.fotoUrl.value.trim(),
      cidade: form.cidade.value.trim(),
      estado: form.estado.value.trim().toUpperCase(),
      areaAtuacao: form.areaAtuacao.value.trim(),
      empresaAtual: form.empresaAtual.value.trim(),
      cargoAtual: form.cargoAtual.value.trim(),
      bio: form.bio.value.trim(),
      aparecerNoMapa: form.aparecerNoMapa.checked,
      aceitarContato: form.aceitarContato.checked,
      receberOportunidades: form.receberOportunidades.checked,
      participarMentoria: form.participarMentoria.checked,
      receberNewsletter: form.receberNewsletter.checked,
      atualizadoEm: new Date().toISOString()
    };

    try {
      const ref = doc(db, 'egressos', usuarioAtual.uid);
      await updateDoc(ref, dadosAtualizados);
      preencherTela(dadosAtualizados);
      abrirAbaPerfil('overview');
    } catch (error) {
      console.error(error);
      alert('Não foi possível salvar as alterações.');
    } finally {
      salvarBtn.textContent = 'Salvar alterações';
      salvarBtn.disabled = false;
    }
  });
}

if (sairBtn) {
  sairBtn.addEventListener('click', async () => {
    await signOut(auth);
    window.location.href = '../index.html';
  });
}

function abrirAbaPerfil(tab) {
  const visualizacao = document.getElementById('perfil-visualizacao');
  const edicao = document.getElementById('perfil-edicao');

  document.querySelectorAll('.profile-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  if (visualizacao) visualizacao.classList.toggle('active', tab === 'overview');
  if (edicao) edicao.classList.toggle('active', tab === 'edit');
}

window.abrirAbaPerfil = abrirAbaPerfil;

document.addEventListener('click', (event) => {
  const tab = event.target?.dataset?.tab;
  if (tab) abrirAbaPerfil(tab);

  if (event.target?.id === 'btn-editar-hero') {
    abrirAbaPerfil('edit');
  }
});

function setText(id, valor) {
  const el = document.getElementById(id);
  if (el) el.textContent = valor;
}

function atualizarPreferencia(id, ativo) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = ativo ? 'Ativo' : 'Inativo';
  el.className = ativo ? 'status-pill status-on' : 'status-pill status-off';
}

function gerarIniciais(nome) {
  return nome
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(parte => parte[0].toUpperCase())
    .join('');
}

function mostrarErro(mensagem) {
  loading.style.display = 'none';
  erro.style.display = 'block';
  erro.textContent = mensagem;
}