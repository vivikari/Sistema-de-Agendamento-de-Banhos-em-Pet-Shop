import express from 'express';
import db from '../db.js';
import upload from '../uploadConfig.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Rota para criar novo agendamento (com upload de imagem)
router.post('/', authMiddleware, upload.single('imagem'), async (req, res) => {
    try {
        // Verificar dados obrigatórios
        const { petNome, petTipo, petRaca, petIdade, petObservacoes, 
                servicoObservacoes, agendamentoData, agendamentoHora } = req.body;
        
        if (!petNome || !petTipo || !petRaca || !agendamentoData || !agendamentoHora) {
            return res.status(400).json({ 
                success: false,
                error: 'Preencha todos os campos obrigatórios' 
            });
        }

        // Validar data/horário
        const dataAgendamento = new Date(`${agendamentoData}T${agendamentoHora}`);
        if (dataAgendamento < new Date()) {
            return res.status(400).json({ 
                success: false,
                error: 'Data/horário deve ser futuro' 
            });
        }

        // Verificar se pet pertence ao usuário
        const [pet] = await db.execute(
            'SELECT id FROM pets WHERE id = ? AND usuario_id = ?',
            [req.body.petId, req.user.id]
        );

        if (!pet.length) {
            return res.status(403).json({ 
                success: false,
                error: 'Pet não encontrado ou não pertence ao usuário' 
            });
        }

        // Criar agendamento no banco de dados
        const [result] = await db.execute(
            `INSERT INTO agendamentos 
             (pet_id, usuario_id, servico_id, data_agendamento, 
              observacoes, imagem_path, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                req.body.petId,
                req.user.id,
                req.body.servicoId,
                dataAgendamento,
                servicoObservacoes || null,
                req.file ? `/uploads/${req.file.filename}` : null,
                'pendente'
            ]
        );

        res.status(201).json({
            success: true,
            id: result.insertId,
            imagem: req.file?.filename
        });

    } catch (error) {
        console.error('Erro no servidor:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro interno',
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
});

// Rota para listar agendamentos do usuário
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [agendamentos] = await db.execute(
            `SELECT a.*, p.nome as pet_nome, p.tipo as pet_tipo, p.raca as pet_raca,
                    s.nome as servico_nome, s.preco as servico_preco
             FROM agendamentos a
             JOIN pets p ON a.pet_id = p.id
             JOIN servicos s ON a.servico_id = s.id
             WHERE a.usuario_id = ?
             ORDER BY a.data_agendamento DESC`,
            [req.user.id]
        );

        res.json({
            success: true,
            data: agendamentos.map(ag => ({
                ...ag,
                data_agendamento: new Date(ag.data_agendamento).toISOString(),
                imagem_url: ag.imagem_path ? `${process.env.BASE_URL}${ag.imagem_path}` : null
            }))
        });

    } catch (error) {
        console.error('Erro ao listar agendamentos:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao carregar agendamentos' 
        });
    }
});

// Rota para obter detalhes de um agendamento específico
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const [agendamentos] = await db.execute(
            `SELECT a.*, p.nome as pet_nome, p.tipo as pet_tipo, p.raca as pet_raca,
                    s.nome as servico_nome, s.descricao as servico_descricao, s.preco as servico_preco
             FROM agendamentos a
             JOIN pets p ON a.pet_id = p.id
             JOIN servicos s ON a.servico_id = s.id
             WHERE a.id = ? AND a.usuario_id = ?`,
            [req.params.id, req.user.id]
        );

        if (!agendamentos.length) {
            return res.status(404).json({ 
                success: false,
                error: 'Agendamento não encontrado' 
            });
        }

        res.json({
            success: true,
            data: {
                ...agendamentos[0],
                data_agendamento: new Date(agendamentos[0].data_agendamento).toISOString(),
                imagem_url: agendamentos[0].imagem_path ? `${process.env.BASE_URL}${agendamentos[0].imagem_path}` : null
            }
        });

    } catch (error) {
        console.error('Erro ao obter agendamento:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao carregar agendamento' 
        });
    }
});

// Rota para atualizar um agendamento
router.put('/:id', authMiddleware, upload.single('imagem'), async (req, res) => {
    try {
        // Verificar se agendamento existe e pertence ao usuário
        const [existing] = await db.execute(
            'SELECT * FROM agendamentos WHERE id = ? AND usuario_id = ?',
            [req.params.id, req.user.id]
        );

        if (!existing.length) {
            return res.status(404).json({ 
                success: false,
                error: 'Agendamento não encontrado' 
            });
        }

        const agendamento = existing[0];

        // Preparar dados para atualização
        const updates = {
            pet_id: req.body.petId || agendamento.pet_id,
            servico_id: req.body.servicoId || agendamento.servico_id,
            data_agendamento: req.body.agendamentoData && req.body.agendamentoHora 
                ? new Date(`${req.body.agendamentoData}T${req.body.agendamentoHora}`)
                : agendamento.data_agendamento,
            observacoes: req.body.servicoObservacoes || agendamento.observacoes,
            status: req.body.status || agendamento.status
        };

        // Tratamento especial para imagem
        let imagem_path = agendamento.imagem_path;
        if (req.file) {
            imagem_path = `/uploads/${req.file.filename}`;
            
        }

        // Atualizar no banco de dados
        await db.execute(
            `UPDATE agendamentos 
             SET pet_id = ?, servico_id = ?, data_agendamento = ?,
                 observacoes = ?, imagem_path = ?, status = ?
             WHERE id = ?`,
            [
                updates.pet_id,
                updates.servico_id,
                updates.data_agendamento,
                updates.observacoes,
                imagem_path,
                updates.status,
                req.params.id
            ]
        );

        res.json({
            success: true,
            message: 'Agendamento atualizado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao atualizar agendamento:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao atualizar agendamento',
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }
});

// Rota para cancelar/excluir um agendamento
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        // Verificar se agendamento existe e pertence ao usuário
        const [existing] = await db.execute(
            'SELECT * FROM agendamentos WHERE id = ? AND usuario_id = ?',
            [req.params.id, req.user.id]
        );

        if (!existing.length) {
            return res.status(404).json({ 
                success: false,
                error: 'Agendamento não encontrado' 
            });
        }

        // Verificar se pode ser cancelado (não pode cancelar concluído)
        if (existing[0].status === 'concluido') {
            return res.status(400).json({ 
                success: false,
                error: 'Agendamento já concluído não pode ser cancelado' 
            });
        }

        // Atualizar status para cancelado (soft delete)
        await db.execute(
            'UPDATE agendamentos SET status = "cancelado" WHERE id = ?',
            [req.params.id]
        );

        res.json({
            success: true,
            message: 'Agendamento cancelado com sucesso'
        });

    } catch (error) {
        console.error('Erro ao cancelar agendamento:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao cancelar agendamento' 
        });
    }
});

// Rota para listar serviços disponíveis
router.get('/servicos/disponiveis', async (req, res) => {
    try {
        const [servicos] = await db.execute(
            'SELECT * FROM servicos WHERE ativo = TRUE ORDER BY nome'
        );

        res.json({
            success: true,
            data: servicos
        });

    } catch (error) {
        console.error('Erro ao listar serviços:', error);
        res.status(500).json({ 
            success: false,
            error: 'Erro ao carregar serviços' 
        });
    }
});

export default router