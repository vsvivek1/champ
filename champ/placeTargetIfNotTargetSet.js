export async function placeTargetIfNotTargetSet(cis1,kite) {
    try {

     // console.warn('placeTargetIfNotTargetSet')
      const positionsResponse = await kite.getPositions()
      const orders = await kite.getOrders();
      const positions = positionsResponse.net;
  
      for (const pos of positions) {


let cis=global.allInstruments.find(i=>i.tradingsymbol==pos.tradingsymbol);

//console.log(cis,cis.name,global.instrumentName!=cis.name,'ceheck now');

if(global.instrumentName!=cis.name) continue;

   
        
        // console.log('PLACING',global.seconds%25,global.seconds)
        // return;

        const qty = pos.quantity;
        if (qty === 0) continue; // Skip closed positions
  
        const isLong = qty > 0;
        const absQty = Math.abs(qty);
        const exitTxn = isLong ? 'SELL' : 'BUY';
        const entryTxn = isLong ? 'BUY' : 'SELL';
  
        // Step 1: Find the last completed entry order
        const entryOrders = orders.filter(order =>
          order.tradingsymbol === pos.tradingsymbol &&
          order.product === pos.product &&
          order.exchange === pos.exchange &&
          order.transaction_type === entryTxn &&
          order.status === 'COMPLETE'
        );
  
        if (entryOrders.length === 0) {
          console.warn(`⚠️ No completed ${entryTxn} order found for ${pos.tradingsymbol}`);
          continue;
        }
  
        const latestEntryOrder = entryOrders.reduce((latest, order) =>
          new Date(order.order_timestamp) > new Date(latest.order_timestamp) ? order : latest
        );
  
        const entryPrice = parseFloat(latestEntryOrder.average_price);
        const targetDelta = parseFloat(global.targetPoints);
  
        if (isNaN(entryPrice) || entryPrice <= 0 || isNaN(targetDelta)) {
          console.warn(`⚠️ Skipping ${pos.tradingsymbol} due to invalid entry price or global.targetPrice latestEntryOrder is ${latestEntryOrder}`,

            latestEntryOrder

          );
          continue;
        }
  
        const rawTarget = isLong ? entryPrice + targetDelta : entryPrice - targetDelta;
     var targetPrice = parseFloat(rawTarget.toFixed(2));
  
        if (isNaN(targetPrice) || targetPrice <= 0) {
          console.warn(`⚠️ Skipping ${pos.tradingsymbol} due to invalid calculated target price`);
          continue;
        }
  
        // Step 2: Check if reverse order at target already placed

        
        const reverseOrderExists = global.orders.some(order =>{
//console.log('pos.tradingsymbol',pos.tradingsymbol,order.tradingsymbol )

          return order.tradingsymbol === pos.tradingsymbol &&
          order.product === pos.product &&
          order.exchange === pos.exchange &&
          order.transaction_type === exitTxn &&
          order.quantity === absQty &&
          order.status == 'OPEN'
        }
          
          
        
        );


  
        if (reverseOrderExists) {
         console.log(`[SKIPPED] Target order already exists for ${pos.tradingsymbol} at ${targetPrice}`,orders.tradingsymbol === pos.tradingsymbol &&
          orders.product === pos.product &&
          orders.exchange === pos.exchange &&
          orders.transaction_type === exitTxn &&
          orders.quantity === absQty &&
          orders.status == 'OPEN');

          continue;
       
        }
  

        if(qty <0) targetPrice=entryPrice-5
        if(qty >0) targetPrice=entryPrice+5
    
        // Step 3: Place LIMIT order at target price
        console.log(`[PLACING TARGET] ${exitTxn} ${absQty} of ${pos.tradingsymbol} at ${targetPrice}`);

        //cis.placeTargetIfNotTargetSet=true;
  
        await kite.placeOrder("regular", {
          exchange: pos.exchange,
          tradingsymbol: pos.tradingsymbol,
          transaction_type: exitTxn,
          quantity: absQty,
          order_type: "LIMIT",
          price: global.toOneDecimal(targetPrice),
          product: pos.product,
          validity: "DAY"
        });
      }
    } catch (err) {
      console.error("❌ Error in placeTargetIfNotTargetSet:", err);
    }
  }
  
  //module.exports = { placeTargetIfNotTargetSet };
  