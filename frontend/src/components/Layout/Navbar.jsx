import React, { useState } from 'react';
import { Menu, Button, Modal, Slider, Typography, message, Popover, Space } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { HomeOutlined, InfoCircleOutlined, SettingOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { useSettings } from '../../context/settings';

const { Text, Paragraph } = Typography;

const menuItems = [
  { label: <Link to="/">Home</Link>, key: 'home', icon: <HomeOutlined /> },
  { label: <Link to="/about">About</Link>, key: 'about', icon: <InfoCircleOutlined /> },
];

// Popover contents for each threshold (no changes needed here)
const percentileHelpContent = {
  veryHot: (
    <div style={{ maxWidth: '300px' }}>
      <Paragraph>
        A percentile shows how a value compares to historical data. The "Very Hot" threshold is the percentile above which a day is considered unusually hot.
      </Paragraph>
      <Paragraph>
        Example: 95th percentile temperature is only exceeded on the hottest 5% of days in the past 30 years.
      </Paragraph>
    </div>
  ),
  veryCold: (
    <div style={{ maxWidth: '300px' }}>
      <Paragraph>
        "Very Cold" threshold: the percentile below which a day is considered unusually cold.
      </Paragraph>
      <Paragraph>Example: 5th percentile temperature is colder than 95% of days historically.</Paragraph>
    </div>
  ),
  veryWindy: (
    <div style={{ maxWidth: '300px' }}>
      <Paragraph>
        "Very Windy" threshold: the percentile above which wind speeds are considered extreme.
      </Paragraph>
      <Paragraph>Example: 90th percentile wind speed means only 10% of days are windier historically.</Paragraph>
    </div>
  ),
  rainProbability: (
    <div style={{ maxWidth: '300px' }}>
      <Paragraph>
        "Rain Probability" threshold: the percentage chance above which a day is flagged as rainy.
      </Paragraph>
      <Paragraph>Example: 60% means any day with ≥ 60% rain chance is considered rainy.</Paragraph>
    </div>
  ),
};

function Navbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { thresholds, setThreshold } = useSettings();
  const location = useLocation();
  const showSettingsButton = location.pathname.startsWith('/dashboard');

  return (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {/* ✅ MODIFIED: Changed text color from white to a dark charcoal */}
      <div style={{ 
          fontWeight: 'bold', 
          fontSize: '1.2rem', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '5px'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none', color: '#333333' }}>
          <img src="/logo.svg" alt="logo" style={{ width: '30px', height: '30px' }} />
          ClimaRisk
        </Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* ✅ MODIFIED: Changed menu theme from "dark" to "light" */}
        <Menu
          theme="light"
          mode="horizontal"
          items={menuItems}
          style={{ borderBottom: 'none', backgroundColor: 'transparent' }}
          selectable={false}
        />

        {showSettingsButton && (
          // ✅ MODIFIED: Removed hardcoded white color; it will now inherit the correct color from the theme
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={() => setIsModalOpen(true)}
            style={{ marginLeft: '16px' }}
          />
        )}
      </div>

      {/* Settings Modal (No changes needed here, it will adapt to the theme automatically) */}
      <Modal
        title="Settings"
        open={isModalOpen}
        onOk={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
      >
        {['veryHot', 'veryCold', 'veryWindy', 'rainProbability'].map((key) => (
          <div key={key} style={{ marginBottom: '24px' }}>
            <Space align="center">
              <Text strong>
                {key === 'veryHot'
                  ? 'Very Hot'
                  : key === 'veryCold'
                  ? 'Very Cold'
                  : key === 'veryWindy'
                  ? 'Very Windy'
                  : 'Rain Probability'} Threshold
              </Text>
              <Popover content={percentileHelpContent[key]} title="What is this?" trigger="hover">
                <QuestionCircleOutlined style={{ color: 'rgba(0,0,0,0.45)', cursor: 'help' }} />
              </Popover>
            </Space>
            <Slider
              min={key === 'veryCold' ? 1 : key === 'rainProbability' ? 10 : 75}
              max={key === 'veryCold' ? 25 : key === 'rainProbability' ? 100 : 99}
              value={thresholds[key]}
              onChange={(value) => {
                setThreshold(key, value);
                const label =
                  key === 'veryHot'
                    ? 'Very Hot'
                    : key === 'veryCold'
                    ? 'Very Cold'
                    : key === 'veryWindy'
                    ? 'Very Windy'
                    : 'Rain Probability';
                message.info(
                  `${label} threshold set to ${value}${key === 'rainProbability' ? '%' : 'th percentile'}`
                );
              }}
              marks={
                key === 'veryCold'
                  ? { 1: '1st', 5: '5th', 10: '10th', 25: '25th' }
                  : key === 'rainProbability'
                  ? { 10: '10%', 30: '30%', 50: '50%', 70: '70%', 100: '100%' }
                  : { 75: '75th', 90: '90th', 95: '95th', 99: '99th' }
              }
            />
          </div>
        ))}
      </Modal>
    </div>
  );
}

export default Navbar;