import xarray as xr
import numpy as np
import json
import glob
import todi_engine

print("--- Starting NASA MERRA-2 SAMPLE Data Processing (First 7 Days) ---")

try:
    # Find the first 7 daily files
    nasa_files = sorted(glob.glob("nasa_merra2_data/*.nc4"))[:7]
    if not nasa_files:
        print("❌ No NASA data files found.")
        exit()

    print(f"Found {len(nasa_files)} NASA files to process for the sample.")
    ds = xr.open_mfdataset(nasa_files, combine="by_coords")
    print("✅ Successfully opened NASA data files.")

    # Perform the same calculations as before
    daily_max_temp_c = (
        ds["T2M"].resample(time="1D").max().max(dim=["lat", "lon"]) - 273.15
    )
    wind_speed = (ds["U10M"] ** 2 + ds["V10M"] ** 2) ** 0.5
    daily_max_wind_ms = wind_speed.resample(time="1D").max().max(dim=["lat", "lon"])

    todi_scores = []
    mock_humidity = 65.0
    for i in range(len(daily_max_temp_c.time)):
        temp = daily_max_temp_c.values[i]
        wind = daily_max_wind_ms.values[i]
        score = todi_engine.calculate_todi_score(temp, mock_humidity, wind)
        todi_scores.append(score)

    # Prepare the final JSON output
    processed_data = {
        "location": "Visakhapatnam Area (Processed from NASA MERRA-2 Data)",
        "daily_summary": {
            "timestamps": [str(t.values) for t in daily_max_temp_c.time],
            "max_temp_celsius": daily_max_temp_c.values.tolist(),
            "max_wind_speed_ms": daily_max_wind_ms.values.tolist(),
            "todi_score": todi_scores,
        },
    }

    with open("processed_data_nasa_SAMPLE.json", "w") as f:
        json.dump(processed_data, f, indent=4)

    print(
        "✅ Success! NASA SAMPLE data processed and saved to 'processed_data_nasa_SAMPLE.json'"
    )

except Exception as e:
    print(f"❌ An error occurred: {e}")
