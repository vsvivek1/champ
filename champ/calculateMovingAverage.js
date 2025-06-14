export default function calculateMovingAverage(data, period, field) {
    // Validate inputs
    if (!Array.isArray(data) || data.length < period) {
        
        console.error("Insufficient data for the given period for calculating movieng averate.");
        return null;
    }

    const validFields = ['open', 'high', 'low', 'close'];
    if (!validFields.includes(field)) {
        console.error(`Invalid field '${field}'. Choose from 'open', 'high', 'low', or 'close'.`);
        return null;
    }

    // Slice the last 'period' entries
    const selectedData = data.slice(-period);

    // Extract the required OHLC field values
    const values = selectedData.map(item => item[field]);

    // Calculate the moving average
    const sum = values.reduce((acc, value) => acc + value, 0);
    const movingAverage = sum / period;

    return movingAverage;
}