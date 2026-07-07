from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models import User, Brand, Category, Product, Location, Stock, InventoryLog
from app.schemas import UserCreate, BrandCreate, BrandUpdate, CategoryCreate, CategoryUpdate, ProductCreate, ProductUpdate, LocationCreate, LocationUpdate
from app.auth import get_password_hash
from fastapi import HTTPException, status
from decimal import Decimal

# --- USER CRUD ---
def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user_in: UserCreate):
    db_user = User(
        name=user_in.name,
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        role=user_in.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


# --- BRAND CRUD ---
def get_brands(db: Session):
    return db.query(Brand).order_by(Brand.name).all()

def get_brand(db: Session, brand_id: int):
    return db.query(Brand).filter(Brand.id == brand_id).first()

def create_brand(db: Session, brand_in: BrandCreate):
    db_brand = Brand(**brand_in.model_dump())
    db.add(db_brand)
    db.commit()
    db.refresh(db_brand)
    return db_brand

def update_brand(db: Session, brand_id: int, brand_in: BrandUpdate):
    db_brand = get_brand(db, brand_id)
    if not db_brand:
        return None
    for key, value in brand_in.model_dump(exclude_unset=True).items():
        setattr(db_brand, key, value)
    db.commit()
    db.refresh(db_brand)
    return db_brand

def delete_brand(db: Session, brand_id: int):
    db_brand = get_brand(db, brand_id)
    if not db_brand:
        return False
    # Check if products exist for this brand
    products_count = db.query(Product).filter(Product.brand_id == brand_id).count()
    if products_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete brand with active products. Reassign or delete products first."
        )
    db.delete(db_brand)
    db.commit()
    return True


# --- CATEGORY CRUD ---
def get_categories(db: Session):
    return db.query(Category).order_by(Category.name).all()

def get_category(db: Session, category_id: int):
    return db.query(Category).filter(Category.id == category_id).first()

def create_category(db: Session, category_in: CategoryCreate):
    db_category = Category(**category_in.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_category(db: Session, category_id: int, category_in: CategoryUpdate):
    db_category = get_category(db, category_id)
    if not db_category:
        return None
    for key, value in category_in.model_dump(exclude_unset=True).items():
        setattr(db_category, key, value)
    db.commit()
    db.refresh(db_category)
    return db_category

def delete_category(db: Session, category_id: int):
    db_category = get_category(db, category_id)
    if not db_category:
        return False
    # Check if products exist for this category
    products_count = db.query(Product).filter(Product.category_id == category_id).count()
    if products_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete category with active products. Reassign or delete products first."
        )
    db.delete(db_category)
    db.commit()
    return True


# --- PRODUCT CRUD ---
def get_products(db: Session, search: str = None, category_id: int = None, brand_id: int = None):
    query = db.query(Product)
    if search:
        query = query.filter(
            (Product.name.ilike(f"%{search}%")) | 
            (Product.sku.ilike(f"%{search}%"))
        )
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if brand_id:
        query = query.filter(Product.brand_id == brand_id)
    return query.order_by(Product.name).all()

def get_product(db: Session, product_id: int):
    return db.query(Product).filter(Product.id == product_id).first()

def create_product(db: Session, product_in: ProductCreate):
    # Verify brand and category exist
    if not get_brand(db, product_in.brand_id):
        raise HTTPException(status_code=400, detail="Invalid brand ID")
    if not get_category(db, product_in.category_id):
        raise HTTPException(status_code=400, detail="Invalid category ID")
    
    # Check SKU uniqueness
    existing = db.query(Product).filter(Product.sku == product_in.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="SKU already exists")

    db_product = Product(**product_in.model_dump())
    db.add(db_product)
    db.commit()
    db.refresh(db_product)
    return db_product

def update_product(db: Session, product_id: int, product_in: ProductUpdate):
    db_product = get_product(db, product_id)
    if not db_product:
        return None
    
    update_data = product_in.model_dump(exclude_unset=True)
    if "brand_id" in update_data and not get_brand(db, update_data["brand_id"]):
        raise HTTPException(status_code=400, detail="Invalid brand ID")
    if "category_id" in update_data and not get_category(db, update_data["category_id"]):
        raise HTTPException(status_code=400, detail="Invalid category ID")
    if "sku" in update_data:
        existing = db.query(Product).filter(Product.sku == update_data["sku"], Product.id != product_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="SKU already exists")

    for key, value in update_data.items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product

def delete_product(db: Session, product_id: int):
    db_product = get_product(db, product_id)
    if not db_product:
        return False
    db.delete(db_product)
    db.commit()
    return True


# --- LOCATION CRUD ---
def get_locations(db: Session):
    return db.query(Location).order_by(Location.location_code).all()

def get_location(db: Session, location_id: int):
    return db.query(Location).filter(Location.id == location_id).first()

def create_location(db: Session, location_in: LocationCreate):
    existing = db.query(Location).filter(Location.location_code == location_in.location_code).first()
    if existing:
        raise HTTPException(status_code=400, detail="Location code already exists")
    db_location = Location(**location_in.model_dump())
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location

