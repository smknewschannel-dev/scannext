import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type DeviceStatus = 'online' | 'degraded' | 'offline';

type Device = {
  id: string;
  tenantId: string;
  name: string;
  ip: string;
  mac: string;
  vendor: string;
  model: string;
  protocol: 'Modbus' | 'DNP3' | 'OPC-UA' | 'BACnet' | 'S7';
  site: string;
  zone: string;
  criticality: 1 | 2 | 3 | 4 | 5;
  status: DeviceStatus;
  firmware: string;
  lastSeen: string;
  openAlerts: number;
  riskScore: number;
};

type Alert = {
  id: string;
  deviceId: string;
  severity: Severity;
  title: string;
  status: 'open' | 'investigating' | 'resolved';
  detectedAt: string;
};

const app = express();
const port = Number(process.env.PORT ?? 8080);

app.use(helmet());
app.use(cors());
app.use(express.json());

const devices: Device[] = [
  {
    id: 'dev-001',
    tenantId: 'tenant-demo',
    name: 'PLC-Assembly-01',
    ip: '10.12.1.14',
    mac: '00:1A:C2:7B:00:47',
    vendor: 'Siemens',
    model: 'S7-1500',
    protocol: 'S7',
    site: 'Pune Plant A',
    zone: 'Assembly Line',
    criticality: 5,
    status: 'online',
    firmware: 'v3.2.1',
    lastSeen: '2026-03-27T14:33:00Z',
    openAlerts: 2,
    riskScore: 84
  },
  {
    id: 'dev-002',
    tenantId: 'tenant-demo',
    name: 'RTU-Water-02',
    ip: '10.12.3.21',
    mac: '00:1A:C2:7B:00:88',
    vendor: 'Schneider',
    model: 'RTU560',
    protocol: 'DNP3',
    site: 'Pune Plant A',
    zone: 'Utility Block',
    criticality: 4,
    status: 'degraded',
    firmware: 'v2.9.0',
    lastSeen: '2026-03-27T14:28:00Z',
    openAlerts: 1,
    riskScore: 73
  },
  {
    id: 'dev-003',
    tenantId: 'tenant-demo',
    name: 'BMS-Gateway-01',
    ip: '10.15.2.10',
    mac: '00:1A:C2:7B:00:90',
    vendor: 'Honeywell',
    model: 'XL500',
    protocol: 'BACnet',
    site: 'Mumbai DC-1',
    zone: 'HVAC',
    criticality: 3,
    status: 'online',
    firmware: 'v1.4.7',
    lastSeen: '2026-03-27T14:31:00Z',
    openAlerts: 0,
    riskScore: 31
  },
  {
    id: 'dev-004',
    tenantId: 'tenant-demo',
    name: 'OPC-Historian-Node',
    ip: '10.99.1.5',
    mac: '00:1A:C2:7B:00:A3',
    vendor: 'Kepware',
    model: 'ServerEX',
    protocol: 'OPC-UA',
    site: 'Ahmedabad Refinery',
    zone: 'Control Room',
    criticality: 5,
    status: 'offline',
    firmware: 'v6.11.1',
    lastSeen: '2026-03-27T13:45:00Z',
    openAlerts: 3,
    riskScore: 92
  },
  {
    id: 'dev-005',
    tenantId: 'tenant-demo',
    name: 'Modbus-Drive-17',
    ip: '10.12.7.44',
    mac: '00:1A:C2:7B:00:B6',
    vendor: 'ABB',
    model: 'ACS880',
    protocol: 'Modbus',
    site: 'Pune Plant A',
    zone: 'Packaging',
    criticality: 4,
    status: 'online',
    firmware: 'v5.0.4',
    lastSeen: '2026-03-27T14:36:00Z',
    openAlerts: 1,
    riskScore: 66
  },
  {
    id: 'dev-006',
    tenantId: 'tenant-demo',
    name: 'PLC-Mixer-03',
    ip: '10.21.11.9',
    mac: '00:1A:C2:7B:00:C0',
    vendor: 'Rockwell',
    model: 'ControlLogix',
    protocol: 'Modbus',
    site: 'Ahmedabad Refinery',
    zone: 'Blending Unit',
    criticality: 5,
    status: 'degraded',
    firmware: 'v4.8.0',
    lastSeen: '2026-03-27T14:27:00Z',
    openAlerts: 2,
    riskScore: 79
  }
];

