import { useEffect, useMemo, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

const TOKENS = {
  page: '#04080f',
  section: '#070e1c',
  card: 'linear-gradient(145deg, #0a1020, #0d1828)',
  cardHover: 'linear-gradient(145deg, #0d1828, #111e30)',
  panel: 'rgba(15, 25, 50, 0.95)',
  gold: '#C9A84C',
  goldLight: '#E8C96D',
  goldDark: '#A07830',
  goldGlow: 'rgba(201,168,76,0.15)',
  blue: '#4F8CFF',
  success: '#00D084',
  text: '#e8edf5',
  muted: 'rgba(232,237,245,0.6)',
  border: '1px solid rgba(201,168,76,0.2)',
  borderHover: '1px solid rgba(201,168,76,0.45)',
  divider: '1px solid rgba(201,168,76,0.08)',
};

function injectFonts(): void {
  if (typeof document === 'undefined') return;
  const existing = document.getElementById('maxsas-enterprise-fonts');
  if (existing) return;
  const link = document.createElement('link');
  link.id = 'maxsas-enterprise-fonts';
  link.rel = 'stylesheet';
  link.href =
    'https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap';
  document.head.appendChild(link);
}

type SidebarItem = { label: string; short: string };
const SIDEBAR_ITEMS: SidebarItem[] = [
  { label: 'Dashboard', short: 'DB' },
  { label: 'Leads', short: 'LD' },
  { label: 'Analytics', short: 'AN' },
  { label: 'Calls', short: 'CL' },
  { label: 'ROI', short: 'ROI' },
  { label: 'Settings', short: 'ST' },
];

const STATS = [
  { label: 'Total Calls', value: '12,480', delta: '+18%' },
  { label: 'Hot Leads', value: '1,294', delta: '+9%' },
  { label: 'Qualified Buyers', value: '842', delta: '+13%' },
  { label: 'Revenue Saved', value: 'INR 38.4L', delta: '+22%' },
];

const LIVE_FEED = [
  { time: '09:04', lead: 'Rahul Sharma', status: 'Qualified', score: 92 },
  { time: '09:07', lead: 'Priya Menon', status: 'Hot', score: 97 },
  { time: '09:12', lead: 'Nitin Rao', status: 'Follow-up', score: 68 },
  { time: '09:17', lead: 'Ayesha Khan', status: 'Qualified', score: 89 },
  { time: '09:20', lead: 'Vikram Jain', status: 'Hot', score: 95 },
];

const PIPELINE_DATA = [
  { stage: 'New', count: 420 },
  { stage: 'Called', count: 350 },
  { stage: 'Qualified', count: 228 },
  { stage: 'Visit', count: 130 },
  { stage: 'Closed', count: 62 },
];

const ACTIVITY = [
  { time: '09:02', text: 'Diamond team launched batch campaign #B932' },
  { time: '09:11', text: 'AI closed 24 high-intent qualification loops' },
  { time: '09:19', text: 'Revenue estimate updated for Whitefield cluster' },
  { time: '09:28', text: '3 enterprise users upgraded voice persona pack' },
  { time: '09:31', text: 'Follow-up automation set for 52 warm leads' },
];

export default function EnterpriseDashboard() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState<number>(typeof window === 'undefined' ? 1280 : window.innerWidth);

  useEffect(() => {
    injectFonts();
    if (typeof window === 'undefined') return;
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobile = width < 900;
  const sidebarWidth = isMobile ? 64 : isCollapsed ? 64 : 240;

  const pageMesh = useMemo(
    () =>
      'radial-gradient(ellipse 70% 50% at 15% 35%, rgba(201,168,76,0.06), transparent 60%), radial-gradient(ellipse 50% 40% at 85% 70%, rgba(79,140,255,0.05), transparent 55%), linear-gradient(180deg, #04080f, #070e1c, #04080f)',
    []
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        background: pageMesh,
        color: TOKENS.text,
        fontFamily: "'DM Sans', sans-serif",
        display: 'flex',
      }}
    >
      <aside
        style={{
          width: sidebarWidth,
          background: TOKENS.page,
          borderRight: TOKENS.divider,
          transition: 'width 0.25s ease',
          padding: '18px 10px',
          position: 'sticky',
          top: 0,
          alignSelf: 'flex-start',
          height: '100vh',
        }}
      >
        <button
          onClick={() => setIsCollapsed((v) => !v)}
          style={{
            width: '100%',
            borderRadius: 10,
            border: TOKENS.border,
            background: 'transparent',
            color: TOKENS.gold,
            padding: '8px 10px',
            marginBottom: 14,
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {isCollapsed || isMobile ? 'EXP' : 'Collapse'}
        </button>
        {SIDEBAR_ITEMS.map((item, idx) => {
          const active = idx === 0;
          return (
            <div
              key={item.label}
              style={{
                background: active ? 'rgba(201,168,76,0.1)' : 'transparent',
                border: active ? TOKENS.borderHover : '1px solid transparent',
                borderRadius: 12,
                color: active ? '#fff' : 'rgba(232,237,245,0.7)',
                padding: '10px 12px',
                marginBottom: 8,
                fontSize: 13,
                fontWeight: 500,
              }}
            >
              {isCollapsed || isMobile ? item.short : item.label}
            </div>
          );
        })}
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            background: 'rgba(7,14,28,0.7)',
            backdropFilter: 'blur(14px)',
            borderBottom: TOKENS.divider,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 5vw',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-block',
                background: 'linear-gradient(135deg, #C9A84C, #E8C96D)',
                color: '#04080f',
                borderRadius: 20,
                padding: '4px 12px',
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              ENTERPRISE
            </div>
            <h1
              style={{
                marginTop: 10,
                fontFamily: "'Syne', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(28px,3.5vw,48px)',
                letterSpacing: '-0.02em',
              }}
            >
              Enterprise Command Center
            </h1>
          </div>
          <div style={{ color: TOKENS.gold, fontSize: 13 }}>ROI snapshot: +22% this month</div>
        </header>

        <main style={{ padding: '40px 5vw 80px' }}>
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(4,minmax(0,1fr))',
              gap: 16,
              marginBottom: 24,
            }}
          >
            {STATS.map((s) => (
              <div
                key={s.label}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  background: TOKENS.card,
                  border: TOKENS.border,
                  borderRadius: 16,
                  padding: 20,
                  boxShadow: '0 0 40px rgba(201,168,76,0.08), 0 8px 32px rgba(0,0,0,0.5)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    right: -16,
                    bottom: -10,
                    fontFamily: "'Syne', sans-serif",
                    fontSize: 72,
                    fontWeight: 800,
                    color: 'rgba(201,168,76,0.04)',
                    transform: 'rotate(-15deg)',
                    zIndex: 0,
                  }}
                >
                  ENTERPRISE
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: TOKENS.gold, fontWeight: 600, textTransform: 'uppercase' }}>
                    {s.label}
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      fontFamily: "'Syne', sans-serif",
                      fontSize: 'clamp(32px,3vw,40px)',
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #C9A84C, #E8C96D)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {s.value}
                  </div>
                  <div style={{ marginTop: 6, color: 'rgba(232,237,245,0.6)', fontSize: 13 }}>{s.delta} vs last 30 days</div>
                </div>
              </div>
            ))}
          </section>

          <section
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1.8fr 1.2fr 320px',
              gap: 16,
            }}
          >
            <div style={{ background: TOKENS.card, border: TOKENS.border, borderRadius: 16, padding: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 'clamp(22px,2.5vw,36px)', marginBottom: 16 }}>Live Calls Feed</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
                  <thead>
                    <tr style={{ borderBottom: TOKENS.divider }}>
                      {['Time', 'Lead', 'Status', 'Score'].map((h) => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 8px', color: TOKENS.gold, fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {LIVE_FEED.map((row) => (
                      <tr key={`${row.time}-${row.lead}`} style={{ borderBottom: TOKENS.divider }}>
                        <td style={{ padding: '12px 8px', fontSize: 14 }}>{row.time}</td>
                        <td style={{ padding: '12px 8px', fontSize: 14 }}>{row.lead}</td>
                        <td style={{ padding: '12px 8px', fontSize: 14, color: row.status === 'Hot' ? TOKENS.goldLight : TOKENS.text }}>{row.status}</td>
                        <td style={{ padding: '12px 8px', fontSize: 14 }}>{row.score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ background: TOKENS.card, border: TOKENS.border, borderRadius: 16, padding: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 24, marginBottom: 10 }}>Lead Pipeline</h2>
              <div style={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={PIPELINE_DATA}>
                    <CartesianGrid stroke="rgba(201,168,76,0.08)" />
                    <XAxis dataKey="stage" stroke="rgba(232,237,245,0.6)" />
                    <YAxis stroke="rgba(232,237,245,0.6)" />
                    <Tooltip
                      contentStyle={{
                        background: TOKENS.panel,
                        border: TOKENS.border,
                        borderRadius: 10,
                        color: TOKENS.text,
                      }}
                    />
                    <Bar dataKey="count" fill={TOKENS.gold} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ background: TOKENS.card, border: TOKENS.border, borderRadius: 16, padding: 20, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 24, marginBottom: 12 }}>Today&apos;s Activity</h2>
              {ACTIVITY.map((a) => (
                <div key={`${a.time}-${a.text}`} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: TOKENS.divider }}>
                  <div>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: TOKENS.gold, boxShadow: '0 0 10px rgba(201,168,76,0.5)', marginTop: 6 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: TOKENS.gold }}>{a.time}</div>
                    <div style={{ fontSize: 13, color: TOKENS.muted }}>{a.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section style={{ marginTop: 18, background: TOKENS.card, border: TOKENS.border, borderRadius: 16, padding: 20 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, marginBottom: 12 }}>Revenue Trend</h2>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { day: 'Mon', val: 5.2 },
                    { day: 'Tue', val: 6.1 },
                    { day: 'Wed', val: 6.6 },
                    { day: 'Thu', val: 7.3 },
                    { day: 'Fri', val: 8.5 },
                    { day: 'Sat', val: 7.8 },
                    { day: 'Sun', val: 9.1 },
                  ]}
                >
                  <CartesianGrid stroke="rgba(201,168,76,0.08)" />
                  <XAxis dataKey="day" stroke="rgba(232,237,245,0.6)" />
                  <YAxis stroke="rgba(232,237,245,0.6)" />
                  <Tooltip contentStyle={{ background: TOKENS.panel, border: TOKENS.border, borderRadius: 10 }} />
                  <Line type="monotone" dataKey="val" stroke={TOKENS.goldLight} strokeWidth={3} dot={{ fill: TOKENS.gold }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
