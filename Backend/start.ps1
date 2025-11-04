# start.ps1 — Backend FastAPI (Windows)
# Executa com: .\start.ps1
$ErrorActionPreference = "Stop"

# Permitir execução deste script na sessão atual (não altera o sistema)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force

# Ir para a pasta do script
Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Path)

Write-Host "== BPA Backend ==" -ForegroundColor Cyan

# Descobrir Python (prioriza 3.11 se existir)
function Get-Py {
    try {
        py -3.11 -c "import sys;print(sys.version)" *> $null
        if ($LASTEXITCODE -eq 0) { return "py -3.11" }
    } catch {}
    try {
        python --version *> $null
        if ($LASTEXITCODE -eq 0) { return "python" }
    } catch {}
    throw "Python não encontrado. Instale Python 3.11 e adicione ao PATH."
}

$PY = Get-Py

# Criar venv se não existir
if (-not (Test-Path "venv")) {
    Write-Host "Criando ambiente virtual..." -ForegroundColor Yellow
    & $PY -m venv venv
}

# Ativar venv
$activate = ".\venv\Scripts\Activate.ps1"
if (-not (Test-Path $activate)) {
    throw "Não foi possível localizar $activate"
}
. $activate

# Atualizar instaladores
Write-Host "Atualizando instaladores..." -ForegroundColor Yellow
python -m pip install --upgrade pip setuptools wheel

# Instalar dependências
Write-Host "Instalando dependências do requirements.txt..." -ForegroundColor Yellow
pip install -r requirements.txt

# Iniciar o servidor
Write-Host "Iniciando Uvicorn em http://127.0.0.1:8000 ..." -ForegroundColor Green
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor Yellow

# Use python -m uvicorn (mais confiável no Windows)
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000