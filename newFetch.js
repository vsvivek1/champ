
const { connectToDatabase } = require('./connectToDatabase.js');
const { closeDatabaseConnection } = require('./connectToDatabase.js');
const { getTodaysAccessToken } = require('./getTodaysAccessToken.js');
const { downLoadAllInstrumentsAndReturnJson } = require('./downLoadAllInstrumentsAndReturnJson.js');
const Path  =  require( 'path' );
const { getNFOScripts } = require('./getNFOScripts.js');
const { getScriptsExpiringBeforeNextThursday } = require('./getScriptsExpiringBeforeNextThursday.js');
const { getScriptsExpiringBeforeSameDayNextWeek } = require('./getScriptsExpiringBeforeNextThursday.js');
const { getScriptsExpiringToday } = require('./getScriptsExpiringBeforeNextThursday.js');
const { getUniqueNames } = require('./getUniqueNames.js');
const { getUniqueInstruments } = require('./getUniqueNames.js');
const { getUniqueTradingSymbols } = require('./getUniqueNames.js');
const { getKiteConnectInstance } = require('./getKiteConnectInstance.js');
const path = require('path');
const {
  attachMovingAverages,
  hasConfirmedRecentCross
} = require("./macrossUtils.js");




const fs = require('fs').promises;
//const restartPM2Process = require('./restartPM2Process');
const scriptDirectory  =  Path.dirname( process.argv[1] );
const FILE_LOCATION  =  Path.join( scriptDirectory, 'appv3', 'public', 'instruments' );
// const io = require('socket.io-client');
// const socket = io('http://localhost:4000'); 

function getNextSevenDays() {
  const days = [];
  const today = new Date();

  for (let i = 1; i < 9; i++) {
      const nextDay = new Date(today);
      nextDay.setDate(today.getDate() + i);

      // Format the date as yyyy-mm-dd
      const year = nextDay.getFullYear();
      const month = String(nextDay.getMonth() + 1).padStart(2, '0');
      const day = String(nextDay.getDate()).padStart(2, '0');

      days.push(`${year}-${month}-${day}`);
  }

  return days;
}
Array.prototype.removeDuplicates = function () {
  const seen = new Set();
  return this.filter(item => {
    const serialized = JSON.stringify(item);
    if (seen.has(serialized)) return false;
    seen.add(serialized);
    return true;
  });
};

  // "SENSEX": "SENSEX",
  // "SENSEX50": "SENSEX50",
