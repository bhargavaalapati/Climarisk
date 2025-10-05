import React from 'react';
import { Card, Row, Col, Typography, Progress, Tag, Space } from 'antd';
import { ThermometerSun } from "lucide-react";
import { formatNumber } from "../../utils/formatters"; // ✅ IMPORT THE NEW FUNCTION
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function LiveRiskCard({ liveData }) {
  if (!liveData) return null;

  const ds = liveData.daily_summary || {};
  const todi_score = ds.todi_score?.[0];
  const max_temp_celsius = ds.max_temp_celsius?.[0];
  const max_wind_speed_ms = ds.max_wind_speed_ms?.[0];
  const dewpoint_celsius = ds.dewpoint_celsius?.[0];
  const fetched_at = liveData.fetched_at || dayjs().toISOString();
  const formattedFetchedAt = dayjs(fetched_at).format('YYYY-MM-DD HH:mm:ss');

  const getStatus = (value, thresholds) => {
    if (value == null) return "normal";
    if (value < thresholds[0]) return "success";
    if (value < thresholds[1]) return "normal";
    return "exception";
  };

  return (
    <Card title="Live NASA Risk Data" extra={<Tag color="blue">Updated: {formattedFetchedAt}</Tag>}>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={6}>
          <Text strong>TODI Score</Text>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: getStatus(todi_score, [3, 7]) === 'exception' ? '#f5222d' : '#faad14' }}>
            {formatNumber(todi_score, 0)} / 100
          </div>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Text strong>Max Temperature</Text>
          <Progress 
            percent={Math.min(max_temp_celsius * 2.5, 100)} 
            // ✅ USE THE FORMATTING FUNCTION HERE
            format={() => `${formatNumber(max_temp_celsius)}°C`} 
            status={getStatus(max_temp_celsius, [30, 38])}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Text strong>Max Wind Speed</Text>
          <Progress 
            percent={Math.min(max_wind_speed_ms * 5, 100)} 
            // ✅ USE THE FORMATTING FUNCTION HERE
            format={() => `${formatNumber(max_wind_speed_ms)} m/s`} 
            status={getStatus(max_wind_speed_ms, [5, 12])}
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Text strong>Dew Point</Text>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <ThermometerSun size={24} color="#1677ff" />
            <Text style={{ fontSize: '1.2rem' }}>
              {/* ✅ USE THE FORMATTING FUNCTION HERE */}
              {formatNumber(dewpoint_celsius)}°C
            </Text>
          </div>
        </Col>
      </Row>
    </Card>
  );
}

export default LiveRiskCard;