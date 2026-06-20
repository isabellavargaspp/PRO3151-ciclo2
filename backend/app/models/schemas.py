from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
import uuid

from app.database import Base


# ─────────────────────────────────────────
# MODELOS SQLALCHEMY (tabelas do banco)
# ─────────────────────────────────────────

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String(20), nullable=False, default="employee")

    reservations = relationship("Reservation", back_populates="user")


class Room(Base):
    __tablename__ = "rooms"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    name = Column(String(100), nullable=False)
    capacity = Column(Integer, nullable=False)
    floor = Column(String(50))
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    reservations = relationship("Reservation", back_populates="room")

    __table_args__ = (
        CheckConstraint("capacity > 0", name="check_capacity_positive"),
    )


class Reservation(Base):
    __tablename__ = "reservations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, nullable=False)
    room_id = Column(UUID(as_uuid=True), ForeignKey("rooms.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("profiles.id"), nullable=False)
    title = Column(String(200), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    room = relationship("Room", back_populates="reservations")
    user = relationship("Profile", back_populates="reservations")

    __table_args__ = (
        CheckConstraint("end_time > start_time", name="check_end_after_start"),
    )


# ─────────────────────────────────────────
# SCHEMAS PYDANTIC (validação de entrada/saída)
# ─────────────────────────────────────────

# Auth
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "employee"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    role: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut

# Rooms
class RoomCreate(BaseModel):
    name: str
    capacity: int
    floor: Optional[str] = None
    description: Optional[str] = None

class RoomOut(BaseModel):
    id: uuid.UUID
    name: str
    capacity: int
    floor: Optional[str]
    description: Optional[str]
    created_at: Optional[datetime]

    class Config:
        from_attributes = True

class RoomAvailability(BaseModel):
    id: uuid.UUID
    name: str
    capacity: int
    floor: Optional[str]
    reservations_today: int
    available: bool

# Reservations
class ReservationCreate(BaseModel):
    room_id: uuid.UUID
    title: str
    start_time: datetime
    end_time: datetime

class ReservationOut(BaseModel):
    id: uuid.UUID
    room_id: uuid.UUID
    user_id: uuid.UUID
    title: str
    start_time: datetime
    end_time: datetime
    created_at: Optional[datetime]

    class Config:
        from_attributes = True