let indexOptions = {
  "BANKEX": "BANKEX",

  "NIFTY": "NIFTY 50",
  "BANKNIFTY": "NIFTY BANK",
  "MIDCPNIFTY": "NIFTY MID SELECT",
  "FINNIFTY":"NIFTY FIN SERVICE",
 "NIFTYNXT50" :"NIFTY NEXT 50",
 "NIFTY":"NIFTY 50",
"SENSEX":"SENSEX",
"BANKEX":"BANKEX"

  // "AARTIIND": "AARTI INDUSTRIES",
  // "ABB": "ABB INDIA",
  // "ABBOTINDIA": "ABBOTT INDIA",
  // "ABCAPITAL": "ADITYA BIRLA CAPITAL",
  // "ABFRL": "ADITYA BIRLA FASHION",
  // "ACC": "ACC",
  // "ADANIENSOL": "ADANI ENERGY SOLUTIONS",
  // "ADANIENT": "ADANI ENTERPRISES",
  // "ADANIGREEN": "ADANI GREEN ENERGY",
  // "ADANIPORTS": "ADANI PORTS",
  // "ALKEM": "ALKEM LABORATORIES",
  // "AMBUJACEM": "AMBUJA CEMENTS",
  // "ANGELONE": "ANGEL ONE",
  // "APLAPOLLO": "APL APOLLO TUBES",
  // "APOLLOHOSP": "APOLLO HOSPITALS",
  // "APOLLOTYRE": "APOLLO TYRES",
  // "ASHOKLEY": "ASHOK LEYLAND",
  // "ASIANPAINT": "ASIAN PAINTS",
  // "ASTRAL": "ASTRAL POLY TECHNIK",
  // "ATGL": "ADANI TOTAL GAS",
  // "ATUL": "ATUL LIMITED",
  // "AUBANK": "AU SMALL FINANCE BANK",
  // "AUROPHARMA": "AUROBINDO PHARMA",
  // "AXISBANK": "AXIS BANK",
  // "BAJAJ-AUTO": "BAJAJ AUTO",
  // "BAJAJFINSV": "BAJAJ FINSERV",
  // "BAJFINANCE": "BAJAJ FINANCE",
  // "BALKRISIND": "BALKRISHNA INDUSTRIES",
  // "BANDHANBNK": "BANDHAN BANK",
  // "BANKBARODA": "BANK OF BARODA",
  // "BANKINDIA": "BANK OF INDIA",
  // "BATAINDIA": "BATA INDIA",
  // "BEL": "BHARAT ELECTRONICS",
  // "BERGEPAINT": "BERGER PAINTS",
  // "BHARATFORG": "BHARAT FORGE",
  // "BHARTIARTL": "BHARTI AIRTEL",
  // "BHEL": "BHARAT HEAVY ELECTRICALS",
  // "BIOCON": "BIOCON",
  // "BOSCHLTD": "BOSCH",
  // "BPCL": "BHARAT PETROLEUM",
  // "BRITANNIA": "BRITANNIA INDUSTRIES",
  // "BSE": "BSE LIMITED",
  // "BSOFT": "BIRLASOFT",
  // "CAMS": "CAMS",
  // "CANBK": "CANARA BANK",
  // "CANFINHOME": "CAN FIN HOMES",
  // "CDSL": "CENTRAL DEPOSITORY SERVICES",
  // "CESC": "CESC LIMITED",
  // "CGPOWER": "CG POWER",
  // "CHAMBLFERT": "CHAMBAL FERTILISERS",
  // "CHOLAFIN": "CHOLAMANDALAM FINANCE",
  // "CIPLA": "CIPLA",
  // "COALINDIA": "COAL INDIA",
  // "COFORGE": "COFORGE",
  // "COLPAL": "COLGATE PALMOLIVE",
  // "CONCOR": "CONTAINER CORPORATION",
  // "COROMANDEL": "COROMANDEL INTERNATIONAL",
  // "CROMPTON": "CROMPTON GREAVES",
  // "CUB": "CITY UNION BANK",
  // "CUMMINSIND": "CUMMINS INDIA",
  // "CYIENT": "CYIENT",
  // "DABUR": "DABUR INDIA",
  // "DALBHARAT": "DALMIA BHARAT",
  // "DEEPAKNTR": "DEEPAK NITRITE",
  // "DELHIVERY": "DELHIVERY",
  // "DIVISLAB": "DIVI'S LABORATORIES",
  // "DIXON": "DIXON TECHNOLOGIES",
  // "DLF": "DLF",
  // "DMART": "AVENUE SUPERMARTS",
  // "DRREDDY": "DR. REDDY'S LABORATORIES",
  // "EICHERMOT": "EICHER MOTORS",
  // "ESCORTS": "ESCORTS KUBOTA",
  // "EXIDEIND": "EXIDE INDUSTRIES",
  // "FEDERALBNK": "FEDERAL BANK",
  // "FINNIFTY": "NIFTY FIN SERVICE",
  // "GAIL": "GAIL",
  // "GLENMARK": "GLENMARK PHARMA",
  // "GMRAIRPORT": "GMR AIRPORTS",
  // "GNFC": "GUJARAT NARMADA VALLEY",
  // "GODREJCP": "GODREJ CONSUMER",
  // "GODREJPROP": "GODREJ PROPERTIES",
  // "GRANULES": "GRANULES INDIA",
  // "GRASIM": "GRASIM INDUSTRIES",
  // "GUJGASLTD": "GUJARAT GAS",
  // "HAL": "HINDUSTAN AERONAUTICS",
  // "HAVELLS": "HAVELLS INDIA",
  // "HCLTECH": "HCL TECHNOLOGIES",
  // "HDFCAMC": "HDFC AMC",
  // "HDFCBANK": "HDFC BANK",
  // "HDFCLIFE": "HDFC LIFE",
  // "HEROMOTOCO": "HERO MOTOCORP",
  // "HFCL": "HFCL",
  // "HINDALCO": "HINDALCO INDUSTRIES",
  // "HINDCOPPER": "HINDUSTAN COPPER",
  // "HINDPETRO": "HINDUSTAN PETROLEUM",
  // "HINDUNILVR": "HINDUSTAN UNILEVER",
  // "HUDCO": "HUDCO",
  // "ICICIBANK": "ICICI BANK",
  // "ICICIGI": "ICICI GENERAL INSURANCE",
  // "ICICIPRULI": "ICICI PRU LIFE",
  // "IDEA": "VODAFONE IDEA",
  // "IDFCFIRSTB": "IDFC FIRST BANK",
  // "IEX": "INDIAN ENERGY EXCHANGE",
  // "IGL": "INDRAPRASTHA GAS",
  // "INDHOTEL": "INDIAN HOTELS",
  // "INDIAMART": "INDIAMART INTERMESH",
  // "INDIANB": "INDIAN BANK",
  // "INDIGO": "INTERGLOBE AVIATION",
  // "INDUSINDBK": "INDUSIND BANK",
  // "INDUSTOWER": "INDUS TOWERS",
  // "INFY": "INFOSYS",
  // "IOC": "INDIAN OIL",
  // "IPCALAB": "IPCA LABORATORIES",
  // "IRB": "IRB INFRASTRUCTURE",
  // "IRCTC": "IRCTC",
  // "IRFC": "INDIAN RAILWAY FINANCE",
  // "ITC": "ITC",
  // "JINDALSTEL": "JINDAL STEEL",
  // "JIOFIN": "JIO FINANCIAL SERVICES",
  // "JKCEMENT": "JK CEMENT",
  // "JSL": "JINDAL STAINLESS",
  // "JSWENERGY": "JSW ENERGY",
  // "JSWSTEEL": "JSW STEEL",
  // "JUBLFOOD": "JUBILANT FOODWORKS",
  // "KALYANKJIL": "KALYAN JEWELLERS",
  // "KEI": "KEI INDUSTRIES",
  // "KOTAKBANK": "KOTAK MAHINDRA BANK",
  // "KPITTECH": "KPIT TECHNOLOGIES",
  // "LALPATHLAB": "DR. LAL PATHLABS",
  // "LAURUSLABS": "LAURUS LABS",
  // "LICHSGFIN": "LIC HOUSING FINANCE",
  // "LICI": "LIC INDIA",
  // "LODHA": "LODHA DEVELOPERS",
  // "LT": "LARSEN & TOUBRO",
  // "LTIM": "LTIMINDTREE",
  // "LTTS": "L&T TECHNOLOGY SERVICES",
  // "LUPIN": "LUPIN LIMITED",
  // "M&M": "MAHINDRA & MAHINDRA",
  // "M&MFIN": "MAHINDRA FINANCE",
  // "MANAPPURAM": "MANAPPURAM FINANCE",
  // "MARICO": "MARICO",
  // "MARUTI": "MARUTI SUZUKI",
  // "MAXHEALTH": "MAX HEALTHCARE",
  // "MCX": "MCX",
  // "METROPOLIS": "METROPOLIS HEALTHCARE",
  // "MFSL": "MAX FINANCIAL SERVICES",
  // "MGL": "MGL",
 
  // "MOTHERSON": "MOTHERSON SUMI",
  // "MPHASIS": "MPHASIS",
  // "MRF": "MRF",
  // "MUTHOOTFIN": "MUTHOOT FINANCE",
  // "NATIONALUM": "NATIONAL ALUMINIUM",
  // "NAUKRI": "INFO EDGE (NAUKRI)",
  // "NAVINFLUOR": "NAVIN FLUORINE",
  // "NCC": "NCC LIMITED",
  // "NESTLEIND": "NESTLE INDIA",
  // "NHPC": "NHPC LIMITED",
  // "NIFTYNEXT50": "NIFTY NEXT 50",
  // "NMDC": "NMDC",
  // "NTPC": "NTPC LIMITED",
  // "NYKAA": "FSN E-COMMERCE (NYKAA)",
  // "OBEROIRLTY": "OBEROI REALTY",
  // "OFSS": "ORACLE FINANCIAL",
  // "OIL": "OIL INDIA",
  // "ONGC": "ONGC",
  // "PAGEIND": "PAGE INDUSTRIES",
  // "PAYTM": "PAYTM",
  // "PEL": "PIRAMAL ENTERPRISES",
  // "PERSISTENT": "PERSISTENT SYSTEMS",
  // "PETRONET": "PETRONET LNG",
  // "PFC": "POWER FINANCE CORP",
  // "PIDILITIND": "PIDILITE INDUSTRIES",
  // "PIIND": "PI INDUSTRIES",
  // "PNB": "PUNJAB NATIONAL BANK",
  // "POLICYBZR": "POLICYBAZAAR",
  // "POLYCAB": "POLYCAB INDIA",
  // "POONAWALLA": "POONAWALLA FINCORP",
  // "POWERGRID": "POWER GRID CORP",
  // "PRESTIGE": "PRESTIGE ESTATES",
  // "PVRINOX": "PVR INOX",
  // "RAMCOCEM": "RAMCO CEMENTS",
  // "RBLBANK": "RBL BANK",
  // "RECLTD": "REC LIMITED",
  // "RELIANCE": "RELIANCE INDUSTRIES",
  // "SAIL": "STEEL AUTHORITY",
  // "SBICARD": "SBI CARDS",
  // "SBILIFE": "SBI LIFE",
  // "SBIN": "STATE BANK OF INDIA",
  // "SHREECEM": "SHREE CEMENT",
  // "SHRIRAMFIN": "SHRIRAM FINANCE",
  // "SIEMENS": "SIEMENS INDIA",
  // "SJVN": "SJVN LIMITED",
  // "SONACOMS": "SONA COMSTAR",
  // "SRF": "SRF LIMITED",
  // "SUNPHARMA": "SUN PHARMA",
  // "SUNTV": "SUN TV",
  // "SUPREMEIND": "SUPREME INDUSTRIES",
  // "SYNGENE": "SYNGENE INTERNATIONAL",
  // "TATACHEM": "TATA CHEMICALS",
  // "TATACOMM": "TATA COMMUNICATIONS",
  // "TATACONSUM": "TATA CONSUMER",
  // "TATAELXSI": "TATA ELXSI",
  // "TATAMOTORS": "TATA MOTORS",
  // "TATAPOWER": "TATA POWER",
  // "TATASTEEL": "TATA STEEL",
  // "TCS": "TATA CONSULTANCY SERVICES",
  // "TECHM": "TECH MAHINDRA",
  // "TIINDIA": "TUBE INVESTMENTS",
  // "TITAN": "TITAN COMPANY",
  // "TORNTPHARM": "TORRENT PHARMA",
  // "TRENT": "TRENT LIMITED",
  // "TVSMOTOR": "TVS MOTOR COMPANY",
  // "UBL": "UNITED BREWERIES",
  // "ULTRACEMCO": "ULTRATECH CEMENT",
  // "UNIONBANK": "UNION BANK OF INDIA",
  // "UNITDSPR": "UNITED SPIRITS",
  // "UPL": "UPL LIMITED",
  // "VBL": "VARUN BEVERAGES",
  // "VEDL": "VEDANTA LIMITED",
  // "VOLTAS": "VOLTAS",
  // "WIPRO": "WIPRO",
  // "YESBANK": "YES BANK",
  // "ZOMATO": "ZOMATO",
  // "ZYDUSLIFE": "ZYDUS LIFESCIENCES"
};

