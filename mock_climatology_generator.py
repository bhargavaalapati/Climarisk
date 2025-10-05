import numpy as np
import json

print("--- Generating FINAL mock full-year CLIMATOLOGY data ---")

climatology_output = {"location": "Global Test Location", "daily_climatology": {}}
for day in range(1, 367):
    seasonal_factor = -np.cos((day / 366.0) * 2 * np.pi)
    # WIDER BASE TEMP to match daily data
    base_temp = 28 + (seasonal_factor * 13)
    base_wind = 8 + (seasonal_factor * 6)

    stats_dict = {
        # Temperature Percentiles
        "p5_temp_celsius": round(base_temp - 5.0, 2),  # "Very Cold"
        "p75_temp_celsius": round(base_temp + 2.0, 2),
        "p85_temp_celsius": round(base_temp + 3.6, 2),
        "p95_temp_celsius": round(base_temp + 6.5, 2),  # "Very Hot"
        "p99_temp_celsius": round(base_temp + 9.0, 2),
        # Wind Percentile
        "p95_wind_speed_ms": round(base_wind + 6.0, 2),  # "Very Windy"
        # HIGHER RAIN PROB: Now it can go above 50%
        "rain_probability_percent": round(
            max(0, 30 + (seasonal_factor * 40) + np.random.uniform(-10, 10)), 2
        ),
    }
    climatology_output["daily_climatology"][str(day)] = stats_dict

with open("climatology_full_1991-2020.json", "w") as f:
    json.dump(climatology_output, f, indent=4)

print("✅ Successfully created final 'climatology_full_1991-2020.json'")
