from sqlalchemy import Column, DateTime, Integer, String, Text, Enum, func

from app.database import Base


class Posts(Base):
    __tablename__ = "Posts"

    id = Column(
        Integer,
        primary_key=True,
        autoincrement=True,
        index=True,
    )
    title = Column(String(200), nullable=False, index=True)
    content = Column(Text, nullable=False)
    category = Column(String(100), nullable=True, index=True)
    created_date = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_date = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
    status = Column(
        Enum("Published", "Draft", "Trashed", name="article_status"),
        nullable=False,
        default="Draft",
    )
