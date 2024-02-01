import axios from 'axios';
import sessionMixin from "@/views/sessionMixin";
import { socket } from "./GTT.vue";

export default (await import('vue')).defineComponent({
mounted() {
},

computed: {
stocksPricePointsFiltered() {
return this.stocksPricePoints.filter(r => {

try {

if (r.pricePoints.pricePoints.length == 0) {

return false;
} else {

return true;
}

} catch (error) {

return false;
}



}



);

},

upperShadowGreaterThanBody() {
return this.stocksPricePoints.filter(r => {

try {

if (r.otherCriteria.upperShadow > r.otherCriteria.body) {

return true;
} else {

return false;
}

} catch (error) {

return false;
}



}



).length;

},



reds() {
// return 1
return this.stocksPricePoints.filter(r => {

try {

if (r.otherCriteria.candleColor == 'red') {

return true;
} else {

return false;
}

} catch (error) {

return false;
}



}



).length;

}, greens() {
// return 1

return this.stocksPricePoints.filter(r => {

try {

if (r.otherCriteria.candleColor == 'green') {

return true;
} else {

return false;
}

} catch (error) {

return false;
}

}

).length;

}
},

mixins: [sessionMixin],
data() {

return {
CurrentGttList: [],
gttAmountPerManualOrder: 100000,
CurrentTick: [],
instrumentTokens: [],
getStockPricePointsLoader: false,
stocksPricePoints: [],
loserList: []
};
},
mounted() {
// this.
},
methods: {
deleteGTT(trigger_id) {
axios.defaults.headers.common = { 'Authorization': `bearer ${this.accessToken} ` };
let url = "/api/deleteGTT/" + trigger_id;

axios.delete(url).then(r => {


console.log(r, 'gtt has been deleted');
});

},

getPercentage(stockPpItem, level) {
try {
return (
(stockPpItem.pricePoints.yesterday.close - level) *
-100 / stockPpItem.pricePoints.yesterday.close).toFixed(0);
}
catch (e) {

return e;
}

},

getGTTS() {
let ob = {};



ob.accessToken = this.accessToken;
let url = "/api/getGTTs";
axios.post(url, ob).then(r => {
// console.log( r.data,'gtts' )

this.CurrentGttList = r.data;

this.stocksPricePoints.forEach(e => {


// console.log( 'e.instrument_token',e.instrument_token )
let ln = r.data.
filter(r => r.condition.instrument_token == e.instrument_token);

// console.log( ln,'gtt' )
if (this.CurrentGttList.
filter(r => e.instrument_token == r.condition.instrument_token).length > 0) {

console.log('if');
this.$set(

e,
'gttData',

this.CurrentGttList.
filter(r => e.instrument_token == r.condition.instrument_token)[0]
);

} else {

// console.log( 'else' )
this.$set(
e,


'gttData',

'NO_GTT_PRESENT'

);

}




});

});


},

PlaceGttOrderForThisPrice(stockPpItem, level, accessToken = this.accessToken) {

console.log(stockPpItem, level);

let ob = {};

ob.params = {};

ob.accessToken = accessToken;

ob.params.tradingsymbol = stockPpItem.tradingsymbol;
ob.params.exchange = stockPpItem.exchange;
ob.params.trigger_values = [level];
ob.params.last_price = stockPpItem.last_price;



console.log(JSON.stringify(ob.params), 'ob params');
let order = {};
order.transaction_type = 'BUY';
order.quantity = (this.gttAmountPerManualOrder / level).toFixed(0);
order.product = 'CNC';
order.order_type = 'LIMIT';
order.price = level;

ob.params.orders = [order];

let url = "/api/PlaceGTT";
axios.post(url, ob).then(r => console.log(r, 'response'));


},


mutateWithLtp(s) {


s.forEach(s1 => {


let instrument_token = s1.instrument_token;

this.stocksPricePoints.filter(sp => sp.instrument_token == instrument_token)[0].last_price = s1.last_price;

});
// console.log( s )
},

startSockets() {
socket.emit("subscribe-GTT", JSON.stringify(this.instrumentTokens));
// console.log( this.instrumentTokens,'i' );
socket.on("send-GTT", (s) => {
this.mutateWithLtp(s);

this.CurrentTick = s;
});


},


getLevels(stockPpItem) {

let ar = stockPpItem.pricePoints.pricePoints;




if (!stockPpItem.pricePoints ||
!stockPpItem.pricePoints.d1 ||
typeof stockPpItem.pricePoints.d1.close === 'undefined') {
return false;
}




let refPrice = stockPpItem.pricePoints.d1.close;

return ar.map(r => r.high || r.level
).sort((a, b) => a - b)
.map((r, index, ar) => {



if (typeof ar[index + 1] == 'undefined') {


let ob = {};
ob.level = r;
ob.support = false;

return ob;

} else {
// upperlevelCheck = refPrice<= ar[index+1]
if (ar[index - 1] <= refPrice && ar[index + 1] >= refPrice && ar[index] <= refPrice) {

let ob = {};
ob.level = r;
ob.support = true;

return ob;

} else {
let ob = {};
ob.level = r;
ob.support = false;

return ob;
}
}
});



},

getStockPricePoints() {


this.getStockPricePointsLoader = true;
let url = "/api/GTT";
let ob = {};
ob.accessToken = this.accessToken;


axios.post(url, ob).then((r) => {

console.log(r, 'r');
r.data.forEach(r1 => {
let a = this.getLevels(r1);
r1.supportLevels = a;

});
this.stocksPricePoints = r.data;

this.instrumentTokens = this.stocksPricePoints.map(r => parseInt(r.instrument_token));

this.getStockPricePointsLoader = false;

this.startSockets();

this.getGTTS();
// console.log( r.data,'r.data' )
// . 
// sort(( a,b ) =>b.profitPc-a.profitPc )
// this.loserList = r.data.losers.
// sort(( a,b ) =>b.loserPc-a.loserPc )
}
);
},
},
name: 'GTT'
});
