// dados principais
let disciplinas = JSON.parse(localStorage.getItem('disciplinas')) || [];

// id da disciplina que esta no modal
let editandoId = null;

// filtro atual
let filtroAtivo = 'Todos';


// salva no navegador
function salvarNoStorage() {
  localStorage.setItem('disciplinas', JSON.stringify(disciplinas));
}


// gera id simples
function gerarId() {
  return Date.now().toString();
}


function salvarDisciplina() {
  const nome      = document.getElementById('nome').value.trim();
  const professor = document.getElementById('professor').value.trim();
  const carga     = parseFloat(document.getElementById('carga').value);
  const area      = document.getElementById('area').value;

  if (!nome || !professor || !carga || !area) {
    mostrarToast('Preencha todos os campos!', 'erro');
    return;
  }

  if (carga <= 0) {
    mostrarToast('A carga horária deve ser maior que zero!', 'erro');
    return;
  }

  disciplinas.push({
    id:             gerarId(),
    nome,
    professor,
    carga,
    area,
    horasEstudadas: 0
  });

  salvarNoStorage();
  limparFormulario();
  renderizarLista();
  atualizarSelectDisciplinas();
  atualizarEstatisticas();
  mostrarToast('Disciplina cadastrada com sucesso!', 'sucesso');
}


function limparFormulario() {
  document.getElementById('nome').value      = '';
  document.getElementById('professor').value = '';
  document.getElementById('carga').value     = '';
  document.getElementById('area').value      = '';
}


function excluirDisciplina(id) {
  disciplinas = disciplinas.filter(d => d.id !== id);

  salvarNoStorage();
  renderizarLista();
  atualizarSelectDisciplinas();
  atualizarEstatisticas();
  mostrarToast('Disciplina removida!', 'sucesso');
}


function abrirModal(id) {
  const d = disciplinas.find(d => d.id === id);
  if (!d) return;

  editandoId = id;

  document.getElementById('m-nome').value      = d.nome;
  document.getElementById('m-professor').value = d.professor;
  document.getElementById('m-carga').value     = d.carga;
  document.getElementById('m-area').value      = d.area;

  document.getElementById('modal-overlay').classList.add('ativo');
}


function fecharModal() {
  document.getElementById('modal-overlay').classList.remove('ativo');
  editandoId = null;
}

// fecha se clicar fora
document.getElementById('modal-overlay').addEventListener('click', function(e) {
  if (e.target === this) fecharModal();
});


function salvarEdicao() {
  const nome      = document.getElementById('m-nome').value.trim();
  const professor = document.getElementById('m-professor').value.trim();
  const carga     = parseFloat(document.getElementById('m-carga').value);
  const area      = document.getElementById('m-area').value;

  if (!nome || !professor || !carga || !area) {
    mostrarToast('Preencha todos os campos!', 'erro');
    return;
  }

  const idx = disciplinas.findIndex(d => d.id === editandoId);
  if (idx !== -1) {
    disciplinas[idx].nome      = nome;
    disciplinas[idx].professor = professor;
    disciplinas[idx].carga     = carga;
    disciplinas[idx].area      = area;
  }

  salvarNoStorage();
  fecharModal();
  renderizarLista();
  atualizarSelectDisciplinas();
  atualizarEstatisticas();
  mostrarToast('Disciplina atualizada!', 'sucesso');
}


function registrarHoras() {
  const id    = document.getElementById('sel-disciplina').value;
  const horas = parseFloat(document.getElementById('horas-input').value);

  if (!id) {
    mostrarToast('Selecione uma disciplina!', 'erro');
    return;
  }

  if (!horas || horas <= 0) {
    mostrarToast('Informe um número de horas válido!', 'erro');
    return;
  }

  const idx = disciplinas.findIndex(d => d.id === id);
  if (idx !== -1) {
    disciplinas[idx].horasEstudadas += horas;

    if (disciplinas[idx].horasEstudadas > disciplinas[idx].carga) {
      disciplinas[idx].horasEstudadas = disciplinas[idx].carga;
      mostrarToast('Carga horária já foi completada!', 'sucesso');
    } else {
      mostrarToast(`${horas}h adicionadas em ${disciplinas[idx].nome}!`, 'sucesso');
    }
  }

  document.getElementById('horas-input').value = '';

  salvarNoStorage();
  renderizarLista();
  atualizarEstatisticas();
}


// atualiza o select da parte de horas
function atualizarSelectDisciplinas() {
  const sel = document.getElementById('sel-disciplina');
  sel.innerHTML = '<option value="">Selecione...</option>';

  disciplinas.forEach(d => {
    const opt       = document.createElement('option');
    opt.value       = d.id;
    opt.textContent = d.nome;
    sel.appendChild(opt);
  });
}


function filtrar(btn) {
  document.querySelectorAll('.filtro').forEach(b => b.classList.remove('ativo'));
  btn.classList.add('ativo');

  filtroAtivo = btn.dataset.area;
  renderizarLista();
}


// busca em tempo real
document.getElementById('busca').addEventListener('input', function() {
  renderizarLista();
});


function renderizarLista() {
  const container = document.getElementById('lista-disciplinas');
  const busca     = document.getElementById('busca').value.toLowerCase().trim();

  const lista = disciplinas.filter(d => {
    const matchArea  = filtroAtivo === 'Todos' || d.area === filtroAtivo;
    const matchBusca = d.nome.toLowerCase().includes(busca);
    return matchArea && matchBusca;
  });

  if (lista.length === 0) {
    container.innerHTML = `
      <div class="vazio">
        <div class="icone">📭</div>
        <p>${disciplinas.length === 0
          ? 'Nenhuma disciplina cadastrada ainda.'
          : 'Nenhuma disciplina encontrada para esse filtro.'
        }</p>
      </div>`;
    return;
  }

  container.innerHTML = lista.map(d => {
    const pct    = d.carga > 0 ? Math.min((d.horasEstudadas / d.carga) * 100, 100) : 0;
    const pctStr = pct.toFixed(0);

    return `
      <div class="card" data-area="${d.area}">

        <div class="card-topo">
          <div>
            <div class="card-nome">${d.nome}</div>
            <div class="card-professor">👤 ${d.professor}</div>
          </div>
          <span class="badge ${d.area}">${d.area}</span>
        </div>

        <div class="progresso-info">
          <span>${d.horasEstudadas}h de ${d.carga}h</span>
          <strong>${pctStr}%</strong>
        </div>
        <div class="barra-bg">
          <div class="barra-fill" style="width: ${pctStr}%"></div>
        </div>

        <div class="card-acoes">
          <button class="btn-acao" onclick="abrirModal('${d.id}')">✏️ Editar</button>
          <button class="btn-acao excluir" onclick="excluirDisciplina('${d.id}')">🗑️ Excluir</button>
        </div>

      </div>`;
  }).join('');
}


function atualizarEstatisticas() {
  document.getElementById('total-disciplinas').textContent = disciplinas.length;

  const totalH = disciplinas.reduce((acc, d) => acc + d.horasEstudadas, 0);
  document.getElementById('total-horas').textContent = totalH + 'h';
}


let toastTimer;

function mostrarToast(msg, tipo = 'sucesso') {
  const t    = document.getElementById('toast');
  t.textContent = msg;
  t.className   = 'visivel ' + tipo;

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = ''; }, 3000);
}


// inicia tela
renderizarLista();
atualizarSelectDisciplinas();
atualizarEstatisticas();