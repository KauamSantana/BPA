-- Migration script para adicionar novos campos
-- Execute este script no seu banco de dados SQLite

-- Adicionar campo data_agendada na tabela reports
ALTER TABLE reports ADD COLUMN data_agendada TIMESTAMP;

-- Adicionar campo role na tabela users
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'operador';

-- Adicionar campo superior_id na tabela users
ALTER TABLE users ADD COLUMN superior_id INTEGER;

-- Criar índice para melhor performance nas consultas de hierarquia
CREATE INDEX IF NOT EXISTS idx_users_superior_id ON users(superior_id);
CREATE INDEX IF NOT EXISTS idx_reports_data_agendada ON reports(data_agendada);

-- Atualizar usuários existentes para terem role 'operador' se estiverem NULL
UPDATE users SET role = 'operador' WHERE role IS NULL;
