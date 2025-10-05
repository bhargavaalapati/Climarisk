import React from 'react';
import { Card, Typography, Button, Progress, Space } from 'antd';
import { ArrowRightOutlined, ThunderboltOutlined, CloudOutlined, FireOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

function RecommendationCard({ recommendation, onSelect }) {
  if (!recommendation) return null;

  return (
    <Card
      style={{
        marginTop: '24px',
        borderLeft: '6px solid #1890ff',
        background: '#f0f5ff',
      }}
      hoverable
    >
      <Title level={5}>🌟 Smart Climate Suggestion</Title>
      <Text style={{ display: 'block', marginBottom: 8 }}>
        Your selected date may have high risk. Consider switching to{' '}
        <strong>
          {new Date(recommendation.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
        </strong>.
      </Text>
      <Space size="middle" style={{ marginBottom: 8 }}>
        <FireOutlined style={{ color: '#ff4d4f' }} /> Risk Score: <strong>{recommendation.todi}/100</strong>
        <CloudOutlined style={{ color: '#13c2c2' }} /> Improvement: <strong>{recommendation.improvement}%</strong>
      </Space>
      <Progress
        percent={recommendation.improvement}
        size="small"
        status="active"
        strokeColor={{
          '0%': '#108ee9',
          '100%': '#87d068',
        }}
        style={{ marginBottom: 8 }}
      />
      <Text>{recommendation.notes}</Text>
      <Button
        type="primary"
        icon={<ArrowRightOutlined />}
        style={{ marginTop: 12 }}
        onClick={() => onSelect(new Date(recommendation.date))}
      >
        Select this date
      </Button>
    </Card>
  );
}

export default RecommendationCard;
