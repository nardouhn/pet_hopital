"""add is_active to users

Revision ID: 3b6c7d8e9f0a
Revises: 2a3b4c5d6e7f
Create Date: 2025-12-29 11:40:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '3b6c7d8e9f0a'
down_revision = '2a3b4c5d6e7f'
branch_labels = None
depends_on = None


def upgrade():
    # Add is_active column with default TRUE for existing rows
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')))


def downgrade():
    op.drop_column('users', 'is_active')
