import { useState } from 'react';

export default function TicksPage() {
  const [scriptName, setScriptName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [ticks, setTicks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTicks = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        ...(scriptName && { scriptName }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
      });

      const response = await fetch(`/api/ticks?${params}`);
      if (!response.ok) throw new Error('Failed to fetch ticks');

      const data = await response.json();
      setTicks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Tick Data Viewer</h1>
      <p>Use the filters below to fetch tick data from the database.</p>

      <div style={{ marginBottom: '15px' }}>
        <label>
          Script Name:
          <input
            type="text"
            value={scriptName}
            onChange={(e) => setScriptName(e.target.value)}
            placeholder="e.g., NIFTY"
            style={{ marginLeft: '10px', padding: '5px', borderRadius: '5px' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>
          Start Time:
          <input
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px', borderRadius: '5px' }}
          />
        </label>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>
          End Time:
          <input
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px', borderRadius: '5px' }}
          />
        </label>
      </div>

      <button
        onClick={fetchTicks}
        disabled={loading}
        style={{
          padding: '10px 15px',
          border: 'none',
          borderRadius: '5px',
          backgroundColor: '#007BFF',
          color: 'white',
          cursor: 'pointer',
        }}
      >
        {loading ? 'Fetching...' : 'Fetch Ticks'}
      </button>

      {error && <p style={{ color: 'red', marginTop: '15px' }}>Error: {error}</p>}

      <div style={{ marginTop: '20px' }}>
        <h2>Tick Data</h2>
        {ticks.length > 0 ? (
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
        ) : (
          <p>No tick data found for the given filters.</p>
        )}
      </div>
    </div>
  );
}
