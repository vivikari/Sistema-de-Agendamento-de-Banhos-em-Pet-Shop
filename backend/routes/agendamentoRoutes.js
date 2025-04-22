import express from 'express';
import db from '../db.js';
import authMiddleware from './authMiddleware.js';
import upload from '../uploadConfig.js';

const router = express.Router();
router.use(authMiddleware);

// Cadastrar pet simplificado (opcional)
router.post('/pets', async (req, res) => {
  try {
    const { nome } = req.body;
    const [result] = await db.execute(
      'INSERT INTO pets (usuario_id, nome) VALUES (?, ?)',
      [req.user.id, nome]
    );
    res.status(201).json({ petId: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Criar agendamento com upload de imagem
router.post('/', upload.single('imagem'), async (req, res) => {
  try {
    const { pet_id, data_agendamento, servico } = req.body;
    
    // Verifica se o arquivo foi enviado
    if (!req.file) {
      return res.status(400).json({ error: "Envie uma imagem do pet" });
    }

    const [result] = await db.execute(
      `INSERT INTO agendamentos 
       (pet_id, usuario_id, data_agendamento, servico, imagem_path) 
       VALUES (?, ?, ?, ?, ?)`,
      [pet_id, req.user.id, data_agendamento, servico, req.file.filename]
    );

    res.status(201).json({
      success: true,
      message: 'Agendamento criado com imagem!',
      imagem: `/uploads/${req.file.filename}`
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Listar agendamentos
router.get('/', async (req, res) => {
  try {
    const [agendamentos] = await db.execute(
      `SELECT a.*, p.nome as pet_nome 
       FROM agendamentos a
       JOIN pets p ON a.pet_id = p.id
       WHERE a.usuario_id = ?`,
      [req.user.id]
    );
    res.json(agendamentos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancelar agendamento
router.delete('/:id', async (req, res) => {
  try {
    await db.execute(
      'DELETE FROM agendamentos WHERE id = ? AND usuario_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Agendamento cancelado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;