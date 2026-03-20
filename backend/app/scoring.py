import math

def calculate_distance(lat1, lng1, lat2, lng2):
    
    R = 6371  
    
    lat1, lng1 = math.radians(lat1), math.radians(lng1)
    lat2, lng2 = math.radians(lat2), math.radians(lng2)
    
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng/2)**2
    c = 2 * math.asin(math.sqrt(a))
    
    return R * c

def calculate_vulnerability_score(location_lat, location_lng, aqi_stations):
   
    if not aqi_stations:
        return None
    
    weighted_sum = 0
    weight_total = 0
    
    for station in aqi_stations:
        distance = calculate_distance(
            location_lat, location_lng,
            station["lat"], station["lng"]
        )
        
        
        if distance < 0.1:
            distance = 0.1
        
        weight = 1 / (distance ** 2)
        weighted_sum += station["aqi"] * weight
        weight_total += weight
    
    score = weighted_sum / weight_total
    return round(score, 1)

def get_risk_level(score):
    
    if score <= 50:
        return "Good"
    elif score <= 100:
        return "Moderate"
    elif score <= 150:
        return "Unhealthy for Sensitive Groups"
    elif score <= 200:
        return "Unhealthy"
    elif score <= 300:
        return "Very Unhealthy"
    else:
        return "Hazardous"