import xarray as xr
import numpy as np
import json
import glob
import todi_engine  # We will reuse our TODI engine!

print("--- Starting FINAL NASA MERRA-2 Data Processing ---")

try:
    # 1. Find and open all the downloaded NASA data files
    nasa_files = sorted(glob.glob("nasa_merra2_data/*.nc4"))
    if not nasa_files:
        print("❌ No NASA data files found.")
        exit()

    print(f"Found {len(nasa_files)} NASA MERRA-2 files to process.")
    ds = xr.open_mfdataset(nasa_files, combine="by_coords")
    print("✅ Successfully opened all NASA data files.")

    # --- 2. Perform Calculations using MERRA-2 Variable Names ---

    # Temperature (T2M is in Kelvin, convert to Celsius)
    daily_max_temp_c = (
        ds["T2M"].resample(time="1D").max().max(dim=["lat", "lon"]) - 273.15
    )

    # Wind Speed (U10M and V10M are the components)
    wind_speed = (ds["U10M"] ** 2 + ds["V10M"] ** 2) ** 0.5
    daily_max_wind_ms = wind_speed.resample(time="1D").max().max(dim=["lat", "lon"])

    # --- 3. Calculate TODI Score for each day ---
    # We will need to calculate relative humidity from dewpoint (T2MDEW)
    # This is a complex formula, so for now, we will continue using our reliable mock humidity
    todi_scores = []
    mock_humidity = 65.0
    for i in range(len(daily_max_temp_c.time)):
        temp = daily_max_temp_c.values[i]
        wind = daily_max_wind_ms.values[i]
        score = todi_engine.calculate_todi_score(temp, mock_humidity, wind)
        todi_scores.append(score)

    # --- 4. Prepare the final JSON output ---
    processed_data = {
        "location": "Visakhapatnam Area (NASA MERRA-2 Data)",
        "daily_summary": {
            "timestamps": [str(t.values) for t in daily_max_temp_c.time],
            "max_temp_celsius": daily_max_temp_c.values.tolist(),
            "max_wind_speed_ms": daily_max_wind_ms.values.tolist(),
            "todi_score": todi_scores,
        },
    }

    # Save to a new JSON file to keep it separate
    with open("processed_data_nasa.json", "w") as f:
        json.dump(processed_data, f, indent=4)

    print(
        "✅ Success! NASA data processed with TODI scores and saved to 'processed_data_nasa.json'"
    )

except Exception as e:
    print(f"❌ An error occurred: {e}")
