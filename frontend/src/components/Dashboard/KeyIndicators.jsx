import React from 'react';
import { List, Typography, Tag } from 'antd';
import { useSettings } from '../../context/settings';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';

const { Text } = Typography;

const getDayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = (date - start) + ((start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000);
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

// Animation variants
const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

function KeyIndicators({ data, loading, selectedDate, onDayClick }) {
  const { thresholds } = useSettings();
  if (!data || !data.daily || !data.climatology) return <List loading={loading} />;

  const { daily_summary } = data.daily;
  const { daily_climatology } = data.climatology;

  const allDaysData = daily_summary.timestamps.map((ts, index) => {
    const dayOfYear = getDayOfYear(new Date(ts));
    const climeData = daily_climatology[String(dayOfYear)];

    const temp = daily_summary.max_temp_celsius[index];
    const wind = daily_summary.max_wind_speed_ms[index];
    const rain = climeData?.rain_probability_percent ?? 0;

    return {
      date: ts,
      temp: temp.toFixed(1),
      wind: wind.toFixed(1),
      rain: rain,
      isVeryHot: climeData?.[`p${thresholds.veryHot}_temp_celsius`] != null ? temp > climeData[`p${thresholds.veryHot}_temp_celsius`] : false,
      isVeryCold: climeData?.[`p${thresholds.veryCold}_temp_celsius`] != null ? temp < climeData[`p${thresholds.veryCold}_temp_celsius`] : false,
      isVeryWindy: climeData?.[`p${thresholds.veryWindy}_wind_speed_ms`] != null ? wind > climeData[`p${thresholds.veryWindy}_wind_speed_ms`] : false,
      isRainy: thresholds.rainProbability != null ? rain >= thresholds.rainProbability : rain >= 50,
    };
  });

  const listData = selectedDate ? allDaysData.filter(item => dayjs(item.date).isSame(selectedDate, 'day')) : allDaysData;

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <List
        header={<div style={{ fontWeight: 'bold' }}>Daily Summary vs. Historical Norms (Click item for details)</div>}
        bordered
        dataSource={listData}
        loading={loading}
        pagination={{ pageSize: 7, align: 'center', hideOnSinglePage: true }}
        renderItem={(item, index) => (
          <motion.div variants={itemVariants} key={item.date}>
            <List.Item
              onClick={() =>
                onDayClick({
                  ...item,
                  todi: daily_summary.todi_score[index],
                  rainProb: item.rain,
                })
              }
              style={{ cursor: 'pointer' }}
            >
              <List.Item.Meta
                title={new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                description={
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {item.isVeryHot && <Tag color="red">Very Hot</Tag>}
                    {item.isVeryCold && <Tag color="blue">Very Cold</Tag>}
                    {item.isVeryWindy && <Tag color="purple">Very Windy</Tag>}
                    {item.isRainy && <Tag color="cyan">Very Wet</Tag>}
                    {!item.isVeryHot && !item.isVeryCold && !item.isVeryWindy && !item.isRainy && <Tag color="green">Normal</Tag>}
                  </div>
                }
              />
              <Text>Temp: {item.temp}°C | Wind: {item.wind} m/s | Rain: {item.rain}%</Text>
            </List.Item>
          </motion.div>
        )}
      />
    </motion.div>
  );
}

export default KeyIndicators;