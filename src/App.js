import { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(setData)
      .catch(err => setError(err.message));
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>EVA3 — Frontend</h1>
      <p>Evaluación ISY1101 — Introducción a Herramientas DevOps</p>
      {error && <p style={{ color: 'red' }}>Error conectando al backend: {error}</p>}
      {data && <p>{data.message}</p>}
      {!data && !error && <p>Cargando...</p>}
    </div>
  );
}

export default App;
