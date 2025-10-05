"""
Module for fetching and processing live MERRA-2 climate data from NASA Earthdata.
"""

import sys
import json
import os
import hashlib
from datetime import datetime, timezone
import numpy as np
import xarray as xr
import earthaccess
import todi_engine
import requests

# --- Cache directory ---
CACHE_DIR = os.path.join(os.path.dirname(__file__), "cache")
os.makedirs(CACHE_DIR, exist_ok=True)

# --- HELPER FUNCTIONS ---


def get_cache_filename(lat, lon, date):
    """Generates a unique, hashed filename for caching downloaded data."""
    key = f"{lat}_{lon}_{date}"
    hashed = hashlib.md5(key.encode()).hexdigest()
    return os.path.join(CACHE_DIR, f"{hashed}.nc4")


def safe_round(value, digits=2):
    """Rounds a value safely, handling None or NaN."""
    return None if value is None or np.isnan(value) else round(float(value), digits)


# --- NEW: JSON COMPATIBILITY HELPER ---
# This function ensures the final result doesn't contain special NumPy numbers
# that would cause a crash when converting to JSON.
def convert_numpy_types(data):
    """
    Recursively converts numpy number types in a dictionary to native Python types
    to ensure JSON serialization compatibility.
    """
    if isinstance(data, dict):
        return {key: convert_numpy_types(value) for key, value in data.items()}
    if isinstance(data, list):
        return [convert_numpy_types(item) for item in data]
    # Check against the base classes for integers and floats
    if isinstance(data, np.integer):
        return int(data)
    if isinstance(data, np.floating):
        return float(data)
    if isinstance(data, np.bool_):
        return bool(data)
    return data


# --- MAIN DATA PROCESSING FUNCTION ---


def process_live_data(lat, lon, start_date, end_date):
    """
    Fetches live MERRA-2 data, processes it, and returns a summary.
    """
    try:
        print("--- DEBUG: Starting live_nasa_processor ---", file=sys.stderr)
        print(f"DEBUG: lat={lat}, lon={lon}, start_date={start_date}", file=sys.stderr)

        # Server-Side Authentication using .netrc file
        auth = earthaccess.login(strategy="netrc")
        if not auth.authenticated:
            return {"error": "Earthdata authentication failed. Check your .netrc file."}
        print(f"DEBUG: Authenticated successfully via .netrc", file=sys.stderr)

        cache_file = get_cache_filename(lat, lon, start_date)
        if os.path.exists(cache_file):
            print(f"DEBUG: Using cached file {cache_file}", file=sys.stderr)
            ds = xr.open_dataset(cache_file)
        else:
            # Search MERRA-2 granules
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
            print(
                f"DEBUG: search_data returned {len(results)} results", file=sys.stderr
            )
            if not results:
                return {"error": "No live data found for this location/date."}

            # Download using earthaccess for robustness
            print(
                "DEBUG: Downloading MERRA-2 file using earthaccess...", file=sys.stderr
            )
            downloaded_files = earthaccess.download(results, local_path=CACHE_DIR)
            if not downloaded_files:
                return {"error": "Data download from Earthdata failed."}

            os.rename(downloaded_files[0], cache_file)
            print(
                f"DEBUG: Renamed downloaded file to cache file: {cache_file}",
                file=sys.stderr,
            )
            ds = xr.open_dataset(cache_file)

        # Extract variables with error handling
        try:
            T2M = ds["T2M"].max().item()
            U10M = ds["U10M"].max().item()
            V10M = ds["V10M"].max().item()
            T2MDEW = ds["T2MDEW"].mean().item()
        except KeyError as e:
            return {"error": f"Variable {e} not found in the dataset."}

        # Calculate metrics
        daily_max_temp_c = safe_round(T2M - 273.15)
        daily_max_wind_ms = safe_round(np.sqrt(U10M**2 + V10M**2))
        daily_dewpoint_c = safe_round(T2MDEW - 273.15)
        todi_score = todi_engine.calculate_todi_score(
            daily_max_temp_c, 65.0, daily_max_wind_ms
        )
        todi_score = None if todi_score is None or np.isnan(todi_score) else todi_score

        result = {
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

        print(f"DEBUG: Live NASA Analysis Finished", file=sys.stderr)

        # FINAL STEP: Sanitize the dictionary before returning it
        native_result = convert_numpy_types(result)
        return native_result

    except Exception as e:
        import traceback

        print(f"❌ ERROR in process_live_data: {str(e)}", file=sys.stderr)
        print(traceback.format_exc(), file=sys.stderr)
        return {"error": f"An unexpected error occurred: {str(e)}"}


if __name__ == "__main__":
    if len(sys.argv) != 4:
        print(
            "Usage: python live_nasa_processor.py <latitude> <longitude> <YYYY-MM-DD>"
        )
        sys.exit(1)

    latitude = float(sys.argv[1])
    longitude = float(sys.argv[2])
    date_str = sys.argv[3]
    processed_data = process_live_data(latitude, longitude, date_str, date_str)
    print(json.dumps(processed_data, indent=2))
