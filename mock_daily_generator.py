import numpy as np
import json
import pandas as pd
import todi_engine  # Import your actual TODI engine!

print("--- Generating FINAL SENSITIVE mock full-year DAILY SUMMARY data ---")

# Generate a date range for the entire year 2023
dates = pd.date_range(start="2023-01-01", end="2023-12-31", freq="D")

daily_summary = {
    "timestamps": [],
    "max_temp_celsius": [],
    "max_wind_speed_ms": [],
    "todi_score": [],
}

for date in dates:
    day_of_year = date.dayofyear
    seasonal_factor = -np.cos((day_of_year / 365.0) * 2 * np.pi)

    # UPDATED: Generate a wider, more sensitive range of data
    # Temp range is now wider (e.g., from ~11°C to ~45°C) to trigger "Very Cold" in winter
    temp = 28 + (seasonal_factor * 17) + np.random.uniform(-4, 4)
    wind = np.random.uniform(
        2, 18
    )  # Wider wind speed range to trigger "Very Windy" more often

    # Use a mock humidity that varies slightly with season
    humidity = 60 - (seasonal_factor * 20) + np.random.uniform(-10, 10)

    # Calculate a real TODI score using your engine!
    todi = todi_engine.calculate_todi_score(temp, humidity, wind)

    daily_summary["timestamps"].append(date.isoformat())
    daily_summary["max_temp_celsius"].append(temp)
    daily_summary["max_wind_speed_ms"].append(wind)
    daily_summary["todi_score"].append(todi)

processed_data = {"location": "Global Test Location", "daily_summary": daily_summary}

with open("processed_data.json", "w") as f:
    json.dump(processed_data, f, indent=4)

print(
    "✅ Successfully created 'processed_data.json' with a full year of sensitive data."
)
