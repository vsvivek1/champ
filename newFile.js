// console.log( today );
// return;
//main();
process.on('unhandledRejection', (reason, p) => {
	console.log('Unhandled Rejection at:', p, 'reason:', reason);
	// application specific logging, throwing an error, or other logic here
});
