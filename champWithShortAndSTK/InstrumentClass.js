import fs from 'fs'

export class Instrument {
  constructor(identifier) {
    const instrumentsData = JSON.parse(fs.readFileSync('../appv3/public/instruments/instrumentsAll.json', 'utf-8'));
    
    const instrument = instrumentsData.find(
      (inst) => inst.tradingsymbol == identifier || inst.instrument_token == identifier
    );

    if (!instrument) {
console.log(instrumentsData.length,'instrumentsDatalength')

      throw new Error(`Instrument with identifier ${identifier} not found.`);
    }

    this.instrumentToken = instrument.instrument_token;
    this.exchangeToken = instrument.exchange_token;
    this.tradingSymbol = instrument.tradingsymbol;
    this.name = instrument.name;
    this.lastPrice = instrument.last_price;
    this.expiry = instrument.expiry;
    this.strike = instrument.strike;
    this.tickSize = instrument.tick_size;
    this.lotSize = instrument.lot_size;
    this.instrumentType = instrument.instrument_type;
    this.segment = instrument.segment;
    this.exchange = instrument.exchange;
    this.pricePoints = instrument.pricePoints;
    this.sevenDayMaxMin = instrument.SevenDayMaxMin;
    this.chart = instrument.chart;
    this.selectedBuyingMethod = instrument.selectedBuyingMethod;
    this.buyNow = instrument.buyNow;
    this.noTradingNow = instrument.noTradingNow;
    this.canTakeFreshTrade = instrument.canTakeFreshTrade;
    this.hasStartedGetOrders = instrument.hasStartedGetOrders;
    this.hasStartedGetLivePositions = instrument.hasStartedGetLivePositions;
    this.refreshingTradeStatus = instrument.refreshingTradeStatus;
    this.hasLiveTarget = instrument.hasLiveTarget;
    this.hasLivePosition = instrument.hasLivePosition;
    this.hasLiveOrder = instrument.hasLiveOrder;
  }

  // Getters
  getInstrumentToken() {
    return this.instrumentToken;
  }

  getExchangeToken() {
    return this.exchangeToken;
  }

  getTradingSymbol() {
    return this.tradingSymbol;
  }

  getName() {
    return this.name;
  }

  getLastPrice() {
    return this.lastPrice;
  }

  getExpiry() {
    return this.expiry;
  }

  getStrike() {
    return this.strike;
  }

  getTickSize() {
    return this.tickSize;
  }

  getLotSize() {
    return this.lotSize;
  }

  getInstrumentType() {
    return this.instrumentType;
  }

  getSegment() {
    return this.segment;
  }

  getExchange() {
    return this.exchange;
  }

  getPricePoints() {
    return this.pricePoints;
  }

  getSevenDayMaxMin() {
    return this.sevenDayMaxMin;
  }

  getChart() {
    return this.chart;
  }

  getSelectedBuyingMethod() {
    return this.selectedBuyingMethod;
  }

  getBuyNow() {
    return this.buyNow;
  }

  getNoTradingNow() {
    return this.noTradingNow;
  }

  getCanTakeFreshTrade() {
    return this.canTakeFreshTrade;
  }

  getHasStartedGetOrders() {
    return this.hasStartedGetOrders;
  }

  getHasStartedGetLivePositions() {
    return this.hasStartedGetLivePositions;
  }

  getRefreshingTradeStatus() {
    return this.refreshingTradeStatus;
  }

  getHasLiveTarget() {
    return this.hasLiveTarget;
  }

  getHasLivePosition() {
    return this.hasLivePosition;
  }

  getHasLiveOrder() {
    return this.hasLiveOrder;
  }

  // Setters
  setInstrumentToken(value) {
    this.instrumentToken = value;
  }

  setExchangeToken(value) {
    this.exchangeToken = value;
  }

  setTradingSymbol(value) {
    this.tradingSymbol = value;
  }

  setName(value) {
    this.name = value;
  }

  setLastPrice(value) {
    this.lastPrice = value;
  }

  setExpiry(value) {
    this.expiry = value;
  }

  setStrike(value) {
    this.strike = value;
  }

  setTickSize(value) {
    this.tickSize = value;
  }

  setLotSize(value) {
    this.lotSize = value;
  }

  setInstrumentType(value) {
    this.instrumentType = value;
  }

  setSegment(value) {
    this.segment = value;
  }

  setExchange(value) {
    this.exchange = value;
  }

  setPricePoints(value) {
    this.pricePoints = value;
  }

  setSevenDayMaxMin(value) {
    this.sevenDayMaxMin = value;
  }

  setChart(value) {
    this.chart = value;
  }

  setSelectedBuyingMethod(value) {
    this.selectedBuyingMethod = value;
  }

  setBuyNow(value) {
    this.buyNow = value;
  }

  setNoTradingNow(value) {
    this.noTradingNow = value;
  }

  setCanTakeFreshTrade(value) {
    this.canTakeFreshTrade = value;
  }

  setHasStartedGetOrders(value) {
    this.hasStartedGetOrders = value;
  }

  setHasStartedGetLivePositions(value) {
    this.hasStartedGetLivePositions = value;
  }

  setRefreshingTradeStatus(value) {
    this.refreshingTradeStatus = value;
  }

  setHasLiveTarget(value) {
    this.hasLiveTarget = value;
  }

  setHasLivePosition(value) {
    this.hasLivePosition = value;
  }

  setHasLiveOrder(value) {
    this.hasLiveOrder = value;
  }
}


