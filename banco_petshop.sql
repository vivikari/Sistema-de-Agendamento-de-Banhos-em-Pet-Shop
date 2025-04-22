CREATE DATABASE IF NOT EXISTS petshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE petshop;

-- Tabela de usuários
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabela de pets
CREATE TABLE pets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL DEFAULT 'cachorro',
    raca VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabela de serviços
CREATE TABLE servicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    descricao TEXT,
    preco DECIMAL(10,2) NOT NULL
) ENGINE=InnoDB;

-- Tabela de agendamentos
CREATE TABLE agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT NOT NULL,
    servico_id INT NOT NULL,
    data_agendamento DATETIME NOT NULL,
    observacoes TEXT,
    imagem_path VARCHAR(255),
    status ENUM('pendente', 'confirmado', 'cancelado', 'concluido') DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    FOREIGN KEY (servico_id) REFERENCES servicos(id)
) ENGINE=InnoDB;

-- Inserção dos serviços
INSERT INTO servicos (nome, descricao, preco) VALUES 
('Banho', 'Banho completo com produtos premium', 50.00),
('Tosa', 'Tosa higiênica ou padrão da raça', 70.00),
('Banho e Tosa', 'Pacote completo', 100.00),
('Hidratação', 'Tratamento capilar', 40.00);

-- Usuário de exemplo (senha: Teste@123)
INSERT INTO usuarios (email, senha_hash, nome, telefone) VALUES 
('cliente@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MQDq3W1X1pD6X3ZQOsW7d5FplZ6k3Qa', 'Cliente Exemplo', '(11) 99999-9999');

-- Pet de exemplo
INSERT INTO pets (usuario_id, nome, tipo, raca) VALUES 
(1, 'Rex', 'cachorro', 'Golden Retriever');

-- Agendamento de exemplo
INSERT INTO agendamentos (pet_id, servico_id, data_agendamento) VALUES 
(1, 3, DATE_ADD(NOW(), INTERVAL 2 DAY));