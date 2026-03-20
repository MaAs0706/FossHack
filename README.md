# AtmosTrack 🌫️

**Hyperlocal Air Quality Intelligence for Kerala**

AtmosTrack is an open-source platform that provides ward-level air quality monitoring and decision support for authorities in Kerala. Unlike city-wide AQI apps, AtmosTrack identifies which specific schools and hospitals are most exposed to air pollution — enabling targeted action rather than broad generalizations.

Built for FossHack.

---

## Screenshots

![AtmosTrack Dashboard](screenshots/dashboard.png)

---

## The Problem

Kerala's air quality monitoring stations report city-level AQI. But a school near an industrial zone and a school 10km away face vastly different pollution exposure. Authorities have no way to know which specific locations need immediate attention.

## Our Solution

AtmosTrack uses Inverse Distance Weighting (IDW) interpolation — the same method used by environmental scientists — to estimate pollution exposure at every school and hospital in Kerala based on nearby monitoring station readings.

---

## Features

- 🗺️ **Interactive Map** — Real-time AQI stations across Kerala with color-coded risk levels
- 🏫 **School Vulnerability Scores** — Every school in Kerala ranked by pollution exposure
- 🏥 **Hospital Vulnerability Scores** — Every hospital ranked by pollution exposure  
- 📊 **24-hour AQI Trends** — Click any station to see historical AQI chart
- 🚨 **Automatic Alerts** — Banner appears when any area crosses dangerous thresholds
- 📍 **Location Intelligence** — Click any at-risk location to fly to it on the map
- ⏱️ **Hourly Updates** — Data refreshes automatically every hour

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Leaflet.js, Recharts |
| Backend | FastAPI, SQLAlchemy |
| Database | SQLite |
| Scheduler | APScheduler |
| Maps | OpenStreetMap, Overpass API |
| AQI Data | WAQI API (aggregates KSPCB/CPCB government data) |
| Interpolation | Inverse Distance Weighting (IDW) |

---

## Data Sources

- **Air Quality**: [WAQI API](https://waqi.info) — aggregates data from Kerala State Pollution Control Board (KSPCB) and Central Pollution Control Board (CPCB) monitoring stations
- **Schools & Hospitals**: [OpenStreetMap](https://openstreetmap.org) via Overpass API
- **Maps**: OpenStreetMap contributors

---

## Running Locally

### Prerequisites
- Python 3.11+
- Node.js 18+

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Add your API token
echo "WAQI_TOKEN=your_token_here" > .env

uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## How It Works

1. Every hour, the backend fetches real AQI readings from Kerala monitoring stations
2. For each school and hospital in Kerala (from OpenStreetMap), we calculate a vulnerability score using IDW interpolation — stations closer to the location have more influence on the score
3. Locations are ranked by vulnerability score and displayed on the map
4. When any station crosses AQI 150, an automatic alert banner appears

---

## License

GPL-3.0 — See [LICENSE](LICENSE)

---

## Attribution

Parts of this codebase were developed with assistance from Claude (Anthropic).
All code has been reviewed, understood, and modified by the team.

Data is sourced from government monitoring stations via WAQI and OpenStreetMap contributors.