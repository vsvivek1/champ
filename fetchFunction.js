module.exports =function fetchFunction(app){

    console.log('from function');
    app.post('/api/fetch-instruments', (req, res) => {
        const script = spawn('node', ['./FetchInstruments']);
      
        // Listen for output from the script
        script.stdout.on('data', (data) => {
          console.log(`Script output: ${data}`);
        });
      
        // Listen for errors from the script
        script.stderr.on('data', (data) => {
          console.error(`Script error: ${data}`);
        });
      
        // Listen for the script to exit
        script.on('close', (code) => {
          console.log(`Script exited with code ${code}`);
      
          res.send({
            message: 'FetchInstruments script finished executing',
            code: code
          });
        });
      });

}