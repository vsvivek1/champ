const fs = require('fs');

// Read the JSON file
fs.readFile('work.json', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading file:', err);
    return;
  }

  try {
    // Parse the JSON data
    const jsonData = JSON.parse(data);

    // Print the JSON data

    

    console.log(jsonData['result_data']['data']);
  } catch (error) {
    console.error('Error parsing JSON:', error);
  }
});
