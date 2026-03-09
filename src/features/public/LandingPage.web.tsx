import { useEffect, useState } from 'react';

const FontInjector = () => {
  useEffect(() => {
    const existing = document.getElementById('maxsas-landing-fonts');
    if (existing) return;

    const link = document.createElement('link');
    link.id = 'maxsas-landing-fonts';
    link.href =
      'https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  return null;
};

const globalStyles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #040c18; color: #e8edf5; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
  h1,h2,h3,h4,h5 { font-family: 'Syne', sans-serif; }

  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  @keyframes pulse-glow { 0%,100%{box-shadow:0 0 20px #4F8CFF44} 50%{box-shadow:0 0 50px #4F8CFF99,0 0 80px #00D08433} }
  @keyframes fade-up { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
  @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes wave-bar { 0%,100%{height:4px} 50%{height:22px} }
  @keyframes slide-in-right { from{opacity:0;transform:translateX(60px)} to{opacity:1;transform:translateX(0)} }

  .fade-up { animation: fade-up 0.7s ease both; }
  .fade-up-1 { animation-delay: 0.1s; }
  .fade-up-2 { animation-delay: 0.25s; }
  .fade-up-3 { animation-delay: 0.4s; }
  .fade-up-4 { animation-delay: 0.55s; }

  .desktop-nav { display: flex; }

  @media (max-width: 1024px) {
    .hero-grid { grid-template-columns: 1fr !important; gap: 36px !important; }
  }

  @media (max-width: 860px) {
    .desktop-nav { display: none !important; }
  }

  @media (max-width: 640px) {
    .hero-section { padding: 108px 20px 64px !important; }
    .features-section,
    .how-section,
    .demo-section,
    .pricing-section,
    .final-cta,
    .footer-wrap { padding-left: 20px !important; padding-right: 20px !important; }
  }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #040c18; }
  ::-webkit-scrollbar-thumb { background: #1e3a5f; border-radius: 3px; }
`;

const CALL_MESSAGES = [
  'Connecting to Rahul Sharma...',
  "Namaste! I'm calling from Maxsas Realty regarding your property inquiry.",
  "Yes, I'm looking for a 3BHK in Whitefield.",
  'Your budget range? Around INR 75-85 lakhs?',
  'Yes, around INR 80 lakhs. Can we schedule a site visit?',
];

const Nav = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '0 5vw',
        height: 68,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: scrolled ? 'rgba(4,12,24,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(79,140,255,0.12)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg,#4F8CFF,#00D084)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
          }}
        >
          AI
        </div>
        <span
          style={{
            fontFamily: "'Syne',sans-serif",
            fontWeight: 800,
            fontSize: 18,
            background: 'linear-gradient(90deg,#fff,#4F8CFF)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Maxsas Realty AI
        </span>
      </div>

      <div
        className="desktop-nav"
        style={{
          gap: 32,
          alignItems: 'center',
        }}
      >
        {['Features', 'How It Works', 'Pricing', 'Demo'].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase().replace(/ /g, '-')}`}
            style={{
              color: 'rgba(232,237,245,0.7)',
              textDecoration: 'none',
              fontSize: 14,
              fontWeight: 500,
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(232,237,245,0.7)')}
          >
            {item}
          </a>
        ))}
        <a
          href="/login"
          style={{
            color: 'rgba(232,237,245,0.6)',
            textDecoration: 'none',
            fontSize: 14,
          }}
        >
          Login
        </a>
        <a
          href="/signup"
          style={{
            background: 'linear-gradient(135deg,#4F8CFF,#2563eb)',
            color: '#fff',
            borderRadius: 8,
            padding: '9px 20px',
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Start Free Trial
        </a>
      </div>
    </nav>
  );
};

const AICallCard = () => {
  const [msgIdx, setMsgIdx] = useState(0);
  const [shown, setShown] = useState([CALL_MESSAGES[0]]);

  useEffect(() => {
    if (msgIdx < CALL_MESSAGES.length - 1) {
      const t = setTimeout(() => {
        setMsgIdx((i) => i + 1);
        setShown((prev) => [...prev, CALL_MESSAGES[msgIdx + 1]]);
      }, 2200);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [msgIdx]);

  const bars = [4, 10, 18, 14, 6, 20, 12, 8, 16, 4];

  return (
    <div
      style={{
        background: 'linear-gradient(145deg,#0d1f38,#0a1628)',
        border: '1px solid rgba(79,140,255,0.25)',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 420,
        animation: 'pulse-glow 3s ease-in-out infinite, slide-in-right 0.8s ease 0.3s both',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 120,
          height: 120,
          background: 'radial-gradient(circle,#4F8CFF33,transparent 70%)',
          borderRadius: '50%',
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#00D084',
            boxShadow: '0 0 8px #00D084',
            animation: 'blink 1.4s ease infinite',
          }}
        />
        <span style={{ fontSize: 13, color: '#00D084', fontWeight: 600, letterSpacing: 1 }}>
          AI AGENT CALLING...
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          marginBottom: 18,
          height: 30,
        }}
      >
        {bars.map((h, i) => (
          <div
            key={i}
            style={{
              width: 4,
              height: h,
              background: 'linear-gradient(to top,#4F8CFF,#00D084)',
              borderRadius: 2,
              animation: `wave-bar ${0.6 + i * 0.07}s ease-in-out infinite`,
              animationDelay: `${i * 0.05}s`,
            }}
          />
        ))}
        <span style={{ marginLeft: 8, fontSize: 12, color: 'rgba(232,237,245,0.5)' }}>02:14</span>
      </div>

      <div
        style={{
          background: 'rgba(79,140,255,0.08)',
          border: '1px solid rgba(79,140,255,0.2)',
          borderRadius: 12,
          padding: '12px 14px',
          marginBottom: 16,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '6px 16px',
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: 'rgba(232,237,245,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Lead
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Rahul Sharma</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(232,237,245,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Budget
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#4F8CFF' }}>INR 80 Lakhs</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(232,237,245,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Location
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>Whitefield</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: 'rgba(232,237,245,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>
            Type
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>3BHK</div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: 'rgba(232,237,245,0.4)', marginBottom: 8, letterSpacing: 1 }}>
          LIVE TRANSCRIPT
        </div>
        <div
          style={{
            background: 'rgba(4,12,24,0.6)',
            borderRadius: 10,
            padding: 10,
            maxHeight: 110,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          {shown.slice(-3).map((msg, i) => (
            <div
              key={i}
              style={{
                fontSize: 11.5,
                color: i % 2 === 0 ? '#4F8CFF' : 'rgba(232,237,245,0.85)',
                padding: '4px 0',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                transition: 'all 0.3s',
              }}
            >
              <span style={{ opacity: 0.5, marginRight: 6 }}>{i % 2 === 0 ? 'AI' : 'Lead'}</span>
              {msg}
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          background: 'rgba(0,208,132,0.07)',
          border: '1px solid rgba(0,208,132,0.2)',
          borderRadius: 10,
          padding: '10px 14px',
          marginBottom: 14,
        }}
      >
        <div style={{ fontSize: 10, color: '#00D084', letterSpacing: 1, marginBottom: 6 }}>
          AI QUALIFICATION SUMMARY
        </div>
        {['Buyer interested in 3BHK', 'Budget confirmed: INR 80L', 'Site visit suggested'].map((t) => (
          <div key={t} style={{ fontSize: 12, color: 'rgba(232,237,245,0.8)', marginBottom: 3 }}>
            {`+ ${t}`}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            background: 'rgba(255,80,80,0.15)',
            border: '1px solid rgba(255,80,80,0.3)',
            borderRadius: 20,
            padding: '5px 14px',
            fontSize: 12,
            fontWeight: 700,
            color: '#ff6b6b',
          }}
        >
          Hot Lead
        </div>
        <div style={{ fontSize: 11, color: 'rgba(232,237,245,0.4)' }}>Follow-up in 24 hrs</div>
      </div>
    </div>
  );
};

const HeroSection = () => (
  <section
    id="hero"
    className="hero-section"
    style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      padding: '120px 5vw 80px',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background:
          'radial-gradient(ellipse 80% 60% at 20% 40%,rgba(79,140,255,0.12) 0%,transparent 60%), radial-gradient(ellipse 60% 50% at 80% 70%,rgba(0,208,132,0.08) 0%,transparent 55%), linear-gradient(180deg,#040c18 0%,#06122a 50%,#040c18 100%)',
      }}
    />
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage:
          'linear-gradient(rgba(79,140,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(79,140,255,0.05) 1px,transparent 1px)',
        backgroundSize: '60px 60px',
      }}
    />
    <div
      style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(79,140,255,0.07),transparent 70%)',
        animation: 'float 7s ease-in-out infinite',
      }}
    />
    <div
      style={{
        position: 'absolute',
        bottom: '15%',
        right: '5%',
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'radial-gradient(circle,rgba(0,208,132,0.07),transparent 70%)',
        animation: 'float 9s ease-in-out infinite reverse',
      }}
    />

    <div
      className="hero-grid"
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 60,
        alignItems: 'center',
        maxWidth: 1200,
        margin: '0 auto',
        width: '100%',
        position: 'relative',
        zIndex: 1,
      }}
    >
      <div>
        <div
          className="fade-up fade-up-1"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(79,140,255,0.1)',
            border: '1px solid rgba(79,140,255,0.25)',
            borderRadius: 20,
            padding: '6px 16px',
            marginBottom: 28,
          }}
        >
          <span style={{ fontSize: 10, color: '#00D084' }}>o</span>
          <span style={{ fontSize: 13, color: 'rgba(232,237,245,0.8)', fontWeight: 500 }}>
            AI-Powered Real Estate Calling
          </span>
        </div>

        <h1
          className="fade-up fade-up-2"
          style={{
            fontFamily: "'Syne',sans-serif",
            fontSize: 'clamp(32px,4.5vw,58px)',
            fontWeight: 800,
            lineHeight: 1.12,
            marginBottom: 22,
            letterSpacing: '-0.02em',
          }}
        >
          Run AI Voice Agents That{' '}
          <span
            style={{
              background: 'linear-gradient(90deg,#4F8CFF,#00D084)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Qualify Real Estate Leads
          </span>{' '}
          Automatically
        </h1>

        <p
          className="fade-up fade-up-3"
          style={{
            fontSize: 'clamp(15px,1.5vw,18px)',
            color: 'rgba(232,237,245,0.65)',
            lineHeight: 1.7,
            marginBottom: 36,
            maxWidth: 500,
          }}
        >
          Maxsas Realty AI calls your property leads, understands buyer intent, and delivers
          qualified prospects directly to your sales team on autopilot.
        </p>

        <div
          className="fade-up fade-up-4"
          style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}
        >
          <a
            href="#demo"
            style={{
              background: 'linear-gradient(135deg,#4F8CFF,#2563eb)',
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif",
              boxShadow: '0 0 30px rgba(79,140,255,0.35)',
              transition: 'transform 0.2s,box-shadow 0.2s',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 0 50px rgba(79,140,255,0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(79,140,255,0.35)';
            }}
          >
            Start AI Demo
          </a>
          <a
            href="#how-it-works"
            style={{
              background: 'transparent',
              color: '#e8edf5',
              border: '1px solid rgba(232,237,245,0.2)',
              borderRadius: 10,
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'DM Sans',sans-serif",
              transition: 'border-color 0.2s',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(79,140,255,0.5)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(232,237,245,0.2)')}
          >
            See How It Works
          </a>
          <a
            href="/login"
            style={{
              color: 'rgba(232,237,245,0.45)',
              textDecoration: 'none',
              fontSize: 13,
            }}
          >
            Login
          </a>
        </div>

        <div
          className="fade-up"
          style={{
            display: 'flex',
            gap: 32,
            marginTop: 48,
            paddingTop: 32,
            borderTop: '1px solid rgba(255,255,255,0.07)',
            animationDelay: '0.7s',
            flexWrap: 'wrap',
          }}
        >
          {[
            { v: '10x', l: 'Faster Lead Qualification' },
            { v: '87%', l: 'Conversion Accuracy' },
            { v: '24/7', l: 'Automated Calling' },
          ].map(({ v, l }) => (
            <div key={v}>
              <div
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 26,
                  fontWeight: 800,
                  background: 'linear-gradient(90deg,#4F8CFF,#00D084)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {v}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(232,237,245,0.45)', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <AICallCard />
      </div>
    </div>
  </section>
);

const TrustStrip = () => {
  const logos = [
    'Prestige Group',
    'Brigade Enterprises',
    'Sobha Realty',
    'Godrej Properties',
    'DLF Limited',
    'Mahindra Lifespaces',
    'Hiranandani',
    'Embassy Group',
    'Prestige Group',
    'Brigade Enterprises',
    'Sobha Realty',
    'Godrej Properties',
  ];

  return (
    <div
      style={{
        padding: '40px 0',
        borderTop: '1px solid rgba(79,140,255,0.1)',
        borderBottom: '1px solid rgba(79,140,255,0.1)',
        overflow: 'hidden',
        background: 'rgba(79,140,255,0.02)',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          fontSize: 12,
          color: 'rgba(232,237,245,0.35)',
          letterSpacing: 3,
          textTransform: 'uppercase',
          marginBottom: 24,
        }}
      >
        Trusted by Leading Real Estate Teams
      </div>
      <div style={{ overflow: 'hidden', position: 'relative' }}>
        <div
          style={{
            display: 'flex',
            gap: 48,
            animation: 'ticker 20s linear infinite',
            width: 'max-content',
          }}
        >
          {logos.map((name, i) => (
            <div
              key={`${name}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                whiteSpace: 'nowrap',
                fontSize: 14,
                fontWeight: 600,
                color: 'rgba(232,237,245,0.3)',
                fontFamily: "'Syne',sans-serif",
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  background: 'rgba(79,140,255,0.1)',
                  border: '1px solid rgba(79,140,255,0.15)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 11,
                }}
              >
                RE
              </span>
              {name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const features = [
  {
    icon: 'CALL',
    title: 'AI Voice Calling',
    desc: 'Automatically calls incoming leads the moment they register - no delay, no missed opportunity.',
  },
  {
    icon: 'AI',
    title: 'Lead Qualification AI',
    desc: 'Understands budget, preferred location, property type, and buyer intent with conversational AI.',
  },
  {
    icon: 'BATCH',
    title: 'Batch Calling',
    desc: 'Launch campaigns to call hundreds of leads simultaneously with a single click.',
  },
  {
    icon: 'AUTO',
    title: 'Follow-up Automation',
    desc: 'AI intelligently schedules and executes follow-up calls based on lead behavior signals.',
  },
  {
    icon: 'LIVE',
    title: 'Real-time Analytics',
    desc: 'Live dashboards track call volumes, qualification rates, hot leads, and conversion metrics.',
  },
  {
    icon: 'CRM',
    title: 'CRM Integration',
    desc: 'Seamlessly connects with Salesforce, HubSpot, Zoho CRM, and custom systems via API.',
  },
];

const FeatureGrid = () => (
  <section id="features" className="features-section" style={{ padding: '100px 5vw', maxWidth: 1200, margin: '0 auto' }}>
    <div style={{ textAlign: 'center', marginBottom: 64 }}>
      <div
        style={{
          display: 'inline-block',
          background: 'rgba(79,140,255,0.1)',
          border: '1px solid rgba(79,140,255,0.2)',
          borderRadius: 20,
          padding: '5px 16px',
          fontSize: 12,
          color: '#4F8CFF',
          letterSpacing: 2,
          textTransform: 'uppercase',
          marginBottom: 16,
        }}
      >
        Platform Features
      </div>
      <h2
        style={{
          fontFamily: "'Syne',sans-serif",
          fontSize: 'clamp(28px,3.5vw,44px)',
          fontWeight: 800,
          marginBottom: 16,
        }}
      >
        Everything You Need to{' '}
        <span
          style={{
            background: 'linear-gradient(90deg,#4F8CFF,#00D084)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Close More Deals
        </span>
      </h2>
      <p style={{ color: 'rgba(232,237,245,0.55)', fontSize: 16, maxWidth: 520, margin: '0 auto' }}>
        One AI platform that handles calling, qualification, follow-ups, and analytics.
      </p>
    </div>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
        gap: 20,
      }}
    >
      {features.map((f) => (
        <div
          key={f.title}
          style={{
            background: 'linear-gradient(145deg,rgba(13,31,56,0.8),rgba(10,22,40,0.9))',
            border: '1px solid rgba(79,140,255,0.12)',
            borderRadius: 16,
            padding: 28,
            transition: 'transform 0.3s,border-color 0.3s,box-shadow 0.3s',
            cursor: 'default',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = 'rgba(79,140,255,0.35)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(79,140,255,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'rgba(79,140,255,0.12)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div
            style={{
              minWidth: 48,
              width: 48,
              height: 48,
              background: 'rgba(79,140,255,0.1)',
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              marginBottom: 16,
              fontWeight: 700,
              color: '#8eb4ff',
            }}
          >
            {f.icon}
          </div>
          <h3
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 17,
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            {f.title}
          </h3>
          <p style={{ fontSize: 14, color: 'rgba(232,237,245,0.55)', lineHeight: 1.65 }}>{f.desc}</p>
        </div>
      ))}
    </div>
  </section>
);

const HowItWorks = () => {
  const steps = [
    {
      num: '01',
      icon: 'UPLOAD',
      title: 'Upload Leads',
      desc: 'Import property inquiries from portals like 99acres, MagicBricks, or your CRM in one click.',
    },
    {
      num: '02',
      icon: 'VOICE',
      title: 'AI Calls Leads',
      desc: 'Your AI agent makes natural, conversational calls, asking the right qualifying questions.',
    },
    {
      num: '03',
      icon: 'QUALIFY',
      title: 'Get Qualified Buyers',
      desc: 'Your sales team receives only high-intent, pre-qualified prospects ready to convert.',
    },
  ];

  return (
    <section
      id="how-it-works"
      className="how-section"
      style={{
        padding: '100px 5vw',
        background: 'linear-gradient(180deg,#040c18,#06122a,#040c18)',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle at 50% 50%,rgba(79,140,255,0.04) 0%,transparent 65%)',
        }}
      />
      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(0,208,132,0.1)',
              border: '1px solid rgba(0,208,132,0.2)',
              borderRadius: 20,
              padding: '5px 16px',
              fontSize: 12,
              color: '#00D084',
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            How It Works
          </div>
          <h2
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 'clamp(28px,3.5vw,44px)',
              fontWeight: 800,
            }}
          >
            From Lead to Qualified Buyer in <span style={{ color: '#00D084' }}>3 Steps</span>
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
            gap: 24,
            position: 'relative',
          }}
        >
          {steps.map((s) => (
            <div key={s.num} style={{ position: 'relative' }}>
              <div
                style={{
                  background: 'linear-gradient(145deg,#0d1f38,#0a1628)',
                  border: '1px solid rgba(79,140,255,0.15)',
                  borderRadius: 20,
                  padding: 32,
                  textAlign: 'center',
                  height: '100%',
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#4F8CFF',
                    letterSpacing: 3,
                    marginBottom: 20,
                  }}
                >
                  STEP {s.num}
                </div>
                <div
                  style={{
                    minWidth: 72,
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg,rgba(79,140,255,0.15),rgba(0,208,132,0.1))',
                    border: '1px solid rgba(79,140,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    margin: '0 auto 20px',
                    fontWeight: 700,
                    color: '#9ebeff',
                  }}
                >
                  {s.icon}
                </div>
                <h3
                  style={{
                    fontFamily: "'Syne',sans-serif",
                    fontSize: 20,
                    fontWeight: 700,
                    marginBottom: 12,
                  }}
                >
                  {s.title}
                </h3>
                <p style={{ fontSize: 14, color: 'rgba(232,237,245,0.55)', lineHeight: 1.65 }}>
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const DemoSection = () => {
  const [active, setActive] = useState(false);
  const lines = [
    { who: 'AI', text: "Hello! I'm Aria from Maxsas Realty. Am I speaking with Priya?" },
    { who: 'Lead', text: 'Yes, this is Priya.' },
    { who: 'AI', text: 'Great! You recently inquired about a 2BHK in Sarjapur. Is that correct?' },
    { who: 'Lead', text: "Yes, I'm looking for a flat there." },
    { who: 'AI', text: 'Wonderful! Could you share your approximate budget range?' },
    { who: 'Lead', text: 'Around 55 to 65 lakhs.' },
    { who: 'AI', text: 'Perfect. Would you be available for a site visit this weekend?' },
    { who: 'Lead', text: 'Yes, Saturday works for me.' },
    {
      who: 'AI',
      text: "Excellent! I'll schedule a site visit for Saturday. Our agent will confirm shortly.",
    },
  ];

  return (
    <section id="demo" className="demo-section" style={{ padding: '100px 5vw' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(79,140,255,0.1)',
              border: '1px solid rgba(79,140,255,0.2)',
              borderRadius: 20,
              padding: '5px 16px',
              fontSize: 12,
              color: '#4F8CFF',
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            Live Demo
          </div>
          <h2
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 'clamp(28px,3.5vw,44px)',
              fontWeight: 800,
              marginBottom: 12,
            }}
          >
            See the AI in Action
          </h2>
          <p style={{ color: 'rgba(232,237,245,0.55)', fontSize: 16 }}>
            Watch how Aria, your AI agent, qualifies a real estate lead in under 2 minutes.
          </p>
        </div>

        <div
          style={{
            background: 'linear-gradient(145deg,#0a1628,#0d1f38)',
            border: '1px solid rgba(79,140,255,0.2)',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderBottom: '1px solid rgba(79,140,255,0.1)',
            }}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              {['#ff5f57', '#ffbd2e', '#28ca42'].map((c) => (
                <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />
              ))}
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'rgba(232,237,245,0.4)',
                fontFamily: 'monospace',
              }}
            >
              aria-agent-v2.maxsas.ai
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: active ? '#00D084' : 'rgba(232,237,245,0.3)',
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: active ? '#00D084' : '#555',
                  animation: active ? 'blink 1.4s infinite' : 'none',
                }}
              />
              {active ? 'LIVE' : 'READY'}
            </div>
          </div>

          <div style={{ padding: 28, minHeight: 320, maxHeight: 360, overflowY: 'auto' }}>
            {active ? (
              lines.map((l, i) => (
                <div
                  key={`${l.who}-${i}`}
                  style={{
                    display: 'flex',
                    gap: 12,
                    marginBottom: 16,
                    animation: `fade-up 0.4s ease ${i * 0.15}s both`,
                    justifyContent: l.who === 'AI' ? 'flex-start' : 'flex-end',
                  }}
                >
                  <div
                    style={{
                      background: l.who === 'AI' ? 'rgba(79,140,255,0.12)' : 'rgba(0,208,132,0.1)',
                      border: `1px solid ${l.who === 'AI' ? 'rgba(79,140,255,0.2)' : 'rgba(0,208,132,0.2)'}`,
                      borderRadius: l.who === 'AI' ? '4px 14px 14px 14px' : '14px 4px 14px 14px',
                      padding: '10px 14px',
                      maxWidth: '70%',
                      fontSize: 13.5,
                      color: 'rgba(232,237,245,0.9)',
                      lineHeight: 1.5,
                    }}
                  >
                    {l.text}
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 280,
                  gap: 16,
                  color: 'rgba(232,237,245,0.3)',
                }}
              >
                <div style={{ fontSize: 48 }}>VOICE</div>
                <div style={{ fontSize: 15 }}>Click below to start the AI demo</div>
              </div>
            )}
          </div>

          <div
            style={{
              padding: '20px 28px',
              borderTop: '1px solid rgba(79,140,255,0.1)',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <button
              onClick={() => {
                setActive(false);
                setTimeout(() => setActive(true), 100);
              }}
              style={{
                background: active ? 'rgba(0,208,132,0.15)' : 'linear-gradient(135deg,#4F8CFF,#2563eb)',
                color: active ? '#00D084' : '#fff',
                border: active ? '1px solid rgba(0,208,132,0.3)' : 'none',
                borderRadius: 10,
                padding: '12px 32px',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: "'DM Sans',sans-serif",
                boxShadow: active ? 'none' : '0 0 30px rgba(79,140,255,0.3)',
              }}
            >
              {active ? 'Replay Demo' : 'Try AI Demo'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const PricingSection = () => {
  const plans = [
    {
      name: 'Basic',
      price: 'INR 4,999',
      per: '/month',
      tag: null,
      color: 'rgba(79,140,255,0.1)',
      border: 'rgba(79,140,255,0.2)',
      features: [
        'Up to 500 AI calls/month',
        'Lead qualification scoring',
        'Basic call transcripts',
        'Email support',
        '1 AI agent voice',
        'Standard analytics',
      ],
    },
    {
      name: 'Diamond',
      price: 'INR 12,999',
      per: '/month',
      tag: 'Most Popular',
      color: 'rgba(79,140,255,0.15)',
      border: '#4F8CFF',
      highlight: true,
      features: [
        'Up to 3,000 AI calls/month',
        'Advanced lead qualification AI',
        'Full conversation transcripts',
        'Priority support + onboarding',
        '5 AI agent voices & personas',
        'CRM integration (HubSpot, Zoho)',
        'Follow-up automation',
        'Real-time analytics dashboard',
        'Batch campaign calling',
      ],
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      per: 'pricing',
      tag: null,
      color: 'rgba(0,208,132,0.05)',
      border: 'rgba(0,208,132,0.25)',
      features: [
        'Unlimited AI calls',
        'Custom AI voice & branding',
        'Multi-team management',
        'Dedicated account manager',
        'Custom CRM & API integration',
        'White-label option',
        'SLA + compliance support',
        'Advanced reporting & BI export',
        'On-premise deployment available',
      ],
    },
  ];

  return (
    <section
      id="pricing"
      className="pricing-section"
      style={{
        padding: '100px 5vw',
        background: 'linear-gradient(180deg,#040c18,#06122a)',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div
            style={{
              display: 'inline-block',
              background: 'rgba(79,140,255,0.1)',
              border: '1px solid rgba(79,140,255,0.2)',
              borderRadius: 20,
              padding: '5px 16px',
              fontSize: 12,
              color: '#4F8CFF',
              letterSpacing: 2,
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            Pricing
          </div>
          <h2
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 'clamp(28px,3.5vw,44px)',
              fontWeight: 800,
              marginBottom: 12,
            }}
          >
            Simple, Transparent{' '}
            <span
              style={{
                background: 'linear-gradient(90deg,#4F8CFF,#00D084)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Pricing
            </span>
          </h2>
          <p style={{ color: 'rgba(232,237,245,0.5)', fontSize: 16 }}>
            Start free. Scale as your business grows.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit,minmax(290px,1fr))',
            gap: 20,
            alignItems: 'start',
          }}
        >
          {plans.map((p) => (
            <div
              key={p.name}
              style={{
                background: `linear-gradient(145deg,${p.color},rgba(10,22,40,0.9))`,
                border: `1px solid ${p.border}`,
                borderRadius: 20,
                padding: 32,
                position: 'relative',
                boxShadow: p.highlight ? '0 0 40px rgba(79,140,255,0.15)' : 'none',
                transform: p.highlight ? 'scale(1.03)' : 'scale(1)',
              }}
            >
              {p.tag && (
                <div
                  style={{
                    position: 'absolute',
                    top: -14,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'linear-gradient(90deg,#4F8CFF,#00D084)',
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 1,
                    padding: '4px 16px',
                    borderRadius: 20,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {p.tag}
                </div>
              )}
              <div
                style={{
                  fontFamily: "'Syne',sans-serif",
                  fontSize: 20,
                  fontWeight: 800,
                  marginBottom: 4,
                }}
              >
                {p.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 24 }}>
                <span
                  style={{
                    fontFamily: "'Syne',sans-serif",
                    fontSize: 34,
                    fontWeight: 800,
                    background: p.highlight ? 'linear-gradient(90deg,#4F8CFF,#00D084)' : 'none',
                    WebkitBackgroundClip: p.highlight ? 'text' : 'unset',
                    WebkitTextFillColor: p.highlight ? 'transparent' : 'inherit',
                  }}
                >
                  {p.price}
                </span>
                <span style={{ fontSize: 13, color: 'rgba(232,237,245,0.4)' }}>{p.per}</span>
              </div>

              <div
                style={{
                  height: 1,
                  background: 'rgba(255,255,255,0.07)',
                  marginBottom: 20,
                }}
              />

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                {p.features.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13.5 }}>
                    <span style={{ color: '#00D084', fontSize: 14 }}>+</span>
                    <span style={{ color: 'rgba(232,237,245,0.75)' }}>{f}</span>
                  </div>
                ))}
              </div>

              <button
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: 10,
                  border: p.highlight ? 'none' : '1px solid rgba(79,140,255,0.3)',
                  background: p.highlight ? 'linear-gradient(135deg,#4F8CFF,#2563eb)' : 'transparent',
                  color: p.highlight ? '#fff' : 'rgba(232,237,245,0.8)',
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: "'DM Sans',sans-serif",
                  boxShadow: p.highlight ? '0 0 25px rgba(79,140,255,0.3)' : 'none',
                }}
              >
                {p.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const FinalCTA = () => (
  <section
    className="final-cta"
    style={{
      padding: '120px 5vw',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse 70% 60% at 50% 50%,rgba(79,140,255,0.1),transparent 70%)',
      }}
    />
    <div style={{ position: 'relative', zIndex: 1, maxWidth: 700, margin: '0 auto' }}>
      <h2
        style={{
          fontFamily: "'Syne',sans-serif",
          fontSize: 'clamp(28px,4vw,52px)',
          fontWeight: 800,
          lineHeight: 1.15,
          marginBottom: 20,
        }}
      >
        Start Automating Your{' '}
        <span
          style={{
            background: 'linear-gradient(90deg,#4F8CFF,#00D084)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Real Estate Calls
        </span>{' '}
        Today
      </h2>
      <p
        style={{
          color: 'rgba(232,237,245,0.55)',
          fontSize: 18,
          marginBottom: 40,
          lineHeight: 1.6,
        }}
      >
        Join hundreds of real estate teams using Maxsas Realty AI to qualify leads faster, close
        more deals, and never miss a buyer again.
      </p>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <a
          href="/signup"
          style={{
            background: 'linear-gradient(135deg,#4F8CFF,#2563eb)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            padding: '16px 36px',
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "'DM Sans',sans-serif",
            boxShadow: '0 0 40px rgba(79,140,255,0.4)',
            textDecoration: 'none',
          }}
        >
          Launch AI Agent
        </a>
        <a
          href="/login"
          style={{
            background: 'transparent',
            color: 'rgba(232,237,245,0.8)',
            border: '1px solid rgba(232,237,245,0.2)',
            borderRadius: 12,
            padding: '16px 36px',
            fontSize: 16,
            fontWeight: 600,
            fontFamily: "'DM Sans',sans-serif",
            textDecoration: 'none',
          }}
        >
          Talk to Sales
        </a>
      </div>
      <p style={{ color: 'rgba(232,237,245,0.3)', fontSize: 13, marginTop: 20 }}>
        No credit card required | Free 14-day trial | Cancel anytime
      </p>
    </div>
  </section>
);

const Footer = () => (
  <footer
    className="footer-wrap"
    style={{
      borderTop: '1px solid rgba(79,140,255,0.1)',
      padding: '48px 5vw 32px',
      background: '#040c18',
    }}
  >
    <div
      style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 32,
        marginBottom: 40,
      }}
    >
      <div style={{ maxWidth: 280 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'linear-gradient(135deg,#4F8CFF,#00D084)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            AI
          </div>
          <span
            style={{
              fontFamily: "'Syne',sans-serif",
              fontWeight: 800,
              fontSize: 16,
              background: 'linear-gradient(90deg,#fff,#4F8CFF)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Maxsas Realty AI
          </span>
        </div>
        <p style={{ fontSize: 13, color: 'rgba(232,237,245,0.4)', lineHeight: 1.6 }}>
          AI Voice Calling Platform for Real Estate Businesses. Qualify buyers automatically.
        </p>
      </div>

      {[
        {
          title: 'Product',
          links: [
            { label: 'Features', href: '#features' },
            { label: 'Pricing', href: '#pricing' },
            { label: 'Demo', href: '#demo' },
            { label: 'How It Works', href: '#how-it-works' },
          ],
        },
        {
          title: 'Company',
          links: [
            { label: 'Home', href: '/' },
            { label: 'Login', href: '/login' },
            { label: 'Signup', href: '/signup' },
            { label: 'Dashboard', href: '/(tabs)' },
          ],
        },
        {
          title: 'Legal',
          links: [
            { label: 'Privacy Policy', href: '/privacy-policy' },
            { label: 'Terms and Conditions', href: '/terms-and-conditions' },
            { label: 'Refund Policy', href: '/refund-policy' },
          ],
        },
      ].map((col) => (
        <div key={col.title}>
          <div
            style={{
              fontFamily: "'Syne',sans-serif",
              fontSize: 13,
              fontWeight: 700,
              color: 'rgba(232,237,245,0.7)',
              marginBottom: 14,
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}
          >
            {col.title}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {col.links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                style={{ color: 'rgba(232,237,245,0.4)', textDecoration: 'none', fontSize: 13 }}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>

    <div
      style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        paddingTop: 20,
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <div style={{ fontSize: 12, color: 'rgba(232,237,245,0.3)' }}>
        Copyright 2026 Maxsas Realty AI. All rights reserved.
      </div>
      <div style={{ fontSize: 12, color: 'rgba(232,237,245,0.3)' }}>Made in India</div>
    </div>
  </footer>
);

export default function LandingPageWeb() {
  return (
    <>
      <FontInjector />
      <style>{globalStyles}</style>
      <Nav />
      <main style={{ background: '#040c18' }}>
        <HeroSection />
        <TrustStrip />
        <FeatureGrid />
        <HowItWorks />
        <DemoSection />
        <PricingSection />
        <FinalCTA />
        <Footer />
      </main>
    </>
  );
}
