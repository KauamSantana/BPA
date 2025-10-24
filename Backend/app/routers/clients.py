from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Client, ClientResponsible, ClientCollaborators
from app.schemas import (
    ClientCreate,
    ClientUpdate,
    ClientResponse,
    ClientListResponse,
)
from app.auth import get_current_user

router = APIRouter(prefix="/clients", tags=["Clientes"])


@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(
    client_data: ClientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cria um novo cliente com responsáveis e informações de colaboradores
    """
    # Verifica se o CNPJ já existe
    existing_client = db.query(Client).filter(Client.cnpj == client_data.cnpj).first()
    if existing_client:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="CNPJ já cadastrado"
        )
    
    # Cria o cliente
    client_dict = client_data.model_dump(exclude={'responsaveis', 'colaboradores_info'})
    new_client = Client(**client_dict)
    db.add(new_client)
    db.flush()  # Gera o ID sem fazer commit
    
    # Adiciona responsáveis
    if client_data.responsaveis:
        for resp_data in client_data.responsaveis:
            responsible = ClientResponsible(
                cliente_id=new_client.id,
                **resp_data.model_dump()
            )
            db.add(responsible)
    
    # Adiciona informações de colaboradores
    if client_data.colaboradores_info:
        collaborators = ClientCollaborators(
            cliente_id=new_client.id,
            **client_data.colaboradores_info.model_dump()
        )
        db.add(collaborators)
    
    db.commit()
    db.refresh(new_client)
    
    return new_client


@router.get("/", response_model=List[ClientListResponse])
def list_clients(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: str = Query(None, description="Busca por nome fantasia ou CNPJ"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista todos os clientes com paginação e busca opcional
    """
    query = db.query(Client)
    
    # Busca por nome ou CNPJ
    if search:
        query = query.filter(
            (Client.nome_fantasia.ilike(f"%{search}%")) |
            (Client.cnpj.ilike(f"%{search}%"))
        )
    
    clients = query.offset(skip).limit(limit).all()
    return clients


@router.get("/{client_id}", response_model=ClientResponse)
def get_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Busca um cliente específico por ID
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    return client


@router.put("/{client_id}", response_model=ClientResponse)
def update_client(
    client_id: int,
    client_data: ClientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualiza um cliente existente
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    
    # Verifica se está tentando mudar para um CNPJ já existente
    if client_data.cnpj and client_data.cnpj != client.cnpj:
        existing_cnpj = db.query(Client).filter(
            Client.cnpj == client_data.cnpj,
            Client.id != client_id
        ).first()
        if existing_cnpj:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CNPJ já cadastrado para outro cliente"
            )
    
    # Atualiza campos do cliente
    update_data = client_data.model_dump(exclude={'responsaveis', 'colaboradores_info'}, exclude_unset=True)
    for key, value in update_data.items():
        setattr(client, key, value)
    
    # Atualiza responsáveis (substitui todos)
    if client_data.responsaveis is not None:
        # Remove responsáveis antigos
        db.query(ClientResponsible).filter(
            ClientResponsible.cliente_id == client_id
        ).delete()
        
        # Adiciona novos responsáveis
        for resp_data in client_data.responsaveis:
            responsible = ClientResponsible(
                cliente_id=client_id,
                **resp_data.model_dump()
            )
            db.add(responsible)
    
    # Atualiza colaboradores
    if client_data.colaboradores_info is not None:
        existing_collab = db.query(ClientCollaborators).filter(
            ClientCollaborators.cliente_id == client_id
        ).first()
        
        if existing_collab:
            # Atualiza existente
            for key, value in client_data.colaboradores_info.model_dump().items():
                setattr(existing_collab, key, value)
        else:
            # Cria novo
            collaborators = ClientCollaborators(
                cliente_id=client_id,
                **client_data.colaboradores_info.model_dump()
            )
            db.add(collaborators)
    
    db.commit()
    db.refresh(client)
    
    return client


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(
    client_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Deleta um cliente
    """
    client = db.query(Client).filter(Client.id == client_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    
    db.delete(client)
    db.commit()
    
    return None
