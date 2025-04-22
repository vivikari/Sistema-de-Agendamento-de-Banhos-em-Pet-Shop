import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petshop',
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10, // Número máximo de conexões no pool
  queueLimit: 0,
  timezone: '+00:00' // Para evitar problemas com fusos horários
};

// Cria o pool diretamente (mais eficiente que criar conexão teste)
const db = mysql.createPool(dbConfig);

// Adiciona handlers para monitoramento
db.on('connection', (connection) => {
  console.log('Nova conexão estabelecida no pool');
});

db.on('acquire', (connection) => {
  console.log('Conexão adquirida do pool');
});

db.on('release', (connection) => {
  console.log('Conexão liberada de volta ao pool');
});

db.on('error', (err) => {
  console.error('Erro no pool de conexões:', err);
  // Reconecta automaticamente após 5 segundos
  setTimeout(() => {
    db.end();
    db = mysql.createPool(dbConfig);
  }, 5000);
});

// Função para testar a conexão (opcional para debug)
export async function testConnection() {
  try {
    const conn = await db.getConnection();
    await conn.ping();
    conn.release();
    console.log('✅ Conexão com o banco de dados verificada!');
    return true;
  } catch (error) {
    console.error('❌ Falha na conexão com o banco:', error.message);
    return false;
  }
}

// Verifica a conexão ao iniciar (opcional)
if (process.env.NODE_ENV !== 'test') {
  testConnection();
}

export default db;