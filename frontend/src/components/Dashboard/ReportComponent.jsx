import React from 'react';
import { Typography } from 'antd';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;

// Reusable styles for a clean PDF layout
const styles = {
  page: { width: '210mm', padding: '20mm', backgroundColor: 'white', color: 'black', fontFamily: 'sans-serif' },
  title: { fontSize: '24px', fontWeight: 'bold', color: '#003a8c' },
  subtitle: { fontSize: '18px', fontWeight: 'bold', color: '#333', marginTop: '24px', borderBottom: '1px solid #eee', paddingBottom: '8px' },
  paragraph: { fontSize: '12px', lineHeight: '1.6' },
  strong: { fontWeight: 'bold' },
};

// Helper function to get the day of the year
const getDayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

const ReportComponent = React.forwardRef(({ data, selectedDate }, ref) => {
  // Safety check: Don't render anything if the core data is missing
  if (!data || !selectedDate) {
    return null;
  }

  const { daily, climatology } = data;
  
  // Find the specific data for the day the user has selected
  const dayIndex = daily.daily_summary.timestamps.findIndex(ts => dayjs(ts).isSame(selectedDate, 'day'));

  // Safety check: If the selected date isn't in our data, render nothing
  if (dayIndex === -1) {
    return null;
  }

  // Create a clean object for the day's data
  const dayData = {
    date: new Date(daily.daily_summary.timestamps[dayIndex]),
    temp: daily.daily_summary.max_temp_celsius[dayIndex],
    wind: daily.daily_summary.max_wind_speed_ms[dayIndex],
    todi: daily.daily_summary.todi_score[dayIndex],
  };

  const dayOfYear = getDayOfYear(dayData.date);
  const climeData = climatology.daily_climatology[String(dayOfYear)];

  return (
    <div ref={ref} style={styles.page}>
      <p style={styles.title}>🚀 ClimaRisk Report</p>
      <div style={styles.paragraph}>
        <p><strong style={styles.strong}>Location:</strong> {daily.location}</p>
        <p><strong style={styles.strong}>Date Analyzed:</strong> {dayData.date.toLocaleDateString()}</p>
      </div>
      
      <p style={styles.subtitle}>Daily Summary</p>
      <div style={styles.paragraph}>
        <p><strong style={styles.strong}>Max Temperature:</strong> {dayData.temp.toFixed(1)}°C</p>
        <p><strong style={styles.strong}>Max Wind Speed:</strong> {dayData.wind.toFixed(1)} m/s</p>
        <p><strong style={styles.strong}>Total Outdoor Discomfort Index (TODI):</strong> {dayData.todi}/100</p>
      </div>

      <p style={styles.subtitle}>Historical Context (based on 30-year data)</p>
      <div style={styles.paragraph}>
        <p><strong style={styles.strong}>95th Percentile "Very Hot" Threshold:</strong> {climeData?.p95_temp_celsius}°C</p>
        <p><strong style={styles.strong}>Historical Probability of Rain:</strong> {climeData?.rain_probability_percent}%</p>
      </div>
    </div>
  );
});

export default ReportComponent;