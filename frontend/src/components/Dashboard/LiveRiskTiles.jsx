import React from "react";
import { Card, Row, Col, Typography } from "antd";
import { Thermometer, Droplets, Wind, CloudRain, AlertTriangle } from "lucide-react";
import { formatNumber } from "../../utils/formatters"; // ✅ IMPORT THE NEW FUNCTION

const { Text } = Typography;

function LiveRiskTiles({ liveData }) {
  if (!liveData) return null;

  const dailySummary = liveData.daily_summary || {};

  const tiles = [
    { title: "Todi Score", value: dailySummary.todi_score?.[0], unit: "", thresholds: [3, 7], icon: <AlertTriangle size={20} /> },
    { title: "Max Temp", value: dailySummary.max_temp_celsius?.[0], unit: "°C", thresholds: [30, 38], icon: <Thermometer size={20} /> },
    { title: "Humidity", value: dailySummary.humidity_percent?.[0], unit: "%", thresholds: [40, 70], icon: <Droplets size={20} /> },
    { title: "Wind Speed", value: dailySummary.max_wind_speed_ms?.[0], unit: " m/s", thresholds: [5, 12], icon: <Wind size={20} /> },
    { title: "Rain Chance", value: dailySummary.rain_probability_percent?.[0], unit: "%", thresholds: [40, 70], icon: <CloudRain size={20} /> },
  ];

  const getLevelColor = (value, thresholds) => {
    if (value == null) return "#d9d9d9";
    if (value < thresholds[0]) return "#52c41a";
    if (value < thresholds[1]) return "#faad14";
    return "#f5222d";
  };

  return (
    <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
      {tiles.map((tile, idx) =>
        tile.value != null ? (
          <Col xs={12} sm={8} md={6} lg={4} key={idx}>
            <Card hoverable style={{ textAlign: "center", borderTop: `4px solid ${getLevelColor(tile.value, tile.thresholds)}` }}>
              <div style={{ fontSize: "24px", color: getLevelColor(tile.value, tile.thresholds), marginBottom: "8px" }}>
                {tile.icon}
              </div>
              <Text strong style={{ display: "block", marginBottom: "4px" }}>
                {tile.title}
              </Text>
              <Text style={{ fontSize: "16px", color: getLevelColor(tile.value, tile.thresholds) }}>
                {/* ✅ USE THE FORMATTING FUNCTION HERE */}
                {formatNumber(tile.value, tile.title === 'Todi Score' ? 0 : 1)}{tile.unit}
              </Text>
            </Card>
          </Col>
        ) : null
      )}
    </Row>
  );
}

export default LiveRiskTiles;