def update_location(db: Session, location_id: int, location_in: LocationUpdate):
    db_location = get_location(db, location_id)
    if not db_location:
        return None
    update_data = location_in.model_dump(exclude_unset=True)
    if "location_code" in update_data:
        existing = db.query(Location).filter(
            Location.location_code == update_data["location_code"], 
            Location.id != location_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Location code already exists")
    for key, value in update_data.items():
        setattr(db_location, key, value)
    db.commit()
    db.refresh(db_location)
    return db_location

def delete_location(db: Session, location_id: int):
    db_location = get_location(db, location_id)
    if not db_location:
        return False
    # Check if stock exists at this location
    stock_count = db.query(Stock).filter(Stock.location_id == location_id, Stock.quantity > 0).count()
    if stock_count > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete location that currently holds stock. Relocate stock first."
        )
    db.delete(db_location)
    db.commit()
    return True


# --- STOCK CRUD & OPERATIONS ---
def get_all_stocks(db: Session):
    return db.query(Stock).order_by(Stock.quantity.desc()).all()

def get_product_stock_sum(db: Session, product_id: int) -> int:
    result = db.query(func.sum(Stock.quantity)).filter(Stock.product_id == product_id).scalar()
    return result or 0

def stock_in(db: Session, user_id: int, product_id: int, location_id: int, quantity: int, reason: str):
    # Verify product and location
    if not get_product(db, product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    if not get_location(db, location_id):
        raise HTTPException(status_code=404, detail="Location not found")
    
    # Retrieve or create Stock entry
    stock = db.query(Stock).filter(Stock.product_id == product_id, Stock.location_id == location_id).first()
    if not stock:
        stock = Stock(product_id=product_id, location_id=location_id, quantity=0)
        db.add(stock)
        db.flush() # Flush to assign an ID
    
    prev_qty = stock.quantity
    stock.quantity += quantity
    stock.last_updated = func.now()

    # Log operation
    log = InventoryLog(
        product_id=product_id,
        user_id=user_id,
        location_id=location_id,
        operation="Stock In",
        quantity_changed=quantity,
        previous_quantity=prev_qty,
        new_quantity=stock.quantity,
        reason=reason
    )
    db.add(log)
    db.commit()
    db.refresh(stock)
    return stock

def stock_out(db: Session, user_id: int, product_id: int, location_id: int, quantity: int, reason: str):
    # Verify product and location
    if not get_product(db, product_id):
        raise HTTPException(status_code=404, detail="Product not found")
    if not get_location(db, location_id):
        raise HTTPException(status_code=404, detail="Location not found")
    
    stock = db.query(Stock).filter(Stock.product_id == product_id, Stock.location_id == location_id).first()
    if not stock or stock.quantity < quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient stock at location. Available: {stock.quantity if stock else 0}, Requested: {quantity}"
        )
    
    prev_qty = stock.quantity
    stock.quantity -= quantity
    stock.last_updated = func.now()

    # Log operation
    log = InventoryLog(
        product_id=product_id,
        user_id=user_id,
        location_id=location_id,
        operation="Stock Out",
        quantity_changed=quantity,
        previous_quantity=prev_qty,
        new_quantity=stock.quantity,
        reason=reason
    )
    db.add(log)
    db.commit()
    db.refresh(stock)
    return stock


# --- INVENTORY LOGS ---
def get_inventory_logs(db: Session):
    return db.query(InventoryLog).order_by(InventoryLog.created_at.desc()).all()


# --- DASHBOARD & ANALYTICS ---
def get_manager_dashboard_stats(db: Session) -> dict:
    total_products = db.query(Product).count()
    total_brands = db.query(Brand).count()
    total_categories = db.query(Category).count()
    
    # Inventory Value Calculation: Sum(Stock.quantity * Product.unit_price)
    value_query = db.query(func.sum(Stock.quantity * Product.unit_price)).join(Product).scalar()
    inventory_value = Decimal(str(value_query or 0))

    # Low Stock Products count: Product whose SUM of stock is < Product.minimum_stock
    # We query all products and sum their stock, then check
    products = db.query(Product).all()
    low_stock_count = 0
    out_of_stock_count = 0
    for p in products:
        total_qty = db.query(func.sum(Stock.quantity)).filter(Stock.product_id == p.id).scalar() or 0
        if total_qty == 0:
            out_of_stock_count += 1
            low_stock_count += 1 # Out of stock is also low stock if minimum_stock > 0
        elif total_qty < p.minimum_stock:
            low_stock_count += 1

    # Recent activity logs (limit 10)
    recent_activity = db.query(InventoryLog).order_by(InventoryLog.created_at.desc()).limit(10).all()

    return {
        "total_products": total_products,
        "total_brands": total_brands,
        "total_categories": total_categories,
        "inventory_value": inventory_value,
        "low_stock_products": low_stock_count,
        "out_of_stock_products": out_of_stock_count,
        "recent_activity": recent_activity
    }

def get_staff_dashboard_stats(db: Session) -> dict:
    # Products in stock: Total quantity sum across all stock locations
    products_in_stock = db.query(func.sum(Stock.quantity)).scalar() or 0
    
    # Low stock items count
    products = db.query(Product).all()
    low_stock_count = 0
    for p in products:
        total_qty = db.query(func.sum(Stock.quantity)).filter(Stock.product_id == p.id).scalar() or 0
        if total_qty < p.minimum_stock:
            low_stock_count += 1

    # Recent updates (limit 5)
    recent_updates = db.query(InventoryLog).order_by(InventoryLog.created_at.desc()).limit(5).all()

    return {
        "products_in_stock": products_in_stock,
        "low_stock_items": low_stock_count,
        "recent_stock_updates": recent_updates
    }
