export default{

methods:{

    checkSidewaysMovementTime() { 
        // Extract hours and minutes from data properties
  
        /// true  = no trade
  
        //false  = trade
        const {  hours, minutes  }   =  this;
        
        // Opening Period: 9:15 AM to 10:00 AM IST
        if ( hours== 9 && minutes >=  15  ) { 
          return false;
         } 
  
        // Mid-Morning Session: 10:00 AM to 11:30 AM IST
        if ( hours== 10 && minutes >=  0 && minutes < 60 ) { 
          return true;
         } 
  
        if ( hours== 11 && minutes >=  30 && minutes < 60 ) { 
          return false;
         } 
  
  
        if ( hours== 12 && minutes >=  0 && minutes < 30 ) { 
          return false;
         } 
  
      
  
        // Post-Lunch Session: 1:00 PM to 2:30 PM IST
        if ( hours== 13 && minutes >=  0 && minutes < 60 ) { 
          return true;
         } 
  
        // Closing Period: 2:30 PM to 3:30 PM IST
        if ( hours== 14 && minutes >=  30 && minutes < 60 ) { 
          return false;
         } 
  
  
        if ( hours== 15 && minutes >=  0 && minutes < 30 ) { 
          return false;
         } 
  
        // If none of the above conditions are met, consider it as sideways movement time
        return true;
       } ,
}

}