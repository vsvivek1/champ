const { getHolidays } = require("./getHolidays");

// Function to check if a given date is a holiday
function isHoliday(date, holidays) {
  const formattedDate = date.toISOString().split('T')[0];
  return holidays.includes(formattedDate);
}

// Function to find the next available weekday (Wed, Tue, Mon, etc.) considering holidays
function findNextAvailableWeekday(date, holidays, targetWeekday) {
  const clonedDate = new Date(date);

  while (true) {
    clonedDate.setDate(clonedDate.getDate() + 1); // Move to the next day

    if (clonedDate.getDay() === targetWeekday && !isHoliday(clonedDate, holidays)) {
      return clonedDate;
    }
  }
}

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Month starts from 0
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getNextThursday() {

  let holidays=getHolidays();
  const today = new Date();
  const dayOfWeek = today.getDay(); // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)

  if (dayOfWeek === 4) { // If today is Thursday (Thursday = 4)
    return formatDate(today); // Return today's date if it's Thursday
  } else {
    const daysUntilThursday = (4 - dayOfWeek + 7) % 7; // Calculate the number of days until next Thursday
    const nextThursday = new Date(today);

    nextThursday.setDate(today.getDate() + daysUntilThursday); // Set the date to the next Thursday
var nextWednesdayForBank=nextThursday.setDate(today.getDate() -1);
    
if (isHoliday(nextThursday, holidays)) {
      // If next Thursday is a holiday, find the next available non-holiday date (Wednesday)
      const nifty = findNextAvailableWeekday(nextThursday, holidays, 3); // Wednesday = 3
      const bankNifty = findNextAvailableWeekday(nextThursday, holidays, 3);
      
      let ob={};
      ob.nifty=formatDate(nextThursday);

      
      ob.bankNifty=formatDate(nextWednesdayForBank)
      // return {nifty,bankNifty}
      // Wednesday = 3
      // const nifty = findNextAvailableWeekday(nextThursday, holidays, 3); // Wednesday = 3
      // return formatDate(nextWednesday);
    } else {

      let ob={};
      ob.nifty=formatDate(nextThursday);
      ob.bankNifty=formatDate(nextWednesdayForBank)

      console.log({ob})
      return ob // Return the date of next Thursday
    }
  }
}

// Example list of holidays (in YYYY-MM-DD format)
// const holidayList = ['2023-11-09', '2023-11-16', '2023-11-23']; // Add your holiday dates here




// const result = getNextThursday(holidayList);
// console.log(result);

exports.getNextThursday = getNextThursday;
