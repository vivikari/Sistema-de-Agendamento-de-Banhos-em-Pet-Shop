import express from 'express'
import db from '../db.js'
import authMiddleware from './authMiddleware.js'

const router = express.Router()

router.use(authMiddleware)

// Middleware para verificar se o pet pertence ao usuário
const checkPetOwnership = async (req, res, next) => {
  try {
    const [pet] = await db.execute(
      'SELECT usuario_id FROM pets WHERE id = ?',
      [req.body.pet_id]
    )
    
    if (pet.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pet não encontrado'
      })
    }
    
    if (pet[0].usuario_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: 'Este pet não pertence a você'
      })
    }
    
    next()
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
}

// Criar agendamento
router.post('/', checkPetOwnership, async (req, res) => {
  try {
    const { pet_id, data_agendamento, servico, observacoes } = req.body
    
    // Validação básica
    if (!pet_id || !data_agendamento || !servico) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios faltando'
      })
    }
    
    const [result] = await db.execute(
      `INSERT INTO agendamentos 
       (pet_id, usuario_id, data_agendamento, servico, observacoes) 
       VALUES (?, ?, ?, ?, ?)`,
      [pet_id, req.user.id, data_agendamento, servico, observacoes]
    )
    
    res.status(201).json({
      success: true,
      data: { id: result.insertId }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Outras rotas CRUD para agendamentos
export default router