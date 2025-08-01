const data = [  
    {    date: "2023-01-23T18:30:00.000Z",    open: 6,    high: 6.35,    low: 5.2,    close: 5.4,    volume: 19800  },  
    {    date: "2023-01-24T18:30:00.000Z",    open: 5.4,    high: 5.4,    low: 3.75,    close: 3.75,    volume: 55800  },  
    // ...
  ];
  
  const now = new Date();
  const today = new Date(now.toLocaleDateString());
  const yesterday = new Date(new Date(today).setDate(today.getDate() - 1));
  
  for (let i = 0; i < data.length; i++) {
    const date = new Date(data[i].date);
    const day = date.getDay();
  
    if (day  == 0 || day  == 6) {
      continue;
    }
  
    if (date.getTime()  == today.getTime()) {
      console.log(`d${i} is today`);
    } else if (date.getTime()  == yesterday.getTime()) {
      console.log(`d${i} is yesterday`);
    } else {
      console.log(`d${i} is not today or yesterday`);
    }
  }
  