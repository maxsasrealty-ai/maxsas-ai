import { useEffect, useMemo, useState } from 'react';

const TOKENS = {
  page: '#04080f',
  section: '#070e1c',
  card: 'linear-gradient(145deg, #0a1020, #0d1828)',
  panel: 'rgba(15, 25, 50, 0.95)',
  gold: '#C9A84C',
  goldLight: '#E8C96D',
  blue: '#4F8CFF',
  success: '#00D084',
  text: '#e8edf5',
  muted: 'rgba(232,237,245,0.6)',
  border: '1px solid rgba(201,168,76,0.2)',
  borderHover: '1px solid rgba(201,168,76,0.45)',
  divider: '1px solid rgba(201,168,76,0.08)',
};

type LeadStatus = 'Hot' | 'Warm' | 'Cold';

type LeadRow = {
  id: string;
  name: string;
  location: string;
  budget: string;
  score: number;
  status: LeadStatus;
  lastTouch: string;
};

const LEADS: LeadRow[] = [
  { id: 'LD-1001', name: 'Rahul Sharma', location: 'Whitefield', budget: 'INR 80L', score: 97, status: 'Hot', lastTouch: '09:12' },
  { id: 'LD-1002', name: 'Priya Menon', location: 'Sarjapur', budget: 'INR 62L', score: 76, status: 'Warm', lastTouch: '09:08' },
  { id: 'LD-1003', name: 'Naveen Rao', location: 'Hebbal', budget: 'INR 48L', score: 54, status: 'Cold', lastTouch: '08:55' },
  { id: 'LD-1004', name: 'Ayesha Khan', location: 'Indiranagar', budget: 'INR 1.2Cr', score: 92, status: 'Hot', lastTouch: '09:01' },
  { id: 'LD-1005', name: 'Vikram Jain', location: 'Marathahalli', budget: 'INR 69L', score: 71, status: 'Warm', lastTouch: '08:49' },
];

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

const statusStyle: Record<LeadStatus, { bg: string; border: string; color: string }> = {
  Hot: {
    bg: 'rgba(201,168,76,0.12)',
    border: '1px solid rgba(201,168,76,0.45)',
    color: '#E8C96D',
  },
  Warm: {
    bg: 'rgba(79,140,255,0.15)',
    border: '1px solid rgba(79,140,255,0.35)',
    color: '#4F8CFF',
  },
  Cold: {
    bg: 'rgba(232,237,245,0.08)',
    border: '1px solid rgba(232,237,245,0.2)',
    color: 'rgba(232,237,245,0.6)',
  },
};

export default function EnterpriseLeads() {
  const [activeFilter, setActiveFilter] = useState<'All' | LeadStatus>('All');
  const [activeLead, setActiveLead] = useState<LeadRow | null>(null);
  const [width, setWidth] = useState<number>(typeof window === 'undefined' ? 1280 : window.innerWidth);

  useEffect(() => {
    injectFonts();
    if (typeof window === 'undefined') return;
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobile = width < 900;
  const filteredLeads = useMemo(() => {
    if (activeFilter === 'All') return LEADS;
    return LEADS.filter((l) => l.status === activeFilter);
  }, [activeFilter]);

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
      <div style={{ maxWidth: 1320, margin: '0 auto', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr auto', gap: 16, alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 11, color: TOKENS.gold, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600 }}>Enterprise Leads</div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(28px,3.5vw,48px)', letterSpacing: '-0.02em' }}>
            Premium Lead Intelligence
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['All', 'Hot', 'Warm', 'Cold'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                background: activeFilter === f ? 'linear-gradient(135deg, #C9A84C, #E8C96D)' : 'transparent',
                color: activeFilter === f ? '#04080f' : TOKENS.gold,
                border: activeFilter === f ? '1px solid rgba(201,168,76,0.6)' : '1px solid rgba(201,168,76,0.35)',
                borderRadius: 20,
                padding: '8px 14px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1320, margin: '20px auto 0', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 360px', gap: 16 }}>
        <div style={{ background: TOKENS.card, border: TOKENS.border, borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr style={{ background: 'rgba(201,168,76,0.06)', borderBottom: TOKENS.divider }}>
                  {['Lead', 'Location', 'Budget', 'Score', 'Status', 'Last Touch', 'Action'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: TOKENS.gold, padding: '12px 16px' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    style={{
                      borderBottom: TOKENS.divider,
                      background: lead.status === 'Hot' ? 'rgba(201,168,76,0.05)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{lead.name}</div>
                      <div style={{ fontSize: 12, color: TOKENS.muted }}>{lead.id}</div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>{lead.location}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>{lead.budget}</td>
                    <td style={{ padding: '12px 16px', fontSize: 14 }}>{lead.score}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          ...statusStyle[lead.status],
                          borderRadius: 20,
                          padding: '4px 12px',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 14, color: TOKENS.muted }}>{lead.lastTouch}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <button
                        onClick={() => setActiveLead(lead)}
                        style={{
                          background: 'transparent',
                          border: '1px solid rgba(201,168,76,0.35)',
                          color: TOKENS.gold,
                          borderRadius: 10,
                          padding: '8px 12px',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div
          style={{
            background: TOKENS.panel,
            border: TOKENS.borderHover,
            borderRadius: 16,
            minHeight: 420,
            boxShadow: '0 16px 48px rgba(201,168,76,0.12)',
            transform: activeLead ? 'translateX(0)' : 'translateX(12px)',
            opacity: activeLead ? 1 : 0.85,
            transition: 'all 0.25s ease',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: 20, borderBottom: TOKENS.divider }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: TOKENS.gold, textTransform: 'uppercase', fontWeight: 700 }}>Lead Detail Drawer</div>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 24, marginTop: 8 }}>Lead Intelligence</h2>
          </div>
          {activeLead ? (
            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, letterSpacing: 2, color: TOKENS.gold, textTransform: 'uppercase' }}>Name</div>
                <div style={{ fontSize: 18, fontFamily: "'Syne', sans-serif", fontWeight: 700 }}>{activeLead.name}</div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, letterSpacing: 2, color: TOKENS.gold, textTransform: 'uppercase' }}>Qualification Score</div>
                <div style={{ fontSize: 34, fontFamily: "'Syne', sans-serif", fontWeight: 800, background: 'linear-gradient(135deg, #C9A84C, #E8C96D)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {activeLead.score}
                </div>
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                <div style={{ background: TOKENS.card, border: TOKENS.border, borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 11, color: TOKENS.gold, letterSpacing: 2, textTransform: 'uppercase' }}>Location</div>
                  <div style={{ fontSize: 14 }}>{activeLead.location}</div>
                </div>
                <div style={{ background: TOKENS.card, border: TOKENS.border, borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 11, color: TOKENS.gold, letterSpacing: 2, textTransform: 'uppercase' }}>Budget</div>
                  <div style={{ fontSize: 14 }}>{activeLead.budget}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button style={{ background: 'linear-gradient(135deg, #C9A84C, #E8C96D)', color: '#04080f', border: 'none', borderRadius: 10, padding: '13px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 0 30px rgba(201,168,76,0.35)' }}>
                  Schedule Site Visit
                </button>
                <button style={{ background: 'transparent', color: TOKENS.gold, border: '1px solid rgba(201,168,76,0.35)', borderRadius: 10, padding: '13px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Export Lead
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: 20, color: TOKENS.muted, fontSize: 14 }}>Select a lead from the table to open premium lead details.</div>
          )}
        </div>
      </div>
    </div>
  );
}
