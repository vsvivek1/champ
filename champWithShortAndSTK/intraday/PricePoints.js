import KiteConnect from "kiteconnect";
import moment from "moment";
import fs from "fs";
import path from "path";

const FILE_LOCATION = "./appv3/src/assets/instruments";
const instruAll = JSON.parse(
  fs.readFileSync(path.join(FILE_LOCATION, "instrumentsAll.json"), "utf8")
);

const api_key_final = "wkcurst2vu5obug7";

export default class PricePoint {
  constructor(stockToken, accessToken) {
    this.counter = 0;
    this.stockToken = stockToken;
    this.accessToken = accessToken;
    this.pricePointData = [];
    this.kcInstance = null; // Renamed kc2 to make it more descriptive
    this.previousMaxIndex = 0;
    this.previousMinIndex = 0;

    this.initializeKiteConnect();
  }

  async initializeKiteConnect() {
    try {
      this.kcInstance = await this.createKiteConnectInstance();
    } catch (error) {
      console.error("Error initializing Kite Connect:", error);
    }
  }

  async createKiteConnectInstance() {
    try {
      const today = moment().format("Y-MM-DD");
      const AccessToken = await import("./models/AccessTokens.js");
      const tokenRecord = await AccessToken.default.findOne(
        { date: today },
        "access_token"
      );

      if (!tokenRecord || !tokenRecord.access_token) {
        throw new Error("Access token not found for today.");
      }

      const access_token = tokenRecord.access_token;
      this.accessToken = access_token;

      return new KiteConnect({
        api_key: api_key_final,
        access_token,
      });
    } catch (error) {
      throw new Error("Error creating Kite Connect instance: " + error.message);
    }
  }

  // Replaced `dateBeforeXdays` with a corrected implementation
  calculateDateBeforeXDays(daysToSubtract) {
    const date = new Date();
    date.setDate(date.getDate() - daysToSubtract);
    return date.toISOString().split("T")[0];
  }

  // Addressed global variables issue by using class properties
  getXMonthMaximum(data, months) {
    try {
      const monthIndex = (months - 1) * 31;
      const relevantData = data.slice(this.previousMaxIndex, monthIndex);

      if (!relevantData.length) {
        throw new Error("No data available for the specified month range.");
      }

      const maxHigh = Math.max(...relevantData.map((item) => item.high));
      const maxData = relevantData.find((item) => item.high == maxHigh);

      this.previousMaxIndex = monthIndex;
      return maxData || {};
    } catch (error) {
      console.error("Error in getXMonthMaximum:", error.message);
      return {};
    }
  }

  getXMonthMinimum(data, months) {
    try {
      const monthIndex = (months - 1) * 31;
      const relevantData = data.slice(this.previousMinIndex, monthIndex);

      if (!relevantData.length) {
        throw new Error("No data available for the specified month range.");
      }

      const minLow = Math.min(...relevantData.map((item) => item.low));
      const minData = relevantData.find((item) => item.low == minLow);

      this.previousMinIndex = monthIndex;
      return minData || {};
    } catch (error) {
      console.error("Error in getXMonthMinimum:", error.message);
      return {};
    }
  }

  // Fixed inefficient sorting by ensuring it's performed only once where necessary
  async fetchHistoricalData(durationType, duration) {
    try {
      const startDay =
        durationType == "month"
          ? this.calculateDateBeforeXDays(duration * 30)
          : this.calculateDateBeforeXDays(duration);

      const historicalData = await this.kcInstance.getHistoricalData(
        this.stockToken,
        "day",
        startDay,
        moment().format("Y-MM-DD"),
        false
      );

      if (!historicalData.length) {
        throw new Error("No historical data retrieved.");
      }

      // Perform sorting only once
      return historicalData.sort((a, b) => new Date(a.date) - new Date(b.date));
    } catch (error) {
      console.error("Error fetching historical data:", error.message);
      return [];
    }
  }

  // Fixed mixed Promises and async/await issue in `getPricePoints`
  async getPricePoints(duration = 34, durationType = "month") {
    try {
      const sortedData = await this.fetchHistoricalData(durationType, duration);

      if (!sortedData.length) {
        throw new Error("Sorted data is empty.");
      }

      const today = moment().startOf("day").format("YYYY-MM-DDTHH:mm:ss.SSSZ");
      const recentData = this.getRecentDaysData(sortedData, today);

      const pivotPoints = this.calculatePivotPoints(recentData.yesterdayData);

      return {
        recentData,
        pivotPoints,
        sortedData,
      };
    } catch (error) {
      console.error("Error in getPricePoints:", error.message);
      return {};
    }
  }

  // Refactored function with descriptive naming
  getRecentDaysData(data, currentDate) {
    if (!Array.isArray(data) || data.length == 0) {
      throw new Error("Data array is invalid or empty.");
    }

    const recentData = data.filter((item) =>
      moment(item.date).isBefore(currentDate)
    );

    if (recentData.length < 7) {
      throw new Error("Not enough data points for the last 7 days.");
    }

    const [d7, d6, d5, d4, d3, d2, d1] = recentData.slice(-7);

    return {
      d7,
      d6,
      d5,
      d4,
      d3,
      d2,
      d1,
      yesterdayData: d1,
    };
  }

  calculatePivotPoints(data) {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid data for pivot point calculation.");
    }

    const { high, low, close } = data;
    const pivotPoint = (high + low + close) / 3;

    return {
      r1: 2 * pivotPoint - low,
      s1: 2 * pivotPoint - high,
      r2: pivotPoint + (high - low),
      s2: pivotPoint - (high - low),
      pivotPoint,
    };
  }

  // Refactored to avoid hardcoded holiday list
  static loadHolidays() {
    try {
      const holidaysPath = path.join(FILE_LOCATION, "holidays.json");
      if (fs.existsSync(holidaysPath)) {
        return JSON.parse(fs.readFileSync(holidaysPath, "utf8"));
      } else {
        throw new Error("Holidays file not found.");
      }
    } catch (error) {
      console.error("Error loading holidays:", error.message);
      return [];
    }
  }
}
