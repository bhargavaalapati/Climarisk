import math


# --- Helper Functions (unchanged) ---
def calculate_heat_index(temp_celsius, relative_humidity):
    temp_fahrenheit = (temp_celsius * 9 / 5) + 32
    heat_index_f = 0.5 * (
        temp_fahrenheit
        + 61.0
        + ((temp_fahrenheit - 68.0) * 1.2)
        + (relative_humidity * 0.094)
    )
    if heat_index_f < temp_fahrenheit:
        heat_index_f = temp_fahrenheit
    heat_index_celsius = (heat_index_f - 32) * 5 / 9
    return heat_index_celsius


def calculate_wind_chill(temp_celsius, wind_speed_ms):
    if temp_celsius > 10 or wind_speed_ms < 1.3:
        return temp_celsius
    temp_f = (temp_celsius * 9 / 5) + 32
    wind_mph = wind_speed_ms * 2.23694
    wind_chill_f = (
        35.74
        + (0.6215 * temp_f)
        - (35.75 * (wind_mph**0.16))
        + (0.4275 * temp_f * (wind_mph**0.16))
    )
    wind_chill_c = (wind_chill_f - 32) * 5 / 9
    return wind_chill_c


# --- FINAL, UPDATED Main Function ---
def calculate_todi_score(temp_celsius, relative_humidity, wind_speed_ms):
    """
    Calculates the final 0-100 TODI score, accounting for both heat and cold.
    Uses Heat Index for hot conditions, Wind Chill for cold conditions,
    and a linear "discomfort" scale from an ideal temperature.
    """
    feels_like_c = temp_celsius

    # Determine the "feels like" temperature
    if temp_celsius > 27:  # Hot: use Heat Index
        feels_like_c = calculate_heat_index(temp_celsius, relative_humidity)
    elif temp_celsius < 10:  # Cold: use Wind Chill
        feels_like_c = calculate_wind_chill(temp_celsius, wind_speed_ms)

    # --- NEW LOGIC: Discomfort relative to ideal temperature ---
    ideal_temp = 22.0  # Comfortable temperature
    discomfort_delta = abs(feels_like_c - ideal_temp)

    # Scale discomfort delta to a 0-100 TODI score
    # Max discomfort at 20°C deviation
    max_delta = 20.0
    score = (discomfort_delta / max_delta) * 100

    # Clamp score between 0 and 100
    score = max(0, min(100, score))

    return int(score)
