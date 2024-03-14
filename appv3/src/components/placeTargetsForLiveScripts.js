export const placeTargetsForLiveScripts = {
  methods: {
      async placeTargetsForLiveScripts() {
          if (this.placingReverseOrderInProgress) {
              return false;
          }

          this.placingReverseOrderInProgress = true;

          let orders = await this.getOrders();
          let liveOrderInstruments = this.liveOrders.filter(order => order.transaction_type === "SELL").map(order => order.instrument_token);

          await this.getPositions();
          let liveInstrumentSymbols = this.livePositions.map(position => parseInt(position.instrument_token));
          this.liveInstrumentSymbols = liveInstrumentSymbols;

          let quotes = await this.getQuoteFromZerodha(liveInstrumentSymbols);

          let { ReverseOrderPending, noTargetArray } = this.checkReverseOrderTallyAndReturnNoTargetScripts();

          if (!ReverseOrderPending) {
              return false;
          }

          let symbols = this.livePositions.slice();
          let timer = setInterval(() => {
              if (symbols.length === 0) {
                  clearInterval(timer);
                  this.placingReverseOrderInProgress = false;
                  return;
              }

              let symbol = symbols.pop();
              let position = this.livePositions.find(p => p.instrument_token === symbol.instrument_token);

              if (!position) {
                  return false;
              }

              let quote = quotes[symbol.instrument_token];
              let upper_circuit_limit = quote.upper_circuit_limit;
              let lower_circuit_limit = quote.lower_circuit_limit;
              let cis = this.instruments.find(i => i.instrument_token === symbol.instrument_token);

              if (!cis) {
                  this.placingReverseOrderInProgress = false;
                  return false;
              }

              let entryPrice = position.quantity < 0 ? position.sell_price : position.buy_price;
              let transaction_type = position.quantity > 0 ? "SELL" : "BUY";
              let targetPoint = this.calculateTargetPoint(entryPrice, transaction_type, cis, upper_circuit_limit, lower_circuit_limit);

              if (targetPoint === false) {
                  this.placingReverseOrderInProgress = false;
                  return false;
              }

              let livePnl = position.pnl;

              this.placetargetAndStopLoss(
                  cis,
                  symbol.instrument_token,
                  0,
                  symbol.product,
                  Math.abs(position.quantity),
                  targetPoint,
                  livePnl,
                  true,
                  transaction_type
              );

          }, 333);
      },

      calculateTargetPoint(entryPrice, transaction_type, cis, upper_circuit_limit, lower_circuit_limit, overnight_quantity) {
        let targetPoint = null;
    
        if (transaction_type === "SELL" && entryPrice > 0 && overnight_quantity == 0) {
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
        } else if (transaction_type === "BUY" && entryPrice > 0 && overnight_quantity == 0) {
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
        }
    
        return Math.min(targetPoint, upper_circuit_limit - 0.1);
    }
    
  }
};
