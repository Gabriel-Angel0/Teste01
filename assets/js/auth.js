import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const DASHBOARDS = {
  placement: 'dashboard-placement.html',
  alumni: 'dashboard-alumni.html',
  parceiro: 'dashboard-parceiro.html'
};

let cadastroForm = document.getElementById('form-cadastro');
const loginForm = document.getElementById('form-login');
const logoutButtons = document.querySelectorAll('[data-logout], #btn-logout');

// Remove listeners antigos de protótipo que eram registrados em main.js.
// Isso garante que o submit seja tratado pelo Firebase abaixo.
if (cadastroForm) {
  const cleanForm = cadastroForm.cloneNode(true);
  cadastroForm.replaceWith(cleanForm);
  cadastroForm = cleanForm;
  cadastroForm.addEventListener('submit', handleCadastro);
}

if (loginForm) {
  loginForm.addEventListener('submit', handleLogin);
}

logoutButtons.forEach((button) => {
  button.addEventListener('click', async (event) => {
    event.preventDefault();
    await signOut(auth);
    window.location.href = 'login.html';
  });
});

async function handleCadastro(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const mensagem = document.getElementById('mensagem');
  setMessage(mensagem, 'Enviando cadastro...', 'info');

  const email = getValue(form, 'email').toLowerCase();
  const senha = getValue(form, 'senha');
  const role = getRole(form);

  if (!email || !senha) {
    setMessage(mensagem, 'Preencha e-mail e senha.', 'error');
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, senha);
    const uid = cred.user.uid;
    const profile = buildProfile(form, role, uid, email);

    await Promise.all([
      setDoc(doc(db, 'users', uid), {
        uid,
        nome: profile.nome,
        email,
        role,
        status: role === 'parceiro' ? 'pendente' : 'ativo',
        criadoEm: serverTimestamp(),
        atualizadoEm: serverTimestamp()
      }, { merge: true }),
      setDoc(doc(db, 'profiles', uid), profile, { merge: true }),
      setDoc(doc(db, 'egressos', uid), profile, { merge: true })
    ]);

    setMessage(mensagem, 'Cadastro realizado com sucesso! Redirecionando...', 'success');

    setTimeout(() => {
      window.location.href = dashboardFor(role);
    }, 700);
  } catch (error) {
    console.error(error);
    setMessage(mensagem, translateFirebaseError(error.code || error.message), 'error');
  }
}

async function handleLogin(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const mensagem = document.getElementById('mensagem-login');
  setMessage(mensagem, 'Entrando...', 'info');

  const email = form.email.value.trim().toLowerCase();
  const senha = form.senha.value;

  try {
    const cred = await signInWithEmailAndPassword(auth, email, senha);
    const role = await getUserRole(cred.user.uid);
    window.location.href = dashboardFor(role);
  } catch (error) {
    console.error(error);
    setMessage(mensagem, translateFirebaseError(error.code || error.message), 'error');
  }
}

async function getUserRole(uid) {
  const userSnap = await getDoc(doc(db, 'users', uid));
  if (userSnap.exists()) return normalizeRole(userSnap.data().role);

  const profileSnap = await getDoc(doc(db, 'profiles', uid));
  if (profileSnap.exists()) return normalizeRole(profileSnap.data().role || profileSnap.data().tipoUsuario || profileSnap.data().tipoVinculo);

  const oldSnap = await getDoc(doc(db, 'egressos', uid));
  if (oldSnap.exists()) return normalizeRole(oldSnap.data().role || oldSnap.data().tipoUsuario || oldSnap.data().tipoVinculo);

  return 'alumni';
}

