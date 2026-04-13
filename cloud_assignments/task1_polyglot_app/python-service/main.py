from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, ConfigDict, Field
from typing import List
import os

app = FastAPI()

# Enable CORS for the dashboard
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "cloud_db")

mongo_client = AsyncIOMotorClient(MONGODB_URI)
db = mongo_client[DB_NAME]
tasks_collection = db["tasks"]

class Task(BaseModel):
    title: str
    description: str


class TaskOut(Task):
    id: str = Field(alias="_id")
    model_config = ConfigDict(populate_by_name=True)

@app.get("/")
async def root():
    return {"message": "Python FastAPI Service is Running!"}

@app.get("/tasks", response_model=List[TaskOut])
async def get_tasks():
    tasks = []
    async for task in tasks_collection.find():
        task["_id"] = str(task["_id"])
        tasks.append(task)
    return tasks

@app.post("/tasks")
async def create_task(task: Task = Body(...)):
    payload = task.model_dump()
    result = await tasks_collection.insert_one(payload)
    return {"id": str(result.inserted_id), **payload}

@app.post("/analyze")
async def analyze_task(task: Task = Body(...)):
    # Simulated AI analysis logic
    analysis_result = {
        "original_title": task.title,
        "complexity_score": len(task.description) % 10,
        "sentiment": "Neutral",
        "cloud_readiness": "High",
        "recommendation": f"Process this task using the {task.title.split()[0]} module."
    }
    return analysis_result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