const alerts: Alert[] = [
  {
    id: 'alt-001',
    deviceId: 'dev-001',
    severity: 'critical',
    title: 'Unauthorized logic change attempt',
    status: 'investigating',
    detectedAt: '2026-03-27T14:20:00Z'
  },
  {
    id: 'alt-002',
    deviceId: 'dev-004',
    severity: 'critical',
    title: 'Historian node unreachable',
    status: 'open',
    detectedAt: '2026-03-27T13:46:00Z'
  },
  {
    id: 'alt-003',
    deviceId: 'dev-006',
    severity: 'high',
    title: 'Firmware mismatch with approved baseline',
    status: 'open',
    detectedAt: '2026-03-27T14:00:00Z'
  }
];

const uniqueSites = [...new Set(devices.map((device) => device.site))].sort();

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'api-gateway', timestamp: new Date().toISOString() });
});

app.get('/dashboard', (_req, res) => {
  const criticalAlerts = alerts.filter((alert) => alert.severity === 'critical').length;
  const highRiskDevices = devices.filter((device) => device.riskScore >= 75).length;

  res.json({
    summary: {
      totalDevices: devices.length,
      onlineDevices: devices.filter((device) => device.status === 'online').length,
      openAlerts: alerts.filter((alert) => alert.status !== 'resolved').length,
      criticalAlerts,
      highRiskDevices,
      averageRiskScore: Math.round(
        devices.reduce((acc, device) => acc + device.riskScore, 0) / devices.length
      )
    },
    sites: uniqueSites
  });
});

app.get('/devices', (req, res) => {
  const queryText = String(req.query.q ?? '').toLowerCase().trim();
  const status = String(req.query.status ?? 'all');
  const site = String(req.query.site ?? 'all');
  const protocol = String(req.query.protocol ?? 'all');
  const sortBy = String(req.query.sort ?? 'risk-desc');

  let result = devices.filter((device) => {
    const matchesText =
      queryText.length === 0 ||
      [device.name, device.ip, device.vendor, device.model, device.zone]
        .join(' ')
        .toLowerCase()
        .includes(queryText);

    const matchesStatus = status === 'all' || device.status === status;
    const matchesSite = site === 'all' || device.site === site;
    const matchesProtocol = protocol === 'all' || device.protocol === protocol;

    return matchesText && matchesStatus && matchesSite && matchesProtocol;
  });

  switch (sortBy) {
    case 'risk-asc':
      result = result.sort((a, b) => a.riskScore - b.riskScore);
      break;
    case 'name-asc':
      result = result.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'recent-desc':
      result = result.sort((a, b) => (a.lastSeen < b.lastSeen ? 1 : -1));
      break;
    default:
      result = result.sort((a, b) => b.riskScore - a.riskScore);
  }

  res.json({
    filters: {
      status: ['all', 'online', 'degraded', 'offline'],
      site: ['all', ...uniqueSites],
      protocol: ['all', ...new Set(devices.map((device) => device.protocol))],
      sort: ['risk-desc', 'risk-asc', 'name-asc', 'recent-desc']
    },
    count: result.length,
    items: result
  });
});

app.get('/alerts', (_req, res) => {
  res.json({
    count: alerts.length,
    items: alerts
      .map((alert) => ({
        ...alert,
        device: devices.find((device) => device.id === alert.deviceId)?.name ?? 'Unknown device'
      }))
      .sort((a, b) => (a.detectedAt < b.detectedAt ? 1 : -1))
  });
});

app.listen(port, () => {
  console.log(`API Gateway running on :${port}`);
});
