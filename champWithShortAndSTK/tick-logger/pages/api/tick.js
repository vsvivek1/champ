import prisma from '../../lib/prisma';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const ticks = await prisma.tickLog.findMany({
      orderBy: { tickTime: 'asc' },
    });

    res.status(200).json(ticks);
  } catch (error) {
    console.error('Error fetching ticks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
