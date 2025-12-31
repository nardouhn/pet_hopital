"""initial

Revision ID: 168b5e07707d
Revises: 
Create Date: 2025-12-29 11:00:05.833566

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '168b5e07707d'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    """Create the minimal base schema for a fresh database.

    This migration is intentionally conservative:
    - Only creates tables and enum types
    - Does NOT drop or alter existing objects
    - Avoids referencing tables that are not created here
    """
    bind = op.get_bind()

    # --- Enums ---
    appointment_enum = postgresql.ENUM(
        'pending', 'confirmed', 'completed', 'cancelled',
        name='enum_appointment_status'
    )
    appointment_enum.create(bind, checkfirst=True)

    feedback_rating = postgresql.ENUM('1', '2', '3', '4', '5', name='feedback_rating_enum')
    feedback_rating.create(bind, checkfirst=True)

    feedback_status = postgresql.ENUM('Hidden', 'Show', name='feedback_status_enum')
    feedback_status.create(bind, checkfirst=True)

    # --- Tables ---
    # Users (created before tables that reference it)
    op.create_table(
        'users',
        sa.Column('user_id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('first_name', sa.String(length=50), nullable=False),
        sa.Column('last_name', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=False, unique=True),
        sa.Column('password', sa.String(length=255), nullable=False),
        sa.Column('user_type', sa.String(length=20), nullable=False),
    )

    # Blocked tokens
    op.create_table(
        'blocked_tokens',
        sa.Column('token', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('token')
    )

    # Appointment: keep references to pets/doctor as plain integer columns (no FK) to avoid referencing
    # tables that may be created in later migrations. Only create the FK to users (which exists here).
    op.create_table(
        'appointment',
        sa.Column('appointment_id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('booking_date', sa.Date(), server_default=sa.text('CURRENT_DATE'), nullable=False),
        sa.Column('timeslot', sa.String(length=64), nullable=True),
        sa.Column('status', postgresql.ENUM('pending', 'confirmed', 'completed', 'cancelled', name='enum_appointment_status', create_type=False), server_default=sa.text("'pending'::enum_appointment_status"), nullable=True),
        sa.Column('service', sa.String(length=150), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('invoice_url', sa.String(length=255), nullable=True),
        sa.Column('pet_id', sa.Integer(), nullable=True),
        sa.Column('doctor_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='CASCADE'),
    )

    # Feedback table referencing users
    op.create_table(
        'feedback',
        sa.Column('feedback_id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('rating', postgresql.ENUM('1', '2', '3', '4', '5', name='feedback_rating_enum', create_type=False), nullable=False),
        sa.Column('status', postgresql.ENUM('Hidden', 'Show', name='feedback_status_enum', create_type=False), nullable=False),
        sa.Column('content', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=False),
        sa.Column('pet_name', sa.String(length=100), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.user_id'], ondelete='SET NULL'),
    )


def downgrade():
    """Drop the objects created by upgrade (reverse order).

    Use checkfirst for types to avoid errors on downgrade when types are used elsewhere.
    """
    bind = op.get_bind()

    op.drop_table('feedback')
    op.drop_table('appointment')
    op.drop_table('blocked_tokens')
    op.drop_table('users')

    # Drop enums safely
    appointment_enum = postgresql.ENUM(name='enum_appointment_status')
    appointment_enum.drop(bind, checkfirst=True)

    feedback_rating = postgresql.ENUM(name='feedback_rating_enum')
    feedback_rating.drop(bind, checkfirst=True)

    feedback_status = postgresql.ENUM(name='feedback_status_enum')
    feedback_status.drop(bind, checkfirst=True)
