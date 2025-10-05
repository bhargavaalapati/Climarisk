import React from "react";
import { Card, Row, Col, Typography } from "antd";
import { Thermometer, Droplets, Wind, CloudRain, AlertTriangle } from "lucide-react";

const { Text } = Typography;

function LiveRiskTiles({ liveData }) {
  if (!liveData) return null;

  const dailySummary = liveData.daily_summary || {};

  const tiles = [
    {
      title: "Todi Score",
      value: dailySummary.todi_score?.[0],
      icon: <AlertTriangle size={20} />,
      thresholds: [3, 7],
    },
    {
      title: "Max Temp",
      value: dailySummary.max_temp_celsius?.[0],
      icon: <Thermometer size={20} />,
      thresholds: [30, 38],
    },
    {
      title: "Min Temp",
      value: dailySummary.min_temp_celsius?.[0],
      icon: <Thermometer size={20} />,
      thresholds: [15, 25],
    },
    {
      title: "Humidity",
      value: dailySummary.humidity_percent?.[0],
      icon: <Droplets size={20} />,
      thresholds: [40, 70],
    },
    {
      title: "Wind Speed",
      value: dailySummary.max_wind_speed_ms?.[0],
      icon: <Wind size={20} />,
      thresholds: [5, 12],
    },
    {
      title: "Rain Chance",
      value: dailySummary.rain_probability_percent?.[0],
      icon: <CloudRain size={20} />,
      thresholds: [40, 70],
    },
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
            <Card
              hoverable
              style={{
                textAlign: "center",
                borderTop: `4px solid ${getLevelColor(tile.value, tile.thresholds)}`,
                borderRadius: "12px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ fontSize: "24px", color: getLevelColor(tile.value, tile.thresholds), marginBottom: "8px" }}>
                {tile.icon}
              </div>
              <Text strong style={{ display: "block", marginBottom: "4px" }}>
                {tile.title}
              </Text>
              <Text style={{ fontSize: "16px", color: getLevelColor(tile.value, tile.thresholds) }}>
                {tile.value}{tile.title.includes("Temp") ? "°C" : tile.title.includes("Humidity") ? "%" : tile.title.includes("Wind") ? " m/s" : ""}
              </Text>
            </Card>
          </Col>
        ) : null
      )}
    </Row>
  );
}

export default LiveRiskTiles;
