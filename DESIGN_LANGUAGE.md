# ERP Experts Design System

## Brand Positioning
**Clean. Bold. Powerful.**

We're not another safe corporate site. We show up with confidence. The design should feel like a firm handshake - direct, professional, memorable.

---

## Typography

### Font Families
| Use | Font | Weight |
|-----|------|--------|
| Headings | Manrope | 800 (Extra Bold) |
| Body | Inter | 400 (Regular) |

### Heading Styles
```
Letter-spacing: -0.04em (tight, confident)
Line-height: 1.0 - 1.1 (compact, impactful)
```

| Level | Desktop Size | Mobile Size | Line Height |
|-------|--------------|-------------|-------------|
| H1 (Hero) | clamp(3rem, 12vw, 11rem) | ~3.4rem | 1.0 |
| H2 | ~7.6rem | ~2.6rem | 1.05 |
| H3 | ~5rem | ~2.6rem | 1.1 |
| H4 | ~3.4rem | ~1.5rem | 1.15 |
| H5 | ~2.25rem | ~1.5rem | 1.2 |
| H6 | ~1.5rem | ~1.5rem | 1.27 |

### Heading Hierarchy (IMPORTANT)

**Use semantic headings. Never override sizes with utility classes.**

The CSS defines the correct sizes - just use the right tag.

| Tag | Usage |
|-----|-------|
| `<h1>` | Page hero headline AND final CTA headline (one per page for hero, one for final CTA is acceptable) |
| `<h2>` | Major section headlines ("Big Statement", primary section intros) |
| `<h3>` | Section titles (Services, Industries, Why Us, etc.) |
| `<h4>` | Sub-section titles, card group headers |
| `<h5>` | Card titles, list item titles |
| `<h6>` | Smallest headings, resource titles |

