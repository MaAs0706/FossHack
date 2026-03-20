import httpx
from dotenv import load_dotenv

load_dotenv()

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

async def fetch_amenities(amenity_type: str):
    query = f"""
    [out:json][timeout:25];
    area["name"="Kerala"]["admin_level"="4"]->.searchArea;
    node["amenity"="{amenity_type}"](area.searchArea);
    out body;
    """
    
    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(OVERPASS_URL, data={"data": query})
        data = response.json()
    
    results = []
    for element in data["elements"]:
        name = element.get("tags", {}).get("name", "Unknown")
        lat = element.get("lat")
        lon = element.get("lon")
        
        if lat and lon:
            results.append({
                "name": name,
                "lat": lat,
                "lng": lon,
                "type": amenity_type
            })
    
    return results