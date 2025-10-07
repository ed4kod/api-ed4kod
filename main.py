from fastapi import FastAPI
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware

import models
from database import engine
from routes import api_router, pages_router

# Создание таблиц
models.Base.metadata.create_all(bind=engine)

# Создание приложения
app = FastAPI(title="api-ed4kod")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS middleware - ДОБАВЬТЕ ЭТОТ КОНФИГ
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешаем все origins
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем все методы
    allow_headers=["*"],  # Разрешаем все заголовки
)

# Templates
templates = Jinja2Templates(directory="templates")

# Include routers
app.include_router(pages_router)
app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
