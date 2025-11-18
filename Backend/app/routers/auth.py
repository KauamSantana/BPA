from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserResponse, UserLogin, UserUpdate, Token, UserSimplified
from app.auth import (
    get_password_hash,
    verify_password,
    authenticate_user,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    get_current_user,
)
from app.models import Client, Report
from typing import List

router = APIRouter(prefix="/auth", tags=["Autenticação"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Registra um novo usuário no sistema
    """
    # Verifica se o email já existe
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email já cadastrado"
        )
    
    # Verifica se o superior existe (se especificado)
    if user_data.superior_id:
        superior = db.query(User).filter(User.id == user_data.superior_id).first()
        if not superior:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Superior não encontrado"
            )
    
    # Cria novo usuário
    new_user = User(
        nome=user_data.nome,
        email=user_data.email,
        senha_hash=get_password_hash(user_data.senha),
        role=user_data.role,
        superior_id=user_data.superior_id
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Faz login e retorna um token JWT
    Usa OAuth2PasswordRequestForm para compatibilidade com Swagger
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/login-json", response_model=Token)
def login_json(user_data: UserLogin, db: Session = Depends(get_db)):
    """
    Alternativa de login que aceita JSON
    Útil para frontend
    """
    user = authenticate_user(db, user_data.email, user_data.senha)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorretos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/forgot-password")
def forgot_password(email: str, db: Session = Depends(get_db)):
    """
    Inicia o processo de recuperação de senha
    NOTA: Nesta versão simplificada, apenas retorna uma mensagem
    Em produção, você enviaria um email com link de recuperação
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Por segurança, não revela se o email existe ou não
        return {
            "message": "Se o email existir no sistema, você receberá instruções para redefinir sua senha"
        }
    
    # TODO: Implementar envio de email com token de recuperação
    # Por enquanto, apenas retorna sucesso
    return {
        "message": "Se o email existir no sistema, você receberá instruções para redefinir sua senha",
        "debug_info": "Em ambiente de desenvolvimento: Entre em contato com o administrador para redefinir sua senha"
    }


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Retorna informações do usuário logado
    """
    return current_user


@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualiza informações do usuário logado
    """
    # Se está tentando trocar a senha
    if user_data.senha_nova:
        if not user_data.senha_atual:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Senha atual é obrigatória para trocar a senha"
            )
        
        # Verifica se a senha atual está correta
        if not verify_password(user_data.senha_atual, current_user.senha_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Senha atual incorreta"
            )
        
        # Atualiza a senha
        current_user.senha_hash = get_password_hash(user_data.senha_nova)
    
    # Se está tentando trocar o email
    if user_data.email and user_data.email != current_user.email:
        # Verifica se o email já existe
        existing_user = db.query(User).filter(
            User.email == user_data.email,
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já está em uso"
            )
        current_user.email = user_data.email
    
    # Atualiza o nome se fornecido
    if user_data.nome:
        current_user.nome = user_data.nome
    
    db.commit()
    db.refresh(current_user)
    
    return current_user


@router.get("/dashboard-stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Retorna estatísticas para o dashboard
    """
    total_clients = db.query(Client).count()
    total_reports = db.query(Report).count()
    
    return {
        "user_name": current_user.nome,
        "total_clients": total_clients,
        "total_reports": total_reports
    }


@router.get("/users", response_model=List[UserSimplified])
def list_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista todos os usuários do sistema
    """
    users = db.query(User).all()
    return users


@router.get("/users/subordinados", response_model=List[UserSimplified])
def list_subordinates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista os subordinados do usuário logado (incluindo ele mesmo)
    """
    # Busca todos os usuários que têm este usuário como superior, mais ele mesmo
    subordinados = db.query(User).filter(
        (User.superior_id == current_user.id) | (User.id == current_user.id)
    ).all()
    
    return subordinados
