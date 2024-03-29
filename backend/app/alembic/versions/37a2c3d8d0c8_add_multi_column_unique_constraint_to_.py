"""add multi-column unique constraint to favorites table

Revision ID: 37a2c3d8d0c8
Revises: fde4182ba1ec
Create Date: 2023-08-16 10:45:09.713569

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '37a2c3d8d0c8'
down_revision = 'fde4182ba1ec'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_unique_constraint('fav_uix_1', 'favorites', ['user_id', 'photo_card_id'])
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('fav_uix_1', 'favorites', type_='unique')
    # ### end Alembic commands ###
