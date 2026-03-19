import httpx
import os
from datetime import datetime, timezone
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import AQIReading
from dotenv import load_dotenv
load_dotenv()



scheduler = AsyncIOScheduler()

async def fetch_and_save_aqi():
    WAQI_TOKEN = os.getenv("WAQI_TOKEN")
    print(f"Fetching AQI data at {datetime.now(timezone.utc)}")
    
    url = f"https://api.waqi.info/map/bounds/?latlng=8.0,74.8,12.5,77.5&token={WAQI_TOKEN}"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        data = response.json()
        
    
    db: Session = SessionLocal()
    
    try:
        for station in data["data"]:
            try:
                aqi_value = station["aqi"]
                if aqi_value == "-" or aqi_value == "":
                  continue
        
                reading = AQIReading(
                  name=station["station"]["name"],
                  lat=station["lat"],
                  lng=station["lon"],
                  aqi=int(aqi_value)
               )
                db.add(reading)
            except (KeyError, ValueError, TypeError) as e:
                  print(f"Skipping station due to error: {e}")
                  continue
   
        
        db.commit()
        print(f"Saved {len(data['data'])} stations to database")
    
    except Exception as e:
        print(f"Error saving AQI data: {e}")
        db.rollback()
    
    finally:
        db.close()

def start_scheduler():
    scheduler.add_job(fetch_and_save_aqi, "interval", hours=1)
    scheduler.start()