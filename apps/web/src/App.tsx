import { useEffect, useState } from 'react';

type DashboardData = {
  assets: number;
  alertsOpen: number;
  riskScore: number;
  status: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export function App() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/dashboard`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => {
        setData({ assets: 0, alertsOpen: 0, riskScore: 0, status: 'API unreachable' });
      });
  }, []);

  return (
    <main className="page">
      <h1>ScanNext OT Security Dashboard</h1>
      <div className="grid">
        <section className="card">
          <h2>Assets</h2>
          <p>{data?.assets ?? '...'}</p>
        </section>
        <section className="card">
          <h2>Open Alerts</h2>
          <p>{data?.alertsOpen ?? '...'}</p>
        </section>
        <section className="card">
          <h2>Risk Score</h2>
          <p>{data?.riskScore ?? '...'}</p>
        </section>
      </div>
      <small>Status: {data?.status ?? 'Loading'}</small>
    </main>
  );
}
