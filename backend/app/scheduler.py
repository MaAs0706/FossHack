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

NON_KERALA_KEYWORDS = [
    "mysuru", "mysore", "coimbatore", "madikeri",
    "chamarajanagar", "bengaluru", "mangaluru",
    "udupi", "hassan", "shimoga", "sidco", "psg college"
]

async def fetch_and_save_aqi():
    WAQI_TOKEN = os.getenv("WAQI_TOKEN")
    print(f"Fetching AQI data at {datetime.now(timezone.utc)}")

    url = f"https://api.waqi.info/map/bounds/?latlng=8.0,74.8,12.5,77.5&token={WAQI_TOKEN}"

    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        data = response.json()

    db: Session = SessionLocal()

    try:
        saved = 0
        for station in data["data"]:
            try:
                aqi_value = station["aqi"]
                if aqi_value == "-" or aqi_value == "":
                    continue

                name = station["station"]["name"]
                name_lower = name.lower()

                # skip non-Kerala stations
                if any(keyword in name_lower for keyword in NON_KERALA_KEYWORDS):
                    continue

                reading = AQIReading(
                    name=name,
                    lat=station["lat"],
                    lng=station["lon"],
                    aqi=int(aqi_value)
                )
                db.add(reading)
                saved += 1

            except (KeyError, ValueError, TypeError) as e:
                continue

        db.commit()
        print(f"Saved {saved} Kerala stations to database")

    except Exception as e:
        print(f"Error saving AQI data: {e}")
        db.rollback()

    finally:
        db.close()

def start_scheduler():
    scheduler.add_job(fetch_and_save_aqi, "interval", hours=1)
    scheduler.start()