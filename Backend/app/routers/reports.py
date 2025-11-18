from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from datetime import datetime

from app.database import get_db
from app.models import (
    User,
    Report,
    ChecklistCategory,
    ChecklistItem,
    ReportStatus,
    Client,
)
from app.schemas import (
    ReportCreate,
    ReportUpdate,
    ReportResponse,
    ReportListResponse,
    ChecklistItemUpdate,
    ChecklistItemResponse,
)
from app.auth import get_current_user
from app.pdf_generator import generate_report_pdf

router = APIRouter(prefix="/reports", tags=["Relatórios"])


@router.post("/", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    report_data: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Cria um novo relatório com categorias e itens de checklist
    """
    # Verifica se o cliente existe
    client = db.query(Client).filter(Client.id == report_data.cliente_id).first()
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cliente não encontrado"
        )
    
    # Verifica se o responsável existe
    responsavel = db.query(User).filter(User.id == report_data.responsavel_inspecao_id).first()
    if not responsavel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Responsável pela inspeção não encontrado"
        )
    
    # Cria o relatório
    report_dict = report_data.model_dump(exclude={'categorias'})
    new_report = Report(**report_dict)
    db.add(new_report)
    db.flush()
    
    # Adiciona categorias e itens
    if report_data.categorias:
        for cat_data in report_data.categorias:
            category = ChecklistCategory(
                relatorio_id=new_report.id,
                nome=cat_data.nome,
                ordem=cat_data.ordem
            )
            db.add(category)
            db.flush()
            
            # Adiciona itens da categoria
            for item_data in cat_data.itens:
                item = ChecklistItem(
                    categoria_id=category.id,
                    **item_data.model_dump()
                )
                db.add(item)
    
    db.commit()
    db.refresh(new_report)
    
    return new_report


@router.get("/", response_model=List[ReportListResponse])
def list_reports(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    cliente_id: int = Query(None, description="Filtrar por cliente"),
    status_filter: ReportStatus = Query(None, description="Filtrar por status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lista todos os relatórios com filtros opcionais
    """
    query = db.query(Report)
    
    if cliente_id:
        query = query.filter(Report.cliente_id == cliente_id)
    
    if status_filter:
        query = query.filter(Report.status == status_filter)
    
    reports = query.offset(skip).limit(limit).all()
    return reports


@router.get("/agenda/calendario", response_model=List[ReportListResponse])
def get_reports_by_date(
    mes: int = Query(..., ge=1, le=12, description="Mês (1-12)"),
    ano: int = Query(..., ge=2000, le=2100, description="Ano"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Busca relatórios agendados para um mês específico
    """
    from sqlalchemy import extract
    
    # Busca relatórios pela data agendada
    reports = (
        db.query(Report)
        .options(joinedload(Report.cliente))
        .filter(
            extract('month', Report.data_agendada) == mes,
            extract('year', Report.data_agendada) == ano
        )
        .order_by(Report.data_agendada)
        .all()
    )
    
    return reports


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Busca um relatório específico por ID com todas as categorias e itens
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relatório não encontrado"
        )
    return report


@router.put("/{report_id}", response_model=ReportResponse)
def update_report(
    report_id: int,
    report_data: ReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualiza informações básicas do relatório
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relatório não encontrado"
        )
    
    # Atualiza campos
    update_data = report_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(report, key, value)
    
    # Se está finalizando, marca a data
    if report_data.status == ReportStatus.CONCLUIDO and not report.finalizado_em:
        report.finalizado_em = datetime.utcnow()
    
    db.commit()
    db.refresh(report)
    
    return report


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Deleta um relatório
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relatório não encontrado"
        )
    
    db.delete(report)
    db.commit()
    
    return None


@router.post("/{report_id}/finalizar", response_model=ReportResponse)
def finalizar_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Finaliza/Encerra um relatório, impedindo futuras edições
    """
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relatório não encontrado"
        )
    
    if report.status == ReportStatus.CONCLUIDO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Relatório já está finalizado"
        )
    
    # Marca como concluído
    report.status = ReportStatus.CONCLUIDO
    report.finalizado_em = datetime.utcnow()
    
    db.commit()
    db.refresh(report)
    
    return report


# ===== ENDPOINTS PARA CHECKLIST ITEMS =====

@router.put("/items/{item_id}", response_model=ChecklistItemResponse)
def update_checklist_item(
    item_id: int,
    item_data: ChecklistItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Atualiza a resposta e observações de um item de checklist
    """
    item = db.query(ChecklistItem).filter(ChecklistItem.id == item_id).first()
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item de checklist não encontrado"
        )
    
    # Atualiza campos
    if item_data.resposta is not None:
        item.resposta = item_data.resposta
    if item_data.observacoes is not None:
        item.observacoes = item_data.observacoes
    
    db.commit()
    db.refresh(item)
    
    return item


@router.get("/{report_id}/pdf")
def export_report_pdf(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Gera e retorna o PDF do relatório
    """
    report = (
        db.query(Report)
        .options(
            joinedload(Report.cliente),
            joinedload(Report.responsavel),
            joinedload(Report.categorias).joinedload(ChecklistCategory.itens)
        )
        .filter(Report.id == report_id)
        .first()
    )
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Relatório não encontrado"
        )
    
    # Gera o PDF
    pdf_buffer = generate_report_pdf(report)
    
    # Nome do arquivo
    filename = f"relatorio_{report.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    
    # Retorna como StreamingResponse
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
