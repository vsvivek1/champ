function getScriptsExpiringBeforeNextThursday(jsonArray) {
   const today = new Date();
   const nextThursday = new Date(today.getTime() + (7 - today.getDay() + 4) % 7 * 24 * 60 * 60 * 1000); // Calculate next Thursday

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


  


   tommorow.setDate(today.getDate());

   

   let tm=tommorow.toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
   
      hour12: false,
      timeZone: 'Asia/Kolkata' // Indian time zone
    }).replace(/\//g, '-').split('-').reverse().join('-');

   
   // console.log(tm);
  // Calculate next Thursday

   return jsonArray.filter(item => {
      if (item.expiry) {
         const expiryDate = item.expiry;

         //console.log(item.expiry)
       //  const expiryDate = new Date(item.expiry);
         return expiryDate ==tm;
      }
      return false;
   });
}
exports.getScriptsExpiringBeforeNextThursday = getScriptsExpiringBeforeNextThursday;
exports.getScriptsExpiringToday= getScriptsExpiringToday;
