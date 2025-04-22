import express from 'express';
import cors from 'cors';
import agendamentoRoutes from './routes/agendamentoRoutes.js';

const app = express();

// Middlewares essenciais
app.use(cors({
    origin: 'http://localhost:5500', // Ajuste para a porta do seu frontend
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Rotas
app.use('/api/agendamentos', agendamentoRoutes);

// Rota de teste de upload
app.post('/api/upload-test', (req, res) => {
    console.log('Recebido upload de teste');
    res.json({ success: true });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

//para conectar o nodemon usar:
//npx nodemon server.js
