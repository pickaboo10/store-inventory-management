from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from typing import Optional, List
from decimal import Decimal

# User Schemas
class UserBase(BaseModel):
    name: str = Field(..., max_length=100)
    email: EmailStr
    role: str = Field(..., pattern="^(Manager|Staff)$")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None

class LoginRequest(BaseModel):
    username: EmailStr  # We match OAuth2 username password flow
    password: str


# Brand Schemas
class BrandBase(BaseModel):
    name: str = Field(..., max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None

class BrandCreate(BrandBase):
    pass

class BrandUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    country: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None

class BrandResponse(BrandBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Category Schemas
class CategoryBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Product Schemas
class ProductBase(BaseModel):
    name: str = Field(..., max_length=150)
    sku: str = Field(..., max_length=100)
    description: Optional[str] = None
    brand_id: int
    category_id: int
    unit_price: Decimal = Field(..., ge=0)
    unit: str = Field(..., max_length=50)
    minimum_stock: int = Field(0, ge=0)
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=150)
    sku: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    brand_id: Optional[int] = None
    category_id: Optional[int] = None
    unit_price: Optional[Decimal] = Field(None, ge=0)
    unit: Optional[str] = Field(None, max_length=50)
    minimum_stock: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    brand: BrandResponse
    category: CategoryResponse

    model_config = ConfigDict(from_attributes=True)


# Location Schemas
class LocationBase(BaseModel):
    location_code: str = Field(..., max_length=100)
    warehouse: str = Field(..., max_length=100)
    aisle: str = Field(..., max_length=50)
    shelf: str = Field(..., max_length=50)
    description: Optional[str] = None

class LocationCreate(LocationBase):
    pass

class LocationUpdate(BaseModel):
    location_code: Optional[str] = Field(None, max_length=100)
    warehouse: Optional[str] = Field(None, max_length=100)
    aisle: Optional[str] = Field(None, max_length=50)
    shelf: Optional[str] = Field(None, max_length=50)
    description: Optional[str] = None

class LocationResponse(LocationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Stock Schemas
class StockBase(BaseModel):
    product_id: int
    location_id: int
    quantity: int = Field(..., ge=0)

class StockInRequest(BaseModel):
    product_id: int
    location_id: int
    quantity: int = Field(..., gt=0)
    reason: Optional[str] = "Stock In"

class StockOutRequest(BaseModel):
    product_id: int
    location_id: int
    quantity: int = Field(..., gt=0)
    reason: Optional[str] = "Stock Out"

# Nested simple structures for Stock response
class ProductSimple(BaseModel):
    id: int
    name: str
    sku: str
    unit: str
    minimum_stock: int
    model_config = ConfigDict(from_attributes=True)

class LocationSimple(BaseModel):
    id: int
    location_code: str
    warehouse: str
    model_config = ConfigDict(from_attributes=True)

class StockResponse(BaseModel):
    id: int
    product_id: int
    location_id: int
    quantity: int
    last_updated: datetime
    product: ProductSimple
    location: LocationSimple

    model_config = ConfigDict(from_attributes=True)


# Inventory Log Schemas
class InventoryLogResponse(BaseModel):
    id: int
    product_id: int
    user_id: Optional[int] = None
    location_id: int
    operation: str
    quantity_changed: int
    previous_quantity: int
    new_quantity: int
    reason: Optional[str] = None
    created_at: datetime
    product: ProductSimple
    location: LocationSimple
    user: Optional[UserResponse] = None

    model_config = ConfigDict(from_attributes=True)


# Dashboard Reporting Schemas
class ManagerDashboardStats(BaseModel):
    total_products: int
    total_brands: int
    total_categories: int
    inventory_value: Decimal
    low_stock_products: int
    out_of_stock_products: int
    recent_activity: List[InventoryLogResponse]

class StaffDashboardStats(BaseModel):
    products_in_stock: int
    low_stock_items: int
    recent_stock_updates: List[InventoryLogResponse]
