import express from 'express';
import db from '../db.js';
import authMiddleware from './authMiddleware.js';
import upload from '../uploadConfig.js';

const router = express.Router();
router.use(authMiddleware);

// Helper para verificar se o pet pertence ao usuário
const verificarDonoPet = async (petId, userId) => {
  const [pet] = await db.execute(
    'SELECT id FROM pets WHERE id = ? AND usuario_id = ?',
    [petId, userId]
  );
  return pet.length > 0;
};

// Rota POST para criar agendamento (com upload de imagem)
router.post('/', upload.single('imagem'), async (req, res) => {
  try {
    const { pet_id, servico_id, data_agendamento, observacoes } = req.body;

    // Validações básicas
    if (!pet_id || !servico_id || !data_agendamento) {
      return res.status(400).json({ 
        success: false,
        error: 'Pet, serviço e data são obrigatórios' 
      });
    }

    // Verifica se o pet pertence ao usuário
    if (!await verificarDonoPet(pet_id, req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Pet não encontrado ou não pertence a você'
      });
    }

    // Verifica se o serviço existe
    const [servico] = await db.execute(
      'SELECT id FROM servicos WHERE id = ?',
      [servico_id]
    );
    if (servico.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Serviço inválido'
      });
    }

    // Cria o agendamento
    const [result] = await db.execute(
      `INSERT INTO agendamentos 
       (pet_id, servico_id, data_agendamento, observacoes, imagem_path) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        pet_id,
        servico_id,
        data_agendamento,
        observacoes || null,
        req.file?.filename || null
      ]
    );

    res.status(201).json({
      success: true,
      data: {
        id: result.insertId,
        imagem_path: req.file ? `/uploads/${req.file.filename}` : null
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao criar agendamento',
      details: error.message
    });
  }
});

// Rota GET para listar agendamentos do usuário
router.get('/', async (req, res) => {
  try {
    const [agendamentos] = await db.execute(
      `SELECT 
        a.id,
        a.data_agendamento,
        a.observacoes,
        a.status,
        a.imagem_path,
        p.nome as pet_nome,
        p.tipo as pet_tipo,
        p.raca as pet_raca,
        s.nome as servico_nome,
        s.preco as servico_preco
       FROM agendamentos a
       JOIN pets p ON a.pet_id = p.id
       JOIN servicos s ON a.servico_id = s.id
       WHERE p.usuario_id = ?
       ORDER BY a.data_agendamento DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      data: agendamentos
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao listar agendamentos',
      details: error.message
    });
  }
});

// Rota PUT para atualizar status do agendamento
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const agendamentoId = req.params.id;

    if (!['pendente', 'confirmado', 'cancelado', 'concluido'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status inválido'
      });
    }

    // Verifica se o agendamento pertence ao usuário
    const [agendamento] = await db.execute(
      `SELECT a.id 
       FROM agendamentos a
       JOIN pets p ON a.pet_id = p.id
       WHERE a.id = ? AND p.usuario_id = ?`,
      [agendamentoId, req.user.id]
    );

    if (agendamento.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agendamento não encontrado'
      });
    }

    await db.execute(
      'UPDATE agendamentos SET status = ? WHERE id = ?',
      [status, agendamentoId]
    );

    res.json({
      success: true,
      message: 'Status atualizado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao atualizar status',
      details: error.message
    });
  }
});

// Rota DELETE para cancelar agendamento
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.execute(
      `DELETE a FROM agendamentos a
       JOIN pets p ON a.pet_id = p.id
       WHERE a.id = ? AND p.usuario_id = ?`,
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Agendamento não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Agendamento cancelado'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao cancelar agendamento',
      details: error.message
    });
  }
});

export default router;