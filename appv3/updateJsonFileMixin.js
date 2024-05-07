import axios from 'axios'
export default{

    methods: {
        async updateInstrumentsFile(json,filePath) {
          try {
            // Make sure instrumentsForMining.json file exists on the server with proper permissions
            const response = await axios.post('/api/updateJsonFileWithData', {
              instruments: json,
              filePath: filePath,
            });
            console.log(response.data); // Logging the response from the server
          } catch (error) {
            console.error('Error updating file:', error);
          }
        },
      },
}