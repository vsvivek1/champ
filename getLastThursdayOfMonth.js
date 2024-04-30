let moment = require('moment');

function getLastThursdayOfMonth(date = moment()) {
	// Get the last day of the month
	const lastDayOfMonth = date.endOf('month');

	// Find the last Thursday of the month
	let lastThursday = lastDayOfMonth.clone().startOf('day').subtract(1, 'day');
	while (lastThursday.day() !== 4) {
		lastThursday.subtract(1, 'day');
	}

	// Check if the last Thursday falls on a holiday
	const holidays = [
		'2022-01-26',
		'2022-03-01',
		'2022-03-18',
		'2022-04-14',
		'2022-04-15',
		'2022-05-03',
		'2022-08-09',
		'2022-08-15',
		'2022-08-31',
		'2022-10-05',
		'2022-10-24',
		'2022-10-26',
		'2022-11-08',
		'2023-01-26',
		'2023-03-07',
		'2023-03-30',
		'2023-04-04',
		'2023-04-07',
		'2023-04-14',
		'2023-04-21',
		'2023-05-01',
		'2023-06-28',
		'2023-08-15',
		'2023-09-19',
		'2023-10-02',
		'2023-10-24',
		'2023-11-14',
		'2023-11-27',
		'2023-12-25'
	];

	if (holidays.includes(lastThursday.format('YYYY-MM-DD'))) {
		// If the last Thursday falls on a holiday, get the previous day
		lastThursday.subtract(1, 'day');
	}

	// Check if there are less than 14 days to the last Thursday
	if (lastDayOfMonth.diff(lastThursday, 'days') < 14) {
		// If there are less than 14 days, get the last Thursday of the next month
		const nextMonth = date.add(1, 'month');
		return getLastThursdayOfMonth(nextMonth);
	}

	// Return the last Thursday and the holidays array
	return { lastThursday: lastThursday.format('YYYY-MM-DD'), holidays };
}

exports.getLastThursdayOfMonth = getLastThursdayOfMonth;