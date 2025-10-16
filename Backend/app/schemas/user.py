from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class UserBase(BaseModel):
    """Schema base do usuário"""
    nome: str = Field(..., min_length=3, max_length=255)
    email: EmailStr


class UserCreate(UserBase):
    """Schema para criação de usuário"""
    senha: str = Field(..., min_length=6, max_length=72)


class UserLogin(BaseModel):
    """Schema para login"""
    email: EmailStr
    senha: str


class UserResponse(UserBase):
    """Schema de resposta do usuário"""
    id: int
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
