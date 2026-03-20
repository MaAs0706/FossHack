from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from app.database import engine, get_db, Base
from app.models import AQIReading
from app.scheduler import start_scheduler, fetch_and_save_aqi
import asyncio
from app.osm import fetch_amenities
from app.scoring import calculate_vulnerability_score, get_risk_level


load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/schools")
async def get_schools():
    return await fetch_amenities("school")

@app.get("/hospitals")
async def get_hospitals():
    return await fetch_amenities("hospital")

@app.get("/vulnerability/schools")
async def get_school_vulnerability(db: Session = Depends(get_db)):
    # get latest AQI readings
    readings = db.query(AQIReading)\
                 .order_by(AQIReading.recorded_at.desc())\
                 .all()
    
    seen = set()
    stations = []
    for r in readings:
        if r.name not in seen:
            seen.add(r.name)
            stations.append({
                "name": r.name,
                "lat": r.lat,
                "lng": r.lng,
                "aqi": r.aqi
            })
    
   
    schools = await fetch_amenities("school")
    
    
    results = []
    for school in schools:
        if school["name"] == "Unknown":
            continue
            
        score = calculate_vulnerability_score(
            school["lat"], school["lng"], stations
        )
        
        results.append({
            "name": school["name"],
            "lat": school["lat"],
            "lng": school["lng"],
            "vulnerability_score": score,
            "risk_level": get_risk_level(score)
        })
    
    # sort by highest risk first
    results.sort(key=lambda x: x["vulnerability_score"], reverse=True)
    
    return results[:50]  # return top 50 most at-risk