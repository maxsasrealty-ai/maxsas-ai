# Enterprise Module Design Tokens

Scope: `src/features/enterprise/*`

Do not use Admin module tokens in this scope.

## Brand Intent
- Premium, high-control, ROI-focused experience.
- Visual language: dark, rich, exclusive.

## Colors
- Page base: `#04080f`
- Section surface: `#070e1c`
- Card base: `linear-gradient(145deg, #0a1020, #0d1828)`
- Card hover: `linear-gradient(145deg, #0d1828, #111e30)`
- Elevated panel: `rgba(15, 25, 50, 0.95)`

## Accent
- Gold primary: `#C9A84C`
- Gold light: `#E8C96D`
- Gold dark: `#A07830`
- Gold gradient: `linear-gradient(135deg, #C9A84C, #E8C96D)`
- Gold glow: `rgba(201,168,76,0.15)`
- Blue accent (data-only): `#4F8CFF`
- Success status: `#00D084`

## Borders
- Default card: `1px solid rgba(201,168,76,0.2)`
- Active/hover: `1px solid rgba(201,168,76,0.45)`
- Divider: `1px solid rgba(201,168,76,0.08)`
- Premium badge: `1px solid rgba(201,168,76,0.6)`

## Typography
- Page title: `Syne 800 clamp(28px,3.5vw,48px)`, `letter-spacing: -0.02em`
- Section H2: `Syne 700 clamp(22px,2.5vw,36px)`
- Card title: `Syne 700 18-20px`
- Body text: `DM Sans 400/500 14-15px`
- Data labels: `DM Sans 600 11px`, `letter-spacing: 2`, uppercase
- Stat numbers: `Syne 800 32-48px`, gold gradient text

## Shadows / Glows
- Card shadow: `0 8px 32px rgba(0,0,0,0.5)`
- Card hover shadow: `0 16px 48px rgba(201,168,76,0.12)`
- Gold button glow: `0 0 30px rgba(201,168,76,0.35)`
- Gold button hover glow: `0 0 50px rgba(201,168,76,0.55)`
- Stat card glow: `0 0 40px rgba(201,168,76,0.08)`

## Buttons
- Primary CTA: gold gradient, text `#04080f`, `DM Sans 700 15px`, radius `10px`, padding `13px 28px`, gold glow
- Primary hover: `translateY(-2px)`, stronger glow
- Secondary CTA: transparent, gold border, gold text, brighter gold border on hover

## Background Effects
- Mesh:
  - `radial-gradient(ellipse 70% 50% at 15% 35%, rgba(201,168,76,0.06), transparent 60%)`
  - `radial-gradient(ellipse 50% 40% at 85% 70%, rgba(79,140,255,0.05), transparent 55%)`
  - `linear-gradient(180deg, #04080f, #070e1c, #04080f)`
- Grid overlay: `rgba(201,168,76,0.03)` lines, `60px x 60px`
- Orbs: gold `rgba(201,168,76,0.05)`, blue `rgba(79,140,255,0.04)`

## Signature Elements
- Card watermark:
  - Text `ENTERPRISE`
  - `Syne 800 72px`
  - `rgba(201,168,76,0.04)`
  - absolute bottom-right, rotate `-15deg`, behind content
- Crown/diamond badge:
  - Gold gradient fill
  - `DM Sans 700 10px`
  - letter-spacing `2`
  - padding `4px 12px`, radius `20px`
  - text `ENTERPRISE`
- Section label: `#C9A84C`, `11px`, letter-spacing `3`, uppercase
- Live status dot: `#00D084` with green glow