**Rules:**
1. Never skip levels (don't go h1 → h4)
2. Never use `text-2xl`, `text-3xl` etc. on headings - the tag defines the size
3. One `h1` per page in the hero (Final CTA can also use h1 for impact)
4. Sections flow: h2 or h3 for section title → h4/h5/h6 for content within
5. If a heading looks wrong, you're using the wrong tag - don't override with classes

**Example page structure:**
```
<h1>Hero headline</h1>
  <h3>Section title</h3>
    <h5>Card title</h5>
    <h5>Card title</h5>
  <h3>Section title</h3>
    <h4>Sub-section</h4>
    <h5>Card title</h5>
  <h2>Big statement</h2>
  <h3>Section title</h3>
<h1>Final CTA headline</h1>
```

### Labels
```
Size: 1rem (18px)
Weight: 700 (Bold)
Transform: UPPERCASE
Letter-spacing: 0.2em (wide, creates contrast with tight headlines)
```

### Body Text
```
Size: 1.125rem (~20px)
Line-height: 1.618 (Golden Ratio - comfortable reading)
Color: #333333 (muted, lets headlines dominate)
```

---

## Colour Palette

### Backgrounds
| Name | Hex | Usage |
|------|-----|-------|
| White | `#ffffff` | 95% of the site - primary background |
| Dark | `#1a1a1a` | Contained CTA boxes only (never full-width) |

### Text
| Name | Hex | Usage |
|------|-----|-------|
| Primary | `#1a1a1a` | Headlines, primary text |
| Muted | `#333333` | Body copy, descriptions |
| On Dark | `#ffffff` | Text on dark backgrounds |
| On Dark Muted | `#a0a0a0` | Secondary text on dark |

### Accents
| Name | Hex | Usage |
|------|-----|-------|
| Pink | `#e6307d` | Primary accent - CTAs, highlights, icons |
| Purple | `#71297b` | Aftercare services ONLY |

### Accent Word Rules
**Pink accent on emotional/impact words:**
- "NetSuite" in hero
- "problem" / "superpower" in statements
- "loves" in testimonials
- Key stats numbers (alternating)

**Never accent:**
- Whole sentences
- More than 2 words per headline
- Generic words (the, and, we, etc.)

---

## Spacing System

Based on Golden Ratio (φ = 1.618), base unit 8px.

| Token | Value | Use |
|-------|-------|-----|
| `--space-xs` | 5px | Micro gaps |
| `--space-sm` | 8px | Tight spacing |
| `--space-md` | 13px | Default gaps |
| `--space-lg` | 21px | Component internal spacing |
| `--space-xl` | 34px | Between related elements |
| `--space-2xl` | 55px | Section internal spacing |
| `--space-3xl` | 89px | Section padding (standard) |
| `--space-4xl` | 144px | Section padding (emphasis) |

### Spacing Rules

**Label → Headline**
```
Space: --space-md (13px)
The label whispers, headline shouts. Keep them close.
```

**Headline → Body Copy**
```
Space: --space-lg to --space-xl (21-34px)
Equal to or slightly less than headline line-height feels balanced.
```

**Body Copy → CTA Button**
```
Space: --space-xl to --space-2xl (34-55px)
CTAs need breathing room. Double the body-to-headline gap.
```

**Section Padding**
```
Standard sections: --space-3xl (89px) vertical
Emphasis sections (Hero, Big Statement, Final CTA): --space-4xl (144px) vertical
```

**Between Sections**
```
Use borders (border-top: 1px solid rgba(26,26,26,0.1)) not background changes.
Or generous whitespace - sections should breathe.
```

**Under content**
...
Make sure to have a space under text if it prceeds with a line or border. There should be equal distance between the line and the copy above it. 
...

---

## Component Specifications

### Buttons

**Primary (Black)**
```
Background: #1a1a1a
Text: #ffffff
Padding: --space-lg (21px) vertical, --space-2xl (55px) horizontal
Border-radius: 9999px (pill)
Font-weight: 700
Hover: scale(1.05)
```

**Accent (Pink)** - Use on dark backgrounds
```
Background: #e6307d
Text: #ffffff
Same padding/radius as Primary
```

**Large Variant**
```
Padding: --space-xl vertical, --space-2xl horizontal
Font-size: --text-h6 (~1.5rem)
```

### Cards
```
Background: #ffffff
Padding: --space-xl (34px)
Border-radius: --space-lg (21px)
Border: 1px solid rgba(26,26,26,0.05) - subtle definition
Hover: translateY(-8px)
```

### Icon Boxes
```
Small: 34px × 34px (--space-xl)
Medium: 55px × 55px (--space-2xl)
Large: 89px × 89px (--space-3xl)
Background: accent color at 10% opacity
Border-radius: --space-md or full round
```

### Contained Dark CTA (NETscore style)
```
Background: #1a1a1a
Padding: --space-2xl to --space-3xl (55-89px)
Border-radius: 2rem
Button: White background, dark text (inverted)
```
This is the ONLY dark element on the page.

---

## Section Anatomy

### Standard Content Section
```
┌─────────────────────────────────────┐
│                                     │  ← --space-3xl padding top
│  LABEL (pink, uppercase)            │
│                                     │  ← --space-md gap
│  Headline Here                      │
│                                     │  ← --space-xl gap
│  Body copy sits here with muted     │
│  color and comfortable line height. │
│                                     │  ← --space-2xl gap (double for CTA)
│  [ Button Label → ]                 │
│                                     │  ← --space-3xl padding bottom
└─────────────────────────────────────┘
```

### Hero Section
```
┌─────────────────────────────────────┐
│                                     │  ← --space-4xl padding top
│  LABEL                              │
│                                     │  ← --space-md gap
│  MASSIVE                            │
│  HEADLINE                           │
│  HERE                               │
│                                     │  ← --space-xl gap
│  Subtext description                │
│                                     │  ← --space-2xl gap
│  [ Primary CTA → ]                  │
│                                     │  ← --space-4xl padding bottom
└─────────────────────────────────────┘
```

### Final CTA Section
```
┌─────────────────────────────────────┐
│                                     │  ← --space-4xl padding
│                                     │
│         Massive Headline            │
│         Accent Second Line          │
│                                     │  ← --space-2xl gap (generous!)
│         [ Button → ]                │
│                                     │
│                                     │  ← --space-4xl padding
└─────────────────────────────────────┘

Centered. Generous whitespace. Statement-making.
```

---

## Visual Hierarchy Checklist

Before shipping any section, verify:

1. **Does the headline dominate?** It should be the first thing you see.
2. **Is there enough whitespace?** When in doubt, add more.
3. **Are accents used sparingly?** Max 1-2 pink words per headline.
4. **Is the CTA breathing?** Should have noticeably more space above it.
5. **Does it feel bold?** If it feels safe, it's wrong.

---

---

## Responsive Behaviour

### Breakpoints
| Name | Width | Usage |
|------|-------|-------|
| Mobile | < 768px | Single column, stacked layouts |
| Tablet | 768px+ | 2-column grids, larger type |
| Desktop | 1024px+ | Full layouts, max typography |
| Wide | 1280px+ | Extra breathing room |

### Mobile Rules
- All grids collapse to single column
- Headlines scale down but stay bold (never below 2.5rem for H1)
- Section padding reduces: `--space-3xl` → `--space-2xl`
- Cards stack vertically with `--space-lg` gaps
- Buttons go full-width on mobile (`w-full sm:w-auto`)
- Touch targets minimum 44px height

### Tablet Rules
- 2-column grids for cards, services
- Side-by-side layouts for content + image sections
- Navigation can stay horizontal

### Desktop Rules
- Full grid layouts (3-col for services, 6-col for industries)
- Maximum container width: 1800px
- Generous horizontal padding: `--space-2xl`

---

## Grid System

### Container
```
Max-width: 1800px
Centered with auto margins
Padding: --space-lg (mobile) → --space-xl (tablet) → --space-2xl (desktop)
```

### Column Grids
| Content Type | Mobile | Tablet | Desktop |
|--------------|--------|--------|---------|
| Services | 1 col | 2 col | 3 col |
| Industries | 3 col | 3 col | 6 col |
| Resources | 1 col | 2 col | 3 col |
| Path Boxes | 1 col | 2 col | 2 col |
| Stats | 2 col | 2 col | 4 col |
| Why Us | 1 col | 2 col | 3 col |

### Gutter Widths
```
Mobile: --space-md (13px)
Tablet: --space-lg (21px)
Desktop: --space-lg to --space-xl (21-34px)
```

---

## Links

### Text Links (inline)
```
Color: #1a1a1a (same as body)
Text-decoration: underline
Hover: color shifts to #e6307d (pink)
```

### Arrow Links ("View all →")
```
Color: #1a1a1a
Font-weight: 700 (bold)
No underline
Icon: ArrowRight, 20px, same color
Hover: icon translates right 4px
Gap between text and arrow: --space-sm (8px)
```

### When to use what
- **Text link**: Within paragraphs, inline references
- **Arrow link**: Section "view all" actions, secondary CTAs
- **Button**: Primary actions, form submissions, hero CTAs

---

## Images & Media

### Aspect Ratios
| Content | Ratio | Usage |
|---------|-------|-------|
| Case Study hero | 4:3 | Featured image |
| Avatars | 1:1 | Testimonials, team |
| Video thumbnails | 16:9 | Resources, webinars |
| Industry icons | 1:1 | Square icon containers |
| Logo placeholders | ~3:1 | Client logos |

### Image Styling
```
Border-radius: --space-lg (21px) for large images
Border-radius: --space-md (13px) for cards/thumbnails
Border-radius: 9999px for avatars (full circle)
```

### Placeholder Styling (wireframes)
```
Background: #1a1a1a (dark) or rgba(26,26,26,0.05) (light)
Border: 2px solid rgba(255,255,255,0.15) for dark placeholders
Text: Uppercase label, centered, muted color
```

### Overlay Treatments
```
Case study gradient: linear-gradient(to top, rgba(230,48,125,0.3), transparent)
Height: 33% of image from bottom
Creates depth and brand connection
```

---

## Decorative Elements

### Pink Triangle (Hero)
```
Position: Absolute, offset right (60-65% from left)
Size: ~800px wide, ~700px tall
Opacity: 20-25%
Color: #e6307d
CSS: Border trick (transparent left/right, solid bottom)
```
Use sparingly - hero only. Creates energy without distraction.

### Large Background Icons
```
Position: Absolute, corner of section/card
Size: 150-250px (oversized, decorative)
Opacity: 10-15% (subtle texture, not distraction)
Color: Accent color (pink or purple for Aftercare)
Stroke-width: 1 (thin, elegant)
Offset: Partially outside container (translate 20-30px)
```

### Background Numbers (Service Cards)
```
Position: Absolute, top-right of card
Size: 8rem (128px)
Font: Heading font, extra bold
Opacity: 4-5% (barely visible texture)
Offset: -top-4, -right-2 (bleeds slightly)
```

### Border Treatments
```
Section dividers: 1px solid rgba(26,26,26,0.1) - 10% opacity
Card borders: 1px solid rgba(26,26,26,0.05) - 5% opacity (subtler)
Thick borders (path boxes): 2px solid rgba(26,26,26,0.1)
Hover borders: shift to accent color at 30% opacity
```

---

## Navigation

### Header
```
Position: Fixed, top
Background: Transparent (uses mix-blend-difference for contrast)
Padding: --space-xl vertical
Logo: Left-aligned, bold, text-based
Links: Right-aligned, --space-xl gaps
Link style: text-sm, font-medium, 60% opacity → 100% on hover
CTA: Bold, no background (text only in nav)
```

### Mobile Navigation
```
Hamburger icon: Right-aligned
Menu: Full-screen overlay or slide-in drawer
Links: Stacked, larger touch targets (--space-xl padding)
Close: X icon, top-right
```

### Active State
```
Current page link: 100% opacity, optional underline or dot indicator
```

---

## Footer

### Layout
```
Max-width: 1800px (same as content)
Padding: --space-4xl vertical
Border-top: 1px solid rgba(26,26,26,0.1)
```

### Structure
```
┌─────────────────────────────────────────────────┐
│  Logo + Description        │  Link Columns     │
│  Social Icons              │  (3 columns)      │
├─────────────────────────────────────────────────┤
│  © Copyright               │  Privacy | Terms  │
└─────────────────────────────────────────────────┘
```

### Grid
- Desktop: Logo area 4 cols, Links area 8 cols (3 sub-columns)
- Mobile: Stacked, logo first, then links, then legal

### Link Styling
```
Column headers: text-sm, uppercase, bold, --space-xl tracking
Links: muted color, hover opacity 60%
Gaps: --space-sm between links
```

### Social Icons
```
Size: 40px circular containers
Background: rgba(26,26,26,0.08)
Icon: 20px, primary text color
Hover: background darkens or scales
Gap: --space-md between icons
```

---

## Don'ts

- ❌ Full-width dark sections (except contained boxes)
- ❌ Grey backgrounds for "variety" - use whitespace instead
- ❌ Accenting entire phrases
- ❌ Tight spacing between content and CTAs
- ❌ Multiple dark elements on one page
- ❌ Purple anywhere except Aftercare
- ❌ Safe, corporate, forgettable layouts
- ❌ Decorative elements above 25% opacity (they should be subtle)
- ❌ More than one triangle per page
- ❌ Background icons that compete with content
- ❌ Inconsistent border-radius (stick to the scale)
