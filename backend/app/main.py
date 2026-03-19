from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from app.database import engine, get_db, Base
from app.models import AQIReading
from app.scheduler import start_scheduler, fetch_and_save_aqi
import asyncio

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.on_event("startup")
async def startup():
    await fetch_and_save_aqi()  
    start_scheduler()            

@app.get("/")
def hello():
    return {"message": "AQI Kerala API is running"}

@app.get("/aqi/kerala")
def get_kerala_aqi(db: Session = Depends(get_db)):
    readings = db.query(AQIReading)\
                 .order_by(AQIReading.recorded_at.desc())\
                 .all()
    
    seen = set()
    latest = []
    
    for reading in readings:
        if reading.name not in seen:
            seen.add(reading.name)
            latest.append({
                "name": reading.name,
                "lat": reading.lat,
                "lng": reading.lng,
                "aqi": reading.aqi,
                "recorded_at": reading.recorded_at
            })
    
    return latest