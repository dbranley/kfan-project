"""enable cascade delete on favorites table

Revision ID: 2db5b32466a9
Revises: 37a2c3d8d0c8
Create Date: 2023-08-16 16:06:22.706730

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2db5b32466a9'
down_revision = '37a2c3d8d0c8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('favorites_photo_card_id_fkey', 'favorites', type_='foreignkey')
    op.drop_constraint('favorites_user_id_fkey', 'favorites', type_='foreignkey')
    op.create_foreign_key(None, 'favorites', 'photo_cards', ['photo_card_id'], ['id'], ondelete='CASCADE')
    op.create_foreign_key(None, 'favorites', 'users', ['user_id'], ['id'], ondelete='CASCADE')
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'favorites', type_='foreignkey')
    op.drop_constraint(None, 'favorites', type_='foreignkey')
    op.create_foreign_key('favorites_user_id_fkey', 'favorites', 'users', ['user_id'], ['id'])
    op.create_foreign_key('favorites_photo_card_id_fkey', 'favorites', 'photo_cards', ['photo_card_id'], ['id'])
    # ### end Alembic commands ###
