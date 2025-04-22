# Sistema-de-Agendamento-de-Banhos-em-Pet-Shop
📝 Descrição do Projeto
Sistema completo para gerenciamento de agendamentos em petshop, incluindo:

Cadastro e autenticação de usuários

Gerenciamento de pets

Agendamento de serviços (banho, tosa, etc.)

Upload de fotos dos pets

Painel administrativo

🛠 Tecnologias Utilizadas
Frontend
HTML5, CSS3, JavaScript

Font Awesome (ícones)

Fetch API para comunicação com backend

Backend
Node.js com Express

MySQL (banco de dados relacional)

JSON Web Tokens (JWT) para autenticação

Bcrypt para criptografia de senhas

Multer para upload de imagens

Infraestrutura
Banco de dados MySQL

Servidor Node.js

📋 Pré-requisitos
Node.js (v14 ou superior)

MySQL (v5.7 ou superior)

NPM ou Yarn

🚀 Como Executar o Projeto
1. Configuração Inicial
bash
# Clone o repositório
git clone https://github.com/vivikari/Sistema-de-Agendamento-de-Banhos-em-Pet-Shop.git

# Acesse a pasta do projeto
cd petshop-agendamentos/backend

# Instale as dependências
npm install
2. Configuração do Banco de Dados
Crie um banco de dados MySQL:

sql
CREATE DATABASE petshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
Importe a estrutura inicial:

bash
mysql -u seu_usuario -p petshop < banco_petshop.sql
3. Configuração do Ambiente
Crie um arquivo .env na pasta backend com:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_DATABASE=petshop
PORT=3000
JWT_SECRET=segredo_seguro

4. Iniciando a Aplicação
bash
# Inicie o servidor backend
npm start

# Acesse o frontend no navegador
http://localhost:5500/frontend
🗃 Estrutura do Banco de Dados
Principais tabelas:

usuarios: Armazena dados dos clientes

pets: Registra os pets dos clientes

servicos: Catálogo de serviços oferecidos

agendamentos: Registro de todos os agendamentos

🔐 Rotas da API
Autenticação
POST /api/register - Cadastro de usuário

POST /api/login - Login e obtenção de token JWT

Agendamentos
POST /api/agendamentos - Cria novo agendamento

GET /api/agendamentos - Lista agendamentos do usuário

GET /api/agendamentos/:id - Detalhes de um agendamento

PUT /api/agendamentos/:id - Atualiza agendamento

DELETE /api/agendamentos/:id - Cancela agendamento

📦 Estrutura de Arquivos
/petshop-system
├── /backend
│   ├── /routes
│   │    ├──agendamentoRoutes.js
│   │    ├──authMiddleware.js
│   │    └──authRoutes.js
│   ├── server.js
│   ├── db.js
│   ├── package.json
│   ├── uploadConfig.js
│   └── .env
├── /frontend
│   ├── /css
│   ├── /js
│   │    ├──agendamentos.js
│   │    ├──upload.js
│   │    └──auth.js
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   └── agendamentos.html
├── /uploads
├── banco_petshop.sql
└── README.md

📌 Exemplo de Uso
Cadastro de Usuário:

javascript
fetch('/api/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: "João Silva",
    email: "joao@email.com",
    senha: "Senha@123"
  })
});
Login:

javascript
fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: "joao@email.com",
    senha: "Senha@123"
  })
});
Criar Agendamento:

javascript
const formData = new FormData();
formData.append('pet_id', 1);
formData.append('servico_id', 3);
formData.append('data_agendamento', '2023-12-25T10:00:00');
formData.append('imagem', fileInput.files[0]);

fetch('/api/agendamentos', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

📜 Licença
Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.