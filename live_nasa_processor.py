import sys
import json
import xarray as xr
import numpy as np
import earthaccess
import requests
import todi_engine
import os
import hashlib
from datetime import datetime, timezone

# --- NEW: Directory to cache downloaded files ---
CACHE_DIR = os.path.join(os.path.dirname(__file__), "cache")
os.makedirs(CACHE_DIR, exist_ok=True)


def get_cache_filename(lat, lon, date):
    """Generate a unique filename for caching based on lat/lon/date."""
    key = f"{lat}_{lon}_{date}"
    hashed = hashlib.md5(key.encode()).hexdigest()
    return os.path.join(CACHE_DIR, f"{hashed}.nc")


def safe_round(value, digits=2):
    return None if value is None or np.isnan(value) else round(value, digits)


def process_live_data(lat, lon, start_date, end_date):
    """
    Fetches and processes live MERRA-2 data for a specific location and date.
    Implements disk caching to avoid repeated downloads.
    Returns extended metrics for live card.
    """
    try:
        print("--- Live NASA Analysis Started ---", file=sys.stderr)
        print(
            f"1. Searching for MERRA-2 data for Lat: {lat}, Lon: {lon}...",
            file=sys.stderr,
        )

        cache_file = get_cache_filename(lat, lon, start_date)
        if os.path.exists(cache_file):
            print(f"2. Using cached data at {cache_file}", file=sys.stderr)
            ds = xr.open_dataset(cache_file)
        else:
            bounding_box = (
                float(lon),
                float(lat),
                float(lon) + 0.625,
                float(lat) + 0.5,
            )
            results = earthaccess.search_data(
                short_name="M2T1NXSLV",
                version="5.12.4",
                temporal=(start_date, end_date),
                bounding_box=bounding_box,
            )
            if not results:
                return {"error": "No live data found for this location/date."}

            print(
                "2. Found data granule. Constructing download URL...", file=sys.stderr
            )
            opendap_url = results[0]["umm"]["RelatedUrls"][0]["URL"]
            required_vars = "T2M,U10M,V10M,T2MDEW"
            download_url = f"{opendap_url}?{required_vars}"

            print("3. Starting download from NASA server...", file=sys.stderr)
            response = requests.get(download_url, timeout=120)
            response.raise_for_status()

            # Save downloaded NetCDF content to cache
            with open(cache_file, "wb") as f:
                f.write(response.content)
            print("2. Found data in local cache, skipping download.", file=sys.stderr)

            ds = xr.open_dataset(cache_file)

        # --- Compute metrics ---
        temp_k = ds["T2M"].max().item()  # ✅ Changed from .mean() to .max()
        daily_max_temp_c = safe_round(temp_k - 273.15)
        u10 = ds["U10M"].max().item()  # ✅ Changed from .mean() to .max()
        v10 = ds["V10M"].max().item()  # ✅ Changed from .mean() to .max()
        wind_speed = np.sqrt(u10**2 + v10**2)
        daily_max_wind_ms = safe_round(wind_speed)
        dewpoint_k = ds["T2MDEW"].mean().item()
        daily_dewpoint_c = safe_round(dewpoint_k - 273.15)
        todi_score = todi_engine.calculate_todi_score(
            daily_max_temp_c, 65.0, daily_max_wind_ms
        )

        # --- Safety checks ---
        todi_score = None if todi_score is None or np.isnan(todi_score) else todi_score

        print("5. Processing complete. Generating final JSON output.", file=sys.stderr)
        print("--- Live NASA Analysis Finished ---", file=sys.stderr)

        return {
            "location": f"Live Data for {lat}, {lon}",
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "daily_summary": {
                "timestamps": [start_date],
                "max_temp_celsius": [daily_max_temp_c],
                "dewpoint_celsius": [daily_dewpoint_c],
                "max_wind_speed_ms": [daily_max_wind_ms],
                "todi_score": [todi_score],
            },
        }

    except Exception as e:
        print(
            f"An error occurred during live data processing: {str(e)}", file=sys.stderr
        )
        return {"error": f"An error occurred during live data processing."}


if __name__ == "__main__":
    latitude = float(sys.argv[1])
    longitude = float(sys.argv[2])
    date_str = sys.argv[3]

    processed_data = process_live_data(latitude, longitude, date_str, date_str)

    print(json.dumps(processed_data))
