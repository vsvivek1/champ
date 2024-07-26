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
