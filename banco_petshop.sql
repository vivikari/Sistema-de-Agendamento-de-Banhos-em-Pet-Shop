CREATE DATABASE petshop;
USE petshop;

-- Tabela de usuários
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pets
CREATE TABLE pets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nome VARCHAR(100) NOT NULL,
    raca VARCHAR(100),
    observacoes TEXT,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabela de agendamentos
CREATE TABLE agendamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT NOT NULL,
    data_agendamento DATETIME NOT NULL,
    servico ENUM('banho', 'tosa', 'banho_tosa', 'hidratacao') NOT NULL,
    status ENUM('pendente', 'confirmado', 'cancelado') DEFAULT 'pendente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);

-- Tabela de fotos
CREATE TABLE pet_fotos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pet_id INT NOT NULL,
    caminho_arquivo VARCHAR(255) NOT NULL,
    is_principal BOOLEAN DEFAULT FALSE,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (pet_id) REFERENCES pets(id) ON DELETE CASCADE
);



-- 1. Exemplo
INSERT INTO usuarios (email, senha, nome) 
VALUES ('cliente@email.com', '1234', 'Gojo da Silva');

INSERT INTO pets (usuario_id, nome, raca)
VALUES (1, 'Rex', 'Golden Retriever');

INSERT INTO agendamentos (pet_id, data_agendamento, servico)
VALUES (1, '2023-12-15 14:00:00', 'banho_tosa');

INSERT INTO pet_fotos (pet_id, caminho_arquivo, is_principal)
VALUES (1, 'uploads/rex_photo123.jpg', TRUE);