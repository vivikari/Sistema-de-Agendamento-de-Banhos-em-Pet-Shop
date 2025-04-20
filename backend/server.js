import express from 'express';
import cors from 'cors';
import db from './db.js';
import upload from './uploadConfig.js';

const app = express();
const port = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Rotas de Usuário
app.post('/usuarios', async (req, res) => {
    try {
        const { email, senha, nome, telefone } = req.body;
        const [result] = await db.execute(
            'INSERT INTO usuarios (email, senha, nome, telefone) VALUES (?, ?, ?, ?)',
            [email, senha, nome, telefone]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rotas de Pets
app.post('/pets', async (req, res) => {
    try {
        const { usuario_id, nome, raca, observacoes } = req.body;
        const [result] = await db.execute(
            'INSERT INTO pets (usuario_id, nome, raca, observacoes) VALUES (?, ?, ?, ?)',
            [usuario_id, nome, raca, observacoes]
        );
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rotas de Agendamentos (com upload de foto)
app.post('/agendamentos', upload.single('foto'), async (req, res) => {
    try {
        const { pet_id, data_agendamento, servico } = req.body;
        const foto_path = req.file ? req.file.path : null;
        
        const [result] = await db.execute(
            'INSERT INTO agendamentos (pet_id, data_agendamento, servico, foto_path) VALUES (?, ?, ?, ?)',
            [pet_id, data_agendamento, servico, foto_path]
        );
        
        res.status(201).json({ id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Listar agendamentos
app.get('/agendamentos', async (req, res) => {
    try {
        const [agendamentos] = await db.execute(
            'SELECT a.*, p.nome as pet_nome FROM agendamentos a JOIN pets p ON a.pet_id = p.id'
        );
        res.json(agendamentos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

//para conectar o nodemon usar:
//npx nodemon server.js
