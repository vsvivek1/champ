let pnlFile = require( './pnl-DV3463-june 29.json' );


// p =>p.Realized_P_L>0 && p =>p.Realized_P_L<= 0 
let profitShares = pnlFile.filter( p =>p.Open_Quantity_Type!= null )
let losetShares = pnlFile.filter( p =>p.Open_Quantity_Type!= null )

console.log( profitShares.length,'won' )
console.log( losetShares.length
    ,'lost' )

