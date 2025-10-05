# Project ClimaRisk: A NASA Space Apps 2025 Submission

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![Built With](https://img.shields.io/badge/Built%20With-React%20%26%20Python-blue.svg)](https://reactjs.org/)

ClimaRisk is a personalized climatological risk assessment tool that provides users with the historical likelihood of adverse weather conditions for any location and date. It empowers users to make informed, data-driven decisions for long-range planning by analyzing decades of Earth observation data.

<img width="1890" height="913" alt="image" src="https://github.com/user-attachments/assets/da96c50c-7259-459c-8536-d490c631aae7" />

## The Challenge: "Will It Rain On My Parade?"

Standard weather apps provide short-term forecasts but fail to help users plan long-range events like vacations, hikes, or festivals. The official NASA Space Apps challenge asks for a tool that can determine the *likelihood* of conditions like "very hot," "very cold," "very windy," or "very uncomfortable" months in advance.

ClimaRisk solves this by shifting the paradigm from weather *forecasting* to climatological *risk assessment*.

## Key Features

* **🌍 Interactive Global Map:** Select any location on Earth with a simple click or by using the location search bar.
* **🌡️ Total Outdoor Discomfort Index (TODI):** A unique, holistic score from 0-100 that combines temperature, humidity, and wind to measure the "feels like" discomfort.
* **📊 Historical Risk Analysis:** Compares daily weather summaries against 30 years of historical data to identify statistically significant extreme conditions.
* **⚙️ Personalized Thresholds:** A settings modal allows users to adjust the percentile (e.g., 90th, 95th) used to define "very hot," making the analysis truly personal.
* **🛰️ Live NASA Analysis:** A powerful feature that connects directly to NASA's servers to download and process real MERRA-2 data on the fly for a selected location and date.
* **📄 Downloadable PDF Reports:** Export a clean, formatted, one-page PDF summary of the climate risk analysis.

## Tech Stack & Data Flow

* **Frontend:** React, Vite, Ant Design, Recharts, `react-leaflet`, Framer Motion
* **Backend:** Node.js, Express.js
* **Data Pipeline & Climatology Engine:** Python, xarray, NumPy, `earthaccess`, `requests`
* **Primary Data Source:** NASA MERRA-2 Reanalysis Dataset

Our data flows from the **NASA GES DISC OPeNDAP Server**, through our Python processing scripts into a clean JSON format, which is then served by our Node.js API to the interactive React frontend. For the live demo, we use a pre-processed mock data cache to ensure a fast and reliable user experience, while the "Live Analysis" feature demonstrates our ability to work with real NASA data on demand.

## How to Run Locally

1.  **Prerequisites:** Ensure you have Git, Node.js (v18+), and Python (v3.10+) installed.

2.  **Clone the repository:**
    ```bash
    git clone [https://github.com/bhargavaalapati/Project-ClimaRisk.git](https://github.com/bhargavaalapati/Project-ClimaRisk.git)
    cd Project-ClimaRisk
    ```

3.  **Setup the Python Environment:**
    * Create and activate a virtual environment:
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```
    * Install Python dependencies from the `requirements.txt` file:
        ```bash
        pip install -r requirements.txt
        ```

4.  **Setup the Backend Server:**
    * In a new terminal, navigate to the `backend` folder and install dependencies:
        ```bash
        cd backend
        npm install
        ```
    * Start the server: `node index.js`. It should be running on `http://localhost:8000`.

5.  **Setup & Run the Frontend:**
    * In another new terminal, navigate to the `frontend` folder and install dependencies:
        ```bash
        cd frontend
        npm install
        ```
    * Start the dev server: `npm run dev`. Your browser should open to `http://localhost:5173`.

---
*This project was developed for the NASA Space Apps 2025 Challenge.*
