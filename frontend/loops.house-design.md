---
version: alpha
name: Loops House
description: A playful, high-contrast editorial system with soft background tones and oversized type.
colors:
  primary: "#0f2c23"
  secondary: "#10271d"
  tertiary: "#e5e7eb"
  neutral: "#f8ffe8"
  surface: "#f8ffe8"
  on-surface: "#10271d"
  error: "#b42318"
  primary-60: "#4d665c"
  primary-70: "#314c41"
  primary-80: "#17362d"
typography:
  headline-display:
    fontFamily: "Funnel Sans"
    fontSize: "72px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.04em"
  headline-lg:
    fontFamily: "Funnel Sans"
    fontSize: "48px"
    fontWeight: 700
    lineHeight: "56px"
    letterSpacing: "-0.035em"
  headline-md:
    fontFamily: "Funnel Sans"
    fontSize: "31px"
    fontWeight: 700
    lineHeight: "38px"
    letterSpacing: "-0.025em"
  headline-sm:
    fontFamily: "ui-sans-serif"
    fontSize: "25px"
    fontWeight: 700
    lineHeight: "34px"
    letterSpacing: "-0.02em"
  body-lg:
    fontFamily: "Funnel Sans"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "0px"
  body-md:
    fontFamily: "Funnel Sans"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "0px"
  body-sm:
    fontFamily: "Funnel Sans"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "0px"
  label-lg:
    fontFamily: "ui-sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "0.02em"
  label-md:
    fontFamily: "ui-sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: "20px"
    letterSpacing: "0.04em"
  label-sm:
    fontFamily: "ui-sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: "16px"
    letterSpacing: "0.08em"
  caption:
    fontFamily: "ui-sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: "14px"
    letterSpacing: "0.08em"
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  xs: 6px
  sm: 20px
  md: 40px
  lg: 56px
  xl: 96px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "16px 24px"
    height: "48px"
  button-primary-hover:
    backgroundColor: "{colors.primary-70}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "16px 24px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "16px 24px"
    height: "48px"
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.secondary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.full}"
    padding: "0px"
    height: "auto"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "16px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  chip:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "8px 12px"
---

# Loops House

## Overview
Loops House feels playful, confident, and editorial, with a strong AI-era personality rather than a generic SaaS tone. The visual language is spacious and minimal, letting oversized headlines and a few rounded UI elements carry the experience. It should feel modern and a little quirky, with warmth coming from the pale cream background and the mascot-like illustration.

## Colors
- **Primary (#0f2c23):** The deep evergreen anchor used for major headlines, key buttons, and strong UI contrast. It gives the interface its dark, grounded character.
- **Secondary (#10271d):** A near-black forest tone for body text and lower-level emphasis. It stays softer than pure black while preserving high readability.
- **Neutral (#f8ffe8):** The pale cream background that defines the brand atmosphere. It makes the layout feel airy, friendly, and slightly vintage.
- **Surface (#f8ffe8):** The default surface tone for cards and controls when a separate surface is needed. In practice it blends with the background for a very flat, open canvas.
- **Tertiary (#e5e7eb):** A light cool gray used for subtle borders and divider-like structure. It should remain quiet and never compete with the dark greens.
- **On-surface (#10271d):** The primary text color for content placed on light surfaces. This keeps body copy crisp without going fully black.
- **Error (#b42318):** Reserved for validation and destructive states only. It should appear sparingly to preserve the calm palette.
- **Primary-60 (#4d665c), Primary-70 (#314c41), Primary-80 (#17362d):** Progressive darkening steps for hover, pressed, and dense overlays when the interface needs more depth.

## Typography
The system mixes a bold geometric display face with a pragmatic sans-serif utility voice. `Funnel Sans` drives the brand’s personality in large headlines and body copy, while `ui-sans-serif` is available for compact labels and system-like utility text.

Headlines are oversized and tightly tracked, with strong weight and negative letter-spacing to create the poster-like hero treatment seen in the screenshot. `headline-display` and `headline-lg` should be used for page-level statements, `headline-md` for section headers, and `headline-sm` for smaller editorial emphasis.

Body text stays readable and compact, around 15–17px with generous line height. Labels and buttons use higher weight, more spacing, and subtle uppercase energy for clarity at small sizes.

## Layout
The composition is highly spacious, with large negative space surrounding the main message and illustration. Use a fluid, open grid rather than a dense card layout, and keep content anchored in broad columns with generous outer margins.

Spacing should follow the observed rhythm of 6px, 20px, 40px, 56px, and 96px. Small internal gaps are restrained, while sections and hero blocks breathe heavily; avoid stacking many unrelated elements too closely.

Cards and controls should sit within calm surface planes with modest padding rather than large decorative frames. The overall effect should be editorial and composed, not dashboard-heavy.

## Elevation & Depth
The interface is intentionally flat. There are no visible shadows, and hierarchy comes from color contrast, typographic scale, and generous whitespace instead of depth layers.

Subtle borders are allowed on secondary controls and containers, but they should remain thin and quiet. If additional emphasis is needed, prefer tonal variation with `primary`, `primary-70`, or `tertiary` rather than shadows.

## Shapes
The shape language is soft and rounded, especially for buttons and decorative panels. Pill forms are common for actions, while cards and inputs use modest 8px radii for a calmer structural feel.

Use `rounded.full` for primary CTAs and chips, `rounded.md` for cards and inputs, and keep sharp corners rare. The result should feel friendly and modern without becoming overly bubbly.

## Components
Buttons are the clearest branded component. `button-primary` should use the dark evergreen fill with light text, pill shaping, and comfortable 16px by 24px padding; it is the most prominent action and should remain visually simple. `button-secondary` should invert the emphasis by using a light surface with dark text and a borderless or near-borderless presentation. `button-tertiary` should be text-led, minimal, and used for lower-priority navigation or utility actions. Hover states should deepen the fill using `button-primary-hover` rather than adding shadows or movement.

Cards should feel understated and content-first. Use `card` with the light surface tone, a subtle 1px border in `tertiary`, `rounded.md`, and 16px padding. Avoid heavy framing or elevated containers.

Inputs should follow the same restrained language as cards: light background, dark text, moderate padding, and rounded medium corners. They should feel approachable, not technical or dense.

Chips should be pill-shaped and compact, using `rounded.full` with small horizontal padding. They can carry muted emphasis but should never outshine primary CTAs.

Text links should remain simple and underlined when they need to read as navigation rather than button actions. Keep them visually quiet so the oversized headlines remain the main attraction.

## Do's and Don'ts
- Do keep headlines large, bold, and tightly tracked.
- Do preserve the pale cream background as the dominant canvas.
- Do use dark evergreen tones for the strongest action and branding moments.
- Do keep components flat and rely on contrast instead of shadows.
- Don't introduce bright accent colors that break the calm forest palette.
- Don't over-round every element beyond the established pill and 8px card language.
- Don't compress the layout into a dense, dashboard-like grid.
- Don't use multiple competing button styles for primary actions.