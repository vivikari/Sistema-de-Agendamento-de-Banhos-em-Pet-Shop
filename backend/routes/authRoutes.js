import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Registro
router.post('/register', async (req, res) => {
  const { email, senha, nome, telefone } = req.body;

  try {
    if (!email || !senha || !nome) {
      return res.status(400).json({
        success: false,
        error: 'Email, senha e nome são obrigatórios'
      });
    }

    // Verificar se já existe
    const [existing] = await db.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Email já registrado'
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    await db.execute(
      'INSERT INTO usuarios (email, senha_hash, nome, telefone) VALUES (?, ?, ?, ?)',
      [email, senhaHash, nome, telefone]
    );

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao registrar usuário'
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios'
      });
    }

    const [users] = await db.execute(
      'SELECT * FROM usuarios WHERE email = ?',
      [email]
    );

    const user = users[0];
    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    const valid = await bcrypt.compare(senha, user.senha_hash);
    if (!valid) {
      return res.status(401).json({
        success: false,
        error: 'Senha incorreta'
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.nome
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      token
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Erro ao fazer login'
    });
  }
});

export default router;
