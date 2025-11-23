CREATE TABLE discos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    artista VARCHAR(255) NOT NULL,
    descricao TEXT,
    capa_url VARCHAR(255),
    ano INT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
