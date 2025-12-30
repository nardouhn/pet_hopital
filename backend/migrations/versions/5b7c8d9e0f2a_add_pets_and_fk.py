"""add pets table if missing and add FK from vaccination to pets

Revision ID: 5b7c8d9e0f2a
Revises: 4a6b7c8d9e1f
Create Date: 2025-12-29 13:40:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '5b7c8d9e0f2a'
down_revision = '4a6b7c8d9e1f'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    # Ensure enum for pets.gender exists (safely)
    gender_enum = postgresql.ENUM('male', 'female', 'unknown', name='enum_pets_gender')
    try:
        # Prefer an explicit lookup so we avoid race conditions in some environments
        exists = bool(conn.execute("SELECT 1 FROM pg_type WHERE typname = 'enum_pets_gender'").fetchone())
    except Exception:
        exists = False
    if not exists:
        try:
            gender_enum.create(conn, checkfirst=True)
        except Exception:
            # Guard against concurrent creation or race conditions
            pass

    # Create pets table only if it doesn't exist
    try:
        has_pets = bool(conn.execute("SELECT to_regclass('public.pets')").scalar())
    except Exception:
        has_pets = False

    if not has_pets:
        op.create_table(
            'pets',
            sa.Column('pet_id', sa.Integer(), primary_key=True, autoincrement=True),
            sa.Column('name', sa.String(length=100), nullable=True),
            sa.Column('breed', sa.String(length=100), nullable=True),
            # Use VARCHAR temporarily to avoid enum creation issues in some environments
            sa.Column('gender', sa.String(length=50), nullable=True),
            sa.Column('age', sa.Integer(), nullable=True),
            sa.Column('weight', sa.Numeric(precision=5, scale=2), nullable=True),
            sa.Column('color', sa.String(length=50), nullable=True),
            sa.Column('user_id', sa.Integer(), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], name='pets_user_id_fkey'),
        )

    # Insert placeholder pet rows for any vaccination.pet_id values that have no matching pet
    # This avoids failure when creating the FK constraint
    orphan_rows = conn.execute(
        sa.text(
        """
        SELECT DISTINCT v.pet_id
        FROM vaccination v
        LEFT JOIN pets p ON v.pet_id = p.pet_id
        WHERE v.pet_id IS NOT NULL AND p.pet_id IS NULL
        """
        )
    ).fetchall()

    if orphan_rows:
        for row in orphan_rows:
            missing_id = row[0]
            # Insert placeholder pet with that id; allow NULL user_id
            conn.execute(
                sa.text(
                    "INSERT INTO pets (pet_id, name, user_id) VALUES (:pet_id, :name, NULL) ON CONFLICT (pet_id) DO NOTHING"
                ),
                {"pet_id": missing_id, "name": f"Unknown Pet #{missing_id}"},
            )

        # Make sure sequence is set to max(pet_id)+1
        conn.execute(
            sa.text(
                "SELECT setval(pg_get_serial_sequence('pets', 'pet_id'), COALESCE((SELECT MAX(pet_id) FROM pets), 1) + 1, false)"
            )
        )

    # Create FK constraint on vaccination.pet_id -> pets.pet_id if not exists
    try:
        fk_exists = bool(conn.execute("SELECT 1 FROM pg_constraint WHERE conname = 'vaccination_pet_id_fkey'").fetchone())
    except Exception:
        fk_exists = False

    if not fk_exists:
        op.create_foreign_key('vaccination_pet_id_fkey', 'vaccination', 'pets', ['pet_id'], ['pet_id'], ondelete='CASCADE')


def downgrade():
    conn = op.get_bind()

    # Drop FK if exists
    try:
        fk_exists = bool(conn.execute("SELECT 1 FROM pg_constraint WHERE conname = 'vaccination_pet_id_fkey'").fetchone())
    except Exception:
        fk_exists = False

    if fk_exists:
        op.drop_constraint('vaccination_pet_id_fkey', 'vaccination', type_='foreignkey')

    # Drop pets table only if it exists
    try:
        has_pets = bool(conn.execute("SELECT to_regclass('public.pets')").scalar())
    except Exception:
        has_pets = False

    if has_pets:
        op.drop_table('pets')

    # Leave enum type in place (safer to not drop shared types)
