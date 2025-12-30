"""add appointment optional fields

Revision ID: 6c9d7b8a9add
Revises: 5b7c8d9e0f2a
Create Date: 2025-12-30 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '6c9d7b8a9add'
down_revision = '5b7c8d9e0f2a'
branch_labels = None
depends_on = None


def upgrade():
    conn = op.get_bind()

    # Add optional columns to appointment table if they're missing
    has_timeslot = bool(conn.execute(sa.text("SELECT column_name FROM information_schema.columns WHERE table_name='appointment' AND column_name='timeslot'")).fetchone())
    if not has_timeslot:
        op.add_column('appointment', sa.Column('timeslot', sa.String(length=64), nullable=True))

    has_service = bool(conn.execute(sa.text("SELECT column_name FROM information_schema.columns WHERE table_name='appointment' AND column_name='service'")).fetchone())
    if not has_service:
        op.add_column('appointment', sa.Column('service', sa.String(length=150), nullable=True))

    has_description = bool(conn.execute(sa.text("SELECT column_name FROM information_schema.columns WHERE table_name='appointment' AND column_name='description'")).fetchone())
    if not has_description:
        op.add_column('appointment', sa.Column('description', sa.Text(), nullable=True))

    has_invoice = bool(conn.execute(sa.text("SELECT column_name FROM information_schema.columns WHERE table_name='appointment' AND column_name='invoice_url'")).fetchone())
    if not has_invoice:
        op.add_column('appointment', sa.Column('invoice_url', sa.String(length=255), nullable=True))

    # Add foreign key columns for pet and doctor if missing
    has_pet_id = bool(conn.execute(sa.text("SELECT column_name FROM information_schema.columns WHERE table_name='appointment' AND column_name='pet_id'")).fetchone())
    if not has_pet_id:
        op.add_column('appointment', sa.Column('pet_id', sa.Integer(), nullable=True))

    has_doctor_id = bool(conn.execute(sa.text("SELECT column_name FROM information_schema.columns WHERE table_name='appointment' AND column_name='doctor_id'")).fetchone())
    if not has_doctor_id:
        op.add_column('appointment', sa.Column('doctor_id', sa.Integer(), nullable=True))

    # Create foreign key constraints only if referenced tables exist
    has_pets_table = bool(conn.execute(sa.text("SELECT to_regclass('public.pets')")).scalar())
    if has_pets_table:
        # create FK only if it doesn't already exist
        fk_exists = bool(conn.execute(sa.text("SELECT 1 FROM pg_constraint WHERE conname = 'fk_appointment_pet'")).fetchone())
        if not fk_exists:
            op.create_foreign_key('fk_appointment_pet', 'appointment', 'pets', ['pet_id'], ['pet_id'], ondelete='SET NULL')

    has_doctor_table = bool(conn.execute(sa.text("SELECT to_regclass('public.doctor')")).scalar())
    if has_doctor_table:
        fk_exists = bool(conn.execute(sa.text("SELECT 1 FROM pg_constraint WHERE conname = 'fk_appointment_doctor'")).fetchone())
        if not fk_exists:
            op.create_foreign_key('fk_appointment_doctor', 'appointment', 'doctor', ['doctor_id'], ['doctor_id'], ondelete='SET NULL')


def downgrade():
    conn = op.get_bind()

    # Drop constraints if exist
    fk_doc = bool(conn.execute(sa.text("SELECT 1 FROM pg_constraint WHERE conname = 'fk_appointment_doctor'")).fetchone())
    if fk_doc:
        op.drop_constraint('fk_appointment_doctor', 'appointment', type_='foreignkey')

    fk_pet = bool(conn.execute(sa.text("SELECT 1 FROM pg_constraint WHERE conname = 'fk_appointment_pet'")).fetchone())
    if fk_pet:
        op.drop_constraint('fk_appointment_pet', 'appointment', type_='foreignkey')

    # Drop columns if they exist
    has_doctor_id = bool(conn.execute(sa.text("SELECT column_name FROM information_schema.columns WHERE table_name='appointment' AND column_name='doctor_id'" )).fetchone())
    if has_doctor_id:
        op.drop_column('appointment', 'doctor_id')

    has_pet_id = bool(conn.execute(sa.text("SELECT column_name FROM information_schema.columns WHERE table_name='appointment' AND column_name='pet_id'")).fetchone())
    if has_pet_id:
        op.drop_column('appointment', 'pet_id')

    has_invoice = bool(conn.execute(sa.text("SELECT column_name FROM information_schema.columns WHERE table_name='appointment' AND column_name='invoice_url'")).fetchone())
    if has_invoice:
        op.drop_column('appointment', 'invoice_url')

    has_description = bool(conn.execute(sa.text("SELECT column_name FROM information_schema.columns WHERE table_name='appointment' AND column_name='description'")).fetchone())
    if has_description:
        op.drop_column('appointment', 'description')

    has_service = bool(conn.execute(sa.text("SELECT column_name FROM information_schema.columns WHERE table_name='appointment' AND column_name='service'")).fetchone())
    if has_service:
        op.drop_column('appointment', 'service')

    has_timeslot = bool(conn.execute(sa.text("SELECT column_name FROM information_schema.columns WHERE table_name='appointment' AND column_name='timeslot'")).fetchone())
    if has_timeslot:
        op.drop_column('appointment', 'timeslot')
