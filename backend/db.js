// db.js
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const db = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '', 
    database: process.env.DB_NAME || 'petshop'
}).catch(err => {
    console.error('Erro ao conectar no MySQL:', err);
    process.exit(1);
});

console.log('✅ Conectado ao MySQL');
export default db;