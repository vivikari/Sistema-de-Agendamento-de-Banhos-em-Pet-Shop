import express from 'express'
import db from '../db.js'
import authMiddleware from './authMiddleware.js'
import upload from '../uploadConfig.js'

const router = express.Router()

router.use(authMiddleware)

// Cadastrar novo pet (com upload de foto)
router.post('/', upload.single('foto'), async (req, res) => {
  try {
    const { nome, raca, observacoes } = req.body
    
    if (!nome) {
      return res.status(400).json({
        success: false,
        error: 'Nome do pet é obrigatório'
      })
    }

    const [result] = await db.execute(
      'INSERT INTO pets (usuario_id, nome, raca, observacoes) VALUES (?, ?, ?, ?)',
      [req.user.id, nome, raca, observacoes]
    )

    if (req.file) {
      await db.execute(
        'INSERT INTO pet_fotos (pet_id, caminho_arquivo, is_principal) VALUES (?, ?, ?)',
        [result.insertId, req.file.path, true]
      )
    }

    res.status(201).json({ 
      success: true,
      message: 'Pet cadastrado com sucesso!',
      petId: result.insertId
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// Listar pets do usuário logado
router.get('/', async (req, res) => {
  try {
    const [pets] = await db.execute(
      `SELECT p.*, pf.caminho_arquivo as foto 
       FROM pets p
       LEFT JOIN pet_fotos pf ON p.id = pf.pet_id AND pf.is_principal = 1
       WHERE p.usuario_id = ?`,
      [req.user.id]
    )
    
    res.json({
      success: true,
      data: pets
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router