import React from 'react';
import { Card, Row, Col, Typography, Progress, Tag, Space } from 'antd';
import { AlertCircle, Wind, Droplets, ThermometerSun, ThermometerSnowflake } from "lucide-react";
import TodiGauge from './TodiGauge';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

function LiveRiskCard({ liveData }) {
  if (!liveData) return null;

  const ds = liveData.daily_summary || {};
  const todi_score = ds.todi_score?.[0];
  const max_temp_celsius = ds.max_temp_celsius?.[0];
  const min_temp_celsius = ds.min_temp_celsius?.[0];
  const humidity_percent = ds.humidity_percent?.[0];
  const heat_index_celsius = ds.heat_index_celsius?.[0];
  const wind_chill_celsius = ds.wind_chill_celsius?.[0];
  const mean_wind_speed_ms = ds.mean_wind_speed_ms?.[0];
  const max_wind_speed_ms = ds.max_wind_speed_ms?.[0];
  const alerts = ds.alerts || [];
  const other_info = liveData.location_name || liveData.location || '-';
  const fetched_at = liveData.fetched_at || dayjs().toISOString();
  const formattedFetchedAt = dayjs(fetched_at).format('YYYY-MM-DD HH:mm:ss');

  const getColor = (value, thresholds, defaultColor = '#d9d9d9') => {
    if (value == null) return defaultColor;
    if (value < thresholds[0]) return '#52c41a';
    if (value < thresholds[1]) return '#faad14';
    return '#f5222d';
  };

  return (
    <Card style={{ marginBottom: '24px' }} title="Live NASA Risk Data" extra={<Tag color="blue">Last updated: {formattedFetchedAt}</Tag>}>
      <Row gutter={[16,16]}>
        {todi_score != null && <Col xs={24} sm={12} md={6}>
          <Text strong>Todi Score</Text>
          <TodiGauge score={todi_score} color={getColor(todi_score,[3,7])} />
          <div style={{ marginTop: '4px', color: getColor(todi_score,[3,7]) }}>{todi_score}/100</div>
        </Col>}

        {max_temp_celsius != null && <Col xs={24} sm={12} md={6}>
          <Text strong>Max Temp (°C)</Text>
          <Progress percent={Math.min(max_temp_celsius*2,100)} format={() => `${max_temp_celsius.toFixed(1)}°C`} strokeColor={getColor(max_temp_celsius,[30,38])} status="active"/>
        </Col>}

        {min_temp_celsius != null && <Col xs={24} sm={12} md={6}>
          <Text strong>Min Temp (°C)</Text>
          <Progress percent={Math.min(min_temp_celsius*2,100)} format={() => `${min_temp_celsius.toFixed(1)}°C`} strokeColor={getColor(min_temp_celsius,[15,25])} status="active"/>
        </Col>}

        {humidity_percent != null && <Col xs={24} sm={12} md={6}>
          <Text strong>Humidity</Text>
          <Progress percent={humidity_percent} format={() => `${humidity_percent.toFixed(1)}%`} strokeColor={getColor(humidity_percent,[40,70])} status="active"/>
        </Col>}
      </Row>

      <Row gutter={[16,16]} style={{marginTop:24}}>
        {heat_index_celsius != null && <Col xs={24} sm={12} md={6}><Text strong><ThermometerSun size={16}/> Heat Index</Text><div style={{marginTop:4,color:getColor(heat_index_celsius,[30,38])}}>{heat_index_celsius}°C</div></Col>}
        {wind_chill_celsius != null && <Col xs={24} sm={12} md={6}><Text strong><ThermometerSnowflake size={16}/> Wind Chill</Text><div style={{marginTop:4,color:getColor(wind_chill_celsius,[0,10])}}>{wind_chill_celsius}°C</div></Col>}
        {mean_wind_speed_ms != null && <Col xs={24} sm={12} md={6}><Text strong><Wind size={16}/> Avg Wind</Text><div style={{marginTop:4}}>{mean_wind_speed_ms} m/s</div></Col>}
        {max_wind_speed_ms != null && <Col xs={24} sm={12} md={6}><Text strong><Wind size={16}/> Max Wind</Text><div style={{marginTop:4}}>{max_wind_speed_ms} m/s</div></Col>}
        <Col xs={24} sm={12} md={6}><Text strong>Other Info</Text><div style={{marginTop:4,wordBreak:'break-word'}}>{other_info}</div></Col>
      </Row>

      {alerts.length > 0 && <Row style={{marginTop:24}}><Col span={24}><Space wrap>{alerts.map((a,i)=><Tag key={i} color="red" icon={<AlertCircle size={14}/>}>{a}</Tag>)}</Space></Col></Row>}
    </Card>
  );
}

export default LiveRiskCard;
