// Utility to inject admin fonts into the document head (web only)
export default function injectFonts(): void {
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
