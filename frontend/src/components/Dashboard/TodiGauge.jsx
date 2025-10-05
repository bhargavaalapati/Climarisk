import React from 'react';
import { Card, Progress, Statistic, Typography } from 'antd';
import { motion } from 'framer-motion';

const { Text } = Typography;

function TodiGauge({ score, loading }) {
  let status = 'success', description = 'Low Discomfort';
  if (score > 40) { status = 'normal'; description = 'Moderate Discomfort'; }
  if (score > 70) { status = 'warning'; description = 'High Discomfort'; }
  if (score > 85) { status = 'exception'; description = 'Extreme Discomfort'; }

  return (
    <Card loading={loading}>
      <Statistic title="Total Outdoor Discomfort Index (TODI)" value=" " />
      {/* The value is now inside the motion component */}
      <div style={{ marginTop: '-20px', marginBottom: '24px' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            style={{fontSize: '38px', fontWeight: '600', lineHeight: '1', color: 'rgba(0, 0, 0, 0.88)'}}
          >
            {score}
          </motion.div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <Progress
          type="dashboard"
          percent={score}
          status={status}
          format={() => ''} // Hide the default percent text
          strokeWidth={10}
        />
        <Text style={{ display: 'block', marginTop: '16px' }} type="secondary">
          {description}
        </Text>
      </div>
    </Card>
  );
}

export default TodiGauge;