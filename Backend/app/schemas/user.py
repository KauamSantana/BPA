from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
from app.models.user import UserRole


class UserBase(BaseModel):
    """Schema base do usuário"""
    nome: str = Field(..., min_length=3, max_length=255)
    email: EmailStr


class UserCreate(UserBase):
    """Schema para criação de usuário"""
    senha: str = Field(..., min_length=6, max_length=72)
    role: Optional[UserRole] = UserRole.OPERADOR
    superior_id: Optional[int] = None


class UserLogin(BaseModel):
    """Schema para login"""
    email: EmailStr
    senha: str


class UserUpdate(BaseModel):
    """Schema para atualização de dados do usuário"""
    nome: Optional[str] = Field(None, min_length=3, max_length=255)
    email: Optional[EmailStr] = None
    senha_atual: Optional[str] = None
    senha_nova: Optional[str] = Field(None, min_length=6, max_length=72)


class UserSimplified(BaseModel):
    """Schema simplificado de usuário para listagem"""
    id: int
    nome: str
    email: str
    role: UserRole

    class Config:
        from_attributes = True


class UserResponse(UserBase):
    """Schema de resposta do usuário"""
    id: int
    role: UserRole
    superior_id: Optional[int] = None
    criado_em: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    """Schema para token JWT"""
    access_token: str
    token_type: str


class TokenData(BaseModel):
    """Schema para dados dentro do token"""
    email: Optional[str] = None
