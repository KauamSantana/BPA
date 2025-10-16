# Script para iniciar o Backend
Write-Host "🚀 Iniciando Backend BPA Digital..." -ForegroundColor Green

# Verifica se está na pasta correta
if (-not (Test-Path "app/main.py")) {
    Write-Host "❌ Erro: Execute este script na pasta Backend!" -ForegroundColor Red
    exit 1
}

# Verifica se o ambiente virtual existe
if (-not (Test-Path "venv")) {
    Write-Host "📦 Criando ambiente virtual..." -ForegroundColor Yellow
    python -m venv venv
}

# Ativa o ambiente virtual
Write-Host "🔧 Ativando ambiente virtual..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

# Instala dependências
Write-Host "📥 Instalando dependências..." -ForegroundColor Yellow
pip install -r requirements.txt --quiet

# Inicia o servidor
Write-Host "" -ForegroundColor Green
Write-Host "✅ Backend pronto!" -ForegroundColor Green
Write-Host "📍 API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "📚 Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Green
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Yellow
Write-Host "" -ForegroundColor Green

uvicorn app.main:app --reload
