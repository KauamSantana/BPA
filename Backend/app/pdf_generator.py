"""
Módulo para geração de PDFs de relatórios
"""
from io import BytesIO
from datetime import datetime
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

from app.models.report import Report, ChecklistResponse


def generate_report_pdf(report: Report) -> BytesIO:
    """
    Gera PDF do relatório com checklist completo
    
    Args:
        report: Objeto Report do banco de dados
        
    Returns:
        BytesIO com o PDF gerado
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )
    
    # Estilos
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#2C3E50'),
        spaceAfter=20,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#34495E'),
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )
    
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        spaceAfter=6,
        alignment=TA_JUSTIFY
    )
    
    # Elementos do PDF
    elements = []
    
    # Título
    elements.append(Paragraph("RELATÓRIO DE INSPEÇÃO", title_style))
    elements.append(Paragraph("BPA Digital - Boas Práticas de Alimentação", normal_style))
    elements.append(Spacer(1, 0.5*cm))
    
    # Converter timezone para Brasil (UTC-3)
    from datetime import timedelta
    brasilia_offset = timedelta(hours=-3)
    criado_em_brasilia = report.criado_em + brasilia_offset if report.criado_em else None
    finalizado_em_brasilia = report.finalizado_em + brasilia_offset if report.finalizado_em else None
    
    # Informações do Relatório
    info_data = [
        ['Descrição:', report.descricao],
        ['Cliente:', report.cliente.nome_fantasia if report.cliente else f'ID: {report.cliente_id}'],
        ['CNPJ:', report.cliente.cnpj if report.cliente and report.cliente.cnpj else 'N/A'],
        ['Categoria:', report.categoria or 'N/A'],
        ['Responsável:', report.responsavel.nome if report.responsavel else 'N/A'],
        ['Status:', 'Concluído' if report.status.value == 'concluido' else 'Em Andamento'],
        ['Data de Criação:', criado_em_brasilia.strftime('%d/%m/%Y %H:%M') if criado_em_brasilia else 'N/A'],
        ['Data de Finalização:', finalizado_em_brasilia.strftime('%d/%m/%Y %H:%M') if finalizado_em_brasilia else 'N/A'],
    ]
    
    info_table = Table(info_data, colWidths=[5*cm, 12*cm])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#ECF0F1')),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#2C3E50')),
        ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    
    elements.append(info_table)
    elements.append(Spacer(1, 1*cm))
    
    # Checklist por Categoria
    if report.categorias:
        elements.append(Paragraph("CHECKLIST DE VERIFICAÇÃO", heading_style))
        elements.append(Spacer(1, 0.3*cm))
        
        for categoria in sorted(report.categorias, key=lambda x: x.ordem):
            # Título da Categoria
            cat_title = Paragraph(
                f"<b>{categoria.nome}</b>",
                ParagraphStyle(
                    'CategoryTitle',
                    parent=styles['Heading3'],
                    fontSize=12,
                    textColor=colors.HexColor('#16A085'),
                    spaceAfter=8,
                    spaceBefore=12,
                    fontName='Helvetica-Bold'
                )
            )
            elements.append(cat_title)
            
            # Itens da Categoria
            if categoria.itens:
                items_data = [['Código', 'Descrição', 'Resposta', 'Observações']]
                
                for item in sorted(categoria.itens, key=lambda x: x.ordem):
                    # Define cor da resposta
                    if item.resposta == ChecklistResponse.CONFORME:
                        resposta_text = '<font color="#27AE60">✓ Conforme</font>'
                    elif item.resposta == ChecklistResponse.NAO_CONFORME:
                        resposta_text = '<font color="#E74C3C">✗ Não Conforme</font>'
                    elif item.resposta == ChecklistResponse.NA:
                        resposta_text = '<font color="#95A5A6">N/A</font>'
                    else:
                        resposta_text = '<font color="#BDC3C7">Sem resposta</font>'
                    
                    items_data.append([
                        Paragraph(f"<b>{item.codigo}</b>", normal_style),
                        Paragraph(item.descricao, normal_style),
                        Paragraph(resposta_text, normal_style),
                        Paragraph(item.observacoes or '-', normal_style)
                    ])
                
                items_table = Table(
                    items_data,
                    colWidths=[2*cm, 7*cm, 3.5*cm, 4.5*cm],
                    repeatRows=1
                )
                items_table.setStyle(TableStyle([
                    # Cabeçalho
                    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#34495E')),
                    ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                    ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
                    ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                    ('FONTSIZE', (0, 0), (-1, 0), 10),
                    ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
                    ('TOPPADDING', (0, 0), (-1, 0), 10),
                    
                    # Corpo
                    ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                    ('TEXTCOLOR', (0, 1), (-1, -1), colors.HexColor('#2C3E50')),
                    ('ALIGN', (0, 1), (0, -1), 'CENTER'),
                    ('ALIGN', (1, 1), (-1, -1), 'LEFT'),
                    ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                    ('FONTSIZE', (0, 1), (-1, -1), 9),
                    ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
                    ('TOPPADDING', (0, 1), (-1, -1), 8),
                    ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                    
                    # Grid
                    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                    
                    # Linhas alternadas
                    ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F8F9FA')]),
                ]))
                
                elements.append(items_table)
                elements.append(Spacer(1, 0.5*cm))
    
    # Resumo do Checklist
    if report.categorias:
        total_items = sum(len(cat.itens) for cat in report.categorias)
        conforme = sum(
            len([i for i in cat.itens if i.resposta == ChecklistResponse.CONFORME])
            for cat in report.categorias
        )
        nao_conforme = sum(
            len([i for i in cat.itens if i.resposta == ChecklistResponse.NAO_CONFORME])
            for cat in report.categorias
        )
        na = sum(
            len([i for i in cat.itens if i.resposta == ChecklistResponse.NA])
            for cat in report.categorias
        )
        sem_resposta = total_items - (conforme + nao_conforme + na)
        
        elements.append(PageBreak())
        elements.append(Paragraph("RESUMO DA INSPEÇÃO", heading_style))
        elements.append(Spacer(1, 0.3*cm))
        
        summary_data = [
            ['Total de Itens Avaliados:', str(total_items)],
            ['Itens Conformes:', f'{conforme} ({conforme*100//total_items if total_items else 0}%)'],
            ['Itens Não Conformes:', f'{nao_conforme} ({nao_conforme*100//total_items if total_items else 0}%)'],
            ['Itens N/A:', f'{na} ({na*100//total_items if total_items else 0}%)'],
            ['Itens Sem Resposta:', str(sem_resposta)],
        ]
        
        summary_table = Table(summary_data, colWidths=[8*cm, 9*cm])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#ECF0F1')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.HexColor('#2C3E50')),
            ('ALIGN', (0, 0), (0, -1), 'RIGHT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ]))
        
        elements.append(summary_table)
    
    # Rodapé
    elements.append(Spacer(1, 1*cm))
    footer_text = f"Relatório gerado em {datetime.now().strftime('%d/%m/%Y às %H:%M')}"
    elements.append(Paragraph(footer_text, ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.grey,
        alignment=TA_CENTER
    )))
    
    # Gera o PDF
    doc.build(elements)
    buffer.seek(0)
    
    return buffer
