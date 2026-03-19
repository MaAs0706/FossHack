from fastapi import FastAPI

import httpx
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

WAQI_TOKEN = os.getenv("WAQI_TOKEN")

@app.get("/")
def hello():
    return {"message":"AQI Kerala API is running "}

@app.get("/aqi/kerala")
async def get_kerala_aqi():
    url = f"https://api.waqi.info/map/bounds/?latlng=8.0,74.8,12.5,77.5&token={WAQI_TOKEN}"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        data = response.json()
    
    stations = []
    for station in data["data"]:
       
        if station["aqi"] == "-":
            continue
        
        stations.append({
            "name": station["station"]["name"],
            "lat": station["lat"],
            "lng": station["lon"],
            "aqi": int(station["aqi"])
        })
    
    return stations