import React from 'react';
import { Card, Typography } from 'antd';

const { Title, Paragraph } = Typography;

function AboutPage() {
  return (
    <Card>
      <Title level={2}>About Project ClimaRisk</Title>
      <Paragraph>
        This application provides personalized climatological risk assessments using decades of NASA and other Earth observation data.
      </Paragraph>
    </Card>
  );
}

export default AboutPage;