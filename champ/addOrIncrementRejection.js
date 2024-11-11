import Rejection from './models/rejectionModel.js'; // Adjust the path as necessary

export  default async  function addOrIncrementRejection(rejectionPoint) {
  try {
    const today = new Date().setHours(0, 0, 0, 0); // Start of the day

    const result = await Rejection.findOneAndUpdate(
      { date: today, rejectionPoint },
      { $inc: { numbers: 1 } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

//   console.log('Operation result:', result);
  } catch (error) {
    console.error('Error updating rejection entry:', error);
  }
};

// Example usage