const strikePriceSteps = {
  "BANKEX": 100,           // BANKEX has a strike price step of 100
  "SENSEX": 50,            // SENSEX has a strike price step of 50
  "SENSEX50": 50,          // SENSEX50 has a strike price step of 50
  "NIFTY50": 50,           // NIFTY 50 has a strike price step of 50
  "NIFTYBANK": 100,        // NIFTY BANK has a strike price step of 100
  "MIDCPNIFTY": 50,
  "FINNIFTY":50 ,
  "NIFTY":50        // NIFTY MIDCAP SELECT has a strike price step of 50
};



  function removeDuplicates(array, key) {
    const seen = new Set();
    return array.filter(item => {
      const keyValue = item[key];
      if (seen.has(keyValue)) {
        return false;
      } else {
        seen.add(keyValue);
        return true;
      }
    });
  }

async function writeJsonToFile(jsonData, fileName) {
    try {
        // Convert JSON object to string
        const jsonString = JSON.stringify(jsonData, null, 2); // null, 2 for pretty formatting

        // Write JSON string to file
        await fs.writeFile(fileName, jsonString);

        

        //console.log('JSON data has been written to', fileName);

      

        return;
    } catch (err) {
        console.error('Error writing JSON to file:', err);

        return;
    }
}

const pricePoints =require('./pricePoints');

