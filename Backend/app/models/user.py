from sqlalchemy import Column, Integer, String, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum


class UserRole(str, enum.Enum):
    """Enum para papéis de usuário"""
    ADMIN = "admin"
    CHEFE = "chefe"
    OPERADOR = "operador"


class User(Base):
    """
    Tabela de usuários do sistema
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    senha_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.OPERADOR, nullable=False)
    superior_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Referência ao chefe
    criado_em = Column(DateTime(timezone=True), server_default=func.now())

    # Relacionamentos
    superior = relationship("User", remote_side=[id], foreign_keys=[superior_id])  # O chefe deste usuário
