import { useEffect, useState } from 'react';

const TOKENS = {
  page: '#050d1a',
  card: 'linear-gradient(145deg, #0c1a2e, #0a1525)',
  primary: '#4F8CFF',
  secondary: '#00D084',
  warning: '#F59E0B',
  danger: '#EF4444',
  text: '#e8edf5',
  muted: 'rgba(232,237,245,0.45)',
};

type CampaignStatus = 'Live' | 'Paused' | 'Pending';
type Campaign = {
  id: string;
  name: string;
  calls: number;
  total: number;
  status: CampaignStatus;
};

const CAMPAIGNS: Campaign[] = [
  { id: 'CMP-201', name: 'Bangalore East Premium Buyers', calls: 1240, total: 1600, status: 'Live' },
  { id: 'CMP-202', name: 'Sarjapur New Launch Push', calls: 620, total: 1300, status: 'Paused' },
  { id: 'CMP-203', name: 'Weekend Visit Conversions', calls: 388, total: 900, status: 'Pending' },
  { id: 'CMP-204', name: 'Luxury Segment Reactivation', calls: 980, total: 1200, status: 'Live' },
];

import injectFonts from './injectFonts';

function statusBadge(status: CampaignStatus): { bg: string; border: string; color: string } {
  if (status === 'Live') return { bg: 'rgba(0,208,132,0.1)', border: '1px solid rgba(0,208,132,0.25)', color: '#00D084' };
  if (status === 'Pending') return { bg: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B' };
  return { bg: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444' };
}

export default function AdminCampaigns() {
  const [width, setWidth] = useState<number>(typeof window === 'undefined' ? 1280 : window.innerWidth);

  useEffect(() => {
    injectFonts();
    if (typeof window === 'undefined') return;
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobile = width < 860;

  return (
    <div style={{ minHeight: '100vh', background: TOKENS.page, color: TOKENS.text, fontFamily: "'DM Sans', sans-serif", padding: '100px 5vw', position: 'relative' }}>
      <div style={{ maxWidth: 1220, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 'clamp(24px,2.5vw,28px)', marginBottom: 16 }}>Admin Campaigns</h1>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2,minmax(0,1fr))', gap: 14 }}>
          {CAMPAIGNS.map((campaign) => {
            const progress = Math.round((campaign.calls / campaign.total) * 100);
            const badge = statusBadge(campaign.status);
            return (
              <div key={campaign.id} style={{ background: TOKENS.card, border: '1px solid rgba(79,140,255,0.12)', borderRadius: 14, padding: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.35)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'start' }}>
                  <div>
                    <div style={{ fontSize: 12, color: TOKENS.muted }}>{campaign.id}</div>
                    <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 600, fontSize: 20, marginTop: 6 }}>{campaign.name}</h2>
                  </div>
                  <span style={{ background: badge.bg, border: badge.border, color: badge.color, borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 600 }}>{campaign.status}</span>
                </div>

                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: TOKENS.muted, marginBottom: 8 }}>
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div style={{ width: '100%', height: 8, borderRadius: 99, background: 'rgba(79,140,255,0.12)', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #4F8CFF, #2563eb)' }} />
                  </div>
                </div>

                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', color: TOKENS.muted, fontSize: 13 }}>
                  <span>Calls made: {campaign.calls}</span>
                  <span>Total: {campaign.total}</span>
                </div>

                <div style={{ marginTop: 14 }}>
                  <button style={{ background: campaign.status === 'Live' ? 'rgba(239,68,68,0.1)' : 'rgba(0,208,132,0.1)', border: campaign.status === 'Live' ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(0,208,132,0.25)', color: campaign.status === 'Live' ? '#EF4444' : '#00D084', borderRadius: 8, padding: '9px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    {campaign.status === 'Live' ? 'Pause' : 'Resume'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          width: 58,
          height: 58,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4F8CFF, #2563eb)',
          color: '#fff',
          border: 'none',
          boxShadow: '0 0 20px rgba(79,140,255,0.25)',
          fontSize: 24,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        +
      </button>
    </div>
  );
}
