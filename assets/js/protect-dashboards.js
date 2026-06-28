import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';
import { firebaseConfig } from './firebase-config.js';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const rolePages = {
  placement: 'dashboard-placement.html',
  alumni: 'dashboard-alumni.html',
  parceiro: 'dashboard-parceiro.html'
};

const required = requiredRole();
document.documentElement.style.visibility = 'hidden';

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.replace('login.html');
    return;
  }

  const role = await readRole(user.uid);

  if (!role) {
    window.location.replace('login.html');
    return;
  }

  if (role === 'placement') {
    await user.reload();
    if (!user.emailVerified) {
      window.location.replace('login.html');
      return;
    }
  }

  if (required && role !== required) {
    window.location.replace(rolePages[role] || 'login.html');
    return;
  }

  document.documentElement.style.visibility = 'visible';
});

async function readRole(uid) {
  const places = ['users', 'profiles', 'egressos'];

  for (const collection of places) {
    const snap = await getDoc(doc(db, collection, uid));
    if (snap.exists()) {
      return normalize(snap.data().role || snap.data().tipoUsuario || snap.data().tipoVinculo);
    }
  }

  return '';
}

function normalize(value) {
  const role = String(value || '').toLowerCase().trim();
  if (role === 'placement' || role === 'placements' || role === 'aluno' || role === 'estudante') return 'placement';
  if (role === 'parceiro' || role === 'parceiros' || role === 'empresa') return 'parceiro';
  if (role === 'alumni') return 'alumni';
  return '';
}

function requiredRole() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('dashboard-placement')) return 'placement';
  if (path.includes('dashboard-alumni')) return 'alumni';
  if (path.includes('dashboard-parceiro')) return 'parceiro';
  return '';
}
