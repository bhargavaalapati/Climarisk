import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import dayjs from 'dayjs';

const styles = StyleSheet.create({
  page: { padding: 20, fontSize: 12, fontFamily: 'Helvetica', backgroundColor: '#fff' },
  title: { fontSize: 20, marginBottom: 10, color: '#003a8c', fontWeight: 'bold' },
  sectionTitle: {
    fontSize: 16,
    marginTop: 15,
    marginBottom: 5,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderBottomStyle: 'solid',
    paddingBottom: 3,
  },
  row: { flexDirection: 'row', marginBottom: 4 },
  label: { width: 180, fontWeight: 'bold' },
  value: { flex: 1 },
  tag: { display: 'inline-block', marginRight: 6, padding: 3, color: 'white', fontSize: 10, borderRadius: 3 },
});

const getDayOfYear = (date) => {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
};

const getRiskAssessment = (dayData, climeData, thresholds) => {
  if (!dayData || !climeData) return { tags: [], assessment: 'No data' };

  const { temp, wind, todi, rainProb } = dayData;
  const tags = [];

  const isVeryHot = climeData[`p${thresholds.veryHot}_temp_celsius`] != null
    ? temp > climeData[`p${thresholds.veryHot}_temp_celsius`] : false;
  const isVeryCold = climeData[`p${thresholds.veryCold}_temp_celsius`] != null
    ? temp < climeData[`p${thresholds.veryCold}_temp_celsius`] : false;
  const isVeryWindy = climeData[`p${thresholds.veryWindy}_wind_speed_ms`] != null
    ? wind > climeData[`p${thresholds.veryWindy}_wind_speed_ms`] : false;
  const isRainy = thresholds.rainProbability != null
    ? rainProb >= thresholds.rainProbability : rainProb >= 50;

  if (isVeryHot) tags.push({ text: 'Very Hot', color: 'red' });
  if (isVeryCold) tags.push({ text: 'Very Cold', color: 'blue' });
  if (isVeryWindy) tags.push({ text: 'Very Windy', color: 'purple' });
  if (isRainy) tags.push({ text: 'Rainy', color: 'cyan' });
  if (!isVeryHot && !isVeryCold && !isVeryWindy && !isRainy) tags.push({ text: 'Normal', color: 'green' });

  let assessment = '';
  if (todi < 30 && !isVeryHot && !isVeryCold && !isVeryWindy && !isRainy) assessment = '✅ Safe to enjoy outside';
  else if (isRainy && !isVeryHot && !isVeryCold) assessment = '⚠️ Take rain precautions';
  else if (todi >= 70 || isVeryHot || isVeryCold || isVeryWindy) assessment = '⚠️ High risk, limit outdoor activities';
  else assessment = '⚠️ Moderate risk, stay alert';

  return { tags, assessment };
};

const ReportPDF = ({ data, selectedDate, thresholds, locationName }) => {
  if (!data || !selectedDate) return null;

  const daily = data.daily || {};
  const climatology = data.climatology || {};
  const timestamps = daily.daily_summary?.timestamps || [];
  const tempArray = daily.daily_summary?.max_temp_celsius || [];
  const windArray = daily.daily_summary?.max_wind_speed_ms || [];
  const todiArray = daily.daily_summary?.todi_score || [];

  const index = timestamps.findIndex(ts => dayjs(ts).isSame(selectedDate, 'day'));
  if (index === -1) return null;

  const dayData = {
    date: new Date(timestamps[index]),
    temp: tempArray[index] ?? 0,
    wind: windArray[index] ?? 0,
    todi: todiArray[index] ?? 0,
    rainProb: climatology.daily_climatology?.[getDayOfYear(new Date(timestamps[index]))]?.rain_probability_percent ?? 0,
  };

  const dayOfYear = getDayOfYear(dayData.date);
  const climeData = climatology.daily_climatology?.[String(dayOfYear)] || {};

  const { tags, assessment } = getRiskAssessment(dayData, climeData, thresholds);

  return (
    <Document>
      <Page style={styles.page}>
        <Text style={styles.title}>ClimaRisk Report</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Location:</Text>
          <Text style={styles.value}>{locationName || 'Unknown'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Date Analyzed:</Text>
          <Text style={styles.value}>{dayData.date.toLocaleDateString()}</Text>
        </View>

        <Text style={styles.sectionTitle}>Daily Summary</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Max Temperature:</Text>
          <Text style={styles.value}>{dayData.temp.toFixed(1)}°C</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Max Wind Speed:</Text>
          <Text style={styles.value}>{dayData.wind.toFixed(1)} m/s</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>TODI:</Text>
          <Text style={styles.value}>{dayData.todi}/100</Text>
        </View>

        <Text style={styles.sectionTitle}>Historical Context</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Very Hot Threshold:</Text>
          <Text style={styles.value}>{climeData?.[`p${thresholds.veryHot}_temp_celsius`] ?? 'N/A'}°C</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Rain Probability:</Text>
          <Text style={styles.value}>{climeData?.rain_probability_percent ?? 'N/A'}%</Text>
        </View>

        <Text style={styles.sectionTitle}>Risk Assessment</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Assessment:</Text>
          <Text style={styles.value}>{assessment}</Text>
        </View>

        <Text style={styles.sectionTitle}>Risk Tags</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
          {tags.map((tag, i) => (
            <Text key={i} style={{ ...styles.tag, backgroundColor: tag.color }}>
              {tag.text}
            </Text>
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default ReportPDF;
