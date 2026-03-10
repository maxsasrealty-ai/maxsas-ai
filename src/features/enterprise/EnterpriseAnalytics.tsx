import { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
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
  gold: '#C9A84C',
  goldLight: '#E8C96D',
  blue: '#4F8CFF',
  text: '#e8edf5',
  muted: 'rgba(232,237,245,0.6)',
  border: '1px solid rgba(201,168,76,0.2)',
  divider: '1px solid rgba(201,168,76,0.08)',
  panel: 'rgba(15, 25, 50, 0.95)',
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

const KPIS = [
  { label: 'Conversion Rate', value: '27.4%' },
  { label: 'Avg Call Duration', value: '2m 18s' },
  { label: 'Cost Per Qualified Lead', value: 'INR 182' },
  { label: 'AI Efficiency Gain', value: '10.8x' },
];

const TREND = [
  { week: 'W1', qualified: 180, closed: 45 },
  { week: 'W2', qualified: 205, closed: 52 },
  { week: 'W3', qualified: 240, closed: 66 },
  { week: 'W4', qualified: 268, closed: 74 },
  { week: 'W5', qualified: 295, closed: 82 },
  { week: 'W6', qualified: 322, closed: 91 },
];

const SOURCE = [
  { source: '99acres', leads: 310 },
  { source: 'MagicBricks', leads: 270 },
  { source: 'Website', leads: 190 },
  { source: 'Referrals', leads: 88 },
];

export default function EnterpriseAnalytics() {
  const [width, setWidth] = useState<number>(typeof window === 'undefined' ? 1280 : window.innerWidth);
  const [range, setRange] = useState<'7D' | '30D' | '90D'>('30D');

  useEffect(() => {
    injectFonts();
    if (typeof window === 'undefined') return;
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobile = width < 900;

  return (
    <div
      style={{
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse 70% 50% at 15% 35%, rgba(201,168,76,0.06), transparent 60%), radial-gradient(ellipse 50% 40% at 85% 70%, rgba(79,140,255,0.05), transparent 55%), linear-gradient(180deg, #04080f, #070e1c, #04080f)',
        color: TOKENS.text,
        fontFamily: "'DM Sans', sans-serif",
        padding: '100px 5vw',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', color: TOKENS.gold, fontWeight: 600 }}>Enterprise Analytics</div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(28px,3.5vw,48px)', letterSpacing: '-0.02em' }}>
              Revenue and Qualification Intelligence
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['7D', '30D', '90D'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                style={{
                  background: range === r ? 'linear-gradient(135deg, #C9A84C, #E8C96D)' : 'transparent',
                  color: range === r ? '#04080f' : TOKENS.gold,
                  border: range === r ? '1px solid rgba(201,168,76,0.6)' : '1px solid rgba(201,168,76,0.35)',
                  borderRadius: 20,
                  padding: '8px 14px',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4,minmax(0,1fr))', gap: 16 }}>
          {KPIS.map((k) => (
            <div key={k.label} style={{ background: TOKENS.card, border: TOKENS.border, borderRadius: 16, padding: 18, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              <div style={{ fontSize: 11, color: TOKENS.gold, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>{k.label}</div>
              <div style={{ marginTop: 8, fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(32px,3vw,40px)', background: 'linear-gradient(135deg, #C9A84C, #E8C96D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {k.value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.6fr 1fr', gap: 16 }}>
          <div style={{ background: TOKENS.card, border: TOKENS.border, borderRadius: 16, padding: 20 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 'clamp(22px,2.5vw,36px)', fontWeight: 700, marginBottom: 12 }}>Qualification vs Closures</h2>
            <div style={{ height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={TREND}>
                  <CartesianGrid stroke="rgba(201,168,76,0.08)" />
                  <XAxis dataKey="week" stroke={TOKENS.muted} />
                  <YAxis stroke={TOKENS.muted} />
                  <Tooltip contentStyle={{ background: TOKENS.panel, border: TOKENS.border, borderRadius: 10 }} />
                  <Legend />
                  <Line type="monotone" dataKey="qualified" stroke={TOKENS.gold} strokeWidth={3} dot={{ fill: TOKENS.goldLight }} />
                  <Line type="monotone" dataKey="closed" stroke={TOKENS.blue} strokeWidth={3} dot={{ fill: TOKENS.blue }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ background: TOKENS.card, border: TOKENS.border, borderRadius: 16, padding: 20 }}>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 12 }}>Lead Sources</h2>
            <div style={{ height: 340 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SOURCE}>
                  <CartesianGrid stroke="rgba(201,168,76,0.08)" />
                  <XAxis dataKey="source" stroke={TOKENS.muted} />
                  <YAxis stroke={TOKENS.muted} />
                  <Tooltip contentStyle={{ background: TOKENS.panel, border: TOKENS.border, borderRadius: 10 }} />
                  <Bar dataKey="leads" fill={TOKENS.gold} radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, background: TOKENS.card, border: TOKENS.border, borderRadius: 16, padding: 20 }}>
          <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: TOKENS.gold, fontWeight: 600 }}>Active Range</div>
          <p style={{ fontSize: 14, color: TOKENS.muted, marginTop: 8 }}>
            Current date range selection: {range}. Gold trend line indicates premium conversion trajectory for enterprise campaigns.
          </p>
        </div>
      </div>
    </div>
  );
}
