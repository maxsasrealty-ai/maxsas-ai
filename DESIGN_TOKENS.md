# Maxsas Realty AI Design Tokens

This is the permanent design token reference for module-specific UI systems.

Rules:
- Never mix tokens across modules.
- `src/features/enterprise/*` must use Enterprise tokens only.
- `src/features/admin/*` must use Admin tokens only.
- Global landing page tokens remain unchanged.

## Global Design System (Do Not Change)

### Colors
- Body background: `#040c18`
- Section mid-tone: `#06122a`
- Card dark tone A: `#0d1f38`
- Card dark tone B: `#0a1628`
- Primary accent: `#4F8CFF`
- Blue gradient partner: `#2563eb`
- Success accent: `#00D084`
- Hot/danger: `#ff6b6b`
- Text primary: `#e8edf5` / `#fff`
- Text muted: `rgba(232,237,245,0.5-0.7)`
- Border standard: `rgba(79,140,255,0.15-0.25)`

### Fonts
- Headings: `'Syne'` (700/800)
- Body: `'DM Sans'` (400/500/600)

### Existing Animations
- `float`
- `pulse-glow`
- `fade-up`
- `ticker`
- `blink`
- `wave-bar`
- `slide-in-right`

### Global Layout
- Border radius standard: `12-20px`
- Section padding standard: `100px 5vw`

## Module 1: Enterprise (`src/features/enterprise/`)

### User Psychology
Premium brokers and agency owners. Must feel power, exclusivity, control, and ROI.

### Background Colors
- Page base: `#04080f`
- Section surface: `#070e1c`
- Card base: `linear-gradient(145deg, #0a1020, #0d1828)`
- Card hover: `linear-gradient(145deg, #0d1828, #111e30)`
- Elevated panel: `rgba(15, 25, 50, 0.95)`

### Accent / Brand Colors
- Gold primary: `#C9A84C`
- Gold light: `#E8C96D`
- Gold dark: `#A07830`
- Gold gradient: `linear-gradient(135deg, #C9A84C, #E8C96D)`
- Gold glow: `rgba(201,168,76,0.15)`
- Blue accent (data/interactive only): `#4F8CFF`
- Success (status only): `#00D084`

### Border Styles
- Default card border: `1px solid rgba(201,168,76,0.2)`
- Active/hover border: `1px solid rgba(201,168,76,0.45)`
- Divider line: `1px solid rgba(201,168,76,0.08)`
- Premium badge border: `1px solid rgba(201,168,76,0.6)`

### Typography
- Page title: `Syne 800 clamp(28px,3.5vw,48px)`, letter-spacing `-0.02em`
- Section H2: `Syne 700 clamp(22px,2.5vw,36px)`
- Card title: `Syne 700 18-20px`
- Body text: `DM Sans 400/500 14-15px`
- Data labels: `DM Sans 600 11px`, letter-spacing `2`, uppercase
- Stat numbers: `Syne 800 32-48px`, gold gradient text

### Shadows & Glows
- Card shadow: `0 8px 32px rgba(0,0,0,0.5)`
- Card hover shadow: `0 16px 48px rgba(201,168,76,0.12)`
- Gold glow button: `0 0 30px rgba(201,168,76,0.35)`
- Gold glow hover: `0 0 50px rgba(201,168,76,0.55)`
- Stat card glow: `0 0 40px rgba(201,168,76,0.08)`

### Buttons
- Primary CTA:
  - Background: `linear-gradient(135deg, #C9A84C, #E8C96D)`
  - Color: `#04080f`
  - Font: `DM Sans 700 15px`
  - Radius: `10px`
  - Padding: `13px 28px`
  - Shadow: `0 0 30px rgba(201,168,76,0.35)`
  - Hover: `translateY(-2px)`, stronger gold glow
- Secondary CTA:
  - Background: `transparent`
  - Border: `1px solid rgba(201,168,76,0.35)`
  - Color: `#C9A84C`
  - Hover border: `rgba(201,168,76,0.6)`

### Background Effects
- Hero/page mesh:
  - `radial-gradient(ellipse 70% 50% at 15% 35%, rgba(201,168,76,0.06), transparent 60%)`
  - `radial-gradient(ellipse 50% 40% at 85% 70%, rgba(79,140,255,0.05), transparent 55%)`
  - `linear-gradient(180deg, #04080f, #070e1c, #04080f)`
- Grid overlay: `rgba(201,168,76,0.03)` lines, `60px x 60px`
- Floating orbs:
  - Gold: `rgba(201,168,76,0.05)`
  - Blue: `rgba(79,140,255,0.04)`

