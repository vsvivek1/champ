function getCombinedDates() {
    const nextSevenDays = getNextSevenDays();
    const lastWeekdays = [];//getLastWeekdaysOfCurrentMonth();
    return nextSevenDays.concat(lastWeekdays);
}

function getNextSevenDays() {
    const days = [];
    const today = new Date();

    for (let i = 1; i < 10; i++) {
        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + i);

        // Format the date as yyyy-mm-dd
        const year = nextDay.getFullYear();
        const month = String(nextDay.getMonth() + 1).padStart(2, '0');
        const day = String(nextDay.getDate()).padStart(2, '0');

        days.push(`${year}-${month}-${day}`);
    }

    return days;
}

function getLastWeekdaysOfCurrentMonth() {
    const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0); // Last day of the current month
    const lastWeekdays = getLastWeekdays(lastDayOfMonth);
    return adjustForCurrentWeek(lastWeekdays);
}

function getLastWeekdays(lastDayOfMonth) {
    const weekdays = [];
    let currentDay = lastDayOfMonth;

    // Iterate backward from the last day of the month
    while (weekdays.length < 5 && currentDay.getDate() > 0) {
        const dayOfWeek = currentDay.getDay();
        if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday (1 = Monday, ..., 5 = Friday)
            weekdays.unshift(formatDate(currentDay));
        }
        currentDay.setDate(currentDay.getDate() - 1); // Move to the previous day
    }

    return weekdays;
}

function adjustForCurrentWeek(lastWeekdays) {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 1 = Monday, ..., 5 = Friday

    // If today is in the last week of the month (e.g., Wednesday or later)
    if (dayOfWeek >= 3 && isLastWeek(today)) {
        // Exclude the already passed Monday and Tuesday
        lastWeekdays = lastWeekdays.filter((date) => {
            const dateObj = new Date(date);
            return dateObj.getDay() > 2; // Keep only Wednesday to Friday
        });

        // Add the last Monday and Tuesday of the next month
        const nextMonthLastDay = new Date(today.getFullYear(), today.getMonth() + 2, 0); // Last day of the next month
        const nextMonthLastWeekdays = getLastWeekdays(nextMonthLastDay);
        lastWeekdays.push(nextMonthLastWeekdays[0]); // Monday of next month
        lastWeekdays.push(nextMonthLastWeekdays[1]); // Tuesday of next month
    }

    return lastWeekdays;
}

function isLastWeek(date) {
    const lastDayOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    const daysLeft = lastDayOfMonth.getDate() - date.getDate();
    return daysLeft <= 7; // Less than or equal to one week left
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}



module.exports=getCombinedDates;
// Export the final function
//export default getCombinedDates;//