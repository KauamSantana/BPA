from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class ClientStatus(str, enum.Enum):
    """Enum para status do cliente"""
    ATIVO = "ativo"
    INATIVO = "inativo"


class ClientCategory(str, enum.Enum):
    """Enum para categoria do estabelecimento"""
    RESTAURANTE = "restaurante"
    MERCADO = "mercado"
    HORTIFRUTI = "hortifruti"
    LANCHONETE_CAFETERIA = "lanchonete_cafeteria"
    BAR = "bar"
    PADARIA_CONFEITARIA = "padaria_confeitaria"


class Client(Base):
    """
    Tabela de clientes (estabelecimentos)
    """
    __tablename__ = "clients"

    # Campos obrigatórios
    id = Column(Integer, primary_key=True, index=True)
    status = Column(SQLEnum(ClientStatus), nullable=False)
    nome_fantasia = Column(String(255), nullable=False, index=True)
    categoria = Column(SQLEnum(ClientCategory), nullable=False)
    razao_social = Column(String(255), nullable=False)
    cnpj = Column(String(18), unique=True, nullable=False, index=True)

    # Campos não obrigatórios
    inscricao_estadual = Column(String(50), nullable=True)
    inscricao_municipal = Column(String(50), nullable=True)
    email = Column(String(255), nullable=True)
    site_instagram = Column(String(255), nullable=True)
    telefone_contato_1 = Column(String(20), nullable=True)
    telefone_contato_2 = Column(String(20), nullable=True)
    endereco = Column(String(255), nullable=True)
    numero = Column(String(20), nullable=True)
    bairro = Column(String(100), nullable=True)
    complemento = Column(String(255), nullable=True)
    cidade = Column(String(100), nullable=True)
    estado = Column(String(2), nullable=True)
    cep = Column(String(10), nullable=True)
    logo_url = Column(String(500), nullable=True)

    # Timestamps
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    atualizado_em = Column(DateTime(timezone=True), onupdate=func.now())

    # Relacionamentos
    responsaveis = relationship("ClientResponsible", back_populates="cliente", cascade="all, delete-orphan")
    colaboradores_info = relationship("ClientCollaborators", back_populates="cliente", uselist=False, cascade="all, delete-orphan")
    relatorios = relationship("Report", back_populates="cliente", cascade="all, delete-orphan")


class ResponsibleType(str, enum.Enum):
    """Enum para tipo de responsável"""
    RESPONSAVEL_ESTABELECIMENTO = "responsavel_estabelecimento"
    RESPONSAVEL_TECNICO = "responsavel_tecnico"


class ClientResponsible(Base):
    """
    Tabela de responsáveis do estabelecimento
    Pode ter múltiplos responsáveis por cliente
    """
    __tablename__ = "client_responsibles"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    tipo = Column(SQLEnum(ResponsibleType), nullable=False)
    nome_completo = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    telefone = Column(String(20), nullable=True)
    cpf = Column(String(14), nullable=True)

    # Relacionamento
    cliente = relationship("Client", back_populates="responsaveis")


class ClientCollaborators(Base):
    """
    Tabela de informações sobre colaboradores
    Um registro único por cliente
    """
    __tablename__ = "client_collaborators"

    id = Column(Integer, primary_key=True, index=True)
    cliente_id = Column(Integer, ForeignKey("clients.id"), unique=True, nullable=False)
    numero_total_colaboradores = Column(Integer, nullable=True)
    numero_manipuladores_alimentos = Column(Integer, nullable=True)

    # Relacionamento
    cliente = relationship("Client", back_populates="colaboradores_info")
