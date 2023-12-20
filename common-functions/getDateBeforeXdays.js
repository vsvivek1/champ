export getDateBeforeXdays(days,includingHolidays=false)

var holidays = [
    '2022-01-26', // Republic Day
    '2022-03-02', // Mahashivratri
    '2022-03-18', // Holi
    '2022-04-14', // Dr. Baba Saheb Ambedkar Jayanti/Mahavir Jayanti
    '2022-04-15', // Good Friday
    '2022-05-03', // Id-Ul-Fitr (Ramzan ID)
    '2022-08-09', // Moharram
    '2022-08-15', // Independence Day
    '2022-08-31', // Ganesh Chaturthi
    '2022-10-05', // Dussehra
    '2022-10-24', // Diwali-Laxmi Pujan
    '2022-10-26', // Diwali-Balipratipada
    '2022-11-08', // Gurunanak Jayanti
    '2023-01-26', // Republic Day
    '2023-03-07', // Holi
    '2023-03-30', // Ram Navami
    '2023-04-04', // Mahavir Jayanti
    '2023-04-07', // Good Friday
    '2023-04-14', // Dr. Baba Saheb Ambedkar Jayanti
    '2023-04-21', // Id-ul-fitr (Ramzan Id)
    '2023-05-01', // Maharashtra Day
    '2023-06-28', // Id-ul-adha (Bakri Id)
    '2023-08-15', // Independence Day
    '2023-09-19', // Ganesh Chaturthi
    '2023-10-02', // Mahatma Gandhi Jayanti
    '2023-10-24', // Dussehra
    '2023-11-14', // Diwali Balipratipada
    '2023-11-27', // Gurunanak Jayanti
    '2023-12-25'  // Christmas
  ];
  var moment = require('moment');

// Get today's date
var today = moment();

// Counter to keep track of days
var counter = 0;

// Array of holidays

// Loop until we reach 210 days, excluding weekends and holidays
while (counter < 210) {
  // Subtract 1 day from today
  today.subtract(1, 'day');

  // Check if the day is not a weekend or holiday


  if (today.day() !==  0 && today.day() !==  6 && 
  
  !holidays.includes(today.format('YYYY-MM-DD')
  
  
  
  )) {
    counter++;
  }
}

// Format the date as desired
var result = today.format('YYYY-MM-DD');

console.log(result);
