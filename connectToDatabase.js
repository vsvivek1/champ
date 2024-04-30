
let mongoose = require('mongoose');

// Function to connect to the database
async function connectToDatabase() {
    try {
        const uri = "mongodb+srv://vivek:idea1234@cluster0.aqcvi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
        await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connected to MongoDB");
        return true; // Indicate successful connection
    } catch (error) {
        console.log('Error connecting to MongoDB:', error);
        return false; // Indicate failure in connection
    }
}

// Function to close the database connection
async function closeDatabaseConnection() {
    try {
        await mongoose.connection.close();
        console.log("Disconnected from MongoDB");
        return true; // Indicate successful disconnection
    } catch (error) {
        console.log('Error disconnecting from MongoDB:', error);
        return false; // Indicate failure in disconnection
    }
}

// Example usage:


// Call exampleUsage function to demonstrate how to connect and disconnect


exports.connectToDatabase = connectToDatabase;
exports.closeDatabaseConnection= closeDatabaseConnection;
