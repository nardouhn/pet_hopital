"""add vaccination table

Revision ID: 4a6b7c8d9e1f
Revises: 3b6c7d8e9f0a
Create Date: 2025-12-29 12:05:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '4a6b7c8d9e1f'
down_revision = '3b6c7d8e9f0a'
branch_labels = None
depends_on = None


def upgrade():
    # Create table without a hard foreign key to `pets` to support deployments where `pets` may not exist yet.
    op.create_table(
        'vaccination',
        sa.Column('vaccination_id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('pet_id', sa.Integer(), nullable=False),
        sa.Column('vaccine', sa.String(length=150), nullable=False),
        sa.Column('date', sa.Date(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('doctor_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
    )

    # Add FK only if the `pets` table already exists
    conn = op.get_bind()
    try:
        has_pets = bool(conn.execute("SELECT to_regclass('public.pets')").scalar())
    except Exception:
        has_pets = False

    if has_pets:
        op.create_foreign_key('vaccination_pet_id_fkey', 'vaccination', 'pets', ['pet_id'], ['pet_id'], ondelete='CASCADE')


def downgrade():
    # Drop FK only if it was created
    conn = op.get_bind()
    try:
        has_pets = bool(conn.execute("SELECT to_regclass('public.pets')").scalar())
    except Exception:
        has_pets = False

    if has_pets:
        op.drop_constraint('vaccination_pet_id_fkey', 'vaccination', type_='foreignkey')

    op.drop_table('vaccination')
