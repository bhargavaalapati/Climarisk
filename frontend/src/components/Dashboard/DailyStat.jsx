import React from 'react';

const DailyStat = ({ date, temp, wind, precip, threshold }) => {
  // Compare the daily temp to the historical threshold, with a safety check
  // If threshold is missing, isVeryHot will be false.
  const isVeryHot = threshold ? temp > threshold : false;
  const tempColorClass = isVeryHot ? 'text-red-500 font-bold animate-pulse' : 'text-red-400';

  // --- SAFETY CHECKS ADDED HERE ---
  // If a value is missing (undefined, null), it will use 0 instead of crashing.
  const tempDisplay = (temp || 0).toFixed(1);
  const windDisplay = (wind || 0).toFixed(1);
  const precipDisplay = (precip || 0).toFixed(1);

  return (
    <div className="bg-gray-700 p-3 rounded-md flex justify-between items-center">
      <div className="font-bold text-gray-200">
        {new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
      </div>
      <div className="text-right text-sm">
        <p>Max Temp: <span className={tempColorClass}>{tempDisplay}°C</span></p>
        <p>Max Wind: <span className="font-semibold text-blue-400">{windDisplay} m/s</span></p>
        <p>Precipitation: <span className="font-semibold text-green-400">{precipDisplay} mm</span></p>
      </div>
    </div>
  );
};

export default DailyStat;