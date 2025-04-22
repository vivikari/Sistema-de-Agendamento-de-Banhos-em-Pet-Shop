import express from 'express';
import db from '../db.js';
import upload from '../uploadConfig.js';

const router = express.Router();

// Rota POST com upload
router.post('/', upload.single('imagem'), async (req, res) => {
    try {
        console.log('Dados recebidos:', req.body);
        console.log('Arquivo recebido:', req.file);

        // Extrair dados do formulário
        const { petNome, petTipo, petRaca, servicoId, dataAgendamento } = req.body;
        
        if (!petNome || !servicoId) {
            return res.status(400).json({ error: 'Dados incompletos' });
        }

        // Criar agendamento no banco de dados
        const [result] = await db.execute(
            `INSERT INTO agendamentos 
             (pet_id, servico_id, data_agendamento, imagem_path) 
             VALUES (?, ?, ?, ?)`,
            [
                1, // ID do pet (deverá vir do frontend)
                servicoId,
                new Date(dataAgendamento),
                req.file ? `/uploads/${req.file.filename}` : null
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