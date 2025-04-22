# 🐾 **PetCare Agendamentos** 🐶🐱

## ✨ **Sistema Completo de Agendamento para PetShops**

O **PetCare** é uma solução moderna para gerenciamento de agendamentos em petshops, oferecendo:

- 📅 Agendamento intuitivo de serviços  
- 📱 Painel administrativo completo  
- 🖼️ Upload de fotos dos pets  
- 🔒 Autenticação segura  

---

## 🛠 **Tecnologias Utilizadas**

### **Frontend**
<div style="display: flex; gap: 10px; flex-wrap: wrap;">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black">
</div>

### **Backend**
<div style="display: flex; gap: 10px; flex-wrap: wrap;">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white">
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white">
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white">
</div>

### **Segurança**
<div style="display: flex; gap: 10px; flex-wrap: wrap;">
  <img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white">
  <img src="https://img.shields.io/badge/Bcrypt-394D54?style=for-the-badge">
</div>

---

## 🚀 **Como Executar**

### **Pré-requisitos**
- Node.js v16+
- MySQL 8+
- NPM ou Yarn

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/petshop-agendamentos.git

# Instale as dependências
cd petshop-agendamentos/backend
npm install
```

### **Configuração**
1. Crie um arquivo `.env` na pasta `backend`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=petshop
JWT_SECRET=chave_secreta_aleatoria
```

2. Importe o banco de dados:
```bash
mysql -u root -p petshop < banco_petshop.sql
```

### **Iniciando o Sistema**
```bash
# Backend (Node.js)
npm start

# Frontend (abra no navegador)
frontend/index.html
```

---

## 📋 **Funcionalidades Principais**

| Recurso          | Descrição                                  |
|------------------|-------------------------------------------|
| 🐕 Cadastro de Pets | Gerencie os pets de cada cliente          |
| 🛁 Agendamentos   | Agende banhos, tosas e outros serviços    |
| 📸 Galeria        | Armazene fotos dos pets                   |
| 🔐 Acesso Seguro  | Autenticação com JWT e criptografia       |

---

## 📜 **Licença**

Distribuído sob licença MIT. Veja `LICENSE` para mais informações.

---

<div align="center">
  <p>Feito com ❤️ por <strong>Vivi</strong></p>
</div>

---

**🐶 Seu petshop merece esse upgrade!** 🐱