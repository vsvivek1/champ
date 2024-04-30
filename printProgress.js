function printProgress(progress) {
	try {
		process.stdout.write(progress);
		process.stdout.clearLine(0);
		process.stdout.cursorTo(0);
		process.stdout.write("\n");

	} catch (error) {
		const lineNumber = error.stack.split('\n')[1].match(/\d+/)[0];
		const functionName = error.stack.split('\n')[1].match(/\w+\s+\w+/)[0].trim();

		console.error(`Error occurred in function "${functionName} " on line ${lineNumber} `);
	}
}
