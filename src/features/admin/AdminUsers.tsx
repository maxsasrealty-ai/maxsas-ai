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

type Plan = 'Basic' | 'Diamond' | 'Enterprise';
type UserStatus = 'Active' | 'Pending' | 'Suspended';

type UserRow = {
  id: string;
  name: string;
  avatar: string;
  plan: Plan;
  status: UserStatus;
  lastActive: string;
};

const USERS: UserRow[] = [
  { id: 'U-1902', name: 'Ananya Das', avatar: 'AD', plan: 'Diamond', status: 'Active', lastActive: '2m ago' },
  { id: 'U-1903', name: 'Rohan Gupta', avatar: 'RG', plan: 'Basic', status: 'Pending', lastActive: '18m ago' },
  { id: 'U-1904', name: 'Meera Shah', avatar: 'MS', plan: 'Enterprise', status: 'Active', lastActive: '5m ago' },
  { id: 'U-1905', name: 'Dev Jain', avatar: 'DJ', plan: 'Basic', status: 'Suspended', lastActive: '1d ago' },
  { id: 'U-1906', name: 'Priya Nair', avatar: 'PN', plan: 'Diamond', status: 'Active', lastActive: '11m ago' },
];

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

function planBadge(plan: Plan): { bg: string; border: string; color: string } {
  if (plan === 'Enterprise') return { bg: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)', color: '#7C3AED' };
  if (plan === 'Diamond') return { bg: 'rgba(79,140,255,0.1)', border: '1px solid rgba(79,140,255,0.25)', color: '#4F8CFF' };
  return { bg: 'rgba(232,237,245,0.1)', border: '1px solid rgba(232,237,245,0.25)', color: 'rgba(232,237,245,0.75)' };
}

function statusBadge(status: UserStatus): { bg: string; border: string; color: string } {
  if (status === 'Active') return { bg: 'rgba(0,208,132,0.1)', border: '1px solid rgba(0,208,132,0.25)', color: '#00D084' };
  if (status === 'Pending') return { bg: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#F59E0B' };
  return { bg: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#EF4444' };
}

export default function AdminUsers() {
  const [query, setQuery] = useState('');
  const [planFilter, setPlanFilter] = useState<'All' | Plan>('All');

  useEffect(() => {
    injectFonts();
  }, []);

  const rows = USERS.filter((u) => {
    const byPlan = planFilter === 'All' || u.plan === planFilter;
    const byQuery = !query || u.name.toLowerCase().includes(query.toLowerCase()) || u.id.toLowerCase().includes(query.toLowerCase());
    return byPlan && byQuery;
  });

  return (
    <div style={{ minHeight: '100vh', background: TOKENS.page, color: TOKENS.text, fontFamily: "'DM Sans', sans-serif", padding: '100px 5vw' }}>
      <div style={{ maxWidth: 1220, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 'clamp(24px,2.5vw,28px)' }}>Admin Users</h1>

        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 10 }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users"
            style={{ background: 'rgba(79,140,255,0.06)', border: '1px solid rgba(79,140,255,0.2)', borderRadius: 8, color: '#fff', padding: '10px 12px', fontSize: 13, outline: 'none' }}
          />
          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value as 'All' | Plan)}
            style={{ background: 'rgba(79,140,255,0.06)', border: '1px solid rgba(79,140,255,0.2)', borderRadius: 8, color: '#fff', padding: '10px 12px', fontSize: 13 }}
          >
            <option>All</option>
            <option>Basic</option>
            <option>Diamond</option>
            <option>Enterprise</option>
          </select>
          <button style={{ background: 'linear-gradient(135deg, #4F8CFF, #2563eb)', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 14, fontWeight: 600, boxShadow: '0 0 20px rgba(79,140,255,0.25)', cursor: 'pointer' }}>
            Add User
          </button>
        </div>

        <div style={{ marginTop: 14, background: TOKENS.card, border: '1px solid rgba(79,140,255,0.12)', borderRadius: 14, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.35)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 980 }}>
              <thead>
                <tr style={{ background: 'rgba(79,140,255,0.05)' }}>
                  {['User', 'Plan', 'Status', 'Last Active', 'Actions'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px 16px', fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: TOKENS.muted }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const plan = planBadge(row.plan);
                  const status = statusBadge(row.status);
                  return (
                    <tr key={row.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(79,140,255,0.12)', border: '1px solid rgba(79,140,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#4F8CFF' }}>{row.avatar}</div>
                          <div>
                            <div style={{ fontSize: 13 }}>{row.name}</div>
                            <div style={{ fontSize: 12, color: TOKENS.muted }}>{row.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: plan.bg, border: plan.border, color: plan.color, borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 600 }}>{row.plan}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: status.bg, border: status.border, color: status.color, borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 600 }}>{row.status}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: TOKENS.muted }}>{row.lastActive}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button style={{ background: 'transparent', border: '1px solid rgba(79,140,255,0.2)', color: '#4F8CFF', borderRadius: 8, padding: '7px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Edit</button>
                          <button style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#F59E0B', borderRadius: 8, padding: '7px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Suspend</button>
                          <button style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#EF4444', borderRadius: 8, padding: '7px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
