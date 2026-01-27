import mongoose from 'mongoose';
import Rejection from '../../../champ/models/rejectionModel.js'; // Adjust the path as necessary

/* const connectDB = async () => {
  if (mongoose.connections[0].readyState) return;
  
  await mongoose.connect('mongodb://localhost:27017/rejectionDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  });
}; */

export default async function handler(req, res) {
  await connectDB();

  const { method } = req;

  switch (method) {
    case 'POST':
      try {
        const { rejectionPoint } = req.body;
        const today = new Date().setHours(0, 0, 0, 0);

        const result = await Rejection.findOneAndUpdate(
          { date: today, rejectionPoint },
          { $inc: { numbers: 1 } },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
