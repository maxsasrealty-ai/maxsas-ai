# Admin Module Design Tokens

Scope: `src/features/admin/*`

Do not use Enterprise module tokens in this scope.

## Brand Intent
- Efficient, clear, operational UI for internal platform control.
- Visual language: precise, functional, reliable.

## Colors
- Page base: `#050d1a`
- Sidebar base: `#040c18`
- Card base: `linear-gradient(145deg, #0c1a2e, #0a1525)`
- Table row hover: `rgba(79,140,255,0.05)`
- Input background: `rgba(79,140,255,0.06)`

## Accent
- Primary: `#4F8CFF`
- Secondary: `#00D084`
- Warning: `#F59E0B`
- Danger: `#EF4444`
- AI badge: `#7C3AED`
- Muted text: `rgba(232,237,245,0.45)`

## Borders
- Default: `1px solid rgba(79,140,255,0.12)`
- Active: `1px solid rgba(79,140,255,0.35)`
- Input: `1px solid rgba(79,140,255,0.2)`
- Focus: `1px solid #4F8CFF`, `0 0 0 3px rgba(79,140,255,0.15)`
- Divider: `1px solid rgba(255,255,255,0.06)`

## Typography
- Page title: `Syne 700 24-28px`
- Section header: `Syne 600 18-20px`
- Table head: `DM Sans 600 11px`, letter-spacing `2`, uppercase, muted
- Table cell: `DM Sans 400 13-14px`
- Labels: `DM Sans 500 12px`
- Stat number: `Syne 800 28-36px`, white or blue gradient

## Shadows
- Card: `0 4px 20px rgba(0,0,0,0.35)`
- Hover: `0 8px 32px rgba(79,140,255,0.1)`
- Modal: `0 24px 64px rgba(0,0,0,0.6)`
- Input focus: `0 0 0 3px rgba(79,140,255,0.15)`

## Buttons
- Primary: blue gradient, white text, `DM Sans 600 14px`, radius `8px`, padding `9px 20px`, blue glow
- Danger: red translucent fill + red border + red text
- Success: green translucent fill + green border + green text
- Ghost: transparent + blue border + muted text

## Status Badges
- Active/Live: bg `rgba(0,208,132,0.1)`, border `rgba(0,208,132,0.25)`, text `#00D084`
- Pending: bg `rgba(245,158,11,0.1)`, border `rgba(245,158,11,0.25)`, text `#F59E0B`
- Failed/Offline: bg `rgba(239,68,68,0.1)`, border `rgba(239,68,68,0.25)`, text `#EF4444`
- AI/Automated: bg `rgba(124,58,237,0.1)`, border `rgba(124,58,237,0.25)`, text `#7C3AED`
- Badge shape: radius `20px`, padding `4px 12px`, size `11px`, weight `600`

## Sidebar
- Width: `240px` expanded, `64px` collapsed
- Active item: bg `rgba(79,140,255,0.1)`, left border `3px solid #4F8CFF`, text `#fff`
- Inactive item: muted text, hover text white, hover bg `rgba(79,140,255,0.05)`
- Section labels: `rgba(232,237,245,0.25)`, `10px`, letter-spacing `2`, uppercase

## Table
- Header row: `rgba(79,140,255,0.05)`, uppercase muted `11px`
- Body row: transparent, bottom border `rgba(255,255,255,0.05)`
- Hover row: `rgba(79,140,255,0.05)`
- Selected row: `rgba(79,140,255,0.08)`, left border `2px solid #4F8CFF`
