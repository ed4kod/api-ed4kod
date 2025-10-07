from pydantic import BaseModel
from typing import List, Optional

class ItemBase(BaseModel):
    title: str
    description: Optional[str] = None

class ItemCreate(ItemBase):
    pass

class Item(ItemBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True

class UserBase(BaseModel):
    email: str
    name: str

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    items: List[Item] = []

    class Config:
        orm_mode = True