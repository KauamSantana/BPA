from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class ReportStatus(str, enum.Enum):
    """Enum para status do relatório"""
    EM_ANDAMENTO = "em_andamento"
    CONCLUIDO = "concluido"


class Report(Base):
    """
    Tabela de relatórios de inspeção
    """
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    descricao = Column(String(255), nullable=False)
    cliente_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    categoria = Column(String(100), nullable=True)
    responsavel_inspecao_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(SQLEnum(ReportStatus), default=ReportStatus.EM_ANDAMENTO, nullable=False)
    data_agendada = Column(DateTime(timezone=True), nullable=True)  # Data agendada para inspeção
    
    criado_em = Column(DateTime(timezone=True), server_default=func.now())
    finalizado_em = Column(DateTime(timezone=True), nullable=True)

    # Relacionamentos
    cliente = relationship("Client", back_populates="relatorios")
    responsavel = relationship("User")
    categorias = relationship("ChecklistCategory", back_populates="relatorio", cascade="all, delete-orphan")


class ChecklistCategory(Base):
    """
    Categorias de checklist dentro de um relatório
    Ex: "Edificação, Isntações e Transporte", "Preparação do Alimento"
    """
    __tablename__ = "checklist_categories"

    id = Column(Integer, primary_key=True, index=True)
    relatorio_id = Column(Integer, ForeignKey("reports.id"), nullable=False)
    nome = Column(String(255), nullable=False)
    ordem = Column(Integer, nullable=False)

    # Relacionamentos
    relatorio = relationship("Report", back_populates="categorias")
    itens = relationship("ChecklistItem", back_populates="categoria", cascade="all, delete-orphan")


class ChecklistResponse(str, enum.Enum):
    """Enum para resposta do item do checklist"""
    CONFORME = "conforme"
    NAO_CONFORME = "nao_conforme"
    NA = "na"


class ChecklistItem(Base):
    """
    Itens individuais do checklist
    """
    __tablename__ = "checklist_items"

    id = Column(Integer, primary_key=True, index=True)
    categoria_id = Column(Integer, ForeignKey("checklist_categories.id"), nullable=False)
    codigo = Column(String(20), nullable=False)  # Ex: "1.1.1"
    descricao = Column(Text, nullable=False)
    resposta = Column(SQLEnum(ChecklistResponse), nullable=True)
    observacoes = Column(Text, nullable=True)
    ordem = Column(Integer, nullable=False)

    # Relacionamento
    categoria = relationship("ChecklistCategory", back_populates="itens")
