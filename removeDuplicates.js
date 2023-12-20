// module.exports  =  
 module.exports = 
function removeDuplicates(arr) {

	try {
		const uniqueArray = arr.filter((value, index) => {
			const _value = JSON.stringify(value);
			return index == arr.findIndex(obj => {
				return JSON.stringify(obj) == _value;
			});
		});

		return uniqueArray;
	} catch (error) {
		const lineNumber = error.stack.split('\n')[1].match(/\d+/)[0];
		const functionName = error.stack.split('\n')[1].match(/\w+\s+\w+/)[0].trim();

		console.error(`Error occurred in function "${functionName} " on line ${lineNumber} `);
	}

}
