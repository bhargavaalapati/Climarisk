// src/utils/formatters.js

/**
 * Formats a number to a fixed number of decimal places.
 * Returns a dash '-' if the value is not a valid number.
 * @param {number | string | null | undefined} value - The number to format.
 * @param {number} decimals - The number of decimal places to round to.
 * @returns {string} The formatted number as a string.
 */
export const formatNumber = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '-'; 
  }
  return parseFloat(value).toFixed(decimals);
};