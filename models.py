from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship

Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}  # Добавьте эту строку

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    is_active = Column(Boolean, default=True)

    # Измените back_populates чтобы избежать конфликта
    items = relationship("Item", back_populates="owner")


class Item(Base):
    __tablename__ = "items"
    __table_args__ = {'extend_existing': True}  # Добавьте эту строку

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))

    # Исправьте back_populates
    owner = relationship("User", back_populates="items")
