import { useState, useEffect } from 'react';

export default function TicksPage() {
  const [ticks, setTicks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch all ticks
  const fetchAllTicks = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/ticks');
      if (!response.ok) throw new Error('Failed to fetch ticks');

      const data = await response.json();
      setTicks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch ticks on component load
  useEffect(() => {
    fetchAllTicks();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Tick Data Viewer</h1>
      <p>Below is a list of all tick data from the database.</p>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!loading && !error && ticks.length === 0 && <p>No tick data found.</p>}

      {!loading && ticks.length > 0 && (
        <table
          style={{
            borderCollapse: 'collapse',
            width: '100%',
            marginTop: '15px',
            fontSize: '14px',
          }}
        >
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Script Name</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Price</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Volume</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Tick Time</th>
            </tr>
          </thead>
          <tbody>
            {ticks.map((tick) => (
              <tr key={tick.id}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{tick.id}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{tick.scriptName}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{tick.price}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{tick.volume}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {new Date(tick.tickTime).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
