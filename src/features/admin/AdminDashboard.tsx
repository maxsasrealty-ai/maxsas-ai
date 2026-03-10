import { useEffect, useState } from 'react';

const TOKENS = {
  page: '#050d1a',
  sidebar: '#040c18',
  card: 'linear-gradient(145deg, #0c1a2e, #0a1525)',
  primary: '#4F8CFF',
  secondary: '#00D084',
  warning: '#F59E0B',
  danger: '#EF4444',
  purple: '#7C3AED',
  text: '#e8edf5',
  muted: 'rgba(232,237,245,0.45)',
  border: '1px solid rgba(79,140,255,0.12)',
  borderActive: '1px solid rgba(79,140,255,0.35)',
  divider: '1px solid rgba(255,255,255,0.06)',
};

function injectFonts(): void {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById('maxsas-admin-fonts');
  if (existing) return;
  const link = document.createElement('link');
  link.id = 'maxsas-admin-fonts';
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap';
  document.head.appendChild(link);
}

const navItems = ['Dashboard', 'Leads', 'Campaigns', 'Agents', 'Analytics', 'Settings', 'Users'];

const stats = [
  { label: 'Total Users', value: '4,281', tone: '#4F8CFF' },
  { label: 'Active Campaigns', value: '124', tone: '#00D084' },
  { label: 'Calls Today', value: '18,920', tone: '#7C3AED' },
  { label: 'System Health', value: '99.92%', tone: '#00D084' },
];

const recentActivity = [
  { actor: 'System', event: 'Webhook retries stabilized for API cluster-2', time: '09:08' },
  { actor: 'Admin', event: 'Created campaign for Bangalore East region', time: '09:13' },
  { actor: 'Agent', event: 'Voice model switched to Aria v3', time: '09:18' },
  { actor: 'System', event: 'Latency warning resolved for call-router', time: '09:26' },
];

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [width, setWidth] = useState<number>(typeof window === 'undefined' ? 1280 : window.innerWidth);

  useEffect(() => {
    injectFonts();
    if (typeof window === 'undefined') return;
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobile = width < 980;
  const sidebarWidth = isMobile ? 64 : collapsed ? 64 : 240;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: TOKENS.page, color: TOKENS.text, fontFamily: "'DM Sans', sans-serif" }}>
      <aside
        style={{
          width: sidebarWidth,
          background: TOKENS.sidebar,
          borderRight: TOKENS.divider,
          padding: '16px 8px',
          transition: 'width 0.2s ease',
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          height: '100vh',
        }}
      >
        <button
          onClick={() => setCollapsed((v) => !v)}
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid rgba(79,140,255,0.2)',
            color: 'rgba(232,237,245,0.7)',
            borderRadius: 8,
            padding: '8px 10px',
            marginBottom: 14,
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {collapsed || isMobile ? 'NAV' : 'Collapse'}
        </button>

        <div style={{ color: 'rgba(232,237,245,0.25)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', padding: '8px 12px' }}>
          Admin
        </div>

        {navItems.map((item, idx) => {
          const active = idx === 0;
          return (
            <div
              key={item}
              style={{
                padding: '10px 12px',
                borderLeft: active ? '3px solid #4F8CFF' : '3px solid transparent',
                borderRadius: 8,
                background: active ? 'rgba(79,140,255,0.1)' : 'transparent',
                color: active ? '#fff' : 'rgba(232,237,245,0.45)',
                fontSize: 13,
                marginBottom: 6,
              }}
            >
              {collapsed || isMobile ? item.slice(0, 2).toUpperCase() : item}
            </div>
          );
        })}
      </aside>

      <div style={{ flex: 1 }}>
        <header
          style={{
            background: TOKENS.sidebar,
            borderBottom: TOKENS.divider,
            padding: '14px 5vw',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr auto',
            gap: 12,
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <input
            placeholder="Search users, campaigns, logs"
            style={{
              background: 'rgba(79,140,255,0.06)',
              border: '1px solid rgba(79,140,255,0.2)',
              color: '#fff',
              borderRadius: 10,
              padding: '10px 14px',
              fontSize: 13,
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: isMobile ? 'flex-start' : 'flex-end' }}>
            <button style={{ background: 'transparent', border: TOKENS.border, color: TOKENS.text, borderRadius: 8, padding: '9px 12px', fontSize: 12, fontWeight: 600 }}>Bell</button>
            <button style={{ background: 'linear-gradient(135deg, #4F8CFF, #2563eb)', border: 'none', color: '#fff', borderRadius: 8, padding: '9px 12px', fontSize: 12, fontWeight: 600, boxShadow: '0 0 20px rgba(79,140,255,0.25)' }}>
              Admin
            </button>
          </div>
        </header>

        <main style={{ padding: '28px 5vw 80px' }}>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 'clamp(24px,2.5vw,28px)', marginBottom: 16 }}>Admin Dashboard</h1>

          <section style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4,minmax(0,1fr))', gap: 14, marginBottom: 18 }}>
            {stats.map((s) => (
              <div key={s.label} style={{ background: TOKENS.card, border: TOKENS.border, borderRadius: 14, padding: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.35)' }}>
                <div style={{ fontSize: 12, color: TOKENS.muted, fontWeight: 500 }}>{s.label}</div>
                <div style={{ marginTop: 8, fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(28px,3vw,36px)', color: s.tone }}>{s.value}</div>
                {s.label === 'System Health' ? (
                  <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: TOKENS.secondary, boxShadow: '0 0 8px rgba(0,208,132,0.5)' }} />
                    <span style={{ fontSize: 12, color: TOKENS.muted }}>All services healthy</span>
                  </div>
                ) : null}
              </div>
            ))}
          </section>

          <section style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: 14 }}>
            <div style={{ background: TOKENS.card, border: TOKENS.border, borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.35)' }}>
              <div style={{ padding: 16, borderBottom: TOKENS.divider }}>
                <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 600 }}>Recent Activity</h2>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'rgba(79,140,255,0.05)' }}>
                    {['Actor', 'Event', 'Time'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, letterSpacing: 2, color: TOKENS.muted, textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((r) => (
                    <tr key={`${r.actor}-${r.time}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{r.actor}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: TOKENS.muted }}>{r.event}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13 }}>{r.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ background: TOKENS.card, border: TOKENS.border, borderRadius: 14, padding: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.35)' }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Quick Actions</h2>
              <div style={{ display: 'grid', gap: 10 }}>
                <button style={{ background: 'linear-gradient(135deg, #4F8CFF, #2563eb)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 14, fontWeight: 600, boxShadow: '0 0 20px rgba(79,140,255,0.25)', cursor: 'pointer' }}>
                  Create Campaign
                </button>
                <button style={{ background: 'rgba(0,208,132,0.1)', border: '1px solid rgba(0,208,132,0.25)', color: '#00D084', borderRadius: 8, padding: '9px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Trigger Health Check
                </button>
                <button style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', borderRadius: 8, padding: '9px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Suspend Faulty Agent
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
