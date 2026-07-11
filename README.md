# Sharing Vision

Article management app with a React frontend, FastAPI backend, and MySQL database.

## Run with Docker (recommended)

Full stack with one command — no `.env` files needed.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose v2)

### Steps

1. Clone this repository.
2. From the repo root, run:

```bash
docker compose up --build
```

3. Open the app at [http://localhost:5173](http://localhost:5173).
4. API docs (optional): [http://localhost:8000/docs](http://localhost:8000/docs)

### Stop

```bash
docker compose down
```

### Reset database

Removes all persisted MySQL data:

```bash
docker compose down -v
```

## Local development (optional)

Run the frontend and backend on your machine with MySQL in Docker.

### 1. Start MySQL

```bash
docker compose -f backend/docker-compose.yml up -d
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Start the backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Environment variables

| File | Purpose |
|------|---------|
| `backend/.env.example` | Database and CORS settings for local backend dev |
| `frontend/.env.example` | API URL for local frontend dev (`VITE_API_BASE_URL`) |

When using root `docker compose up`, environment values are set in `docker-compose.yml`. For the Docker frontend image, `VITE_API_BASE_URL` is passed as a build argument — rebuild after changing it:

```bash
docker compose up --build frontend
```
