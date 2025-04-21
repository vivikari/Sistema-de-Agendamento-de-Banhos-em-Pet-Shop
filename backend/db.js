import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'petshop',
  port: 3306 // Porta padrão do MySQL no XAMPP
};

// Testar a conexão
async function testConnection() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexão com MySQL (XAMPP) estabelecida com sucesso!');
    await connection.end();
    return mysql.createPool(dbConfig); // Usar pool para melhor performance
  } catch (error) {
    console.error('❌ Erro ao conectar no MySQL (XAMPP):', error.message);
    process.exit(1);
  }
}

const db = await testConnection();
export default db;