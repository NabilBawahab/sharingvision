from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.posts import Posts

from pydantic import BaseModel


class PostRequest(BaseModel):
    title: str
    content: str
    category: str
    status: str


router = APIRouter(prefix="/article", tags=["Posts"])


def request_validation(payload: PostRequest):
    if payload.title is None or len(payload.title) < 20:
        return {
            "status": "error",
            "message": "Title must be at least 20 characters long",
        }

    if payload.content is None or len(payload.content) < 200:
        return {
            "status": "error",
            "message": "Content must be at least 200 characters long",
        }

    if payload.category is None or len(payload.category) < 3:
        return {
            "status": "error",
            "message": "Category must be at least 3 characters long",
        }

    if payload.status is None or payload.status not in [
        "Published",
        "Draft",
        "Trashed",
    ]:
        return {
            "status": "error",
            "message": "Status must be one of the following: Published, Draft, Trashed",
        }


@router.post("/", response_model=dict)
def get_posts(payload: PostRequest, db: Session = Depends(get_db)):

    validation_result = request_validation(payload)
    if validation_result:
        return validation_result

    post = Posts(
        title=payload.title,
        content=payload.content,
        category=payload.category,
        status=payload.status,
    )

    db.add(post)
    db.commit()
    db.refresh(post)
    return {
        "status": "success creating post",
        "posts": {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "category": post.category,
            "status": post.status,
            "created_date": (
                post.created_date.isoformat() if post.created_date else None
            ),
            "updated_date": (
                post.updated_date.isoformat() if post.updated_date else None
            ),
        },
    }


@router.get("/{id}")
def get_post_by_id(id: int, db: Session = Depends(get_db)):
    post = db.query(Posts).filter(Posts.id == id).first()

    if not post:
        return {"status": "error", "message": "Post not found"}

    return {
        "status": "success",
        "post": {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "category": post.category,
            "status": post.status,
            "created_date": (
                post.created_date.isoformat() if post.created_date else None
            ),
            "updated_date": (
                post.updated_date.isoformat() if post.updated_date else None
            ),
        },
    }


@router.get("/{limit}/{offset}")
def get_posts_paginated(limit: int, offset: int, db: Session = Depends(get_db)):
    posts = (
        db.query(Posts)
        .order_by(Posts.created_date.desc())
        .limit(limit)
        .offset(offset)
        .all()
    )

    posts_list = []

    for post in posts:
        posts_list.append(
            {
                "id": post.id,
                "title": post.title,
                "content": post.content,
                "category": post.category,
                "status": post.status,
                "created_date": (
                    post.created_date.isoformat() if post.created_date else None
                ),
                "updated_date": (
                    post.updated_date.isoformat() if post.updated_date else None
                ),
            }
        )

    return {
        "status": "success",
        "posts": posts_list,
    }


@router.put("/{id}")
def update_post(id: int, payload: PostRequest, db: Session = Depends(get_db)):
    post = db.query(Posts).filter(Posts.id == id).first()

    if not post:
        return {"status": "error", "message": "Post not found"}

    validation_result = request_validation(payload)
    if validation_result:
        return validation_result

    post.title = payload.title
    post.content = payload.content
    post.category = payload.category
    post.status = payload.status

    db.commit()
    db.refresh(post)

    return {
        "status": "success updating post",
        "post": {
            "id": post.id,
            "title": post.title,
            "content": post.content,
            "category": post.category,
            "status": post.status,
            "created_date": (
                post.created_date.isoformat() if post.created_date else None
            ),
            "updated_date": (
                post.updated_date.isoformat() if post.updated_date else None
            ),
        },
    }


@router.delete("/{id}")
def delete_post(id: int, db: Session = Depends(get_db)):
    post = db.query(Posts).filter(Posts.id == id).first()

    if not post:
        return {"status": "error", "message": "Post not found"}

    db.delete(post)
    db.commit()

    return {
        "status": "success deleting post",
        "message": f"Post with id {id} has been deleted",
    }
