"""Initial migration

Revision ID: b0b65437bc51
Revises: 
Create Date: 2024-09-09 11:30:05.051341

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'b0b65437bc51'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.add_column(sa.Column('linkedin_url', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('github_url', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('other_website_url', sa.String(length=255), nullable=True))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('user', schema=None) as batch_op:
        batch_op.drop_column('other_website_url')
        batch_op.drop_column('github_url')
        batch_op.drop_column('linkedin_url')

    # ### end Alembic commands ###
