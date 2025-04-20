import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../db.js'
import dotenv from 'dotenv'

dotenv.config()
const router = express.Router()

// Registro
router.post('/register', async (req, res) => {
  const { username, password } = req.body
  
  try {
    // Validação
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Usuário e senha são obrigatórios'
      })
    }

    const [existing] = await db.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    )
    
    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Usuário já existe'
      })
    }
    
    const hashed = await bcrypt.hash(password, 10)
    await db.execute(
      'INSERT INTO users(username, password) VALUES (?, ?)',
      [username, hashed]
    )
    
    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao registrar usuário'
    })
  }
})

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  
  try {
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Usuário e senha são obrigatórios'
      })
    }

    const [users] = await db.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    )
    
    const user = users[0]
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Usuário não encontrado'
      })
    }
    
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({
        success: false,
        error: 'Senha incorreta'
      })
    }
    
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )
    
    res.json({
      success: true,
      token
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao fazer login'
    })
  }
})

export default router