from fastapi import FastAPI

from app.database import Base, engine
from app.models import posts
from app.routes import posts

app = FastAPI(title="Coding Test API", version="1.0.0")

Base.metadata.create_all(bind=engine)

app.include_router(posts.router)
