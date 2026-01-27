export default  function  getTimeFactorAndElapsedMinutes() {
    // Define the trading start and end times
    const tradingStartHours = 9;
    const tradingStartMinutes = 15;
    const tradingEndHours = 15;
    const tradingEndMinutes = 30;

   // console.log(global.hours,global.minutes)

    // Total trading minutes in the session
    const totalTradingMinutes = (tradingEndHours * 60 + tradingEndMinutes) - (tradingStartHours * 60 + tradingStartMinutes);

    // Validate global.hours and global.minutes
    if (typeof global.hours !== 'number' || typeof global.minutes !== 'number' || global.hours < 0 || global.minutes < 0 || global.minutes >= 60) {
        throw new Error("Invalid input: global.hours and global.minutes must be valid numbers within the range of a 24-hour clock.");
    }

    // Current time from global.hours and global.minutes
    const currentMinutes = global.hours * 60 + global.minutes;
    const tradingStartMinutesTotal = tradingStartHours * 60 + tradingStartMinutes;
    const tradingEndMinutesTotal = tradingEndHours * 60 + tradingEndMinutes;

    // Calculate elapsed minutes from trading start
    const elapsedMinutes = Math.max(0, Math.min(currentMinutes - tradingStartMinutesTotal, totalTradingMinutes));

    // Calculate the time factor (elapsed time as a fraction of total time)
    const timeFactor = totalTradingMinutes > 0 ? Math.max(0, Math.min(elapsedMinutes / totalTradingMinutes, 1)) : 0;

    return {
        timeFactor,
        elapsedMinutes,
    };
}