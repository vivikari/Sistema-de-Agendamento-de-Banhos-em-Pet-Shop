CREATE DATABASE IF NOT EXISTS petshop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE petshop;

-- Tabela de usuários (com segurança reforçada)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL COMMENT 'Armazenar apenas o hash bcrypt',
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    cpf VARCHAR(14) UNIQUE COMMENT 'Formatado: 000.000.000-00',
    data_nascimento DATE,
    endereco TEXT,
    is_ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    
    INDEX idx_usuario_email (email),
    INDEX idx_usuario_ativo (is_ativo)
) ENGINE=InnoDB;

-- Tabela de tipos de serviço (mais flexível que ENUM)
CREATE TABLE servicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    duracao_min INT NOT NULL COMMENT 'Duração em minutos',
    preco_base DECIMAL(10,2) NOT NULL,
    is_ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabela de status de agendamento
CREATE TABLE status_agendamento (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT,
    cor VARCHAR(20) COMMENT 'Cor para exibição no frontend',
    is_ativo BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB;

-- Tabela de pets (com campos adicionais)
CREATE TABLE pets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    tipo ENUM('cachorro', 'gato', 'outro') NOT NULL DEFAULT 'cachorro',
    raca VARCHAR(100),
    peso DECIMAL(5,2) COMMENT 'Peso em kg',
    data_nascimento DATE,
    observacoes TEXT,
    alergias TEXT,
    is_ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_pet_usuario (usuario_id),
    INDEX idx_pet_nome (nome)
) ENGINE=InnoDB;

-- Tabela de agendamentos (completa)
CREATE TABLE agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT NOT NULL,
    servico_id INT NOT NULL,
    status_id INT NOT NULL DEFAULT 1 COMMENT '1 = pendente',
    data_agendamento DATETIME NOT NULL,
    data_conclusao DATETIME NULL,
    observacoes TEXT,
    valor_final DECIMAL(10,2),
    funcionario_id INT COMMENT 'Quem realizou o atendimento',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    FOREIGN KEY (servico_id) REFERENCES servicos(id),
    FOREIGN KEY (status_id) REFERENCES status_agendamento(id),
    INDEX idx_agendamento_data (data_agendamento),
    INDEX idx_agendamento_status (status_id)
) ENGINE=InnoDB;

-- Tabela de fotos (com melhor controle)
CREATE TABLE pet_fotos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT NOT NULL,
    caminho_arquivo VARCHAR(255) NOT NULL,
    descricao VARCHAR(255),
    is_principal BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE,
    INDEX idx_foto_pet (pet_id),
    UNIQUE uk_foto_principal (pet_id, is_principal)
) ENGINE=InnoDB;

-- Tabela de histórico (para auditoria)
CREATE TABLE agendamento_historico (
    id INT AUTO_INCREMENT PRIMARY KEY,
    agendamento_id INT NOT NULL,
    status_anterior_id INT NULL,  -- Alterado para permitir NULL
    status_novo_id INT NOT NULL,
    observacao TEXT,
    usuario_id INT COMMENT 'Quem fez a alteração',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (agendamento_id) REFERENCES agendamentos(id) ON DELETE CASCADE,
    FOREIGN KEY (status_anterior_id) REFERENCES status_agendamento(id),
    FOREIGN KEY (status_novo_id) REFERENCES status_agendamento(id),
    INDEX idx_historico_agendamento (agendamento_id)
) ENGINE=InnoDB;

-- Dados iniciais
INSERT INTO status_agendamento (nome, descricao, cor) VALUES 
('pendente', 'Aguardando confirmação', 'orange'),
('confirmado', 'Agendamento confirmado', 'green'),
('cancelado', 'Agendamento cancelado', 'red'),
('concluido', 'Serviço realizado', 'blue');

INSERT INTO servicos (nome, descricao, duracao_min, preco_base) VALUES 
('Banho', 'Banho completo com produtos premium', 60, 50.00),
('Tosa', 'Tosa higiênica ou padrão da raça', 90, 70.00),
('Banho e Tosa', 'Pacote completo', 120, 100.00),
('Hidratação', 'Tratamento capilar', 30, 40.00),
('Consulta', 'Consulta com veterinário', 60, 150.00);

-- Usuário de exemplo (senha: Teste@123)
INSERT INTO usuarios (email, senha_hash, nome, telefone) VALUES 
('cliente@email.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MQDq3W1X1pD6X3ZQOsW7d5FplZ6k3Qa', 'Gojo da Silva', '(11) 99999-9999');

-- Pet de exemplo
INSERT INTO pets (usuario_id, nome, tipo, raca, peso) VALUES 
(1, 'Rex', 'cachorro', 'Golden Retriever', 25.5),
(1, 'Luna', 'gato', 'Siamês', 4.2);

-- Agendamento de exemplo
INSERT INTO agendamentos (pet_id, servico_id, status_id, data_agendamento) VALUES 
(1, 3, 2, DATE_ADD(NOW(), INTERVAL 2 DAY));

-- Fotos de exemplo
INSERT INTO pet_fotos (pet_id, caminho_arquivo, is_principal) VALUES 
(1, 'uploads/rex_photo_123.jpg', TRUE),
(2, 'uploads/luna_photo_456.jpg', TRUE);