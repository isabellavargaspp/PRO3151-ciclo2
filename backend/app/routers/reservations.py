from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.database import get_db
from app.models.schemas import Reservation, ReservationCreate, ReservationOut
from app.routers.auth import get_current_user, Profile

router = APIRouter(prefix="/reservations", tags=["Reservations"])


@router.get("/my", response_model=List[ReservationOut])
def my_reservations(db: Session = Depends(get_db), current_user: Profile = Depends(get_current_user)):
    return db.query(Reservation).filter(Reservation.user_id == current_user.id).all()


@router.post("/", response_model=ReservationOut, status_code=201)
def create_reservation(data: ReservationCreate, db: Session = Depends(get_db), current_user: Profile = Depends(get_current_user)):
    # Valida conflito de horário
    conflict = db.query(Reservation).filter(
        Reservation.room_id == data.room_id,
        Reservation.start_time < data.end_time,
        Reservation.end_time > data.start_time
    ).first()

    if conflict:
        raise HTTPException(
            status_code=409,
            detail="Este horário conflita com uma reserva existente"
        )

    reservation = Reservation(
        room_id=data.room_id,
        user_id=current_user.id,
        title=data.title,
        start_time=data.start_time,
        end_time=data.end_time
    )
    db.add(reservation)
    db.commit()
    db.refresh(reservation)
    return reservation


@router.delete("/{reservation_id}")
def cancel_reservation(reservation_id: uuid.UUID, db: Session = Depends(get_db), current_user: Profile = Depends(get_current_user)):
    reservation = db.query(Reservation).filter(Reservation.id == reservation_id).first()

    if not reservation:
        raise HTTPException(status_code=404, detail="Reserva não encontrada")

    if reservation.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Você não tem permissão para cancelar esta reserva")

    db.delete(reservation)
    db.commit()
    return {"mensagem": "Reserva cancelada com sucesso"}
