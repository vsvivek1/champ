import dbConnect from '../../lib/dbConnect';
import Cis from '../../models/Cis';

export default async function handler(req, res) {
    await dbConnect();

    if (req.method === 'GET') {
        try {
            // Filter documents where holdingTime > 0
           // const data = await Cis.find({ holdingTime: { $gt: 0 } }).lean();
           const startOfDay = new Date();
           startOfDay.setHours(0, 0, 0, 0); // Start of today
           
           const endOfDay = new Date();
           endOfDay.setHours(23, 59, 59, 999); // End of today
           
           const data = await Cis.find({
               holdingTime: { $gt: 0 },
               buyTime: { $gte: startOfDay, $lt: endOfDay } // Match today's date only
           }).lean();

           // db.cis.find({}, { buyTimeStamp: 1 }).limit(5)
            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error("Error fetching CIS data:", error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    } else {
        res.status(405).json({ success: false, message: "Method not allowed" });
    }
}
