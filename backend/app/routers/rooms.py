from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime, timezone
from typing import List
import uuid

from app.database import get_db
from app.models.schemas import Room, Reservation, RoomCreate, RoomOut, RoomAvailability
from app.routers.auth import get_current_user, require_admin, Profile

router = APIRouter(prefix="/rooms", tags=["Rooms"])


@router.get("/", response_model=List[RoomOut])
def list_rooms(db: Session = Depends(get_db), current_user: Profile = Depends(get_current_user)):
    return db.query(Room).all()


@router.get("/availability", response_model=List[RoomAvailability])
def get_availability(date: date, db: Session = Depends(get_db), current_user: Profile = Depends(get_current_user)):
    rooms = db.query(Room).all()
    result = []

    for room in rooms:
        reservations_today = db.query(Reservation).filter(
            Reservation.room_id == room.id,
            func.date(Reservation.start_time) == date
        ).count()

        # Verifica se há reserva ativa agora
        now = datetime.now(timezone.utc)
        active = db.query(Reservation).filter(
            Reservation.room_id == room.id,
            Reservation.start_time <= now,
            Reservation.end_time >= now
        ).first()

        result.append({
            "id": room.id,
            "name": room.name,
            "capacity": room.capacity,
            "floor": room.floor,
            "reservations_today": reservations_today,
            "available": active is None
        })

    return result


@router.post("/", response_model=RoomOut, status_code=201)
def create_room(data: RoomCreate, db: Session = Depends(get_db), current_user: Profile = Depends(require_admin)):
    room = Room(**data.model_dump())
    db.add(room)
    db.commit()
    db.refresh(room)
    return room


@router.delete("/{room_id}")
def delete_room(room_id: uuid.UUID, db: Session = Depends(get_db), current_user: Profile = Depends(require_admin)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Sala não encontrada")

    db.delete(room)
    db.commit()
    return {"mensagem": "Sala removida com sucesso"}