function filterByName(jsonArray, names = ['NIFTY', 'BANKNIFTY',"MIDCPNIFTY","FINNIFTY","BANKEX"]) {
   return jsonArray.filter(item => names.includes(item.name));
}

var con=connectToDatabase();



//const { exec } = require('child_process');

const { exec, execSync } = require('child_process');

const { clearCustomQueryHandlers } = require('puppeteer');
const { disconnect, set } = require('mongoose');



async function main(params) {


 let exchanges=['NFO','BFO']   
   // exec('clear');
   //console.clear();


 
   var accessTokenDoc= await getTodaysAccessToken(params)
  let allScriptJson=await  downLoadAllInstrumentsAndReturnJson()



  let a= allScriptJson.filter(i => i.segment== 'INDICES').map(y=>({[y.tradingsymbol]:y.name}));

 
  const kite=await getKiteConnectInstance();



  //console.log(  allScriptJson.filter(a=>a.segment=="INDICES"  && a.exchange=="NSE" ));

 
  
;

  writeJsonToFile(
  allScriptJson,
  path.join(__dirname, 'appv3', 'shared', 'instruments', 'instrumentsForMining.json')
);

writeJsonToFile(
  allScriptJson,
  path.join(__dirname, 'appv3', 'src', 'assets', 'instruments', 'instrumentsForMining.json')
);


  var dateRange ;
  
   dateRange = getNextSevenDays();
  
   //  console.log(dateRange,' expiry dates here ')
   
var nfoScripts=allScriptJson.filter(a=>
  
  (['NIFTY','SENSEX','BANKNIFTY',"MIDCPNIFTY","FINNIFTY"].includes(a.name)&& !['NIFTYNXT50'].includes(a.name)) && exchanges.includes(a.exchange)

&&  dateRange.includes(a.expiry)



);










/// till now ok




/// all nofo scripts is here 
var expToday=nfoScripts//getScriptsExpiringBeforeSameDayNextWeek(nfoScripts);

//console.log(expToday,'exp')










///seems ok here



//// indexs in this


//let names = Array.from(new Set(expToday.map(i => i.name)));




let names=['NIFTY','SENSEX','BANKNIFTY',"MIDCPNIFTY","FINNIFTY"]
//names=['NIFTY', 'BANKNIFTY',"MIDCPNIFTY","FINNIFTY"]//'SENSEX','BANKEX'
let selectedOptions = [];
let index = 0;

//console.log('here', names);


let names1 = [
  'BANKEX', 'SENSEX', 'SENSEX50', 'NIFTY', 'AARTIIND', 'ABB',
  'ABBOTINDIA', 'ABCAPITAL', 'ABFRL', 'ACC', 'ADANIENSOL', 
  'ADANIENT', 'ADANIGREEN', 'ADANIPORTS', 'ALKEM'
];



// Debug names array
//console.log('Names:', names);




names=['NIFTY','SENSEX','BANKNIFTY',"MIDCPNIFTY","FINNIFTY"]

const intervalId = await new Promise((resolve, reject) => {
  
  
  const interval = setInterval(async () => {
    if (index >= names.length) {
      console.log('✅ All index names processed.');
      clearInterval(interval);

      resolve(true);
      return resolve(true);
    }

    const currentName = names[index];
    console.log('Current Name:', currentName);
    const tradingsymbol = indexOptions[currentName];
    const ins = allScriptJson.find(i => i.tradingsymbol == tradingsymbol);

    if (!ins) {
      console.warn(`❌ Instrument not found: ${tradingsymbol} (${currentName})`);
      index++;
      return;
    }

    try {
      const quote1 = await kite.getLTP(ins.instrument_token);
      const ltp = quote1[ins.instrument_token]?.last_price;

      if (!ltp) {
        console.warn(`⚠️ LTP not found for ${currentName}`);
        index++;
        return;
      }

    

     // const expiries = [...new Set(optionsForIndex.map(o => o.expiry))].sort();

      
//console.log('Depth',depth);
      
const expiries  = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i +0);               // +1 for tomorrow, +i for the subsequent days
        return d.toISOString().slice(0, 10);          // “YYYY-MM-DD”; adjust formatting as needed
      });

    //  console.log(expiries,'expiries');
     // const nearestExpiry = expiries[0];

      // Filter all options for this index


      
var optionsForIndex;
let month = new Date().getMonth() + 1; // Months are zero-based, so add 1
month = month < 10 ? '0' + month : '' + month; // Ensure two-digit format 

  // Premium-band strike selection: pick the strike whose live premium falls
  // inside [MIN_PREMIUM, MAX_PREMIUM] rather than a fixed strike-count offset,
  // since strike spacing/IV moves the premium for a fixed depth all over the place.
  const MIN_PREMIUM = 20;
  const MAX_PREMIUM = 30;
  const STRIKE_SCAN_WINDOW = 20; // how many strikes OTM to scan looking for a band match

if(['BANKNIFTY',"MIDCPNIFTY","FINNIFTY"].includes(currentName)){
console.log(currentName,'included');
// optionsForIndex = allScriptJson.filter(o => o.name == currentName  && month==o.expiry.split('-')[1]) ;
// console.log(optionsForIndex)
}else{
  //weekly expiry for nifty and sensex
optionsForIndex = allScriptJson.filter(o => o.name == currentName  && expiries.includes(o.expiry) );


    //  [ 'BANKNIFTY', 'MIDCPNIFTY', 'FINNIFTY' ]
    //   optionsForIndex = allScriptJson.filter(o => o.name == currentName  && expiries.includes(o.expiry) );


      //console.log(optionsForIndex )
     // process.exit()
      // Pick nearest expiry


      const ceOptions = optionsForIndex.filter(o => o.instrument_type == 'CE');
      const peOptions = optionsForIndex.filter(o => o.instrument_type == 'PE');

      const ceStrikes = ceOptions.map(o => o.strike).sort((a, b) => a - b);
      const peStrikes = peOptions.map(o => o.strike).sort((a, b) => a - b);

      // OTM-direction candidate windows around spot (CE: strikes above spot, PE: strikes below spot)
      const ceBaseIndex = ceStrikes.findIndex(s => s >= ltp);
      const ceCandidateStrikes = ceBaseIndex == -1
        ? []
        : ceStrikes.slice(ceBaseIndex, ceBaseIndex + STRIKE_SCAN_WINDOW);

      const peReversed = [...peStrikes].reverse();
      const peBaseIndexReversed = peReversed.findIndex(s => s <= ltp);
      const peCandidateStrikes = peBaseIndexReversed == -1
        ? []
        : (() => {
            const peBaseIndex = peStrikes.length - 1 - peBaseIndexReversed;
            const start = Math.max(0, peBaseIndex - STRIKE_SCAN_WINDOW + 1);
            return peStrikes.slice(start, peBaseIndex + 1).reverse(); // nearest-to-spot first
          })();

      const ceCandidates = ceCandidateStrikes.map(s => ceOptions.find(o => o.strike == s)).filter(Boolean);
      const peCandidates = peCandidateStrikes.map(s => peOptions.find(o => o.strike == s)).filter(Boolean);

      const allCandidates = [...ceCandidates, ...peCandidates];

      let quotes = {};
      if (allCandidates.length) {
        quotes = await kite.getLTP(allCandidates.map(o => o.instrument_token));
      }

      const pickByPremiumBand = (candidates, legName) => {
        if (!candidates.length) return null;

        const withPremium = candidates
          .map(o => ({ option: o, premium: quotes[o.instrument_token]?.last_price }))
          .filter(c => typeof c.premium == 'number' && c.premium > 0);

        if (!withPremium.length) return null;

        const midBand = (MIN_PREMIUM + MAX_PREMIUM) / 2;
        const inBand = withPremium.filter(c => c.premium >= MIN_PREMIUM && c.premium <= MAX_PREMIUM);
        const pool = inBand.length ? inBand : withPremium;

        pool.sort((a, b) => Math.abs(a.premium - midBand) - Math.abs(b.premium - midBand));

        if (!inBand.length) {
          console.warn(`No ${legName} strike in band ${MIN_PREMIUM}-${MAX_PREMIUM} for ${currentName}, falling back to closest premium ${pool[0].premium}`);
        }

        return pool[0].option;
      };

      const ceOption = pickByPremiumBand(ceCandidates, 'CE');
      const peOption = pickByPremiumBand(peCandidates, 'PE');

      if (ceOption) selectedOptions.push(ceOption);
      else console.warn(`CE not found in premium band for ${currentName}`);

      if (peOption) selectedOptions.push(peOption);
      else console.warn(`PE not found in premium band for ${currentName}`);
    }
    } catch (error) {
      console.error(`⚠️ Error processing ${currentName}: ${error.message}`);
    }

    index++;
  }, 333)
});




