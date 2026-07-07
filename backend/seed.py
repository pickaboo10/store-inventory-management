from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models import User, Brand, Category, Product, Location, Stock, InventoryLog
from app.auth import get_password_hash
import datetime

def seed():
    # Create tables if not exist
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if database is already seeded
        if db.query(User).count() > 0:
            print("Database already seeded.")
            return

        print("Seeding database...")
        
        # 1. Seed Users
        manager = User(
            name="Alice Manager",
            email="manager@store.com",
            hashed_password=get_password_hash("manager123"),
            role="Manager"
        )
        staff = User(
            name="Bob Staff",
            email="staff@store.com",
            hashed_password=get_password_hash("staff123"),
            role="Staff"
        )
        db.add_all([manager, staff])
        db.commit()

        # 2. Seed Brands
        brands = [
            Brand(name="Sony", country="Japan", description="Consumer electronics, gaming, and entertainment"),
            Brand(name="Nike", country="USA", description="Athletic footwear, apparel, and equipment"),
            Brand(name="Logitech", country="Switzerland", description="Computer peripherals and software utilities"),
            Brand(name="Patagonia", country="USA", description="Environmentally sustainable outdoor apparel")
        ]
        db.add_all(brands)
        db.commit()

        # 3. Seed Categories
        categories = [
            Category(name="Electronics", description="Consumer devices, computer peripherals, and accessories"),
            Category(name="Apparel", description="Shirts, pants, jackets, and sportswear"),
            Category(name="Footwear", description="Running shoes, sneakers, and boots"),
            Category(name="Accessories", description="Bags, watches, sunglasses, and equipment")
        ]
        db.add_all(categories)
        db.commit()

        # 4. Seed Locations
        locations = [
            Location(location_code="WH-A-1-A", warehouse="Warehouse A", aisle="1", shelf="A", description="Top shelf, fast-moving lane"),
            Location(location_code="WH-A-1-B", warehouse="Warehouse A", aisle="1", shelf="B", description="Middle shelf, standard storage"),
            Location(location_code="WH-B-2-A", warehouse="Warehouse B", aisle="2", shelf="A", description="Upper tier bulk section"),
            Location(location_code="WH-B-2-B", warehouse="Warehouse B", aisle="2", shelf="B", description="Cold room compartment")
        ]
        db.add_all(locations)
        db.commit()

        # 5. Seed Products
        sony = brands[0]
        nike = brands[1]
        logitech = brands[2]
        patagonia = brands[3]

        electronics = categories[0]
        apparel = categories[1]
        footwear = categories[2]
        accessories = categories[3]

        products = [
            Product(
                name="Sony WH-1000XM4 Headphones",
                sku="SONY-WH1000XM4-B",
                description="Active noise canceling over-ear wireless headphones",
                brand_id=sony.id,
                category_id=electronics.id,
                unit_price=299.99,
                unit="pcs",
                minimum_stock=10,
                is_active=True
            ),
            Product(
                name="Nike Air Max 90",
                sku="NIKE-AM90-W-10",
                description="Classic white-on-white running shoes, US Size 10",
                brand_id=nike.id,
                category_id=footwear.id,
                unit_price=120.00,
                unit="pcs",
                minimum_stock=15,
                is_active=True
            ),
            Product(
                name="Logitech MX Master 3S Mouse",
                sku="LOGI-MX3S-GR",
                description="Ergonomic wireless performance office mouse",
                brand_id=logitech.id,
                category_id=electronics.id,
                unit_price=99.99,
                unit="pcs",
                minimum_stock=8,
                is_active=True
            ),
            Product(
                name="Patagonia Torrentshell 3L Jacket",
                sku="PATA-TORR3L-M",
                description="Waterproof H2No performance outdoor shell jacket, size M",
                brand_id=patagonia.id,
                category_id=apparel.id,
                unit_price=149.00,
                unit="pcs",
                minimum_stock=5,
                is_active=True
            )
        ]
        db.add_all(products)
        db.commit()

        # 6. Seed Stocks & Logs
        # Product 1 (Sony): 12 in WH-A-1-A (Above min stock 10)
        # Product 2 (Nike): 5 in WH-A-1-B (Below min stock 15 -> Low Stock!)
        # Product 3 (Logitech): 20 in WH-B-2-A (Above min stock 8)
        # Product 4 (Patagonia): 0 in stock -> Out of stock! (No stock row or qty=0)

        stock_ops = [
            (products[0].id, locations[0].id, 12, "Initial inventory restock"),
            (products[1].id, locations[1].id, 5, "Initial inventory restock"),
            (products[2].id, locations[2].id, 20, "Initial inventory restock"),
        ]

        for prod_id, loc_id, qty, reason in stock_ops:
            stock = Stock(product_id=prod_id, location_id=loc_id, quantity=qty)
            db.add(stock)
            db.flush()

            log = InventoryLog(
                product_id=prod_id,
                user_id=manager.id,
                location_id=loc_id,
                operation="Stock In",
                quantity_changed=qty,
                previous_quantity=0,
                new_quantity=qty,
                reason=reason
            )
            db.add(log)
        
        db.commit()
        print("Database seeded successfully!")

    finally:
        db.close()

if __name__ == "__main__":
    seed()
