from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import timedelta

from app.database import engine, Base, get_db
from app.models import User
from app.config import settings
from app.auth import (
    create_access_token,
    get_current_user,
    require_role,
    get_password_hash,
    verify_password
)
from app.schemas import (
    UserCreate, UserResponse, Token,
    BrandResponse, BrandCreate, BrandUpdate,
    CategoryResponse, CategoryCreate, CategoryUpdate,
    ProductResponse, ProductCreate, ProductUpdate,
    LocationResponse, LocationCreate, LocationUpdate,
    StockResponse, StockInRequest, StockOutRequest,
    InventoryLogResponse, ManagerDashboardStats, StaffDashboardStats
)
from app import crud

# Create database tables automatically on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Store Inventory Management System API",
    description="Backend API for managing products, brands, categories, locations, stock, and logs.",
    version="1.0.0"
)

# CORS Configuration for Frontend React SPA
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify actual origins like http://localhost:5173
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- AUTHENTICATION ---

@app.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing_user = crud.get_user_by_email(db, email=user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    return crud.create_user(db=db, user_in=user_in)


@app.post("/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role},
        expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/auth/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


# --- BRANDS (Manager only write, all read) ---

@app.get("/brands", response_model=List[BrandResponse])
def read_brands(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.get_brands(db)


@app.post("/brands", response_model=BrandResponse, status_code=status.HTTP_201_CREATED)
def create_brand(
    brand_in: BrandCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["Manager"]))
):
    return crud.create_brand(db, brand_in)


@app.put("/brands/{id}", response_model=BrandResponse)
def update_brand(
    id: int, 
    brand_in: BrandUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["Manager"]))
):
    brand = crud.update_brand(db, id, brand_in)
    if not brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    return brand


@app.delete("/brands/{id}")
def delete_brand(
    id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["Manager"]))
):
    deleted = crud.delete_brand(db, id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Brand not found")
    return {"detail": "Brand deleted successfully"}


# --- CATEGORIES (Manager only write, all read) ---

@app.get("/categories", response_model=List[CategoryResponse])
def read_categories(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.get_categories(db)


@app.post("/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(
    category_in: CategoryCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["Manager"]))
):
    return crud.create_category(db, category_in)


@app.put("/categories/{id}", response_model=CategoryResponse)
def update_category(
    id: int, 
    category_in: CategoryUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["Manager"]))
):
    category = crud.update_category(db, id, category_in)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@app.delete("/categories/{id}")
def delete_category(
    id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["Manager"]))
):
    deleted = crud.delete_category(db, id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"detail": "Category deleted successfully"}


# --- PRODUCTS (Manager only write, all read) ---

@app.get("/products", response_model=List[ProductResponse])
def read_products(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    brand_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.get_products(db, search=search, category_id=category_id, brand_id=brand_id)


@app.get("/products/{id}", response_model=ProductResponse)
def read_product(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    product = crud.get_product(db, id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["Manager"]))
):
    return crud.create_product(db, product_in)


@app.put("/products/{id}", response_model=ProductResponse)
def update_product(
    id: int, 
    product_in: ProductUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["Manager"]))
):
    product = crud.update_product(db, id, product_in)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@app.delete("/products/{id}")
def delete_product(
    id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["Manager"]))
):
    deleted = crud.delete_product(db, id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"detail": "Product deleted successfully"}


# --- LOCATIONS (Manager only write, all read) ---

@app.get("/locations", response_model=List[LocationResponse])
def read_locations(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.get_locations(db)


@app.post("/locations", response_model=LocationResponse, status_code=status.HTTP_201_CREATED)
def create_location(
    location_in: LocationCreate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["Manager"]))
):
    return crud.create_location(db, location_in)


@app.put("/locations/{id}", response_model=LocationResponse)
def update_location(
    id: int, 
    location_in: LocationUpdate, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["Manager"]))
):
    location = crud.update_location(db, id, location_in)
    if not location:
        raise HTTPException(status_code=404, detail="Location not found")
    return location


@app.delete("/locations/{id}")
def delete_location(
    id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["Manager"]))
):
    deleted = crud.delete_location(db, id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Location not found")
    return {"detail": "Location deleted successfully"}


# --- STOCK OPERATIONS ---

@app.get("/stock", response_model=List[StockResponse])
def read_stock(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.get_all_stocks(db)


@app.post("/stock/in", response_model=StockResponse)
def stock_in(
    stock_in_req: StockInRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["Manager", "Staff"]))
):
    return crud.stock_in(
        db=db, 
        user_id=current_user.id,
        product_id=stock_in_req.product_id, 
        location_id=stock_in_req.location_id, 
        quantity=stock_in_req.quantity,
        reason=stock_in_req.reason
    )


@app.post("/stock/out", response_model=StockResponse)
def stock_out(
    stock_out_req: StockOutRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["Manager"]))
):
    return crud.stock_out(
        db=db, 
        user_id=current_user.id,
        product_id=stock_out_req.product_id, 
        location_id=stock_out_req.location_id, 
        quantity=stock_out_req.quantity,
        reason=stock_out_req.reason
    )


# --- INVENTORY LOGS (Manager only) ---

@app.get("/inventory-logs", response_model=List[InventoryLogResponse])
def read_inventory_logs(
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["Manager"]))
):
    return crud.get_inventory_logs(db)


# --- DASHBOARD REPORTING ---

@app.get("/dashboard/manager", response_model=ManagerDashboardStats)
def get_manager_stats(
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["Manager"]))
):
    return crud.get_manager_dashboard_stats(db)


@app.get("/dashboard/staff", response_model=StaffDashboardStats)
def get_staff_stats(
    db: Session = Depends(get_db), 
    current_user: User = Depends(require_role(["Manager", "Staff"]))
):
    return crud.get_staff_dashboard_stats(db)
