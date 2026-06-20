from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, rooms, reservations

# Cria as tabelas no banco automaticamente
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Reserva de Salas - FGMF Arquitetos",
    description="API para gerenciamento de reservas de salas de reunião",
    version="1.0.0"
)

# CORS para o frontend (Vite roda na 5173, ajuste se necessário)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "https://reservaarquitetura.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(rooms.router)
app.include_router(reservations.router)

@app.get("/")
def root():
    return {"mensagem": "API Reserva de Salas - FGMF Arquitetos", "docs": "/docs"}
