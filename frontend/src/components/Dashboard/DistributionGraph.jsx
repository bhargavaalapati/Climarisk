import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import dayjs from 'dayjs';
import { Sun, Wind, CloudRain } from 'lucide-react';

function DistributionGraph({ data, thresholds, selectedDate }) {
  const [chartType, setChartType] = useState('bar'); // toggle chart type

  if (!data || !data.daily || !data.climatology) return null;

  const getDayOfYear = (date) => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff =
      date - start + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  let chartData = data.daily.daily_summary.timestamps.map((ts, i) => {
    const dayOfYear = getDayOfYear(new Date(ts));
    const climeData = data.climatology.daily_climatology[String(dayOfYear)];

    const temp = Number(data.daily.daily_summary.max_temp_celsius[i].toFixed(1));
    const wind = Number(data.daily.daily_summary.max_wind_speed_ms[i].toFixed(1));
    const rain = Number((climeData?.rain_probability_percent ?? 0).toFixed(1));

    const isHot =
      climeData?.[`p${thresholds.veryHot}_temp_celsius`] != null
        ? temp > climeData[`p${thresholds.veryHot}_temp_celsius`]
        : false;
    const isCold =
      climeData?.[`p${thresholds.veryCold}_temp_celsius`] != null
        ? temp < climeData[`p${thresholds.veryCold}_temp_celsius`]
        : false;
    const isWindy =
      climeData?.[`p${thresholds.veryWindy}_wind_speed_ms`] != null
        ? wind > climeData[`p${thresholds.veryWindy}_wind_speed_ms`]
        : false;
    const isRainy =
      thresholds.rainProbability != null ? rain >= thresholds.rainProbability : rain >= 50;

    // Severity score 0-4
    const riskScore = isHot + isCold + isWindy + isRainy;

    // Color based on severity
    const getBadgeColor = (score) => {
      if (score === 0) return '#52c41a'; // green
      if (score <= 2) return '#faad14'; // orange
      return '#f5222d'; // red
    };

    const colorTemp = isHot
      ? 'url(#hotGradient)'
      : isCold
      ? 'url(#coldGradient)'
      : 'url(#tempNormalGradient)';
    const colorWind = isWindy ? 'url(#windGradient)' : 'url(#windNormalGradient)';
    const colorRain = isRainy ? 'url(#rainGradient)' : 'url(#rainNormalGradient)';

    return {
      date: ts,
      temp,
      wind,
      rain,
      colorTemp,
      colorWind,
      colorRain,
      isHot,
      isCold,
      isWindy,
      isRainy,
      riskScore,
      badgeColor: getBadgeColor(riskScore),
    };
  });

  if (selectedDate) {
    chartData = chartData.filter((entry) =>
      dayjs(entry.date).isSame(selectedDate, 'day')
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;
    const entry = payload[0].payload;

    return (
      <div
        style={{
          backgroundColor: '#fff',
          border: '1px solid #ccc',
          padding: '12px',
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          minWidth: '220px',
          fontSize: '0.9rem',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '6px' }}>
          {new Date(entry.date).toLocaleString()}
        </div>
        <div>
          <Sun size={16} style={{ marginRight: 6 }} /> Temp: {entry.temp}°C{' '}
          {entry.isHot ? '🔥 Very Hot' : entry.isCold ? '❄️ Very Cold' : '✅ Normal'}
        </div>
        <div>
          <Wind size={16} style={{ marginRight: 6 }} /> Wind: {entry.wind} m/s{' '}
          {entry.isWindy ? '💨 Very Windy' : '✅ Normal'}
        </div>
        <div>
          <CloudRain size={16} style={{ marginRight: 6 }} /> Rain: {entry.rain}%{' '}
          {entry.isRainy ? '☔ Risk' : '✅ Normal'}
        </div>
        <div style={{ marginTop: 6, fontWeight: 'bold', color: entry.badgeColor }}>
          Risk Score: {entry.riskScore} / 4
        </div>
      </div>
    );
  };

  // Fixed CustomLabel
  const CustomLabel = (props) => {
    const { x, y, value, payload } = props;
    if (!value || value === 0) return null;
    const badgeColor = payload?.badgeColor || '#000';

    return (
      <text x={x} y={y - 6} textAnchor="middle" fill={badgeColor} fontSize={12} fontWeight="bold">
        ⚠️{value}
      </text>
    );
  };

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <button
          onClick={() => setChartType(chartType === 'bar' ? 'line' : 'bar')}
          style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #888' }}
        >
          Switch to {chartType === 'bar' ? 'Line Chart' : 'Bar Chart'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 14, fontWeight: 'bold' }}>
        <div style={{ color: '#52c41a' }}>✅ Normal</div>
        <div style={{ color: '#faad14' }}>⚠️ Medium Risk</div>
        <div style={{ color: '#f5222d' }}>⚠️ High Risk</div>
      </div>

      <div style={{ width: '100%', height: '500px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart data={chartData} margin={{ top: 30, right: 30, left: 0, bottom: 5 }} barSize={25}>
              <defs>
                <linearGradient id="hotGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff4d4f" stopOpacity={1} />
                  <stop offset="100%" stopColor="#ffa39e" stopOpacity={1} />
                </linearGradient>

                <linearGradient id="coldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#40a9ff" stopOpacity={1} />
                  <stop offset="100%" stopColor="#bae7ff" stopOpacity={1} />
                </linearGradient>

                <linearGradient id="tempNormalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#95de64" stopOpacity={1} />
                  <stop offset="100%" stopColor="#d9f7be" stopOpacity={1} />
                </linearGradient>

                <linearGradient id="windGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#722ed1" stopOpacity={1} />
                  <stop offset="100%" stopColor="#d3adf7" stopOpacity={1} />
                </linearGradient>

                <linearGradient id="windNormalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#d3adf7" stopOpacity={1} />
                  <stop offset="100%" stopColor="#f0f0f0" stopOpacity={1} />
                </linearGradient>

                <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#13c2c2" stopOpacity={1} />
                  <stop offset="100%" stopColor="#87e8de" stopOpacity={1} />
                </linearGradient>

                <linearGradient id="rainNormalGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#87e8de" stopOpacity={1} />
                  <stop offset="100%" stopColor="#f0f0f0" stopOpacity={1} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="date"
                tickFormatter={(val) =>
                  new Date(val).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                }
                tick={{ fontSize: 12, fill: '#555' }}
              />
              <YAxis tick={{ fontSize: 12, fill: '#555' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />

              <Bar dataKey="temp" isAnimationActive animationDuration={1000}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-temp-${index}`} fill={entry.colorTemp} />
                ))}
                <LabelList dataKey="riskScore" content={CustomLabel} />
              </Bar>

              <Bar dataKey="wind" isAnimationActive animationDuration={1000}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-wind-${index}`} fill={entry.colorWind} />
                ))}
                <LabelList dataKey="riskScore" content={CustomLabel} />
              </Bar>

              <Bar dataKey="rain" isAnimationActive animationDuration={1000}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-rain-${index}`} fill={entry.colorRain} />
                ))}
                <LabelList dataKey="riskScore" content={CustomLabel} />
              </Bar>
            </BarChart>
          ) : (
            <LineChart data={chartData} margin={{ top: 30, right: 30, left: 0, bottom: 5 }}>
              <XAxis
                dataKey="date"
                tickFormatter={(val) =>
                  new Date(val).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                }
                tick={{ fontSize: 12, fill: '#555' }}
              />
              <YAxis tick={{ fontSize: 12, fill: '#555' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line type="monotone" dataKey="temp" stroke="#ff4d4f" strokeWidth={2} dot={{ fill: '#ff4d4f' }} />
              <Line type="monotone" dataKey="wind" stroke="#722ed1" strokeWidth={2} dot={{ fill: '#722ed1' }} />
              <Line type="monotone" dataKey="rain" stroke="#13c2c2" strokeWidth={2} dot={{ fill: '#13c2c2' }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default DistributionGraph;
