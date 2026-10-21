
const AccessToken = require("./models/AccessTokens");
const { KiteConnect } = require("kiteconnect");
const moment = require("moment");



let MarketProtection=5;
let autoslice=true;

const api_key = process.env.api_key;

console.log("API Key:", api_key);
const now = new Date();

const hour = now.getHours();
const minute = now.getMinutes();

const isAMO =
    hour < 9 ||
    (hour === 9 && minute < 15) ||
    hour > 15 ||
    (hour === 15 && minute >= 30);

const variety = isAMO
    ? "amo"
    : "regular";

async function getAccessToken() {

    console.log("Getting access token for date:", moment().format("YYYY-MM-DD"));
    const today = moment().format("YYYY-MM-DD");

    const tokenDoc = await AccessToken.findOne(
        { date: today },
        "access_token"
    );

    if (!tokenDoc?.access_token) {
        throw new Error("Access token not found");
    }

    const kc = new KiteConnect({
        api_key,
        access_token: tokenDoc.access_token
    });

    console.log("Setting access token for KiteConnect",api_key, kc.access_token);
    kc.setAccessToken(tokenDoc.access_token);

    return {
        access_token: tokenDoc.access_token,
        kc:kc
    };
}

// =====================================================
// BUY ORDER
// =====================================================

async function buyOrderHandler(req, res) {
    try {
        const {
            broker,
            symbol,
            exchange,
            qty,
            price,
            triggerPrice,
            orderType
        } = req.body;

        if (broker !== "zerodha") {
            return res.status(400).json({
                ok: false,
                error: "Unsupported broker"
            });
        }

        if (!qty || qty <= 0) {
            return res.status(400).json({
                ok: false,
                error: "Invalid quantity"
            });
        }

        const { kc } = await getAccessToken();

        console.log(kc,'kc');
    MarketProtection=5;
        if((qty > 1000 && exchange=="BFO") || (qty > 1755 && exchange=="NFO")){
        
            autoslice=true;
        }else{
           
            autoslice=false;
        }   
        console.log("MarketProtection:", MarketProtection, "Autoslice:", autoslice);

        const orderParams = {
            exchange:exchange,
            tradingsymbol: symbol,
            transaction_type: kc.TRANSACTION_TYPE_BUY,
            quantity: Number(qty),
            product: kc.PRODUCT_NRML,
            validity: kc.VALIDITY_DAY,
            market_protection:MarketProtection,
            autoslice:autoslice
        };

        if (orderType === "SL") {
            orderParams.order_type = kc.ORDER_TYPE_SL;
            orderParams.price = Number(price);
            orderParams.trigger_price = Number(triggerPrice);
        } else if (orderType === "LIMIT") {
            orderParams.order_type = kc.ORDER_TYPE_LIMIT;
            orderParams.price = Number(price);
        } else {
            orderParams.order_type = kc.ORDER_TYPE_MARKET;
        }


        console.log("Placing Buy Order:", orderParams);

       // KC.VA
        const order = await kc.placeOrder(
            variety,
            orderParams
        );

        return res.json({
            ok: true,
            order
        });

    } catch (err) {
        console.error("Buy Order Error:", err);

        return res.status(500).json({
            ok: false,
            error: err.message
        });
    }
}

// =====================================================
// SELL ORDER
// =====================================================

async function sellOrderHandler(req, res) {
    try {
        const {
            broker,
            symbol,
            exchange ,
            sellQty
        } = req.body;

        if (broker !== "zerodha") {
            return res.status(400).json({
                ok: false,
                error: "Unsupported broker"
            });
        }

        if (!sellQty || sellQty <= 0) {
            return res.status(400).json({
                ok: false,
                error: "Invalid sell quantity"
            });
        }

        const { kc } = await getAccessToken();

        const order = await kc.placeOrder(
            variety,
            {
                exchange:exchange,
                tradingsymbol: symbol,
                transaction_type: kc.TRANSACTION_TYPE_SELL,
                quantity: Number(sellQty),
                product: kc.PRODUCT_NRML,
                order_type: kc.ORDER_TYPE_MARKET,
                validity: kc.VALIDITY_DAY
            }
        );

        return res.json({
            ok: true,
            order
        });

    } catch (err) {
        console.error("Sell Order Error:", err);

        return res.status(500).json({
            ok: false,
            error: err.message
        });
    }
}

