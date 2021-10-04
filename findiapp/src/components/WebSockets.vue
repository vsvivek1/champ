<template>
    <div>
<!-- {{session}} session -->

{{ws}}

<button  @click="p1('abc')" class="btn btn-danger"></button>
    </div>
</template>

<script>
var KiteTicker = require("kiteconnect").KiteTicker;
import axios from 'axios'
  import sessionMixin from '@/views/sessionMixin';
    export default {
        data(){

            return{
ws:{},

            }
        },
mixins:[sessionMixin],
methods:{

p1(binpacks){

alert(binpacks)
console.log('binpacks',binpacks)

},
buf2long(buf) {
		var b = new Uint8Array(buf),
			val = 0,
			len = b.length;

		for(var i=0, j=len-1; i<len; i++, j--) {
			val += b[j] << (i*8);
		}

		return val;
	},
splitPackets(bin) {
		// number of packets
		var num = this.buf2long(bin.slice(0, 2)),
			j = 2,
			packets = [];

		for(var i=0; i<num; i++) {
			// first two bytes is the packet length
			var size = this.buf2long(bin.slice(j, j+2)),
				packet = bin.slice(j+2, j+2+size);

			packets.push(packet);

			j += 2 + size;
		}

		return packets;
	},
parseBinary(binpacks) {

	// console.log('binpacks1',binpacks)
	// return false;
		var packets = this.splitPackets(binpacks),
			ticks = [];

		for(var n=0; n<packets.length; n++) {
			var bin = packets[n],
				instrument_token = this.buf2long(bin.slice(0, 4)),
				segment = instrument_token & 0xff;

			var tradable = true;
			if (segment === Indices) tradable = false;

			var divisor = 100.0;
			if (segment === NseCD) divisor = 10000000.0;

			// Parse LTP
			if (bin.byteLength === 8) {
				ticks.push({
					tradable: tradable,
					mode: modeLTP,
					instrument_token: instrument_token,
					last_price: this.buf2long(bin.slice(4,8)) / divisor
				});
			// Parse indices quote and full mode
			} else if (bin.byteLength === 28 || bin.byteLength === 32) {
				var mode = modeQuote;
				if (bin.byteLength === 32) mode = modeFull;

                var tick = {
                    tradable: tradable,
                    mode: mode,
                    instrument_token: instrument_token,
                    last_price: this.buf2long(bin.slice(4,8)) / divisor,
                    ohlc: {
                        high: this.buf2long(bin.slice(8, 12)) / divisor,
                        low: this.buf2long(bin.slice(12, 16)) / divisor,
                        open: this.buf2long(bin.slice(16, 20)) / divisor,
                        close: this.buf2long(bin.slice(20, 24)) / divisor
					},
					change: this.buf2long(bin.slice(24, 28))
				};

                // Compute the change price using close price and last price
                if(tick.ohlc.close != 0) {
                    tick.change = (tick.last_price - tick.ohlc.close) * 100 / tick.ohlc.close;
				}

                // Full mode with timestamp in seconds
                if (bin.byteLength === 32) {
					tick.timestamp = null;
					var timestamp = this.buf2long(bin.slice(28, 32));
					if (timestamp) tick.timestamp = new Date(timestamp * 1000);
				}

				ticks.push(tick);
			} else if (bin.byteLength === 44 || bin.byteLength === 184) {
				var mode = modeQuote;
				if (bin.byteLength === 184) mode = modeFull;

				var tick = {
                    tradable: tradable,
                    mode: mode,
                    instrument_token: instrument_token,
                    last_price: this.buf2long(bin.slice(4, 8)) / divisor,
                    last_quantity: this.buf2long(bin.slice(8, 12)),
                    average_price: this.buf2long(bin.slice(12, 16)) / divisor,
                    volume: this.buf2long(bin.slice(16, 20)),
                    buy_quantity: this.buf2long(bin.slice(20, 24)),
                    sell_quantity: this.buf2long(bin.slice(24, 28)),
                    ohlc: {
                        open: this.buf2long(bin.slice(28, 32)) / divisor,
                        high: this.buf2long(bin.slice(32, 36)) / divisor,
                        low: this.buf2long(bin.slice(36, 40)) / divisor,
                        close: this.buf2long(bin.slice(40, 44)) / divisor
                    }
				};

                // Compute the change price using close price and last price
                if (tick.ohlc.close != 0) {
                    tick.change = (tick.last_price - tick.ohlc.close) * 100 / tick.ohlc.close;
				}

				// Parse full mode
				if (bin.byteLength === 184) {
					// Parse last trade time
					tick.last_trade_time = null;
					var last_trade_time = this.buf2long(bin.slice(44, 48));
					if (last_trade_time) tick.last_trade_time = new Date(last_trade_time * 1000);

					// Parse timestamp
					tick.timestamp = null;
					var timestamp = this.buf2long(bin.slice(60, 64));
					if (timestamp) tick.timestamp = new Date(timestamp * 1000);

					// Parse OI
					tick.oi = this.buf2long(bin.slice(48, 52));
                    tick.oi_day_high = this.buf2long(bin.slice(52, 56));
					tick.oi_day_low = this.buf2long(bin.slice(56, 60));
					tick.depth = {
						buy: [],
						sell: []
					};

					var s = 0, depth = bin.slice(64, 184);
					for (var i=0; i<10; i++) {
						s = i * 12;
						tick.depth[i < 5 ? "buy" : "sell"].push({
							quantity:	this.buf2long(depth.slice(s, s + 4)),
							price:		this.buf2long(depth.slice(s + 4, s + 8)) / divisor,
							orders: 	this.buf2long(depth.slice(s + 8, s + 10))
						});
					}
				}

				ticks.push(tick);
			}
		}

		return ticks;
	},
	p(binpacks){

	

			console.log('binpacks',binpacks)	
			},

},
        mounted(){
let api_key=this.session.api_key;
let access_token=this.session.access_token;
			
// var ticker = new KiteTicker({
//     api_key: api_key,
//     access_token: access_token
// });

// ticker.connect();
// ticker.on("ticks", onTicks);
// ticker.on("connect", subscribe);

// function onTicks(ticks) {
//     console.log("Ticks3", ticks);
// }

// function subscribe() {
//     var items = [738561];
//     ticker.subscribe(items);
//     ticker.setMode(ticker.modeFull, items);
// }


var message = {"a": "mode", "v": ["full", [408065]]};;
let ws;
let w =new Promise((resolve, reject) =>{
ws =new WebSocket(`wss://ws.kite.trade?api_key=${api_key}&access_token=${access_token}`),
resolve(ws),reject('websocket errror')


} 
);

w.then(
    w=>{
console.log('w',w.url)
w.onopen = (e)=> {

  w.send(JSON.stringify(message))

 w. onmessage = (event)=> {
console.log(`[message] Data received from server: ${event.data}`);


let ticks=this.parseBinary(event.data)

console.log('ticks',ticks);




};


}
    } ).catch(e=>console.log(e))






// then(r=>{

//     this.ws.send(JSON.stringify(message));
// });





console.log(this.ws)
        },
       
    }
</script>

<style scoped>

</style>