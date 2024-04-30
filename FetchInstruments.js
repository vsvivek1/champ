process.stdout.write( '\033c' );
const Path  =  require( 'path' )
const Axios  =  require( 'axios' );
const ZerodhaAPI  =  require( './ZerodhaAPI' );

const { getBankNiftyExpiry } = require('./getBankNiftyExpiry.js');
const { getCurrentExpiryDate } = require('./getCurrentExpiryDate.js');
const { getLastThursdayOfMonth } = require('./getLastThursdayOfMonth.js');
const { overnightScripts } = require('./overnightScripts.js');
const { cl } = require('./cl.js');
const { getSymbols } = require('./getSymbols.js');
const { writeFinalScriptsTofile } = require('./writeFinalScriptsTofile.js');
const { createAndMoveFileFromJson } = require('./createAndMoveFileFromJson.1.js');
const { main } = require('./main.js');

//const scriptDirectory  =  Path.dirname( process.argv[1] );
const FILE_LOCATION  =  Path.join( scriptDirectory, 'appv3', 'public', 'instruments' );



// const FILE_LOCATION = './appv3/public/instruments'

const scriptDirectory  =  Path.dirname( process.argv[1] );

//exports.FILE_LOCATION = FILE_LOCATION;


let ce_upper_percentage = 1.02;
exports.ce_upper_percentage = ce_upper_percentage;
let ce_lower_percentage = 1;
exports.ce_lower_percentage = ce_lower_percentage;

let pe_upper_percentage = 1;
exports.pe_upper_percentage = pe_upper_percentage;
let pe_lower_percentage = .98;
exports.pe_lower_percentage = pe_lower_percentage;
const TIMER  = 200 ;
exports.TIMER = TIMER;
let today  =  new Date(  ).toISOString(  ).slice( 0,10 );
exports.today = today;

// Call the main function to start the process


exports.cl = cl;



var overAllTimer;
exports.overAllTimer = overAllTimer;




var KiteConnect  =  require( "kiteconnect" ).KiteConnect;
exports.KiteConnect = KiteConnect;




require( 'dotenv' ).config(  )
let access_token;
exports.access_token = access_token;
// const api_key  =  process.env.api_key;
const api_key  =  'wkcurst2vu5obug7';
exports.api_key = api_key;





// let today  =  new Date(  ).toISOString(  )//.slice( 0, 10 );
// const fetchInstrumentsForNewMint = require( './FetchInstrumentsForNewMint.js' )

const instruAll  =  FILE_LOCATION+'/instrumentsAll.json';
exports.instruAll = instruAll;

const EXPIRY  =  getCurrentExpiryDate(  );
exports.EXPIRY = EXPIRY;
console.log( EXPIRY,'EXPIRY' )









  






main();

