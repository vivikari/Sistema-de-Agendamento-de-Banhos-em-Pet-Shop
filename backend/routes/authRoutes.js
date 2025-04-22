import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Registro simplificado
router.post('/register', async (req, res) => {
  try {
    const { email, senha, nome } = req.body;
    const [existing] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Email já registrado' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    await db.execute(
      'INSERT INTO usuarios (email, senha_hash, nome) VALUES (?, ?, ?)',
      [email, senhaHash, nome]
    );
    
    res.status(201).json({ message: 'Usuário registrado com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao registrar usuário' });
  }
});

// Login simplificado
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const [users] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
    
    if (users.length === 0 || !await bcrypt.compare(senha, users[0].senha_hash)) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: users[0].id, username: users[0].nome },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

export default router;