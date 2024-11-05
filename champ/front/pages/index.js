import { useState } from 'react';

export default function Home() {
  const [rejectionPoint, setRejectionPoint] = useState('');
  const [response, setResponse] = useState(null);

  const handleSubmit = async () => {
    try {
      const res = await fetch('/api/rejection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rejectionPoint }),
      });

      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <h1>Rejection Point Logger</h1>
      <input
        type="text"
        value={rejectionPoint}
        onChange={(e) => setRejectionPoint(e.target.value)}
        placeholder="Enter Rejection Point"
      />
      <button onClick={handleSubmit}>Submit</button>
      {response && <div>Response: {JSON.stringify(response)}</div>}
    </div>
  );
}
