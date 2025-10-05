export const fetchRiskData = async () => {
  try {
    const response = await fetch('http://localhost:8000/api/real/risk');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch risk data:", error);
    return null;
  }
};