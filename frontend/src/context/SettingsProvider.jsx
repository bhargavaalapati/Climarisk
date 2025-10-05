import React, { useState } from 'react';
import { SettingsContext } from './settings';

export const SettingsProvider = ({ children }) => {
  const [thresholds, setThresholds] = useState({
    veryHot: 95,   // Default 95th percentile
    veryCold: 5,   // Default 5th percentile
    veryWindy: 90, // Default 90th percentile
    rainProbability: 50, // Default 50% probability
  });

  const setThreshold = (key, value) => {
    setThresholds(prev => ({ ...prev, [key]: value }));
  };

  const value = { thresholds, setThreshold };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};