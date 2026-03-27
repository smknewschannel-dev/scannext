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
};

type ScannedDevice = {
  ip: string;
  mac: string;
  vendor: string;
  host: string;
  state: 'up' | 'unknown';
  deviceType: 'router' | 'phone' | 'laptop' | 'iot' | 'server' | 'unknown';
  confidence: 'high' | 'medium' | 'low';
};

type NetworkScanResponse = {
  subnet: string;
  method: string;
  scannedAt: string;
  durationMs: number;
  count: number;
  items: ScannedDevice[];
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

  const [scanLoading, setScanLoading] = useState(false);
  const [scanResult, setScanResult] = useState<NetworkScanResponse | null>(null);

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

    void loadDashboard();
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

    void loadDevices();
  }, [query, status, site, protocol, sort]);

  const sites = useMemo(() => ['all', ...(dashboard?.sites ?? [])], [dashboard]);

  async function runScan() {
    setScanLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/network/scan`);
      const payload = (await response.json()) as NetworkScanResponse;
      setScanResult(payload);
    } catch {
      setError('Network scan failed. Ensure API has host network visibility and nmap/arp installed.');
    } finally {
      setScanLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <div>
          <p className="eyebrow">ScanNext OT Security Suite</p>
          <h1>Device Discovery & Risk Command Center</h1>
          <p className="subtitle">
            Real-time OT asset visibility with searchable inventory, risk prioritization, and live nearby network scan.
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

      <section className="scan-panel">
        <div className="scan-header">
          <div>
            <h2>Nearby Network Scan</h2>
            <p>Detect routers, phones, and nearby devices visible from the API host network.</p>
          </div>
          <button type="button" onClick={() => void runScan()} disabled={scanLoading}>
            {scanLoading ? 'Scanning...' : 'Run Scan'}
          </button>
        </div>

        {scanResult && (
          <>
            <p className="scan-meta">
              Subnet: <strong>{scanResult.subnet}</strong> · Method: <strong>{scanResult.method}</strong> · Devices:
              <strong> {scanResult.count}</strong> · Time: <strong>{scanResult.durationMs}ms</strong>
            </p>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>IP</th>
                    <th>Type</th>
                    <th>Host</th>
                    <th>Vendor</th>
                    <th>MAC</th>
                    <th>State</th>
                    <th>Confidence</th>
                  </tr>
                </thead>
                <tbody>
                  {scanResult.items.map((item) => (
                    <tr key={`${item.ip}-${item.mac}`}>
                      <td>{item.ip}</td>
                      <td className="capitalize">{item.deviceType}</td>
                      <td>{item.host}</td>
                      <td>{item.vendor}</td>
                      <td>{item.mac}</td>
                      <td className="capitalize">{item.state}</td>
                      <td className="capitalize">{item.confidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {scanResult.count === 0 && <p className="empty">No nearby devices found from current network namespace.</p>}
            </div>
          </>
        )}
      </section>

      {error && <p className="error-banner">{error}</p>}
    </main>
  );
}