console.log(names);//









let o=await kite.getOrders();
let p=await kite.getPositions();

let o1=o.filter(ox=>ox.exchange=='NFO' && ox.status=='OPEN' && ox.transaction_type=='BUY').map(k=>{
  
  
  let script=allScriptJson.find(as=>as.tradingsymbol==k.tradingsymbol)

  return script

}


);

let p1=p.day.filter(px=>px.quantity>0).map(k=>{

  let script=allScriptJson.find(as=>as.tradingsymbol==k.tradingsymbol)

  return script

});


// console.log(o1, 'orders')
// console.log(p1,'positions')



selectedOptions.push(...o1)
selectedOptions.push(...p1)

console.warn('Pushing selected options')
selectedOptions = removeDuplicates(selectedOptions, 'instrument_token');


//console.log(selectedOptions,'number of options selected' );



//return;
//process.exit();

let fullJson=[]

let a1=await popOption(selectedOptions,fullJson,accessTokenDoc);

console.log('here 158',a1)

//



//const { exec } = require('child_process');

//
return;


}






function popOption(selectedOptions, fullJson, accessTokenDoc) {



  let s=selectedOptions.map(a=>a.tradingsymbol) 

  console.log(s,'s')
  //return;
  return new Promise((resolve, reject) => {
    if (typeof selectedOptions == 'undefined' || selectedOptions.length == 0) {
      resolve(); // Resolve early if no work
      return;
    }

    const timer = setInterval(async () => {



      if (selectedOptions.length > 0) {
        const option = selectedOptions.pop();
        console.log(`${option.tradingsymbol} - pop option attaching pp` , 'len',selectedOptions.length);

        try {
          await setPricePointsToInstrument(option, fullJson, accessTokenDoc);
        } catch (error) {
          console.error('Error setting price points:', error.message);
          // You can choose to reject here if needed
        }

      } else {
        
  clearInterval(timer);
        console.log("Array is empty. Resetting timer.");
       


        // Optional log
        setTimeout(async () => {

        
          console.log(`LAST TIME EXECUTED: ${Date()}`);

const appDir = path.join(__dirname, 'appv3');
exec(
  'yarn run build && pm2 restart all',
  { cwd: appDir },
  (err, stdout, stderr) => {
    try {
      if (err) {
        console.error('EXEC ERROR:', err.message);
      }

      if (stdout) {
        console.log('STDOUT:\n', stdout);
      }

      if (stderr) {
        console.error('STDERR:\n', stderr);
      }
    } finally {
      disconnect();
    }
  }
);



resolve(true)
          return;
        }, 5 * 1000);
      }
    }, 500);
  });
}





