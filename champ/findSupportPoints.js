 /**
* Function to find the lowest n/6 support points and rejected points based on shooting star or hammer patterns
* @param {Array} minuteData - Array of objects with OHLC data (open, high, low, close).
* @returns {Object} - Object containing two arrays: `supportPoints` and `rejectedPoints`.
*/
export function findSupportPoints(minuteData) {
   return; //support point buying diabled
   const totalRecords = minuteData.length;
   
   // Determine the number of lowest points to select (n/6)
   const numSupportPoints = Math.floor(totalRecords / 90);
   
   // Sort the minuteData based on the 'Low' value (ascending order)
   const sortedData = [...minuteData].sort((a, b) => a.low - b.low);
   
   // Select the n/6 lowest points as support points
   const supportPoints = sortedData.slice(0, numSupportPoints).map(i=>i.low);
   
   // Remaining points will be checked for shooting star or hammer patterns
   const remainingPoints = sortedData.slice(numSupportPoints);
   
  // const rejectedPoints1 = remainingPoints.filter(isShootingStar).map(r=>r.high);
   const rejectedPoints2 = remainingPoints.filter(isHammer).map(r=>r.low);

   //rejectedPoints1
   let ret=supportPoints.concat( rejectedPoints2);

   return ret;
   
   return {
       supportPoints,
       rejectedPoints1,
       rejectedPoints2
   };
}

/**
* Helper function to check if a point is a shooting star or hammer based on OHLC data
* @param {Object} point - Object containing OHLC data (open, high, low, close).
* @returns {boolean} - True if the point is a shooting star or hammer pattern.
*/
function isShootingStar(point) {
   const bodySize = Math.abs(point.close - point.open);
   const upperShadow = point.high - Math.max(point.open, point.close);
   const lowerShadow = Math.min(point.open, point.close) - point.low;

   // Criteria for hammer: small body, long lower shadow, little/no upper shadow
   const isHammer = lowerShadow >= 2 * bodySize && upperShadow <= bodySize * 0.5;
   
   // Criteria for shooting star: small body, long upper shadow, little/no lower shadow
   const isShootingStar = upperShadow >= 2 * bodySize && lowerShadow <= bodySize * 0.5;
   


   return isShootingStar;
}

function isHammer(point) {
    const bodySize = Math.abs(point.close - point.open);
    const upperShadow = point.high - Math.max(point.open, point.close);
    const lowerShadow = Math.min(point.open, point.close) - point.low;
 
    // Criteria for hammer: small body, long lower shadow, little/no upper shadow
    const isHammer = lowerShadow >= 2 * bodySize && upperShadow <= bodySize * 0.5;
    
    // Criteria for shooting star: small body, long upper shadow, little/no lower shadow
    const isShootingStar = upperShadow >= 2 * bodySize && lowerShadow <= bodySize * 0.5;
    
 
 return false;
    return isHammer ;
 }

// Example usage:
// Assuming cis.minuteData is an array of OHLC objects

