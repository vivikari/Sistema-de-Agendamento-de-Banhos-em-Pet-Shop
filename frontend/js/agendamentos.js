document.addEventListener('DOMContentLoaded', async () => {
    // Verifica autenticação
    if (!await checkAuth()) {
        window.location.href = 'login.html';
        return;
    }

    // Carrega dados iniciais
    await loadPets(); // Carrega pets para o select
    await loadAgendamentos();

    // Adicione esta função para carregar os pets do usuário
async function loadPets() {
    try {
        const response = await fetchWithAuth('/api/pets');
        if (!response.ok) throw new Error('Erro ao carregar pets');
        
        const pets = await response.json();
        const petSelect = document.getElementById('petId');
        
        petSelect.innerHTML = pets.map(pet => `
            <option value="${pet.id}">${pet.nome} (${pet.raca})</option>
        `).join('');
        
        // Adicione opção para novo pet
        petSelect.innerHTML += '<option value="new">+ Cadastrar novo pet</option>';
        
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

    // Configuração do formulário de agendamento
    const agendamentoForm = document.getElementById('agendamentoForm');
    if (agendamentoForm) {
        agendamentoForm.addEventListener('submit', handleAgendamentoSubmit);
    }

    // Preview da imagem
    const imagemInput = document.getElementById('imagemPet');
    if (imagemInput) {
        imagemInput.addEventListener('change', handleImagePreview);
    }
});

// Função unificada para verificar autenticação
async function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        const response = await fetch('/api/validate-token', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Função melhorada para carregar agendamentos
async function loadAgendamentos() {
    try {
        showLoading(true);
        
        const response = await fetchWithAuth('/api/agendamentos');
        if (!response.ok) throw new Error('Erro ao carregar agendamentos');
        
        const agendamentos = await response.json();
        renderAgendamentos(agendamentos);
        
    } catch (error) {
        showMessage(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// Renderização otimizada de agendamentos
function renderAgendamentos(agendamentos) {
    const container = document.getElementById('agendamentosContainer');
    
    if (!agendamentos || agendamentos.length === 0) {
        container.innerHTML = '<p class="no-results">Nenhum agendamento encontrado</p>';
        return;
    }

    container.innerHTML = agendamentos.map(ag => `
        <div class="agendamento-card" data-id="${ag.id}">
            <div class="agendamento-image">
                ${ag.imagem_path ? 
                    `<img src="/uploads/${ag.imagem_path}" alt="${ag.pet_nome}">` : 
                    '<div class="no-image"><i class="fas fa-paw"></i></div>'}
            </div>
            <div class="agendamento-info">
                <h3>${ag.pet_nome} <small>${ag.raca}</small></h3>
                <p><strong>Serviço:</strong> ${ag.servico}</p>
                <p><strong>Data:</strong> ${formatDateTime(ag.data_agendamento)}</p>
                <p><strong>Observações:</strong> ${ag.observacoes || 'Nenhuma'}</p>
            </div>
            <div class="agendamento-actions">
                <button class="btn btn-outline" onclick="editAgendamento(${ag.id})">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-danger" onclick="confirmDelete(${ag.id})">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        </div>
    `).join('');
}

// Atualize o manipulador de submit
async function handleAgendamentoSubmit(e) {
    e.preventDefault();
    
    try {
        const petId = document.getElementById('petId').value;
        
        // Se for um novo pet, crie primeiro
        if (petId === 'new') {
            const novoPet = await cadastrarNovoPet();
            if (!novoPet) return;
        }
        
        // Resto da lógica de agendamento...
    } catch (error) {
        showMessage(error.message, 'error');
    }
}

async function cadastrarNovoPet() {
    // Implemente um modal ou formulário para cadastro rápido
    const nome = prompt('Nome do novo pet:');
    if (!nome) return null;
    
    const raca = prompt('Raça do pet:');
    const response = await fetchWithAuth('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, raca })
    });
    
    if (!response.ok) throw new Error('Erro ao cadastrar pet');
    
    return await response.json();
}

// Funções auxiliares melhoradas
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    const defaultHeaders = {
        'Authorization': `Bearer ${token}`,
        ...(options.body instanceof FormData ? {} : {'Content-Type': 'application/json'})
    };
    
    return await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers
        }
    });
}

function showMessage(message, type = 'success') {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => messageDiv.style.display = 'none', 300);
    }, 5000);
}

function showLoading(show) {
    const loader = document.getElementById('loading-overlay');
    loader.style.display = show ? 'flex' : 'none';
}

function handleImagePreview(e) {
    const preview = document.getElementById('preview');
    if (e.target.files && e.target.files[0]) {
        preview.style.display = 'block';
        preview.src = URL.createObjectURL(e.target.files[0]);
    }
}

function formatDateTime(dateString) {
    const options = { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return new Date(dateString).toLocaleString('pt-BR', options);
}