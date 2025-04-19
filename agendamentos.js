document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadAgendamentos();
    
    // Configuração do formulário de agendamento
    const agendamentoForm = document.getElementById('agendamentoForm');
    if(agendamentoForm) {
        agendamentoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(agendamentoForm);
            const petId = formData.get('petId');
            const dataAgendamento = formData.get('data_agendamento');
            const servico = formData.get('servico');
            const observacoes = formData.get('observacoes');
            const imagem = formData.get('imagem');
            
            try {
                const response = await fetchWithAuth('/api/agendamentos', {
                    method: 'POST',
                    body: formData
                });
                
                if(response.ok) {
                    alert('Agendamento realizado com sucesso!');
                    agendamentoForm.reset();
                    document.getElementById('preview').style.display = 'none';
                    loadAgendamentos();
                } else {
                    const error = await response.json();
                    showMessage(error.message || 'Erro ao agendar', 'error');
                }
            } catch (err) {
                showMessage('Erro ao conectar com o servidor', 'error');
            }
        });
    }
    
    // Preview da imagem
    const imagemInput = document.getElementById('imagemPet');
    if(imagemInput) {
        imagemInput.addEventListener('change', function(e) {
            const preview = document.getElementById('preview');
            if(this.files && this.files[0]) {
                preview.style.display = 'block';
                preview.src = URL.createObjectURL(this.files[0]);
            }
        });
    }
});

async function loadAgendamentos() {
    try {
        const response = await fetchWithAuth('/api/agendamentos');
        if(!response.ok) throw new Error('Erro ao carregar agendamentos');
        
        const agendamentos = await response.json();
        const container = document.getElementById('agendamentosContainer');
        
        if(agendamentos.length === 0) {
            container.innerHTML = '<p>Nenhum agendamento encontrado</p>';
            return;
        }
        
        const html = agendamentos.map(ag => `
            <div class="agendamento-card">
                <div class="agendamento-image">
                    ${ag.imagem_path ? `<img src="/uploads/${ag.imagem_path}" alt="${ag.pet_nome}">` : '<div class="no-image"><i class="fas fa-paw"></i></div>'}
                </div>
                <div class="agendamento-info">
                    <h3>${ag.pet_nome} <small>${ag.raca}</small></h3>
                    <p><strong>Serviço:</strong> ${ag.servico}</p>
                    <p><strong>Data:</strong> ${new Date(ag.data_agendamento).toLocaleString()}</p>
                    <p><strong>Observações:</strong> ${ag.observacoes || 'Nenhuma'}</p>
                </div>
                <div class="agendamento-actions">
                    <button class="btn btn-outline" onclick="editarAgendamento(${ag.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="cancelarAgendamento(${ag.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
    } catch (err) {
        showMessage(err.message, 'error');
    }
}

function showMessage(message, type = 'success') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    messageDiv.className = `message ${type}`;
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Função auxiliar para chamadas autenticadas
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
    };
    return await fetch(url, options);
}

// Preview da foto
document.getElementById('foto-pet').addEventListener('change', function(e) {
    const preview = document.getElementById('preview-foto');
    if (this.files && this.files[0]) {
      preview.style.display = 'block';
      preview.src = URL.createObjectURL(this.files[0]);
    }
  });
  
  // Envio do formulário
  document.getElementById('form-agendamento').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('pet', document.getElementById('pet').value);
    formData.append('servico', document.querySelector('input[name="servico"]:checked').value);
    formData.append('data', document.getElementById('data').value);
    formData.append('foto', document.getElementById('foto-pet').files[0]);
  
    try {
      const response = await fetch('/api/agendamentos', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        alert('Agendamento realizado com sucesso!');
        window.location.href = 'meus-agendamentos.html';
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  });
  // Exemplo de chamada para listar agendamentos
async function loadAgendamentos() {
    const response = await fetch('/api/agendamentos');
    const data = await response.json();
    
    // Renderiza os agendamentos na página
    renderAgendamentos(data);
  }
  document.getElementById('agendamentoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    try {
      const response = await fetch('/api/agendamentos', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        // Recarrega a lista
        loadAgendamentos();
        // Fecha o modal
        modal.style.display = 'none';
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  });