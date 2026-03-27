import { useEffect, useMemo, useState } from 'react';

type DeviceStatus = 'online' | 'degraded' | 'offline';

type Device = {
  id: string;
  name: string;
  ip: string;
  vendor: string;
  model: string;
  protocol: string;
  site: string;
  zone: string;
  criticality: number;
  status: DeviceStatus;
  lastSeen: string;
  openAlerts: number;
  riskScore: number;
};

type DashboardResponse = {
  summary: {
    totalDevices: number;
    onlineDevices: number;
    openAlerts: number;
    criticalAlerts: number;
    highRiskDevices: number;
    averageRiskScore: number;
  };
  sites: string[];
};

type DevicesResponse = {
  count: number;
  items: Device[];
  filters: {
    status: string[];
    site: string[];
    protocol: string[];
    sort: string[];
  };
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

function riskTone(score: number) {
  if (score >= 80) return 'critical';
  if (score >= 65) return 'high';
  if (score >= 45) return 'medium';
  return 'low';
}

export function App() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [site, setSite] = useState('all');
  const [protocol, setProtocol] = useState('all');
  const [sort, setSort] = useState('risk-desc');

  const statusFilters = ['all', 'online', 'degraded', 'offline'];
  const sortOptions = [
    { value: 'risk-desc', label: 'Risk: High to Low' },
    { value: 'risk-asc', label: 'Risk: Low to High' },
    { value: 'name-asc', label: 'Name: A-Z' },
    { value: 'recent-desc', label: 'Last Seen: Recent' }
  ];

  useEffect(() => {
    async function loadDashboard() {
      try {
        const dashboardRes = await fetch(`${API_BASE_URL}/dashboard`);
        const dashboardJson = (await dashboardRes.json()) as DashboardResponse;
        setDashboard(dashboardJson);
      } catch {
        setError('Dashboard summary fetch failed');
      }
    }

    loadDashboard();
  }, []);

  useEffect(() => {
    async function loadDevices() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          status,
          site,
          protocol,
          sort
        });

        const devicesRes = await fetch(`${API_BASE_URL}/devices?${params.toString()}`);
        const devicesJson = (await devicesRes.json()) as DevicesResponse;
        setDevices(devicesJson.items);
      } catch {
        setError('Device discovery fetch failed');
      } finally {
        setLoading(false);
      }
    }

    loadDevices();
  }, [query, status, site, protocol, sort]);

  const sites = useMemo(() => ['all', ...(dashboard?.sites ?? [])], [dashboard]);

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">ScanNext OT Security Suite</p>
          <h1>Device Discovery & Risk Command Center</h1>
          <p className="subtitle">
            Real-time OT asset visibility with searchable inventory, risk prioritization, and alert-aware operations.
          </p>
        </div>
      </header>

      <section className="kpi-grid">
        <article className="kpi-card">
          <span>Total Devices</span>
          <strong>{dashboard?.summary.totalDevices ?? '--'}</strong>
        </article>
        <article className="kpi-card">
          <span>Online Devices</span>
          <strong>{dashboard?.summary.onlineDevices ?? '--'}</strong>
        </article>
        <article className="kpi-card">
          <span>Open Alerts</span>
          <strong>{dashboard?.summary.openAlerts ?? '--'}</strong>
        </article>
        <article className="kpi-card">
          <span>Critical Alerts</span>
          <strong>{dashboard?.summary.criticalAlerts ?? '--'}</strong>
        </article>
        <article className="kpi-card">
          <span>High-Risk Devices</span>
          <strong>{dashboard?.summary.highRiskDevices ?? '--'}</strong>
        </article>
        <article className="kpi-card">
          <span>Avg Risk Score</span>
          <strong>{dashboard?.summary.averageRiskScore ?? '--'}</strong>
        </article>
      </section>

      <section className="finder-panel">
        <div className="finder-title-row">
          <h2>Devices Finder</h2>
          <small>{loading ? 'Refreshing...' : `${devices.length} devices shown`}</small>
        </div>

        <div className="filters">
          <label>
            Search
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, IP, vendor, model, zone"
            />
          </label>

          <label>
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              {statusFilters.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            Site
            <select value={site} onChange={(event) => setSite(event.target.value)}>
              {sites.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            Protocol
            <select value={protocol} onChange={(event) => setProtocol(event.target.value)}>
              {['all', 'Modbus', 'DNP3', 'OPC-UA', 'BACnet', 'S7'].map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label>
            Sort by
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Device</th>
                <th>Network</th>
                <th>Location</th>
                <th>Status</th>
                <th>Alerts</th>
                <th>Risk</th>
                <th>Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {devices.map((device) => (
                <tr key={device.id}>
                  <td>
                    <strong>{device.name}</strong>
                    <small>
                      {device.vendor} · {device.model} · {device.protocol}
                    </small>
                  </td>
                  <td>
                    {device.ip}
                    <small>Zone: {device.zone}</small>
                  </td>
                  <td>{device.site}</td>
                  <td>
                    <span className={`status-badge ${device.status}`}>{device.status}</span>
                  </td>
                  <td>{device.openAlerts}</td>
                  <td>
                    <span className={`risk-pill ${riskTone(device.riskScore)}`}>{device.riskScore}</span>
                  </td>
                  <td>{new Date(device.lastSeen).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && devices.length === 0 && <p className="empty">No devices matched your filters.</p>}
        </div>
      </section>

      {error && <p className="error-banner">{error}</p>}
    </main>
  );
}
