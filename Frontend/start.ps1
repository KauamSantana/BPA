# Script para iniciar o Frontend
Write-Host "🚀 Iniciando Frontend BPA Digital..." -ForegroundColor Green

# Verifica se está na pasta correta
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: Execute este script na pasta Frontend!" -ForegroundColor Red
    exit 1
}

# Verifica se node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
} else {
    Write-Host "✅ Dependências já instaladas" -ForegroundColor Green
}

# Inicia o servidor
Write-Host "" -ForegroundColor Green
Write-Host "✅ Frontend pronto!" -ForegroundColor Green
Write-Host "📍 App: http://localhost:5173" -ForegroundColor Cyan
Write-Host "" -ForegroundColor Green
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Yellow
Write-Host "" -ForegroundColor Green

npm run dev
