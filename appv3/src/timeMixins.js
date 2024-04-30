export default{


    methods:{
        isAfterMarketHours() {
            const now = new Date();
            const currentDay = now.getDay(); // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
            const currentTime = now.getHours() * 100 + now.getMinutes(); // Convert current time to a comparable number (HHMM format)
          
            const isWeekend = currentDay === 0 || currentDay === 6; // Sunday or Saturday
            const isSpecialTime = currentTime > 330 || currentTime < 915; // After 3:30 PM or before 9:15 AM
          
            // List of holidays in "YYYY-MM-DD" format
            const holidays = [
              "2024-01-01",
              "2024-05-27",
              // Add more holidays as needed
            ];
          
            const formattedDate = now.toISOString().split('T')[0];
            const isHoliday = holidays.includes(formattedDate); // Check if today is a holiday
          
            return isWeekend || isSpecialTime || isHoliday;
          },
          
          getRequiredTime( h,m ) { 
                  const today  =  new Date(  ); // Current date
                
                //   console.log( today );
                  const dayOfWeek  =  today.getDay(  ); // Get current day of the week ( 0 - Sunday, 6 - Saturday )
                
                  // Calculate the difference between today and last Friday
                  const daysDiff  =  ( dayOfWeek + 7 - 5 ) % 7; // 5 represents Friday
                
                  // Calculate the date of last Friday
                 const lastFriday  =  new Date( today + daysDiff );
                //   lastFriday.setDate( today.getDate(  ) - daysDiff );
                
                  // Set the time to 9:15 AM
                  lastFriday.setHours( h );
                  lastFriday.setMinutes( m );
                  lastFriday.setSeconds( 0 );
                
                  // Format the date in YYYY-MM-DD hh:MM:SS
                
                
                const options  =  { 
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  timeZone: 'Asia/Kolkata' // Set the timezone to Indian Standard Time ( IST )
                 } ;
                
                // console.log( lastFriday );
                
                
                const date  =  new Date( lastFriday );
                
                const year  =  date.getFullYear(  );
                const month  =  String( date.getMonth(  ) + 1 ).padStart( 2, '0' ); // Month is zero-indexed
                const day  =  String( date.getDate(  )).padStart( 2, '0' );
                const hours  =  String( date.getHours(  )).padStart( 2, '0' );
                const minutes  =  String( date.getMinutes(  )).padStart( 2, '0' );
                const seconds  =  String( date.getSeconds(  )).padStart( 2, '0' );
                
                const formattedDateTime  =  `${ year }-${ month }-${ day } ${ hours }:${ minutes }:${ seconds } `;
                // console.log( formattedDateTime );
                
                // const formattedDateTime  =  lastFriday.toLocaleString( 'en-IN', options ).replace( /\//g, '-' ).replace( /\,/g, '' );
                return formattedDateTime
                 } ,
      
          getOneMinuteData(){ 
      
            return;
      let intervel = 'minute';
            // this.getHistoricalDataForCustomDuration( intervel )
      
            console.log(this.instrumentTokens);
      
      
            // this.initiateHistoricalDataFetch(this.instrumentTokens)
           } ,


    }
}