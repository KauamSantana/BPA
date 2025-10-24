from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth_router, clients_router, reports_router

# Cria as tabelas no banco de dados
Base.metadata.create_all(bind=engine)

# Inicializa o app FastAPI
app = FastAPI(
    title="BPA Digital API",
    description="API para gerenciamento de Boas Práticas em Alimentação",
    version="1.0.0",
    docs_url="/docs",  # Swagger UI
    redoc_url="/redoc",  # ReDoc
)

# Configuração de CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React/Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registra os routers
app.include_router(auth_router)
app.include_router(clients_router)
app.include_router(reports_router)


@app.get("/", tags=["Root"])
def read_root():
    """
    Endpoint raiz da API
    """
    return {
        "message": "BPA Digital API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }


@app.get("/health", tags=["Health"])
def health_check():
    """
    Verifica se a API está funcionando
    """
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
