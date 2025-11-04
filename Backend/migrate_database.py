"""
Script de migração para adicionar novos campos ao banco de dados
Execute: python migrate_database.py
"""
import sqlite3
import os

# Caminho do banco de dados
DB_PATH = "database.db"

def migrate():
    if not os.path.exists(DB_PATH):
        print(f"❌ Banco de dados não encontrado: {DB_PATH}")
        print("💡 Certifique-se de estar no diretório Backend/")
        return False

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        print("🔄 Iniciando migração...")
        
        # Verifica se as colunas já existem antes de adicionar
        cursor.execute("PRAGMA table_info(reports)")
        reports_columns = [col[1] for col in cursor.fetchall()]
        
        if 'data_agendada' not in reports_columns:
            print("  ➕ Adicionando coluna 'data_agendada' em reports...")
            cursor.execute("ALTER TABLE reports ADD COLUMN data_agendada TIMESTAMP")
            print("  ✅ Coluna 'data_agendada' adicionada")
        else:
            print("  ⏭️  Coluna 'data_agendada' já existe")
        
        cursor.execute("PRAGMA table_info(users)")
        users_columns = [col[1] for col in cursor.fetchall()]
        
        if 'role' not in users_columns:
            print("  ➕ Adicionando coluna 'role' em users...")
            cursor.execute("ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'operador'")
            # Atualiza valores NULL para o padrão
            cursor.execute("UPDATE users SET role = 'operador' WHERE role IS NULL")
            print("  ✅ Coluna 'role' adicionada")
        else:
            print("  ⏭️  Coluna 'role' já existe")
        
        if 'superior_id' not in users_columns:
            print("  ➕ Adicionando coluna 'superior_id' em users...")
            cursor.execute("ALTER TABLE users ADD COLUMN superior_id INTEGER")
            print("  ✅ Coluna 'superior_id' adicionada")
        else:
            print("  ⏭️  Coluna 'superior_id' já existe")
        
        # Criar índices
        print("  📊 Criando índices...")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_users_superior_id ON users(superior_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_reports_data_agendada ON reports(data_agendada)")
        print("  ✅ Índices criados")
        
        conn.commit()
        print("\n✨ Migração concluída com sucesso!")
        
        # Mostra estatísticas
        cursor.execute("SELECT COUNT(*) FROM users")
        user_count = cursor.fetchone()[0]
        cursor.execute("SELECT COUNT(*) FROM reports")
        report_count = cursor.fetchone()[0]
        
        print(f"\n📊 Estatísticas do banco:")
        print(f"   👥 Usuários: {user_count}")
        print(f"   📋 Relatórios: {report_count}")
        
        conn.close()
        return True
        
    except sqlite3.Error as e:
        print(f"\n❌ Erro durante a migração: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🗄️  Migração do Banco de Dados - BPA 2.0")
    print("=" * 60)
    print()
    
    if migrate():
        print("\n✅ Tudo pronto! Você pode reiniciar o servidor agora.")
    else:
        print("\n❌ Migração falhou. Verifique os erros acima.")
    
    print("\n" + "=" * 60)