function buildProfile(form, role, uid, email) {
  const data = {
    uid,
    role,
    tipoUsuario: role,
    tipoVinculo: role,
    nome: getValue(form, 'nome'),
    email,
    matricula: getValue(form, 'matricula'),
    curso: getValue(form, 'curso'),
    categoriaAlumni: getValue(form, 'categoriaAlumni'),
    tipoParceiro: getValue(form, 'tipoParceiro'),
    periodoAtual: getValue(form, 'periodoAtual'),
    campus: getValue(form, 'campus'),
    tipoOportunidade: getValue(form, 'tipoOportunidade'),
    portfolio: getValue(form, 'portfolio'),
    cnpj: getValue(form, 'cnpj'),
    site: getValue(form, 'site'),
    responsavel: getValue(form, 'responsavel'),
    cargoResponsavel: getValue(form, 'cargoResponsavel'),
    telefone: getValue(form, 'telefone'),
    interesseParceria: getValue(form, 'interesseParceria'),
    anoIngresso: getNumber(form, 'anoIngresso'),
    anoConclusao: getNumber(form, 'anoConclusao'),
    situacao: getValue(form, 'situacao') || defaultSituacao(role),
    linkedin: getValue(form, 'linkedin'),
    fotoUrl: getValue(form, 'fotoUrl'),
    cidade: getValue(form, 'cidade'),
    estado: getValue(form, 'estado').toUpperCase(),
    areaAtuacao: getValue(form, 'areaAtuacao'),
    empresaAtual: getValue(form, 'empresaAtual'),
    cargoAtual: getValue(form, 'cargoAtual'),
    bio: getValue(form, 'bio'),
    aparecerNoMapa: getChecked(form, 'aparecerNoMapa'),
    aceitarContato: getChecked(form, 'aceitarContato'),
    receberOportunidades: getChecked(form, 'receberOportunidades'),
    participarMentoria: getChecked(form, 'participarMentoria'),
    receberNewsletter: getChecked(form, 'receberNewsletter'),
    statusVerificacao: 'pendente',
    atualizadoEm: serverTimestamp(),
    criadoEm: serverTimestamp()
  };

  Object.keys(data).forEach((key) => {
    if (data[key] === undefined) delete data[key];
  });

  return data;
}

function getRole(form) {
  return normalizeRole(getValue(form, 'tipoVinculo') || getValue(form, 'role') || detectRoleFromPath());
}

function detectRoleFromPath() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('placement')) return 'placement';
  if (path.includes('parceiro')) return 'parceiro';
  return 'alumni';
}

function normalizeRole(value) {
  const role = String(value || '').toLowerCase().trim();
  if (['placement', 'placements', 'aluno', 'estudante'].includes(role)) return 'placement';
  if (['parceiro', 'parceiros', 'empresa', 'organizacao', 'organização'].includes(role)) return 'parceiro';
  return 'alumni';
}

function dashboardFor(role) {
  return DASHBOARDS[normalizeRole(role)] || DASHBOARDS.alumni;
}

function defaultSituacao(role) {
  if (role === 'placement') return 'cursando';
  if (role === 'parceiro') return 'parceiro';
  return 'concluido';
}

function getValue(form, name) {
  return form.elements[name]?.value?.trim() || '';
}

function getNumber(form, name) {
  const value = getValue(form, name);
  return value ? Number(value) : null;
}

function getChecked(form, name) {
  return Boolean(form.elements[name]?.checked);
}

function setMessage(element, text, type = 'info') {
  if (!element) return;
  element.textContent = text;
  const colors = { info: '#bfdbfe', success: '#86efac', error: '#fecaca' };
  element.style.color = colors[type] || colors.info;
}

function translateFirebaseError(code) {
  const errors = {
    'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
    'auth/invalid-email': 'Digite um e-mail válido.',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/missing-password': 'Digite uma senha.',
    'auth/invalid-credential': 'E-mail ou senha inválidos.',
    'auth/user-not-found': 'Usuário não encontrado.',
    'auth/wrong-password': 'Senha incorreta.',
    'permission-denied': 'Permissão negada no Firestore. Verifique as regras do banco de dados.'
  };

  return errors[code] || `Erro: ${code}`;
}

export { auth, db, getUserRole, dashboardFor, normalizeRole };
