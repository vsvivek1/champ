export  function convertToIndianTime(utcTimeString) {
    // Create a Date object from the UTC time string
    const utcDate = new Date(utcTimeString);

    // Set the time zone to Indian Standard Time (IST)
    const options = { timeZone: 'Asia/Kolkata' };

    // Format the date and time using IST
    const indianTimeString = utcDate.toLocaleString('en-IN', options);

    return indianTimeString;
}