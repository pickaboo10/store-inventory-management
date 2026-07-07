# Store Inventory Management System

StoreFlow is a premium, web-based Store Inventory Management System that helps businesses digitally track products, stock levels, warehouse coordinates, and maintain a detailed history of all stock events.

## Features
- **Role-Based Access Control (RBAC)**: Users log in with secure JWT authorization and see tailored interfaces based on their permission levels (Manager or Staff).
- **Interactive Dashboards**: Role-specific dashboards featuring analytics counters, low stock indicators, and a recent transaction timeline.
- **Product Directory**: Comprehensive catalog list with custom categories and brands, search inputs, and filters (Manager holds full CRUD rights, Staff holds view-only access).
- **Storage Locations**: Tracks which warehouse aisle and shelf holds each inventory item, including specific section allocation.
- **Stock Module**: Facilitates *Stock In* (restocking) and *Stock Out* (sales/usages/write-offs) operations. Only Managers can authorize Stock Out deductions.
- **Inventory Audit Logs**: Traceable transaction logs recording the exact shift in quantities, previous/new stock levels, location, timestamp, notes, and the user who authorized the change.

---

## Tech Stack

### Frontend
- **React (via Vite)**: Reactive components and state.
- **Vanilla CSS**: Styled for a sleek, glassmorphic dark theme.
- **Axios**: Communicates with the REST endpoints.
- **Lucide React**: Clean icons.

### Backend
- **FastAPI**: REST endpoints, JWT authorization, validation.
- **SQLAlchemy 2.0**: Database ORM.
- **PostgreSQL**: Production database storage (with a transparent local **SQLite fallback** for seamless local testing).
- **Pydantic v2**: Strict payload and serialization schemas.
- **Brypt**: Direct password hashing.

---

## Setup and Running

### Prerequisites
- Python 3.12+
- Node.js (with npm)

### 1. Backend Server Setup
Navigate to the `backend` folder:
```bash
cd backend
```

Install dependencies:
```bash
pip install -r requirements.txt
```

Initialize and Seed the database with demonstration data:
```bash
python seed.py
```
*Note: If PostgreSQL is not active, the system automatically falls back to a local SQLite database (`store_inventory.db`) so the system is immediately ready to run.*

Start the FastAPI backend server:
```bash
python -m uvicorn app.main:app --port 8000 --reload
```
The interactive Swagger API documentation will be available at: [http://localhost:8000/docs](http://localhost:8000/docs).

---

### 2. Frontend Setup
Navigate to the `frontend` folder:
```bash
cd frontend
```

Install packages:
```bash
npm install
```

Start the React development server:
```bash
npm run dev
```
Open the application in your browser at: [http://localhost:5173](http://localhost:5173).

---

## Demonstration Credentials
We have pre-seeded the database with two demonstration user profiles for evaluation:

1. **Manager Profile (Full Access)**:
   - **Email**: `manager@store.com`
   - **Password**: `manager123`

2. **Staff Profile (Operational Access)**:
   - **Email**: `staff@store.com`
   - **Password**: `staff123`
