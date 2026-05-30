import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import {
  getFirestore,
  doc,
  setDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const cadastroForm = document.getElementById('form-cadastro');
const loginForm = document.getElementById('form-login');
const situacaoSelect = document.getElementById('situacao');
const campoAnoConclusao = document.getElementById('campo-ano-conclusao');

if (situacaoSelect && campoAnoConclusao) {
  situacaoSelect.addEventListener('change', () => {
    const anoConclusaoInput = cadastroForm?.anoConclusao;

    if (situacaoSelect.value === 'concluido') {
      campoAnoConclusao.style.display = 'block';
      if (anoConclusaoInput) anoConclusaoInput.required = true;
    } else {
      campoAnoConclusao.style.display = 'none';
      if (anoConclusaoInput) {
        anoConclusaoInput.required = false;
        anoConclusaoInput.value = '';
      }
    }
  });
}

if (cadastroForm) {
  cadastroForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const mensagem = document.getElementById('mensagem');
    mensagem.textContent = 'Enviando cadastro...';

    const dados = {
      nome: cadastroForm.nome.value.trim(),
      email: cadastroForm.email.value.trim(),
      matricula: cadastroForm.matricula.value.trim(),
      curso: cadastroForm.curso.value.trim(),
      anoIngresso: Number(cadastroForm.anoIngresso.value),
      situacao: cadastroForm.situacao.value,
      anoConclusao: cadastroForm.anoConclusao.value ? Number(cadastroForm.anoConclusao.value) : null,
      linkedin: cadastroForm.linkedin.value.trim(),
      fotoUrl: cadastroForm.fotoUrl.value.trim(),
      cidade: cadastroForm.cidade.value.trim(),
      estado: cadastroForm.estado.value.trim().toUpperCase(),
      areaAtuacao: cadastroForm.areaAtuacao.value.trim(),
      empresaAtual: cadastroForm.empresaAtual.value.trim(),
      cargoAtual: cadastroForm.cargoAtual.value.trim(),
      bio: cadastroForm.bio.value.trim(),
      tipoUsuario: 'egresso',
      criadoEm: new Date().toISOString()
    };

    const senha = cadastroForm.senha.value;

    try {
      const cred = await createUserWithEmailAndPassword(auth, dados.email, senha);
      await setDoc(doc(db, 'egressos', cred.user.uid), dados);

      mensagem.textContent = 'Cadastro realizado com sucesso! Redirecionando...';
      cadastroForm.reset();

      setTimeout(() => {
        window.location.href = '../index.html';
      }, 1800);
    } catch (error) {
      console.error(error);
      mensagem.textContent = traduzirErroFirebase(error.code || error.message);
    }
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const mensagem = document.getElementById('mensagem-login');
    mensagem.textContent = 'Entrando...';

    const email = loginForm.email.value.trim();
    const senha = loginForm.senha.value;

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      window.location.href = '../index.html';
    } catch (error) {
      console.error(error);
      mensagem.textContent = traduzirErroFirebase(error.code || error.message);
    }
  });
}

function traduzirErroFirebase(codigo) {
  const erros = {
    'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
    'auth/invalid-email': 'Digite um e-mail válido.',
    'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
    'auth/missing-password': 'Digite uma senha.',
    'auth/invalid-credential': 'E-mail ou senha inválidos.',
    'permission-denied': 'Permissão negada no Firestore. Verifique as regras do banco de dados.'
  };

  return erros[codigo] || `Erro: ${codigo}`;
}
