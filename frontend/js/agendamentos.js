document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('agendamentoForm');
    const petImagemInput = document.getElementById('petImagem');
    const btnSelecionarImagem = document.getElementById('btnSelecionarImagem');
    const btnRemoverImagem = document.getElementById('btnRemoverImagem');
    const uploadPreview = document.getElementById('uploadPreview');
    const servicosContainer = document.getElementById('servicosContainer');
    const messageDiv = document.getElementById('message');

    let selectedServico = null;
    let petImageFile = null;

    // Iniciar
    initDatePicker();
    loadServicos();
    setupEventListeners();

    function initDatePicker() {
        const today = new Date();
        document.getElementById('agendamentoData').min = today.toISOString().split('T')[0];
    }

    function setupEventListeners() {
        // Image upload
        btnSelecionarImagem.addEventListener('click', () => petImagemInput.click());
        petImagemInput.addEventListener('change', handleImageUpload);
        btnRemoverImagem.addEventListener('click', resetImageUpload);
        
        // Form submission
        form.addEventListener('submit', handleFormSubmit);
    }

    // Handle form submission
    async function handleFormSubmit(e) {
        e.preventDefault();
        
        if (!validateForm()) return;

        const submitBtn = document.getElementById('btnAgendar');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Agendando...';

        try {
            const formData = new FormData(form);
            formData.append('servicoId', selectedServico.id);
            
            // Debug
            for (let [key, value] of formData.entries()) {
                console.log(`${key}:`, value instanceof File ? `${value.name} (${value.size} bytes)` : value);
            }

            const token = localStorage.getItem('token');
            if (!token) throw new Error('Usuário não autenticado');

            const response = await fetch('http://localhost:3000/api/agendamentos', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                   
                },
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Erro ao agendar');
            }

            const result = await response.json();
            console.log('Success:', result);
            showMessage('Agendamento realizado com sucesso!', 'success');
            
            setTimeout(() => {
                window.location.href = 'meus-agendamentos.html';
            }, 2000);

        } catch (error) {
            console.error('Error:', error);
            showMessage(error.message, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Confirmar Agendamento';
        }
    }

    // Image handling
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validação
        if (!file.type.match('image/(jpeg|png)')) {
            showMessage('Apenas imagens JPEG ou PNG são permitidas', 'error');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            showMessage('Imagem muito grande (máx. 5MB)', 'error');
            return;
        }
        
        petImageFile = file;
        
        // Preview
        const reader = new FileReader();
        reader.onload = (e) => {
            uploadPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            uploadPreview.querySelector('img').style.display = 'block';
            btnRemoverImagem.disabled = false;
        };
        reader.readAsDataURL(file);
    }

    function resetImageUpload() {
        petImagemInput.value = '';
        petImageFile = null;
        uploadPreview.innerHTML = '<i class="fas fa-paw"></i><span>Nenhuma imagem selecionada</span>';
        btnRemoverImagem.disabled = true;
    }

    // Load serviços
    async function loadServicos() {
        try {
            const response = await fetch('/api/servicos');
            if (!response.ok) throw new Error('Erro ao carregar serviços');
            
            const servicos = await response.json();
            renderServicos(servicos);
        } catch (error) {
            showMessage(error.message, 'error');
        }
    }

    function renderServicos(servicos) {
        servicosContainer.innerHTML = servicos.map(servico => `
            <div class="servico-card" data-id="${servico.id}">
                <h4>${servico.nome}</h4>
                <p>${servico.descricao}</p>
                <div class="preco">R$ ${servico.preco.toFixed(2)}</div>
            </div>
        `).join('');

        // Eventos
        document.querySelectorAll('.servico-card').forEach(card => {
            card.addEventListener('click', function() {
                document.querySelectorAll('.servico-card').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
                selectedServico = {
                    id: this.dataset.id,
                    nome: this.querySelector('h4').textContent
                };
            });
        });
    }

    // Form validation
    function validateForm() {
        hideMessage();
        
        const requiredFields = [
            'petNome', 'petTipo', 'petRaca',
            'agendamentoData', 'agendamentoHora'
        ];
        
        const missingFields = requiredFields.filter(field => {
            return !document.getElementById(field).value.trim();
        });
        
        if (missingFields.length > 0) {
            showMessage('Preencha todos os campos obrigatórios', 'error');
            return false;
        }
        
        if (!selectedServico) {
            showMessage('Selecione um serviço', 'error');
            return false;
        }
        
        return true;
    }

    // UI feedback
    function showMessage(message, type) {
        messageDiv.textContent = message;
        messageDiv.className = `alert ${type}`;
        messageDiv.style.display = 'block';
        setTimeout(hideMessage, 5000);
    }

    function hideMessage() {
        messageDiv.style.display = 'none';
    }
});