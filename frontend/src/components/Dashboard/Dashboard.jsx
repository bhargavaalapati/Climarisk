import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, Col, Row, Typography } from 'antd';
import TodiGauge from '../components/Dashboard/TodiGauge'; // <-- Import the new component

const { Title, Text } = Typography;

function DashboardPage() {
  const [searchParams] = useSearchParams();
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  // We will fetch the real data later. For now, we use a static score for testing.
  const mockTodiScore = 72;
  const isLoading = false; // Set to true to see the loading skeleton

  return (
    <div>
      <Title level={4} style={{ marginBottom: '24px' }}>
        Climate Risk Analysis for Lat: {lat}, Lon: {lon}
      </Title>
      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          {/* Add the TodiGauge component here */}
          <TodiGauge score={mockTodiScore} loading={isLoading} />
        </Col>
        <Col xs={24} md={16}>
          <Card>
            <p>The KeyIndicators and DistributionGraph components will go here.</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default DashboardPage;