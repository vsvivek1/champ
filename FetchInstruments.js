const Fs = require('fs')  
const Path = require('path')  
const Axios = require('axios')

async function downloadInstruments () {  

    let url="https://api.kite.trade/instruments";
  const path = Path.resolve(__dirname, 'instruments', 'instruments.csv')
  const writer = Fs.createWriteStream(path)

  const response = await Axios({
    url,
    method: 'GET',
    responseType: 'stream'
  })

  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve)
    writer.on('error', reject)
  })
}



downloadInstruments ()

.then(r=>{

  let csvToJson = require('convert-csv-to-json');

  let fileInputName = 'instruments/instruments.csv'; 
  let fileOutputName = 'instruments/instruments.json';
  
  csvToJson.parseSubArray('*',',').getJsonFromCsv((fileInputName,fileOutputName));

})

.

then( 
  
  r=>{

  let targetDir = Path.join(__dirname, '/findiapp/instruments.json');
  

  Fs.copyFile('instruments/instruments.json', targetDir, (err) => {
    if (err) throw err;
    console.log('source.txt was copied to destination.txt');
  });

}



)

