from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import ProgrammingError, OperationalError
from models.user import User
from models.order import Order
from models.cart import Cart

def ensure_user_columns(db: Session):
    """
    On-the-fly self-healing:
    If a query failed because device_token or timestamps were missing,
    this adds them immediately in a dedicated transaction so the retry succeeds.
    """
    try:
        db.rollback()
        db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS device_token TEXT;"))
        db.execute(text("ALTER TABLE users DROP COLUMN IF EXISTS password_hash;"))
        db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;"))
        db.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;"))
        db.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_device_token ON users(device_token) WHERE device_token IS NOT NULL;"))
        db.execute(text("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);"))
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"[crud_user:ensure_user_columns] Migration error (non-fatal): {e}")

def get_user_by_email(db: Session, email: str):
    if not email:
        return None
    clean = email.strip().lower()
    try:
        return db.query(User).filter(User.email == clean).first()
    except (ProgrammingError, OperationalError) as e:
        if "device_token" in str(e).lower() or "undefinedcolumn" in str(e).lower():
            ensure_user_columns(db)
            return db.query(User).filter(User.email == clean).first()
        raise

def get_user_by_device_token(db: Session, device_token: str):
    if not device_token:
        return None
    clean = device_token.strip()
    try:
        return db.query(User).filter(User.device_token == clean).first()
    except (ProgrammingError, OperationalError) as e:
        if "device_token" in str(e).lower() or "undefinedcolumn" in str(e).lower():
            ensure_user_columns(db)
            return db.query(User).filter(User.device_token == clean).first()
        raise

def get_user_by_id(db: Session, user_id):
    if user_id is None:
        return None
    try:
        int_id = int(user_id)
        return db.query(User).filter(User.id == int_id).first()
    except (ValueError, TypeError):
        return db.query(User).filter(User.id == user_id).first()
    except (ProgrammingError, OperationalError) as e:
        if "device_token" in str(e).lower() or "undefinedcolumn" in str(e).lower():
            ensure_user_columns(db)
            try:
                int_id = int(user_id)
                return db.query(User).filter(User.id == int_id).first()
            except (ValueError, TypeError):
                return db.query(User).filter(User.id == user_id).first()
        raise

def create_user_with_device(db: Session, email: str, device_token: str, is_admin: bool = False):
    cleaned_email = email.strip().lower()
    cleaned_token = device_token.strip()
    db_user = User(
        email=cleaned_email,
        device_token=cleaned_token,
        is_admin=is_admin
    )
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except (ProgrammingError, OperationalError) as e:
        if "device_token" in str(e).lower() or "password_hash" in str(e).lower() or "undefinedcolumn" in str(e).lower():
            ensure_user_columns(db)
            db.add(db_user)
            db.commit()
            db.refresh(db_user)
            return db_user
        raise

def rebind_user_device(db: Session, user: User, new_device_token: str):
    cleaned_token = new_device_token.strip()
    user.device_token = cleaned_token
    try:
        db.commit()
        db.refresh(user)
        return user
    except (ProgrammingError, OperationalError) as e:
        if "device_token" in str(e).lower() or "undefinedcolumn" in str(e).lower():
            ensure_user_columns(db)
            user.device_token = cleaned_token
            db.commit()
            db.refresh(user)
            return user
        raise

def delete_user(db: Session, user_id):
    str_user_id = str(user_id)
    # Cascade delete all orders and carts for this user
    try:
        int_id = int(user_id)
        db.query(Order).filter((Order.user_id == str_user_id) | (Order.user_id == str(int_id))).delete(synchronize_session=False)
        db.query(Cart).filter((Cart.user_id == str_user_id) | (Cart.user_id == str(int_id))).delete(synchronize_session=False)
    except (ValueError, TypeError):
        db.query(Order).filter(Order.user_id == str_user_id).delete(synchronize_session=False)
        db.query(Cart).filter(Cart.user_id == str_user_id).delete(synchronize_session=False)

    user = get_user_by_id(db, user_id)
    if user:
        db.delete(user)
        db.commit()
        return True
    return False
