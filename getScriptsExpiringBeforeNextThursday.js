function getScriptsExpiringBeforeNextThursday(jsonArray) {
   const today = new Date();
   const nextThursday = new Date(today.getTime() + (7 - today.getDay() + 4) % 7 * 24 * 60 * 60 * 1000); // Calculate next Thursday

   console.log('EXPITY',nextThursday)
   return jsonArray.filter(item => {
      if (item.expiry) {
         const expiryDate = new Date(item.expiry);
         return expiryDate < nextThursday;
      }
      return false;
   });
}
function getDatesFromTodayToNextSameDay() {
   const today = new Date();
   today.setHours(0, 0, 0, 0); // Normalize to midnight

   const dates = [];
   const sameDayNextWeek = new Date(today);
   sameDayNextWeek.setDate(today.getDate() + 8); // Calculate the same day next week

   let currentDate = new Date(today);
   while (currentDate < sameDayNextWeek) { // Include the day before next week's same day
       dates.push(currentDate.toISOString().split('T')[0]); // Format as 'YYYY-MM-DD'
       currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
   }

   console.log(dates);
   
   return dates;
}

function getScriptsExpiringBeforeSameDayNextWeek(jsonArray) {

  // console.log(jsonArray)
   const uniqueNames = new Set();

    // Iterate over the array and add each name to the Set
   /*  jsonArray.forEach(item => {
        if (item.name) {
            uniqueNames.add(item.name);
        }
    }); */

//console.log(uniqueNames )
    //process.exit();
   const dateRange = getDatesFromTodayToNextSameDay(); // Generate date range

   // Filter items whose expiry is included in the generated date range
   const filtered = jsonArray.filter(item => {

      //console.log(item.name);
      

       return (dateRange.includes(item.expiry)|| item.expiry=='2024-08-8' || item.expiry=='2024-08-29');
   });

   return filtered;
}

// Function to create an array of dates from today to the day before the same day next week
function generateDatesTillNextSameDay(today) {
   const dates = [];
   const sameDayNextWeek = new Date(today);
   sameDayNextWeek.setDate(today.getDate() + 7); // Calculate the same day next week

   let currentDate = new Date(today);
   while (currentDate < sameDayNextWeek) {
       dates.push(new Date(currentDate)); // Push a copy of the current date
       currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
   }

   return dates;
}

// Example usage




function getScriptsExpiringToday(jsonArray) {
   const today = new Date();
   const tommorow = new Date(); // Calculate next Thursday


  


   tommorow.setDate(today.getDate()+8);

   

   let tm=tommorow.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
   
      hour12: false,
      timeZone: 'Asia/Kolkata' // Indian time zone
    }).replace(/\//g, '-').split('-').reverse().join('-');

   
   // console.log(tm);
  // Calculate next Thursday

  

let filtered= jsonArray.filter(item => {
      if (item.expiry) {


        // return item.expiry=='2024-05-30'
         //const expiryDate = item.expiry;

      //console.log(item.expiry)

     // const nextThursday = new Date(today.getTime() + (14 - today.getDay() + 4) % 7 * 24 * 60 * 60 * 1000); // Calculate next Thursday
      const nextThursday =new Date(getPreviousDayOfNextWeek());
        const expiryDate = new Date(item.expiry);

        expiryDate.setDate(expiryDate.getDate()-1);

        console.log({expiryDate},{nextThursday});
        
        // return expiryDate<=nextThursday;
         return expiryDate<=nextThursday;
      }
      return false;
   });

 /*   console.log(filtered);

   process.exit() */
   return filtered;
}


function getPreviousDayOfNextWeek() {
   const today = new Date();
   const currentDayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
 
   // Calculate the same day next week
   const sameDayNextWeek = new Date(today);
   sameDayNextWeek.setDate(today.getDate() + 8);
 
   // Subtract one day to get the previous day
   const previousDayOfNextWeek = new Date(sameDayNextWeek);
   previousDayOfNextWeek.setDate(sameDayNextWeek.getDate() - 1);
 
   return previousDayOfNextWeek;
 }
exports.getScriptsExpiringBeforeNextThursday = getScriptsExpiringBeforeNextThursday;
exports.getScriptsExpiringToday= getScriptsExpiringToday;
exports.getScriptsExpiringBeforeSameDayNextWeek= getScriptsExpiringBeforeSameDayNextWeek;
