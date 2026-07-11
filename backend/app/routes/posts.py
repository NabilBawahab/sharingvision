from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.article import Article

router = APIRouter(prefix="/api", tags=["Posts"])


@router.get("/", response_model=List[dict])
def get_posts(db: Session = Depends(get_db)):
    articles = db.query(Article).order_by(Article.created_at.desc()).all()
    return [
        {
            "id": article.id,
            "title": article.title,
            "content": article.content,
            "created_at": article.created_at.isoformat() if article.created_at else None,
        }
        for article in articles
    ]


@router.post("/articles", response_model=dict)
def create_article(payload: dict, db: Session = Depends(get_db)):
    article = Article(title=payload["title"], content=payload["content"])
    db.add(article)
    db.commit()
    db.refresh(article)
    return {
        "id": article.id,
        "title": article.title,
        "content": article.content,
        "created_at": article.created_at.isoformat() if article.created_at else None,
    }
