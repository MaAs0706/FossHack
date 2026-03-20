import httpx
from dotenv import load_dotenv

load_dotenv()

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

async def fetch_amenities(amenity_type: str):
    query = f"""
    [out:json][timeout:60];
    area["name"="Kerala"]["admin_level"="4"]->.searchArea;
    node["amenity"="{amenity_type}"](area.searchArea);
    out body;
    """
    
    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(OVERPASS_URL, data={"data": query})
            
            if response.status_code != 200:
                print(f"OSM error: {response.status_code}")
                return []
            
            if not response.text.strip():
                print("OSM returned empty response")
                return []
                
            data = response.json()
    except Exception as e:
        print(f"OSM fetch error: {e}")
        return []
    
    results = []
    for element in data.get("elements", []):
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