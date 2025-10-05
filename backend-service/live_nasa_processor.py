"""
Module for fetching and processing live MERRA-2 climate data from NASA Earthdata.

This refactored version separates concerns into smaller, more manageable functions
for improved readability and maintenance.
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

# --- Configuration Constants ---
CACHE_DIR = os.path.join(os.path.dirname(__file__), "cache")
MERRA2_SHORT_NAME = "M2T1NXSLV"
MERRA2_VERSION = "5.12.4"

# Ensure the cache directory exists on startup
os.makedirs(CACHE_DIR, exist_ok=True)

# --- Helper Functions ---


def get_cache_filename(lat, lon, date):
    """Generates a unique, hashed filename for caching downloaded data."""
    key = f"{lat}_{lon}_{date}"
    hashed = hashlib.md5(key.encode()).hexdigest()
    return os.path.join(CACHE_DIR, f"{hashed}.nc4")


def convert_numpy_types(data):
    """
    Recursively converts numpy number types in a dictionary to native Python types
    to ensure JSON serialization compatibility.
    """
    if isinstance(data, dict):
        return {key: convert_numpy_types(value) for key, value in data.items()}
    if isinstance(data, list):
        return [convert_numpy_types(item) for item in data]
    if isinstance(data, np.integer):
        return int(data)
    if isinstance(data, np.floating):
        return float(data)
    if isinstance(data, np.bool_):
        return bool(data)
    return data


# --- Core Logic Functions (Internal) ---


def _authenticate_earthdata():
    """Handles authentication with Earthdata using .netrc file."""
    print("DEBUG: Authenticating with Earthdata...", file=sys.stderr)
    auth = earthaccess.login(strategy="netrc")
    if not auth.authenticated:
        raise ConnectionError(
            "Earthdata authentication failed. Check your .netrc file."
        )
    print("DEBUG: Authenticated successfully via .netrc", file=sys.stderr)


def _search_and_download(lat, lon, date, cache_file):
    """Searches for and downloads the required MERRA-2 data file."""
    bounding_box = (float(lon), float(lat), float(lon) + 0.625, float(lat) + 0.5)

    print("DEBUG: Searching for MERRA-2 granules...", file=sys.stderr)
    results = earthaccess.search_data(
        short_name=MERRA2_SHORT_NAME,
        version=MERRA2_VERSION,
        temporal=(date, date),
        bounding_box=bounding_box,
    )
    print(f"DEBUG: Found {len(results)} results", file=sys.stderr)
    if not results:
        raise FileNotFoundError("No live data found for this location/date.")

    print("DEBUG: Downloading MERRA-2 file using earthaccess...", file=sys.stderr)
    downloaded_files = earthaccess.download(results, local_path=CACHE_DIR)

    if (
        not downloaded_files
        or not os.path.exists(downloaded_files[0])
        or os.path.getsize(downloaded_files[0]) == 0
    ):
        if downloaded_files and os.path.exists(downloaded_files[0]):
            os.remove(downloaded_files[0])  # Clean up empty file
        raise ConnectionError(
            "Download failed: The downloaded file is missing or empty."
        )

    os.rename(downloaded_files[0], cache_file)
    print(
        f"DEBUG: Renamed downloaded file to cache file: {cache_file}", file=sys.stderr
    )


def _extract_metrics_from_dataset(ds):
    """Extracts and calculates meteorological variables from the xarray dataset."""
    try:
        T2M = ds["T2M"].max().item()
        U10M = ds["U10M"].max().item()
        V10M = ds["V10M"].max().item()
        T2MDEW = ds["T2MDEW"].mean().item()

        daily_max_temp_c = T2M - 273.15
        daily_max_wind_ms = np.sqrt(U10M**2 + V10M**2)
        daily_dewpoint_c = T2MDEW - 273.15

        todi_score = todi_engine.calculate_todi_score(
            daily_max_temp_c, 65.0, daily_max_wind_ms
        )

        return {
            "max_temp_celsius": daily_max_temp_c,
            "dewpoint_celsius": daily_dewpoint_c,
            "max_wind_speed_ms": daily_max_wind_ms,
            "todi_score": todi_score,
        }
    except KeyError as e:
        raise ValueError(f"Variable {e} not found in the dataset.") from e


# --- Main Public Function ---


def process_live_data(lat, lon, start_date, end_date):
    """
    Main entry point to fetch, process, and summarize live MERRA-2 data.
    """
    try:
        print("--- DEBUG: Starting live_nasa_processor ---", file=sys.stderr)
        _authenticate_earthdata()

        cache_file = get_cache_filename(lat, lon, start_date)

        if not os.path.exists(cache_file):
            _search_and_download(lat, lon, start_date, cache_file)
        else:
            print(f"DEBUG: Using cached file {cache_file}", file=sys.stderr)

        ds = xr.open_dataset(cache_file)
        metrics = _extract_metrics_from_dataset(ds)

        result = {
            "location": f"Live Data for {lat}, {lon}",
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "daily_summary": {
                "timestamps": [start_date],
                "max_temp_celsius": [metrics["max_temp_celsius"]],
                "dewpoint_celsius": [metrics["dewpoint_celsius"]],
                "max_wind_speed_ms": [metrics["max_wind_speed_ms"]],
                "todi_score": [metrics["todi_score"]],
            },
        }

        print("DEBUG: Live NASA Analysis Finished", file=sys.stderr)
        return convert_numpy_types(result)

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
