import express from 'express';
import db from '../db.js';
import authMiddleware from './authMiddleware.js';
import upload from '../uploadConfig.js';

const router = express.Router();
router.use(authMiddleware);

// Rota unificada para cadastrar pet E agendamento (opcional)
router.post('/', upload.single('imagem'), async (req, res) => {
  try {
    const { pet_nome, pet_raca, data_agendamento, servico_id } = req.body;

    // 1. Cadastra o pet (se necessário)
    const [pet] = await db.execute(
      'INSERT INTO pets (usuario_id, nome, raca) VALUES (?, ?, ?)',
      [req.user.id, pet_nome, pet_raca]
    );

    // 2. Validação da imagem
    if (!req.file) {
      return res.status(400).json({ error: "Envie uma imagem do pet" });
    }

    // 3. Cria o agendamento
    const [agendamento] = await db.execute(
      `INSERT INTO agendamentos 
       (pet_id, usuario_id, data_agendamento, servico_id, imagem_path) 
       VALUES (?, ?, ?, ?, ?)`,
      [pet.insertId, req.user.id, data_agendamento, servico_id, req.file.filename]
    );

    res.status(201).json({
      success: true,
      agendamentoId: agendamento.insertId,
      imagem: `/uploads/${req.file.filename}`
    });

  } catch (error) {
    res.status(500).json({ 
      error: "Erro no agendamento",
      details: error.message 
    });
  }
});

// Listar agendamentos com dados do pet
router.get('/', async (req, res) => {
  try {
    const [agendamentos] = await db.execute(
      `SELECT a.*, p.nome as pet_nome, p.raca, s.nome as servico_nome 
       FROM agendamentos a
       JOIN pets p ON a.pet_id = p.id
       JOIN servicos s ON a.servico_id = s.id
       WHERE a.usuario_id = ?`,
      [req.user.id]
    );
    res.json({ success: true, data: agendamentos });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancelar agendamento
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.execute(
      'DELETE FROM agendamentos WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.user.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Agendamento não encontrado" });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;