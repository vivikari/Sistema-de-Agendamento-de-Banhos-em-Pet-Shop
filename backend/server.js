import express from 'express';
import cors from 'cors';
import db from './db.js';
import upload from './uploadConfig.js';

import authRoutes from './routes/authRoutes.js';
import petsRoutes from './routes/petsRoutes.js';
import agendamentoRoutes from './routes/agendamentoRoutes.js';
import imagesRoutes from './routes/imagesRoutes.js';

const app = express();
const port = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Rotas
app.use('/auth', authRoutes);        // Login e Registro
app.use('/pets', petsRoutes);         // Cadastro e listagem de pets
app.use('/agendamentos', agendamentoRoutes); // Agendamentos protegidos
app.use('/images', imagesRoutes);     // Upload e gestão de imagens

// Página de status simples
app.get('/', (req, res) => {
  res.send('Servidor de Agendamento de Banhos funcionando!');
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});


//para conectar o nodemon usar:
//npx nodemon server.js
