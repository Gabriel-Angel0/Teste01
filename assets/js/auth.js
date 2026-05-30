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

if (cadastroForm) {
  cadastroForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = cadastroForm.nome.value;
    const email = cadastroForm.email.value;
    const curso = cadastroForm.curso.value;
    const ano = cadastroForm.ano.value;
    const senha = cadastroForm.senha.value;

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, senha);

      await setDoc(doc(db, 'egressos', cred.user.uid), {
        nome,
        email,
        curso,
        ano,
        criadoEm: new Date().toISOString()
      });

      document.getElementById('mensagem').textContent = 'Cadastro realizado com sucesso!';
      cadastroForm.reset();
    } catch (error) {
      document.getElementById('mensagem').textContent = error.message;
    }
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = loginForm.email.value;
    const senha = loginForm.senha.value;

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      window.location.href = '../index.html';
    } catch (error) {
      document.getElementById('mensagem-login').textContent = error.message;
    }
  });
}
