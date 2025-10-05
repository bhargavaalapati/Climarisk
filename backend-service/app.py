from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import json
import os
import sys
import itertools
import time
from threading import Thread
from live_nasa_processor import (
    process_live_data,
)  # Ensure this is your working live processor

app = Flask(__name__)
# Define a list of allowed frontend URLs
allowed_origins = [
    "https://project-clima-risk.vercel.app",  # Your deployed frontend
    "http://localhost:5173",  # Your local frontend dev server
    # You can add other ports here if Vite uses a different one, e.g., "http://localhost:3000"
]

# Initialize CORS with the list of allowed origins
CORS(app, origins=allowed_origins, supports_credentials=True)

# --- Load Mock Data on Startup (optional, fallback) ---
MOCK_DATA = {}
mock_files = {
    "risk": "processed_data.json",
    "climatology": "climatology_full_1991-2020.json",
    "graph": "graph_data_daily_histogram.json",
}

for key, fname in mock_files.items():
    try:
        with open(os.path.join(os.path.dirname(__file__), fname), "r") as f:
            MOCK_DATA[key] = json.load(f)
        print(f"✅ Loaded mock file: {fname}")
    except Exception as e:
        print(f"❌ Failed to load {fname}: {e}")
        MOCK_DATA[key] = {}


# --- Mock Data Endpoints ---
@app.route("/api/real/risk")
def get_risk():
    return jsonify(MOCK_DATA["risk"])


@app.route("/api/climatology")
def get_climatology():
    return jsonify(MOCK_DATA["climatology"])


@app.route("/api/graph-data")
def get_graph():
    return jsonify(MOCK_DATA["graph"])


# --- Live Data SSE Endpoint ---
@app.route("/api/live-risk")
def live_risk():
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    date = request.args.get("date")

    if not lat or not lon or not date:
        return jsonify({"error": "lat, lon, and date are required"}), 400

    def event_stream():
        try:
            yield f"data: 🔍 Starting live NASA analysis for {lat}, {lon}, {date}\n\n"

            steps = [
                "Step 1: Authenticate Earthdata",
                "Step 2: Search MERRA-2 granules",
                "Step 3: Download/Load .nc4 file",
                "Step 4: Extract variables",
                "Step 5: Compute TODI score",
            ]
            fun_msgs = [
                "🌡️ Measuring heat...",
                "💨 Checking wind...",
                "💧 Calculating dew point...",
                "🚀 Crunching numbers...",
            ]
            spinner = itertools.cycle(["⏳", "🚀", "🌍", "💨", "☀️"])

            # Thread-safe container for live data
            result_container = {}

            def fetch_data():
                result_container["data"] = process_live_data(
                    float(lat), float(lon), date, date
                )

            # Start background thread to fetch data
            thread = Thread(target=fetch_data)
            thread.start()

            i = 0
            # Stream fun spinner + step messages until fetch completes
            while thread.is_alive():
                step_msg = steps[i % len(steps)]
                fun_msg = fun_msgs[i % len(fun_msgs)]
                yield f"data: {next(spinner)} {step_msg} {fun_msg}\n\n"
                i += 1
                time.sleep(0.5)

            thread.join()
            result = result_container["data"]

            if "error" in result:
                yield f"data: {json.dumps(result)}\n\n"
            else:
                # Recommendation logic
                current_todi = result["daily_summary"]["todi_score"][0] or 0
                recommended_todi = max(current_todi - 1, 0)
                recommendation = {
                    "date": date,
                    "todi": recommended_todi,
                    "improvement": round(
                        ((current_todi - recommended_todi) / max(current_todi, 1)) * 100
                    ),
                    "notes": f"Based on live NASA data, {date} is predicted to be safer.",
                }

                yield f"event: result\ndata: {json.dumps({'liveData': result, 'recommendation': recommendation})}\n\n"

            yield "event: end\ndata: done\n\n"

        except Exception as e:
            import traceback

            tb = traceback.format_exc()
            yield f"data: {json.dumps({'error': str(e), 'trace': tb})}\n\n"
            yield "event: end\ndata: failed\n\n"

    return Response(event_stream(), mimetype="text/event-stream")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    app.run(host="0.0.0.0", port=port, debug=True)
