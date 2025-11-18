from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.models.report import ReportStatus, ChecklistResponse


# ===== Checklist Item =====
class ChecklistItemBase(BaseModel):
    """Schema base do item de checklist"""
    codigo: str = Field(..., max_length=20)
    descricao: str
    resposta: Optional[ChecklistResponse] = None
    observacoes: Optional[str] = None
    ordem: int = Field(..., ge=1)


class ChecklistItemCreate(ChecklistItemBase):
    """Schema para criar item de checklist"""
    pass


class ChecklistItemUpdate(BaseModel):
    """Schema para atualizar item de checklist"""
    resposta: Optional[ChecklistResponse] = None
    observacoes: Optional[str] = None


class ChecklistItemResponse(ChecklistItemBase):
    """Schema de resposta do item de checklist"""
    id: int
    categoria_id: int

    class Config:
        from_attributes = True


# ===== Checklist Category =====
class ChecklistCategoryBase(BaseModel):
    """Schema base da categoria de checklist"""
    nome: str = Field(..., max_length=255)
    ordem: int = Field(..., ge=1)


class ChecklistCategoryCreate(ChecklistCategoryBase):
    """Schema para criar categoria de checklist"""
    itens: List[ChecklistItemCreate] = []


class ChecklistCategoryResponse(ChecklistCategoryBase):
    """Schema de resposta da categoria de checklist"""
    id: int
    relatorio_id: int
    itens: List[ChecklistItemResponse] = []

    class Config:
        from_attributes = True


# ===== Cliente Simplificado =====
class ClienteSimplificado(BaseModel):
    """Schema simplificado do cliente para listagem"""
    nome_fantasia: str

    class Config:
        from_attributes = True


# ===== Report =====
class ReportBase(BaseModel):
    """Schema base do relatório"""
    descricao: str = Field(..., max_length=255)
    cliente_id: int
    categoria: Optional[str] = None
    responsavel_inspecao_id: int
    data_agendada: Optional[datetime] = None  # Data agendada para inspeção


class ReportCreate(ReportBase):
    """Schema para criar relatório"""
    categorias: List[ChecklistCategoryCreate] = []


class ReportUpdate(BaseModel):
    """Schema para atualizar relatório"""
    descricao: Optional[str] = Field(None, max_length=255)
    categoria: Optional[str] = None
    status: Optional[ReportStatus] = None


class ReportResponse(ReportBase):
    """Schema de resposta completa do relatório"""
    id: int
    status: ReportStatus
    cliente: Optional[ClienteSimplificado] = None
    criado_em: datetime
    finalizado_em: Optional[datetime] = None
    data_agendada: Optional[datetime] = None
    categorias: List[ChecklistCategoryResponse] = []

    class Config:
        from_attributes = True


class ReportListResponse(BaseModel):
    """Schema para lista simplificada de relatórios"""
    id: int
    descricao: str
    cliente_id: int
    cliente: Optional[ClienteSimplificado] = None
    status: ReportStatus
    criado_em: datetime
    data_agendada: Optional[datetime] = None
    criado_em: datetime

    class Config:
        from_attributes = True
