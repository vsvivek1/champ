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

    

    // console.log(jsonData['result_data']['data']['wrk_schedule_group_structures']);



    var res=jsonData['result_data']['unit_master']['labours'][0]['quantity']//['data']['wrk_schedule_group_structures'];

    let keys=Object.keys(res);


    console.log(res)
    console.log(keys);
// var uniqueTasks = wrk_schedule_group_structures.map(i => i.mst_task);

// .filter((obj, index, self) =>
//   index  == self.findIndex(item => item.mst_task  == obj.mst_task.id))




    // console.log(uniqueTasks,'uq');
    // console.log(taskList);


  } catch (error) {
    console.error('Error parsing JSON:', error);
  }
});
