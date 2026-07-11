from sqlalchemy import Column, DateTime, Integer, String, Text, func

from app.database import Base


class Posts(Base):
    __tablename__ = "articles"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True,
    )
    title = Column(String(200), nullable=False, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
