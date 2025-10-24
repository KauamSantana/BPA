from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional, List
from app.models.client import ClientStatus, ClientCategory, ResponsibleType


# ===== Responsável =====
class ClientResponsibleBase(BaseModel):
    """Schema base do responsável"""
    tipo: ResponsibleType
    nome_completo: Optional[str] = None
    email: Optional[EmailStr] = None
    telefone: Optional[str] = None
    cpf: Optional[str] = None


class ClientResponsibleCreate(ClientResponsibleBase):
    """Schema para criar responsável"""
    pass


class ClientResponsibleResponse(ClientResponsibleBase):
    """Schema de resposta do responsável"""
    id: int
    cliente_id: int

    class Config:
        from_attributes = True


# ===== Colaboradores =====
class ClientCollaboratorsBase(BaseModel):
    """Schema base de colaboradores"""
    numero_total_colaboradores: Optional[int] = Field(None, ge=0)
    numero_manipuladores_alimentos: Optional[int] = Field(None, ge=0)


class ClientCollaboratorsCreate(ClientCollaboratorsBase):
    """Schema para criar informações de colaboradores"""
    pass


class ClientCollaboratorsResponse(ClientCollaboratorsBase):
    """Schema de resposta de colaboradores"""
    id: int
    cliente_id: int

    class Config:
        from_attributes = True


# ===== Cliente =====
class ClientBase(BaseModel):
    """Schema base do cliente com campos obrigatórios"""
    # Obrigatórios
    status: ClientStatus
    nome_fantasia: str = Field(..., min_length=1, max_length=255)
    categoria: ClientCategory
    razao_social: str = Field(..., min_length=1, max_length=255)
    cnpj: str = Field(..., pattern=r'^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$')
    
    # Não obrigatórios
    inscricao_estadual: Optional[str] = None
    inscricao_municipal: Optional[str] = None
    email: Optional[EmailStr] = None
    site_instagram: Optional[str] = None
    telefone_contato_1: Optional[str] = None
    telefone_contato_2: Optional[str] = None
    endereco: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    complemento: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = Field(None, max_length=2)
    cep: Optional[str] = None
    logo_url: Optional[str] = None


class ClientCreate(ClientBase):
    """Schema para criar cliente"""
    responsaveis: Optional[List[ClientResponsibleCreate]] = []
    colaboradores_info: Optional[ClientCollaboratorsCreate] = None


class ClientUpdate(BaseModel):
    """Schema para atualizar cliente (todos os campos opcionais)"""
    status: Optional[ClientStatus] = None
    nome_fantasia: Optional[str] = Field(None, min_length=1, max_length=255)
    categoria: Optional[ClientCategory] = None
    razao_social: Optional[str] = Field(None, min_length=1, max_length=255)
    cnpj: Optional[str] = Field(None, pattern=r'^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$')
    inscricao_estadual: Optional[str] = None
    inscricao_municipal: Optional[str] = None
    email: Optional[EmailStr] = None
    site_instagram: Optional[str] = None
    telefone_contato_1: Optional[str] = None
    telefone_contato_2: Optional[str] = None
    endereco: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    complemento: Optional[str] = None
    cidade: Optional[str] = None
    estado: Optional[str] = Field(None, max_length=2)
    cep: Optional[str] = None
    logo_url: Optional[str] = None
    responsaveis: Optional[List[ClientResponsibleCreate]] = None
    colaboradores_info: Optional[ClientCollaboratorsCreate] = None


class ClientResponse(ClientBase):
    """Schema de resposta completa do cliente"""
    id: int
    criado_em: datetime
    atualizado_em: Optional[datetime] = None
    responsaveis: List[ClientResponsibleResponse] = []
    colaboradores_info: Optional[ClientCollaboratorsResponse] = None

    class Config:
        from_attributes = True


class ClientListResponse(BaseModel):
    """Schema para lista simplificada de clientes"""
    id: int
    status: ClientStatus
    nome_fantasia: str
    categoria: ClientCategory
    cnpj: str
    logo_url: Optional[str] = None

    class Config:
        from_attributes = True
