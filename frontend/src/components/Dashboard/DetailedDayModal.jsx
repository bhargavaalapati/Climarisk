import React from 'react';
import { Modal, Typography, Tag, Row, Col, Statistic, Divider } from 'antd';
import { Thermometer, Wind, Umbrella, Sun, Snowflake, Zap } from 'lucide-react';

const { Title, Text } = Typography;

function DetailedDayModal({ isVisible, dayData, thresholds, onCancel }) {
  if (!dayData) return null;

  const { date, temp, wind, todi, isVeryHot, isVeryCold, isVeryWindy, rainProb } = dayData;

  const isRainy = thresholds?.rainProbability != null ? rainProb >= thresholds.rainProbability : rainProb >= 50;

  return (
    <Modal
      title={`Detailed Analysis for ${new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}`}
      open={isVisible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Row gutter={[32, 32]} align="middle" style={{ marginTop: '24px' }}>
        <Col span={12} style={{ textAlign: 'center' }}>
          <Statistic title="TODI Score" value={todi} suffix="/ 100" />
        </Col>
        <Col span={12}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Thermometer size={24} /> <Text>Max Temperature: <strong>{temp}°C</strong></Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Wind size={24} /> <Text>Max Wind Speed: <strong>{wind} m/s</strong></Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Umbrella size={24} /> <Text>Rain Probability: <strong>{rainProb}%</strong></Text>
          </div>
        </Col>
      </Row>

      <Divider />
      <div style={{ marginTop: '24px', textAlign: 'center' }}>
        <Title level={5}>Risk Assessment Tags</Title>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {isVeryHot && <Tag icon={<Sun />} color="error">Very Hot</Tag>}
          {isVeryCold && <Tag icon={<Snowflake />} color="cyan">Very Cold</Tag>}
          {isVeryWindy && <Tag icon={<Zap />} color="purple">Very Windy</Tag>}
          {isRainy && <Tag icon={<Umbrella />} color="cyan">Rainy</Tag>}
          {!isVeryHot && !isVeryCold && !isVeryWindy && !isRainy && <Tag color="green">Conditions within normal range</Tag>}
        </div>
      </div>
    </Modal>
  );
}

export default DetailedDayModal;
