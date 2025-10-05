import earthaccess
import requests
import os

# --- 1. Search for the MERRA-2 data ---
print("Searching for MERRA-2 data granules on Earthdata...")
try:
    results = earthaccess.search_data(
        short_name="M2T1NXSLV",
        version="5.12.4",
        temporal=("2023-06-01", "2023-06-30"),
        # Bounding box for Visakhapatnam: West, South, East, North
        bounding_box=(83, 17, 84, 18),
    )
    if not results:
        print(
            "❌ No data found for the specified criteria. Please check the parameters."
        )
        exit()
except Exception as e:
    print(f"❌ An error occurred during search: {e}")
    exit()

# --- 2. Get the OPeNDAP URLs from the search results ---
opendap_urls = []
for item in results:
    for url_info in item["umm"]["RelatedUrls"]:
        if "OPENDAP" in url_info.get("Description", "").upper():
            opendap_urls.append(url_info["URL"])

print(f"✅ Found {len(opendap_urls)} data files to download.")

# --- 3. Download each file ---
output_dir = "nasa_merra2_data"
os.makedirs(output_dir, exist_ok=True)

for url in opendap_urls:
    # Construct the full download URL with the variables we need (Temp, Wind, Dewpoint)
    # NOTE: MERRA-2 variable names are different from ERA5
    required_vars = "T2M,U10M,V10M,T2MDEW"
    download_url = f"{url}.nc?{required_vars}"

    filename = os.path.join(output_dir, os.path.basename(url))

    if os.path.exists(filename):
        print(f"File exists, skipping: {filename}")
        continue

    print(f"Downloading {filename}...")
    try:
        # The .netrc file is used automatically for authentication
        response = requests.get(download_url, timeout=120)
        response.raise_for_status()  # Raise an exception for bad status codes (like 401 or 404)

        with open(filename, "wb") as f:
            f.write(response.content)
        print("...Success!")
    except requests.exceptions.RequestException as e:
        print(f"...Failed to download: {e}")

print("\n--- NASA Data Download Complete ---")
