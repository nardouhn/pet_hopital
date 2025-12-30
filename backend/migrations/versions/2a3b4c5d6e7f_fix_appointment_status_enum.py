"""normalize appointment.status -> enum

Revision ID: 2a3b4c5d6e7f
Revises: 168b5e07707d
Create Date: 2025-12-29 11:20:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '2a3b4c5d6e7f'
down_revision = '168b5e07707d'
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()

    # Create a temporary enum type with localized labels
    localized_enum = postgresql.ENUM(
        'Đang chờ xác nhận', 'Đặt lịch hẹn thành công', 'Đã hủy lịch hẹn',
        name='enum_appointment_status_new'
    )
    localized_enum.create(bind, checkfirst=True)

    # Drop any column default to avoid CAST errors, then convert current values into the localized labels while moving to the new enum type
    op.execute("""
        ALTER TABLE appointment ALTER COLUMN status DROP DEFAULT;
    """)

    op.execute("""
        ALTER TABLE appointment
        ALTER COLUMN status
        TYPE enum_appointment_status_new
        USING (CASE
            WHEN status = 'pending' THEN 'Đang chờ xác nhận'
            WHEN status IN ('confirmed','completed') THEN 'Đặt lịch hẹn thành công'
            WHEN status = 'cancelled' THEN 'Đã hủy lịch hẹn'
            WHEN status IS NULL THEN 'Đang chờ xác nhận'
            ELSE 'Đang chờ xác nhận'
        END)::enum_appointment_status_new;
    """)

    # Replace the old enum type name with the new one (drop old then rename)
    op.execute("""
        DROP TYPE IF EXISTS enum_appointment_status;
        ALTER TYPE enum_appointment_status_new RENAME TO enum_appointment_status;
    """)

    # Make status non-nullable
    with op.batch_alter_table('appointment', schema=None) as batch_op:
        batch_op.alter_column('status', existing_type=postgresql.ENUM(name='enum_appointment_status'), nullable=False)


def downgrade():
    # Revert to plain text (VARCHAR) so a downgrade doesn't require recreating string labels
    op.execute("""
        ALTER TABLE appointment
        ALTER COLUMN status
        TYPE VARCHAR
        USING status::text;
    """)

    # Drop the enum if it exists
    appointment_enum = postgresql.ENUM(name='enum_appointment_status')
    appointment_enum.drop(op.get_bind(), checkfirst=True)