// =====================================================
// FIND OPEN ORDER BY SYMBOL
// =====================================================

async function findOpenOrderBySymbol(symbol) {
    const { kc } = await getAccessToken();

    const orders = await kc.getOrders();

    //console.log("All Orders:", orders);

    const candidates = orders.filter(
        order =>
            order.instrument_token == symbol
          &&
        !    ["COMPLETED","REJECTED","CANCELLED"].includes(order.status)



    );

   // console.log("Open Orders for", symbol, ":", candidates);

    if (!candidates.length) {
        return null;
    }

    // candidates.sort(
    //     (a, b) =>
    //         new Date(b.order_timestamp) -
    //         new Date(a.order_timestamp)
    // );

    return candidates;;
}

// =====================================================
// UPDATE ORDER
// =====================================================

async function updateOrderHandler(req, res) {
    try {
        const {
            symbol,
            price,
            triggerPrice,
            isSL
        } = req.body;



        const { kc } = await getAccessToken();

        const openOrder =
            await findOpenOrderBySymbol(symbol);

        if (!openOrder) {
            return res.status(404).json({
                ok: false,
                error: "No open order found"
            });
        }

        const modifyParams = {
            quantity: openOrder.quantity,
            validity: kc.VALIDITY_DAY
        };

        if (isSL) {
            modifyParams.order_type =
                kc.ORDER_TYPE_SL;

            modifyParams.price =
                Number(price);

            modifyParams.trigger_price =
                Number(triggerPrice);
        } else {
            modifyParams.order_type =
                kc.ORDER_TYPE_LIMIT;

            modifyParams.price =
                Number(price);
        }

        const result = await kc.modifyOrder(
            openOrder.variety || variety,
            openOrder.order_id,
            modifyParams
        );

        return res.json({
            ok: true,
            result
        });

    } catch (err) {
        console.error("Modify Order Error:", err);

        return res.status(500).json({
            ok: false,
            error: err.message
        });
    }
}

// =====================================================
// CANCEL ORDER
// =====================================================

async function cancelOrderHandler(req, res) {
    try {
        const { instrument_token,exchange,closeOrder } = req.body;

        console.log("Cancel Order Request:", instrument_token, exchange, closeOrder);

        const { kc } = await getAccessToken();

        const openOrders = await findOpenOrderBySymbol(instrument_token);

if (!openOrders || openOrders.length === 0) {
    return res.status(404).json({
        ok: false,
        error: "No open order found"
    });
}

const results = await Promise.all(
    openOrders.map(order =>
        kc.cancelOrder(
            order.variety || variety,
            order.order_id
        )
    )
);

        return results.json({
            ok: true,
            result
        });

    } catch (err) {
        console.error("Cancel Order Error:", err);

        return res.status(500).json({
            ok: false,
            error: err.message
        });
    }
}


// =====================================================
// SUBSCRIBE CHART INSTRUMENT (add to instrumentsForMining if missing)
// =====================================================

async function subscribeChartInstrumentHandler(req, res) {
    try {
        const { instrumentToken } = req.body;

        if (!instrumentToken) {
            return res.status(400).json({
                ok: false,
                error: "instrumentToken is required"
            });
        }

        const { access_token } = await getAccessToken();

        const updateMissingScriptInInstrumetsFile = require("./updateMissingScriptInInstrumetsFile.js");
        await updateMissingScriptInInstrumetsFile([instrumentToken], access_token);

        return res.json({ ok: true });
    } catch (err) {
        console.error("Subscribe Chart Instrument Error:", err);

        return res.status(500).json({
            ok: false,
            error: err.message
        });
    }
}

module.exports = {
    getAccessToken,
    buyOrderHandler,
    sellOrderHandler,
    findOpenOrderBySymbol,
    updateOrderHandler,
    cancelOrderHandler,
    subscribeChartInstrumentHandler
};

