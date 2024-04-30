export default{

methods:{


    calculateTargetPoint(entryPrice, transaction_type, 
        cis, upper_circuit_limit, lower_circuit_limit, overnight_quantity=0) {
        let targetPoint = null;

        //debugger;
    
        if (transaction_type === "SELL" && entryPrice > 0 && overnight_quantity == 0) {
           // debugger;
            console.log('return ainside target point sell')
            switch (true) {
                case (entryPrice < cis.pricePoints.d1.low):
                    targetPoint = cis.pricePoints.d1.low;
                    break;
                case (entryPrice < Math.min(cis.pricePoints.d1.open, cis.pricePoints.d1.close)):
                    targetPoint = Math.min(cis.pricePoints.d1.open, cis.pricePoints.d1.close);
                    break;
                case (entryPrice < Math.max(cis.pricePoints.d1.open, cis.pricePoints.d1.close)):
                    targetPoint = Math.max(cis.pricePoints.d1.open, cis.pricePoints.d1.close);
                    break;
                case (entryPrice < cis.pricePoints.d1.high):
                    targetPoint = cis.pricePoints.d1.high;
                    break;
                case (entryPrice > cis.pricePoints.d1.high):
                    targetPoint = (cis.pricePoints.d1.high * 1.1).toFixed(1);
                    break;
            }
//debugger;
            return Math.min(targetPoint, upper_circuit_limit - 0.1);
        }
        
        
    /*     else if (transaction_type === "BUY" && entryPrice > 0 && overnight_quantity == 0) {

debuger;
            console.log('return ainside target point buy')
            console.log('return b')
            switch (true) {
                case (entryPrice < cis.pricePoints.d1.low):
                    targetPoint = cis.pricePoints.d1.low;
                    break;
                case (entryPrice < Math.min(cis.pricePoints.d1.open, cis.pricePoints.d1.close)):
                    targetPoint = Math.min(cis.pricePoints.d1.open, cis.pricePoints.d1.close);
                    break;
                case (entryPrice < Math.max(cis.pricePoints.d1.open, cis.pricePoints.d1.close)):
                    targetPoint = Math.max(cis.pricePoints.d1.open, cis.pricePoints.d1.close);
                    break;
                case (entryPrice < cis.pricePoints.d1.high):
                    targetPoint = cis.pricePoints.d1.high;
                    break;
                case (entryPrice > cis.pricePoints.d1.high):
                    targetPoint = (cis.pricePoints.d1.high * 1.1).toFixed(1);
                    break;
            }

            debugger;
            return Math.min(targetPoint, lower_circuit_limit - 0.1);
        } */
    
        
    }
}

}