### Special Enterprise UI Elements
- Card watermark:
  - Text: `ENTERPRISE`
  - Font: `Syne 800 72px`
  - Color: `rgba(201,168,76,0.04)`
  - Position: absolute bottom-right, rotate `-15deg`, `z-index: 0`
- Crown/diamond badge:
  - Background: `linear-gradient(135deg, #C9A84C, #E8C96D)`
  - Color: `#04080f`
  - Font: `DM Sans 700 10px`
  - Letter spacing: `2`
  - Padding: `4px 12px`
  - Radius: `20px`
  - Label: `ENTERPRISE`
- Section labels: `#C9A84C`, letter-spacing `3`, uppercase, `11px`
- Stat card numbers: gold gradient text
- Live indicator dot: `#00D084` with green glow

## Module 2: Admin (`src/features/admin/`)

### User Psychology
Internal super-admin users need speed, clarity, and reliability.

### Background Colors
- Page base: `#050d1a`
- Sidebar base: `#040c18`
- Card base: `linear-gradient(145deg, #0c1a2e, #0a1525)`
- Table row hover: `rgba(79,140,255,0.05)`
- Input background: `rgba(79,140,255,0.06)`

### Accent Colors
- Primary: `#4F8CFF`
- Secondary: `#00D084`
- Warning: `#F59E0B`
- Danger: `#EF4444`
- AI accent: `#7C3AED`
- Muted text: `rgba(232,237,245,0.45)`

### Border Styles
- Default: `1px solid rgba(79,140,255,0.12)`
- Active: `1px solid rgba(79,140,255,0.35)`
- Input: `1px solid rgba(79,140,255,0.2)`
- Focus: `1px solid #4F8CFF` + `0 0 0 3px rgba(79,140,255,0.15)`
- Divider: `1px solid rgba(255,255,255,0.06)`

### Typography
- Page title: `Syne 700 24-28px`
- Section header: `Syne 600 18-20px`
- Table head: `DM Sans 600 11px`, letter-spacing `2`, uppercase, muted
- Table cell: `DM Sans 400 13-14px`
- Labels: `DM Sans 500 12px`
- Stat number: `Syne 800 28-36px`, white or blue gradient

### Shadows
- Card: `0 4px 20px rgba(0,0,0,0.35)`
- Hover: `0 8px 32px rgba(79,140,255,0.1)`
- Modal: `0 24px 64px rgba(0,0,0,0.6)`
- Input focus: `0 0 0 3px rgba(79,140,255,0.15)`

### Buttons
- Primary:
  - Background: `linear-gradient(135deg, #4F8CFF, #2563eb)`
  - Color: `#fff`
  - Font: `DM Sans 600 14px`
  - Radius: `8px`
  - Padding: `9px 20px`
  - Shadow: `0 0 20px rgba(79,140,255,0.25)`
- Danger:
  - Background: `rgba(239,68,68,0.1)`
  - Border: `1px solid rgba(239,68,68,0.3)`
  - Color: `#EF4444`
- Success:
  - Background: `rgba(0,208,132,0.1)`
  - Border: `1px solid rgba(0,208,132,0.25)`
  - Color: `#00D084`
- Ghost:
  - Background: `transparent`
  - Border: `1px solid rgba(79,140,255,0.2)`
  - Color: `rgba(232,237,245,0.7)`

### Status Badges
- Active/Live: `rgba(0,208,132,0.1)` / `rgba(0,208,132,0.25)` / `#00D084`
- Pending: `rgba(245,158,11,0.1)` / `rgba(245,158,11,0.25)` / `#F59E0B`
- Failed/Offline: `rgba(239,68,68,0.1)` / `rgba(239,68,68,0.25)` / `#EF4444`
- AI/Automated: `rgba(124,58,237,0.1)` / `rgba(124,58,237,0.25)` / `#7C3AED`
- Shared badge shape: radius `20px`, padding `4px 12px`, size `11px`, weight `600`

### Sidebar
- Width: `240px` expanded, `64px` collapsed
- Background: `#040c18`
- Active item: `rgba(79,140,255,0.1)`, left border `3px solid #4F8CFF`, text `#fff`
- Inactive item: `rgba(232,237,245,0.45)`, hover text `#fff`, hover bg `rgba(79,140,255,0.05)`
- Section labels: `rgba(232,237,245,0.25)`, `10px`, letter-spacing `2`, uppercase

### Table
- Header row: `rgba(79,140,255,0.05)`, muted uppercase `11px`
- Body rows: transparent, bottom border `rgba(255,255,255,0.05)`
- Hover row: `rgba(79,140,255,0.05)`
- Selected row: `rgba(79,140,255,0.08)`, left border `2px solid #4F8CFF`
