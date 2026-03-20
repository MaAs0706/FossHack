from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from app.database import engine, get_db, Base
from app.models import AQIReading
from app.scheduler import start_scheduler, fetch_and_save_aqi
from app.osm import fetch_amenities
from app.scoring import calculate_vulnerability_score, get_risk_level
from datetime import datetime, timezone, timedelta

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

osm_cache = {
    "schools": None,
    "hospitals": None,
}

@app.on_event("startup")
async def startup():
    await fetch_and_save_aqi()
    start_scheduler()

@app.get("/aqi/history/{station_name}")
def get_station_history(station_name: str, db: Session = Depends(get_db)):
    since = datetime.now(timezone.utc) - timedelta(hours=24)
    
    readings = db.query(AQIReading)\
                 .filter(AQIReading.name == station_name)\
                 .filter(AQIReading.recorded_at >= since)\
                 .order_by(AQIReading.recorded_at.asc())\
                 .all()
    
    return [
        {
            "aqi": r.aqi,
            "recorded_at": r.recorded_at
        }
        for r in readings
    ]    

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

@app.get("/vulnerability/schools")
async def get_school_vulnerability(db: Session = Depends(get_db)):
    global osm_cache
    readings = db.query(AQIReading)\
                 .order_by(AQIReading.recorded_at.desc())\
                 .all()
    seen = set()
    stations = []
    for r in readings:
        if r.name not in seen:
            seen.add(r.name)
            stations.append({"name": r.name, "lat": r.lat, "lng": r.lng, "aqi": r.aqi})

    if osm_cache["schools"] is None:
        osm_cache["schools"] = await fetch_amenities("school")

    results = []
    for school in osm_cache["schools"]:
        if school["name"] == "Unknown":
            continue
        score = calculate_vulnerability_score(school["lat"], school["lng"], stations)
        results.append({
            "name": school["name"],
            "lat": school["lat"],
            "lng": school["lng"],
            "vulnerability_score": score,
            "risk_level": get_risk_level(score)
        })
    results.sort(key=lambda x: x["vulnerability_score"], reverse=True)
    return results

@app.get("/vulnerability/hospitals")
async def get_hospital_vulnerability(db: Session = Depends(get_db)):
    global osm_cache
    readings = db.query(AQIReading)\
                 .order_by(AQIReading.recorded_at.desc())\
                 .all()
    seen = set()
    stations = []
    for r in readings:
        if r.name not in seen:
            seen.add(r.name)
            stations.append({"name": r.name, "lat": r.lat, "lng": r.lng, "aqi": r.aqi})

    if osm_cache["hospitals"] is None:
        osm_cache["hospitals"] = await fetch_amenities("hospital")

    results = []
    for hospital in osm_cache["hospitals"]:
        if hospital["name"] == "Unknown":
            continue
        score = calculate_vulnerability_score(hospital["lat"], hospital["lng"], stations)
        results.append({
            "name": hospital["name"],
            "lat": hospital["lat"],
            "lng": hospital["lng"],
            "vulnerability_score": score,
            "risk_level": get_risk_level(score)
        })
    results.sort(key=lambda x: x["vulnerability_score"], reverse=True)
    return results