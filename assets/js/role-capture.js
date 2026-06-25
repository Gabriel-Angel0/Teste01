document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('form-cadastro');
  if (!form) return;

  form.addEventListener('submit', function () {
    const email = form.elements.email?.value?.trim().toLowerCase();
    const rawType = form.elements.tipoVinculo?.value || form.dataset.tipo || 'alumni';
    const type = normalizeType(rawType);

    if (email) {
      localStorage.setItem('conexoes_ufjf_tipo_' + email, type);
    }
  }, true);
});

function normalizeType(value) {
  const type = String(value || '').toLowerCase().trim();
  if (['placement', 'placements', 'aluno', 'estudante'].includes(type)) return 'placement';
  if (['parceiro', 'empresa'].includes(type)) return 'parceiro';
  return 'alumni';
}
