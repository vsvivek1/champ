// Assuming this is in a file like gttComponent.js

import axios from "axios";
import { io } from "socket.io-client";
// import PlaceGttOrderForThisPrice from './PlaceGttOrderForThisPrice';

const socket = io("http://localhost:4000");

export const getPercentage = (stockPpItem, level) => {
  try {
    return (
      ((stockPpItem.pricePoints.yesterday.close - level) *
        -100 / stockPpItem.pricePoints.yesterday.close).toFixed(0)
    );
  } catch (e) {
    return e;
  }
};

export const getGTTS = async (accessToken) => {
  try {
    const ob = { accessToken };
    const url = "/api/getGTTs";
    const response = await axios.post(url, ob);
    return response.data;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const deleteGTT = async (trigger_id, accessToken) => {
  try {
    axios.defaults.headers.common = { 'Authorization': `bearer ${accessToken} ` };
    const url = `/api/deleteGTT/${trigger_id}`;
    const response = await axios.delete(url);
    console.log(response, 'gtt has been deleted');
  } catch (error) {
    console.error(error);
  }
};

export const mutateWithLtp = (s, stocksPricePoints) => {
  s.forEach(s1 => {
    const instrument_token = s1.instrument_token;
    const stock = stocksPricePoints.find(sp => sp.instrument_token == instrument_token);
    if (stock) {
      stock.last_price = s1.last_price;
    }
  });
};

export const startSockets = (instrumentTokens, mutateWithLtp, setCurrentTick) => {
  socket.emit("subscribe-GTT", JSON.stringify(instrumentTokens));

  socket.on("send-GTT", (s) => {
    mutateWithLtp(s);
    setCurrentTick(s);
  });
};

export const getLevels = (stockPpItem) => {
  const ar = stockPpItem.pricePoints.pricePoints;

  if (
    !stockPpItem.pricePoints ||
    !stockPpItem.pricePoints.d1 ||
    typeof stockPpItem.pricePoints.d1.close == 'undefined'
  ) {
    return false;
  }

  const refPrice = stockPpItem.pricePoints.d1.close;

  return ar.map(r => r.high || r.level)
    .sort((a, b) => a - b)
    .map((r, index, ar) => {
      if (typeof ar[index + 1] == 'undefined') {
        const ob = { level: r, support: false };
        return ob;
      } else {
        if (ar[index - 1] <= refPrice && ar[index + 1] >= refPrice && ar[index] <= refPrice) {
          const ob = { level: r, support: true };
          return ob;
        } else {
          const ob = { level: r, support: false };
          return ob;
        }
      }
    });
};

export const getStockPricePoints = async (accessToken) => {
  try {
    const url = "/api/GTT";
    const ob = { accessToken };
    const response = await axios.post(url, ob);
    const stocksPricePoints = response.data;

    stocksPricePoints.forEach(r1 => {
      const supportLevels = getLevels(r1);
      r1.supportLevels = supportLevels;
    });

    return stocksPricePoints;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const getCurrentGttList = () => {
  return [];
};

export const getCurrentTick = () => {
  return [];
};

export const getStocksPricePointsFiltered = (stocksPricePoints) => {
  return stocksPricePoints.filter(r => {
    try {
      return r.pricePoints.pricePoints.length !== 0;
    } catch (error) {
      return false;
    }
  });
};

export const getUpperShadowGreaterThanBody = (stocksPricePoints) => {
  return stocksPricePoints.filter(r => {
    try {
      return r.otherCriteria.upperShadow > r.otherCriteria.body;
    } catch (error) {
      return false;
    }
  }).length;
};

export const getReds = (stocksPricePoints) => {
  return stocksPricePoints.filter(r => {
    try {
      return r.otherCriteria.candleColor == 'red';
    } catch (error) {
      return false;
    }
  }).length;
};

export const getGreens = (stocksPricePoints) => {
  return stocksPricePoints.filter(r => {
    try {
      return r.otherCriteria.candleColor == 'green';
    } catch (error) {
      return false;
    }
  }).length;
};

export const getGttAmountPerManualOrder = {
  data() {
    return { gttAmountPerManualOrder: 100000 };
  }
};

export const getStockPricePointsLoader = {
  data() {
    return { getStockPricePointsLoader: false };
  }
};
