
import { useEffect, useState } from 'react';
import { ADMIN_COLORS, ADMIN_FONTS } from './adminColors';
import injectFonts from './injectFonts';
const tabs = [
  'Dashboard', 'Tenants', 'Users', 'Campaigns', 'Wallets', 'Payments', 'Analytics', 'Logs', "API's Controls"
];

type TopNavBarProps = {
  activeTab: string;
  onTab: (tab: string) => void;
  onLogout: () => void;
};

function TopNavBar({ activeTab, onTab, onLogout, mode, onModeChange }: TopNavBarProps & { mode: string, onModeChange: (mode: string) => void }) {
  return (
    <div style={{
      width: '100%',
      background: ADMIN_COLORS.sidebarHeaderBg,
      borderBottom: '1px solid rgba(79,140,255,0.1)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 32px',
      height: 64,
      position: 'sticky',
      top: 0,
      zIndex: 10
    }}>
      <div style={{ display: 'flex', alignItems: 'center', marginRight: 32 }}>
        <img src="/logo.svg" alt="Maxsas" style={{ height: 32, marginRight: 12 }} />
        <span style={{ fontFamily: ADMIN_FONTS.heading, fontWeight: 700, fontSize: 22, color: ADMIN_COLORS.textPrimary }}>
          Admin Panel
        </span>
      </div>
      <div style={{ display: 'flex', flex: 1 }}>
        {tabs.map(tab => (
          <div
            key={tab}
            onClick={() => onTab(tab)}
            style={{
              padding: '0 18px',
              height: 64,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              fontFamily: ADMIN_FONTS.heading,
              fontWeight: 700,
              fontSize: 15,
              color: activeTab === tab ? '#fff' : ADMIN_COLORS.textMuted,
              borderBottom: activeTab === tab ? '2px solid #4F8CFF' : '2px solid transparent',
              background: activeTab === tab ? 'rgba(79,140,255,0.08)' : 'transparent',
              transition: 'all 0.2s',
              marginRight: 2
            }}
            onMouseOver={e => {
              if (activeTab !== tab) (e.currentTarget).style.color = '#e8edf5';
            }}
            onMouseOut={e => {
              if (activeTab !== tab) (e.currentTarget).style.color = ADMIN_COLORS.textMuted;
            }}
          >
            {tab}
          </div>
        ))}
        {/* Mode Switch */}
        <div style={{ marginLeft: 32, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: ADMIN_COLORS.textMuted, fontSize: 13, fontWeight: 600 }}>Mode:</span>
          <button
            onClick={() => onModeChange(mode === 'Lexus Plan' ? 'Enterprise Plan' : 'Lexus Plan')}
            style={{
              background: mode === 'Lexus Plan' ? ADMIN_COLORS.primary : ADMIN_COLORS.secondary,
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '7px 18px',
              fontWeight: 700,
              fontFamily: ADMIN_FONTS.body,
              fontSize: 14,
              cursor: 'pointer',
              transition: 'background 0.2s',
              marginLeft: 4
            }}
          >
            {mode}
          </button>
        </div>
      </div>
      <button
        onClick={onLogout}
        style={{
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          color: ADMIN_COLORS.danger,
          borderRadius: 10,
          padding: '10px 18px',
          fontFamily: ADMIN_FONTS.body,
          fontWeight: 600,
          fontSize: 15,
          marginLeft: 24,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          transition: 'background 0.2s',
        }}
        onMouseOver={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
        onMouseOut={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
      >
        <span style={{ marginRight: 8 }}>Logout</span>
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="#EF4444" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"/></svg>
      </button>
    </div>
  );
}


type InfoBannerProps = { message: string };
function InfoBanner({ message }: InfoBannerProps) {
  return (
    <div style={{
      width: '100%',
      background: ADMIN_COLORS.infoBannerBg,
      borderLeft: ADMIN_COLORS.infoBannerBorder,
      color: ADMIN_COLORS.primary,
      fontFamily: ADMIN_FONTS.body,
      fontSize: 12,
      display: 'flex',
      alignItems: 'center',
      padding: '7px 18px',
      marginBottom: 0
    }}>
      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" style={{ marginRight: 8 }}><circle cx="12" cy="12" r="10" stroke="#4F8CFF" strokeWidth="2"/><path d="M12 8v4m0 4h.01" stroke="#4F8CFF" strokeWidth="2" strokeLinecap="round"/></svg>
      <span>{message}</span>
    </div>
  );
}




const recentActivity = [
  { actor: 'System', event: 'Webhook retries stabilized for API cluster-2', time: '09:08' },
  { actor: 'Admin', event: 'Created campaign for Bangalore East region', time: '09:13' },
  { actor: 'Agent', event: 'Voice model switched to Aria v3', time: '09:18' },
  { actor: 'System', event: 'Latency warning resolved for call-router', time: '09:26' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [width, setWidth] = useState<number>(typeof window === 'undefined' ? 1280 : window.innerWidth);
  const [mode, setMode] = useState<'Lexus Plan' | 'Enterprise Plan'>('Lexus Plan');

  useEffect(() => {
    injectFonts();
    if (typeof window === 'undefined') return;
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobile = width < 980;

  return (
    <div style={{ minHeight: '100vh', background: ADMIN_COLORS.pageBase, color: ADMIN_COLORS.textPrimary, fontFamily: ADMIN_FONTS.body }}>
      <TopNavBar
        activeTab={activeTab}
        onTab={setActiveTab}
        onLogout={() => {}}
        mode={mode}
        onModeChange={setMode}
      />
      <InfoBanner message="Welcome to the new Admin Panel! All systems operational." />
      <main style={{ padding: '32px 5vw 80px', maxWidth: 1600, margin: '0 auto' }}>
        <h1 style={{ fontFamily: ADMIN_FONTS.heading, fontWeight: 800, fontSize: 32, marginBottom: 18, color: ADMIN_COLORS.textPrimary }}>Admin Dashboard</h1>

        <section style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4,minmax(0,1fr))', gap: 18, marginBottom: 24 }}>
          {/* Add stat cards here if needed */}
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.5fr 1fr', gap: 18 }}>
          <div style={{ background: ADMIN_COLORS.cardBg, border: ADMIN_COLORS.cardBorder, borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ padding: 20, borderBottom: ADMIN_COLORS.borderDefault }}>
              <h2 style={{ fontFamily: ADMIN_FONTS.heading, fontSize: 22, fontWeight: 700, color: ADMIN_COLORS.textPrimary }}>Recent Activity</h2>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(79,140,255,0.05)' }}>
                  {['Actor', 'Event', 'Time'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 20px', fontSize: 12, letterSpacing: 2, color: ADMIN_COLORS.textMuted, textTransform: 'uppercase', fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((r) => (
                  <tr key={`${r.actor}-${r.time}`} style={{ borderBottom: ADMIN_COLORS.borderDefault }}>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: ADMIN_COLORS.textPrimary }}>{r.actor}</td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: ADMIN_COLORS.textMuted }}>{r.event}</td>
                    <td style={{ padding: '14px 20px', fontSize: 14, color: ADMIN_COLORS.textPrimary }}>{r.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ background: ADMIN_COLORS.cardBg, border: ADMIN_COLORS.cardBorder, borderRadius: 16, padding: 20 }}>
            <h2 style={{ fontFamily: ADMIN_FONTS.heading, fontSize: 22, fontWeight: 700, marginBottom: 14, color: ADMIN_COLORS.textPrimary }}>Quick Actions</h2>
            <div style={{ display: 'grid', gap: 12 }}>
              <button style={{ background: `linear-gradient(135deg, ${ADMIN_COLORS.primary}, #2563eb)`, color: '#fff', border: 'none', borderRadius: 10, padding: '11px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: ADMIN_FONTS.body }}>
                Create Campaign
              </button>
              <button style={{ background: 'rgba(0,208,132,0.1)', border: '1px solid rgba(0,208,132,0.25)', color: ADMIN_COLORS.success, borderRadius: 10, padding: '11px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: ADMIN_FONTS.body }}>
                Trigger Health Check
              </button>
              <button style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: ADMIN_COLORS.danger, borderRadius: 10, padding: '11px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: ADMIN_FONTS.body }}>
                Suspend Faulty Agent
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
