import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import agendamentoRoutes from './routes/agendamentoRoutes.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Rotas
app.use('/auth', authRoutes);        // Login e Registro
app.use('/agendamentos', agendamentoRoutes); // Agendamentos protegidos 

// Página de status simples
app.get('/', (req, res) => {
  res.send('Servidor de Agendamento de Banhos funcionando!');
});

// Iniciar servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});


//para conectar o nodemon usar:
//npx nodemon server.js
