// src/pages/Reports.tsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService, Report } from '../services/reportService';
import Navbar from '../components/Navbar'; 
import './Reports.css'; 

function Reports() {
    const [reports, setReports] = useState<Report[]>([]);
    const [search, setSearch] = useState(''); 
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const loadReports = async () => {
        try {
            const data = await reportService.getAll(); 
            setReports(data);
        } catch (error) {
            console.error('Erro ao carregar relatórios:', error);
            setReports([]); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReports();
    }, []);

    const filteredReports = reports.filter(report => {
        const searchTerm = search.toLowerCase();
        const clientName = report.cliente?.nome_fantasia?.toLowerCase() || '';
        const reportDesc = report.descricao?.toLowerCase() || '';
        
        return reportDesc.includes(searchTerm) || clientName.includes(searchTerm);
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // A busca é feita no frontend, então não precisa recarregar aqui.
    };

    const handleDelete = async (id: number) => {
        if (confirm('Deseja realmente deletar este relatório?')) {
            try {
                await reportService.delete(id);
                loadReports();
            } catch (error) {
                alert('Erro ao deletar relatório');
            }
        }
    };

    const handleExportPDF = async (e: React.MouseEvent, id: number) => {
        e.stopPropagation(); 
        try {
            await reportService.exportPDF(id);
        } catch (error) {
            alert('Erro ao exportar PDF');
            console.error('Erro ao exportar PDF:', error);
        }
    };

    return (
        <div className="reports-page">
            <Navbar /> 
            
            <div className="reports-container">
                <div className="reports-header">
                    <div className="reports-title-group">
                        {/* ADICIONADO: Ícone de grupo para o título "Relatórios / Checklist" */}
                        <h1 className="reports-title">📄 Relatórios / Checklist</h1>
                    </div>
                    
                    <div className="reports-actions">
                        <button
                            className="btn btn-success"
                            onClick={() => navigate('/reports/new')}
                        >
                            ➕ NOVO RELATÓRIO
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSearch} className="search-bar">
                    <input
                        type="text"
                        // ADICIONADO: Ícone de lupa no placeholder da busca
                        placeholder="🔍 Buscar relatórios..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <button type="submit" className="btn btn-primary">
                        Buscar
                    </button>
                </form>

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner">⏳</div>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📄</div>
                        <h2 className="empty-state-title">Nenhum relatório encontrado</h2>
                        <p className="empty-state-description">
                            {search ? 'Tente ajustar sua busca ou' : 'Clique em'} "+ RELATÓRIO" para criar um novo.
                        </p>
                        <button 
                            className="btn btn-primary"
                            onClick={() => navigate('/reports/new')}
                        >
                            ➕ Cadastrar Relatório
                        </button>
                    </div>
                ) : (
                    <div className="reports-list">
                        {filteredReports.map((report) => (
                            <div
                                key={report.id}
                                className="report-card"
                                onClick={() => navigate(`/reports/checklist/${report.id}`)}
                            >
                                <div className="report-card-content">
                                    <div className="report-details">
                                        <h3>{report.descricao || `Relatório ${report.id}`}</h3>
                                        <p>
                                            <strong>Cliente:</strong> {report.cliente?.nome_fantasia || `ID ${report.cliente_id}`}
                                        </p>
                                        <p>
                                            <strong>Data:</strong> {new Date(report.criado_em).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <div className="report-actions">
                                        <span 
                                            className={`status-badge status-${report.status === 'concluido' ? 'concluido' : 'andamento'}`}
                                        >
                                            {report.status === 'concluido' ? 'Concluído' : 'Em Andamento'}
                                        </span>
                                        <button
                                            onClick={(e) => handleExportPDF(e, report.id)}
                                            className="btn btn-primary btn-sm"
                                            title="Exportar para PDF"
                                        >
                                            📥 PDF
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(report.id);
                                            }}
                                            className="btn btn-danger btn-sm"
                                            title="Deletar"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Reports;