from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

class OrderItem(BaseModel):
    product: str  # ObjectId as str
    productName: str
    quantity: int
    price: float
    total: float

class CustomerInfo(BaseModel):
    name: str
    phone: str
    address: str

class Order(BaseModel):
    orderId: str
    user: str  # user ID
    items: List[OrderItem]
    totalAmount: float
    customerInfo: CustomerInfo
    status: str = "pending"
    discountCode: Optional[str] = None
    discountAmount: float = 0
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None