async function setPricePointsToInstrument( option, fullJson,accessTokenDoc) {

    
    return new Promise(async (resolve, reject) => {
        try {

            let pp=new pricePoints(option.instrument_token,accessTokenDoc);


            console.log(option.instrument_token,accessTokenDoc,'accessTokenDoc ')
    await  pp.initiateKiteConnect();
    console.log(option.instrument_token,'instru token inside seting function');
            let c = await pp.getPricePoints(7, 'day');
            option.pricePoints = c;
            option.SevenDayMaxMin = c.SevenDayMaxMin;


           // /markets/ext/chart/web/tvc/NFO-OPT/NIFTY2660223500PE/14599938
            option.chart = `https://kite.zerodha.com/markets/ext/chart/web/tvc/${option.exchange}/${option.tradingsymbol}/${option.instrument_token}`;
            option.selectedBuyingMethod = 'MAX';
            option.buyNow = false;

            option.noTradingNow=false;
            option.canTakeFreshTrade=true;
            option.hasStartedGetOrders=false
            option.hasStartedGetLivePositions=false
            option.refreshingTradeStatus=false
            option.hasLiveTarget =false
            option.hasLivePosition =false
            option.hasLiveOrder=false;

            option.signals={};

            // option.signals.fifteenMinuteBreakout=false;
            // option.signals.crossedYesterdayHighFromBelow=false;
            // option.signals.crossedDayOpenFromBelow=false;
            // option.signals.crossedDayHighFromBelow=false;
            // option.signals.lastCandleTouchedDaysLowAndRejected=false;
            // option.signals.reversa30=false;
            // option.signals.openAboveAndGreenCandleBefore920=false;

            option.deployedStrategies={};
            option.deployedStrategies.test=1;
            option.deployedStrategies.buyAboveOpenAtNineAm='untouched'
            option.deployedStrategies.buyAtHugeLastTick='untouched';
            option.deployedStrategies.handleLongLowerShadowTrades='untouched';
            option.deployedStrategies.reversa30='untouched';
            option.returnPoints=[];
            option.ordered=false;
            option.returnPoints = [];
            option.location = {};
            option.firstTimeCisFetch=true;
            option.strategyTested=[];
            

            console.log('pushing option', option.tradingsymbol,option.expiry);
            fullJson.push(option);
            console.log('new length', fullJson.length);

            //console.log(fullJson.length,'full json len',selectedOptions.length)
           writeJsonToFile(
  fullJson,
  path.join(__dirname, 'appv3', 'shared', 'instruments', 'instrumentsForMining.json')
);

writeJsonToFile(
  fullJson,
  path.join(__dirname, 'appv3', 'src', 'assets', 'instruments', 'instrumentsForMining.json')
);
            

            resolve(fullJson);
        } catch (error) {

console.log(error)
resolve(fullJson);
            //reject(error);
        }
    });
}

//main();

main();
 
module.exports = { main };



// setInterval(()=>{
// console.time('start')
//    main();
//    console.timeEnd('start')
// //disconnect()
// },15*60*1000) 
//disconnect();//