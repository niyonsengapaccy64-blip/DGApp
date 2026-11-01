import traceback
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import models
from sqlalchemy import text
from database import engine, Base
from routers import auth, users, products, carts, orders
from seed_data import seed_products_if_empty

def auto_migrate_schema():
    """
    Auto-detects and aligns the live PostgreSQL schema to match the ORM models.
    Handles:
      - users.device_token  : adds column if missing (passwordless device auth)
      - users.password_hash : drops legacy password column if still present
      - users.created_at    : adds column if missing
      - users.updated_at    : adds column if missing
      - products/carts/orders.id : converts INTEGER SERIAL to VARCHAR(255) for UUID support
    """
    logs = []
    if engine.dialect.name == "postgresql":
        try:
            # 1. users table: add device_token if missing
            with engine.begin() as conn:
                res = conn.execute(text(
                    "SELECT column_name FROM information_schema.columns "
                    "WHERE table_name = 'users' AND column_name = 'device_token';"
                )).fetchone()
                if not res:
                    msg = "[AutoMigrate] Adding device_token column to users table..."
                    print(msg)
                    logs.append(msg)
                    conn.execute(text(
                        "ALTER TABLE users ADD COLUMN IF NOT EXISTS device_token TEXT;"
                    ))
                    logs.append("[AutoMigrate] device_token column added successfully.")

            # 2. users table: drop legacy password_hash if present
            with engine.begin() as conn:
                res = conn.execute(text(
                    "SELECT column_name FROM information_schema.columns "
                    "WHERE table_name = 'users' AND column_name = 'password_hash';"
                )).fetchone()
                if res:
                    msg = "[AutoMigrate] Dropping legacy password_hash column..."
                    print(msg)
                    logs.append(msg)
                    conn.execute(text("ALTER TABLE users DROP COLUMN IF EXISTS password_hash;"))
                    logs.append("[AutoMigrate] password_hash column dropped.")

            # 3. users table: add created_at & updated_at if missing
            with engine.begin() as conn:
                for col in ["created_at", "updated_at"]:
                    col_res = conn.execute(text(
                        f"SELECT column_name FROM information_schema.columns "
                        f"WHERE table_name = 'users' AND column_name = '{col}';"
                    )).fetchone()
                    if not col_res:
                        conn.execute(text(
                            f"ALTER TABLE users ADD COLUMN IF NOT EXISTS {col} TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;"
                        ))
                        logs.append(f"[AutoMigrate] Added {col} to users table.")

            # 4. users.device_token: create partial unique index (ignores NULLs)
            with engine.begin() as conn:
                idx = conn.execute(text(
                    "SELECT indexname FROM pg_indexes "
                    "WHERE tablename = 'users' AND indexname = 'idx_users_device_token';"
                )).fetchone()
                if not idx:
                    msg = "[AutoMigrate] Creating unique index on users.device_token..."
                    print(msg)
                    logs.append(msg)
                    conn.execute(text(
                        "CREATE UNIQUE INDEX IF NOT EXISTS idx_users_device_token "
                        "ON users(device_token) WHERE device_token IS NOT NULL;"
                    ))
                    logs.append("[AutoMigrate] Index idx_users_device_token created.")

            # 5. products / carts / orders: id INTEGER -> VARCHAR(255)
            with engine.begin() as conn:
                for table in ["products", "carts", "orders"]:
                    check_query = text(
                        "SELECT data_type FROM information_schema.columns "
                        "WHERE table_name = :t AND column_name = 'id';"
                    )
                    res = conn.execute(check_query, {"t": table}).fetchone()
                    if res and res[0] in ("integer", "smallint", "bigint"):
                        msg = f"[AutoMigrate] Converting {table}.id from {res[0]} to VARCHAR(255)..."
                        print(msg)
                        logs.append(msg)
                        conn.execute(text(
                            f"ALTER TABLE {table} ALTER COLUMN id TYPE VARCHAR(255) USING id::VARCHAR;"
                        ))
                        try:
                            conn.execute(text(f"ALTER TABLE {table} ALTER COLUMN id DROP DEFAULT;"))
                        except Exception:
                            pass
                        logs.append(f"[AutoMigrate] Successfully converted {table}.id to VARCHAR(255)")

        except Exception as e:
            err = f"[AutoMigrate Error] Failed to auto-migrate PostgreSQL columns: {e}"
            print(err)
            logs.append(err)
    return logs

# Automatically create tables for local development / deployment
Base.metadata.create_all(bind=engine)
auto_migrate_schema()
seed_products_if_empty()

app = FastAPI(
    title="D&G E-Commerce API",
    description="Production backend API for D&G React Native mobile application.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_trace = traceback.format_exc()
    print(f"[Server Error] {error_trace}")
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc), "traceback": error_trace}
    )

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(carts.router, prefix="/api/carts", tags=["Carts"])
app.include_router(orders.router, prefix="/api/orders", tags=["Orders"])

@app.get("/")
def root():
    return {"message": "D&G E-Commerce Backend is up and running successfully!"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/migrate")
@app.post("/api/migrate")
def trigger_migration():
    """Manual endpoint to invoke schema alignment on live database."""
    Base.metadata.create_all(bind=engine)
    logs = auto_migrate_schema()
    return {"status": "Migration completed", "logs": logs}
