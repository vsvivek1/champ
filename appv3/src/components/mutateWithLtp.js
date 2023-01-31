mutateWithLtp(s) {
  console.log(s);
  this.heartBeatAndCurrentCheckDigit();

  if (this.hasStartedGetOrders || this.hasStartedGetLivePositions || this.refreshingTradeStatus) {
    return false;
  }

  for (let i = 0; i < s.length; i++) {
    const element = s[i];
    let last_price = this.setLastPriceBasedOnTradeDirection(CurrentInstrument, element) || 0;
    let instrument_token = element.instrument_token;
    let CurrentInstrument = this.instruments.find(i => i.instrument_token === instrument_token);

    if (!CurrentInstrument) {
      return false;
    }

    this.setPreviousPriceAndLastPrice(instrument_token, last_price);

    if (this.proxyTrade) {
      this.proxyTradeExitProcedure(CurrentInstrument);
      let pp1 = this.proxyPositions.find(k => k.squaredOff === false && k.instrument.instrument_token === CurrentInstrument.instrument_token);

      if (pp1) {
        pp1.last_price = last_price;
        return;
      }

      if (CurrentInstrument.previousPrice < CurrentInstrument.pricePoints.d2.high && last_price >= CurrentInstrument.pricePoints.d2.high) {
        this.proxyPositions.push({
          instrument: CurrentInstrument,
          entryType: "buy",
          entryPrice: CurrentInstrument.pricePoints.d2.high,
          squaredOff: false,
          exitPrice: 0,
          exitType: 'NOT EXITED',
          last_price: 0,
          profit: 0
        });
      }

      return;
    }

    if
