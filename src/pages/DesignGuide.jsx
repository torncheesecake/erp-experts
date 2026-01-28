/**
 * ERP Experts Design Guide
 * Visual reference for the design system
 * NOT indexed by search engines - internal use only
 */

import { useEffect } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Rocket,
  HeartHandshake,
  AlertCircle,
  BookOpen,
} from "lucide-react";

export default function DesignGuide() {
  useEffect(() => {
    // Set noindex meta tag
    let meta = document.querySelector('meta[name="robots"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "robots";
      document.head.appendChild(meta);
    }
    meta.content = "noindex, nofollow";

    // Set page title
    document.title = "Design Guide - Internal Only";

    return () => {
      // Clean up on unmount
      if (meta) meta.content = "index, follow";
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="py-(--space-3xl) border-b border-(--color-text)/10">
        <div className="container">
          <p className="text-label text-primary mb-md">Internal Reference</p>
          <h1 className="text-hero mb-xl">Design Guide</h1>
          <p className="text-lg text-muted max-w-2xl">
            Visual reference for the ERP Experts design system. This page is not indexed by search
            engines.
          </p>
        </div>
      </header>

      {/* Navigation */}
      <nav className="py-(--space-lg) border-b border-(--color-text)/10 sticky top-0 bg-white z-50">
        <div className="container">
          <div className="flex flex-wrap gap-md">
            {[
              "Brand",
              "Typography",
              "Colours",
              "Spacing",
              "Buttons",
              "Cards",
              "Icons",
              "Sections",
            ].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="px-lg py-sm rounded-full text-base font-medium border border-(--color-text)/10 hover:border-(--color-primary) hover:text-primary transition-all"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Brand */}
      <section id="brand" className="section-padding-lg border-b border-(--color-text)/10">
        <div className="container">
          <p className="text-label text-primary mb-md">01</p>
          <h2 className="mb-xl">Brand Positioning</h2>

          <div className="max-w-3xl">
            <div className="p-(--space-2xl) bg-(--color-text) rounded-2xl mb-xl">
              <p className="text-3xl md:text-4xl font-heading text-white leading-tight">
                Clean. Bold. Powerful.
              </p>
            </div>

            <p className="text-lg text-muted mb-lg">
              We're not another safe corporate site. We show up with confidence. The design should
              feel like a firm handshake - direct, professional, memorable.
            </p>

            <div className="p-(--space-xl) border-2 border-(--color-primary) rounded-xl">
              <p className="text-xl font-bold text-primary">"If it feels safe, it's wrong."</p>
            </div>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section id="typography" className="section-padding-lg border-b border-(--color-text)/10">
        <div className="container">
          <p className="text-label text-primary mb-md">02</p>
          <h2 className="mb-xl">Typography</h2>

          {/* Font Families */}
          <div className="mb-3xl">
            <h4 className="mb-lg">Font Families</h4>
            <div className="grid md:grid-cols-2 gap-xl">
              <div className="p-(--space-xl) border border-(--color-text)/10 rounded-xl">
                <p className="text-label text-muted mb-md">Headings</p>
                <p className="font-heading text-4xl mb-lg">Manrope 800</p>
                <p className="text-base text-muted">Extra bold, tight letter-spacing (-0.04em)</p>
              </div>
              <div className="p-(--space-xl) border border-(--color-text)/10 rounded-xl">
                <p className="text-label text-muted mb-md">Body</p>
                <p className="text-4xl mb-lg">Inter 400</p>
                <p className="text-base text-muted">Regular weight, golden ratio line-height</p>
              </div>
            </div>
          </div>

          {/* Heading Scale */}
          <div className="mb-3xl">
            <h4 className="mb-lg">Heading Scale</h4>
            <p className="text-base text-muted mb-xl">
              Use semantic tags. Never override with utility classes.
            </p>

            <div className="space-y-lg">
              <div className="flex items-baseline gap-xl border-b border-(--color-text)/5 pb-lg">
                <code className="text-sm text-primary font-mono w-16">h1</code>
                <h1 className="flex-1">Hero Headline</h1>
                <span className="text-sm text-muted">Hero + Final CTA only</span>
              </div>
              <div className="flex items-baseline gap-xl border-b border-(--color-text)/5 pb-lg">
                <code className="text-sm text-primary font-mono w-16">h2</code>
                <h2 className="flex-1">Major Section</h2>
                <span className="text-sm text-muted">Big statements</span>
              </div>
              <div className="flex items-baseline gap-xl border-b border-(--color-text)/5 pb-lg">
                <code className="text-sm text-primary font-mono w-16">h3</code>
                <h3 className="flex-1">Section Title</h3>
                <span className="text-sm text-muted">Primary sections</span>
              </div>
              <div className="flex items-baseline gap-xl border-b border-(--color-text)/5 pb-lg">
                <code className="text-sm text-primary font-mono w-16">h4</code>
                <h4 className="flex-1">Sub-section Title</h4>
                <span className="text-sm text-muted">Card groups, sub-sections</span>
              </div>
              <div className="flex items-baseline gap-xl border-b border-(--color-text)/5 pb-lg">
                <code className="text-sm text-primary font-mono w-16">h5</code>
                <h5 className="flex-1">Card Title</h5>
                <span className="text-sm text-muted">Individual cards</span>
              </div>
              <div className="flex items-baseline gap-xl">
                <code className="text-sm text-primary font-mono w-16">h6</code>
                <h6 className="flex-1">Small Heading</h6>
                <span className="text-sm text-muted">Resources, minor items</span>
              </div>
            </div>
          </div>

          {/* Labels */}
          <div className="mb-3xl">
            <h4 className="mb-lg">Labels</h4>
            <div className="p-(--space-xl) border border-(--color-text)/10 rounded-xl">
              <p className="text-label text-primary mb-lg">SECTION LABEL</p>
              <div className="text-sm text-muted space-y-xs">
                <p>Size: 1rem (18px)</p>
                <p>Weight: 700 (Bold)</p>
                <p>Transform: UPPERCASE</p>
                <p>Letter-spacing: 0.2em</p>
                <p>
                  Class: <code className="text-primary">text-label text-primary</code>
                </p>
              </div>
            </div>
          </div>

          {/* Accent Words */}
          <div>
            <h4 className="mb-lg">Accent Words</h4>
            <div className="grid md:grid-cols-2 gap-xl">
              <div className="p-(--space-xl) border border-green-500/30 bg-green-500/5 rounded-xl">
                <p className="text-label text-green-600 mb-md">DO</p>
                <h3 className="mb-lg">
                  Your ERP should feel like a <span className="text-primary">superpower</span>.
                </h3>
                <p className="text-base text-muted">Accent emotional/impact words (max 1-2)</p>
              </div>
              <div className="p-(--space-xl) border border-red-500/30 bg-red-500/5 rounded-xl">
                <p className="text-label text-red-600 mb-md">DON'T</p>
                <h3 className="mb-lg text-primary">Your ERP should feel like a superpower.</h3>
                <p className="text-base text-muted">Never accent entire phrases</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Colours */}
      <section id="colours" className="section-padding-lg border-b border-(--color-text)/10">
        <div className="container">
          <p className="text-label text-primary mb-md">03</p>
          <h2 className="mb-xl">Colours</h2>

          {/* Backgrounds */}
          <div className="mb-3xl">
            <h4 className="mb-lg">Backgrounds</h4>
            <div className="grid md:grid-cols-2 gap-xl">
              <div>
                <div className="aspect-video rounded-xl bg-white border-2 border-(--color-text)/10 flex items-center justify-center mb-md">
                  <span className="text-label text-muted">WHITE</span>
                </div>
                <p className="text-base font-bold mb-xs">#ffffff</p>
                <p className="text-sm text-muted">95% of the site - primary background</p>
              </div>
              <div>
                <div className="aspect-video rounded-xl bg-(--color-bg-dark) flex items-center justify-center mb-md">
                  <span className="text-label text-white/60">DARK</span>
                </div>
                <p className="text-base font-bold mb-xs">#1a1a1a</p>
                <p className="text-sm text-muted">Contained CTA boxes only - never full-width</p>
              </div>
            </div>
          </div>

          {/* Accent Colours */}
          <div className="mb-3xl">
            <h4 className="mb-lg">Accent Colours</h4>
            <div className="grid md:grid-cols-2 gap-xl">
              <div>
                <div className="aspect-video rounded-xl bg-(--color-primary) flex items-center justify-center mb-md">
                  <span className="text-label text-white">PINK</span>
                </div>
                <p className="text-base font-bold mb-xs">#e6307d</p>
                <p className="text-sm text-muted">
                  Primary accent - CTAs, highlights, icons, everything except Aftercare
                </p>
              </div>
              <div>
                <div className="aspect-video rounded-xl bg-(--color-secondary) flex items-center justify-center mb-md">
                  <span className="text-label text-white">PURPLE</span>
                </div>
                <p className="text-base font-bold mb-xs">#71297b</p>
                <p className="text-sm text-muted">Aftercare services ONLY</p>
              </div>
            </div>
          </div>

          {/* Text Colours */}
          <div>
            <h4 className="mb-lg">Text Colours</h4>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-md">
              <div className="p-(--space-lg) border border-(--color-text)/10 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-(--color-text) mb-lg" />
                <p className="text-sm font-bold mb-xs">#1a1a1a</p>
                <p className="text-sm text-muted">Primary text</p>
              </div>
              <div className="p-(--space-lg) border border-(--color-text)/10 rounded-xl">
                <div className="w-12 h-12 rounded-full bg-(--color-text-muted) mb-lg" />
                <p className="text-sm font-bold mb-xs">#333333</p>
                <p className="text-sm text-muted">Muted text</p>
              </div>
              <div className="p-(--space-lg) border border-(--color-text)/10 rounded-xl bg-(--color-bg-dark)">
                <div className="w-12 h-12 rounded-full bg-white mb-lg" />
                <p className="text-sm font-bold text-white mb-xs">#ffffff</p>
                <p className="text-sm text-white/60">On dark</p>
              </div>
              <div className="p-(--space-lg) border border-(--color-text)/10 rounded-xl bg-(--color-bg-dark)">
                <div className="w-12 h-12 rounded-full bg-white/40 mb-lg" />
                <p className="text-sm font-bold text-white mb-xs">#a0a0a0</p>
                <p className="text-sm text-white/60">On dark muted</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spacing */}
      <section id="spacing" className="section-padding-lg border-b border-(--color-text)/10">
        <div className="container">
          <p className="text-label text-primary mb-md">04</p>
          <h2 className="mb-xl">Spacing</h2>

          <p className="text-lg text-muted mb-xl max-w-2xl">
            Based on Golden Ratio (φ = 1.618), base unit 8px. Each step multiplies by ~1.618.
          </p>

          {/* Scale */}
          <div className="mb-3xl">
            <h4 className="mb-lg">Spacing Scale</h4>
            <div className="space-y-md">
              {[
                { token: "--space-xs", value: "5px", use: "Micro gaps" },
                { token: "--space-sm", value: "8px", use: "Tight spacing" },
                { token: "--space-md", value: "13px", use: "Default gaps, label→headline" },
                { token: "--space-lg", value: "21px", use: "Component internal spacing" },
                { token: "--space-xl", value: "34px", use: "Between related elements" },
                { token: "--space-2xl", value: "55px", use: "Section internal, headline→CTA" },
                { token: "--space-3xl", value: "89px", use: "Section padding (standard)" },
                { token: "--space-4xl", value: "144px", use: "Section padding (emphasis)" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-lg p-(--space-md) border border-(--color-text)/5 rounded-lg"
                >
                  <code className="text-sm text-primary font-mono w-32">{item.token}</code>
                  <div
                    className="bg-(--color-primary) rounded"
                    style={{ width: item.value, height: "24px" }}
                  />
                  <span className="text-base font-bold w-16">{item.value}</span>
                  <span className="text-sm text-muted">{item.use}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Spacing Rules */}
          <div>
            <h4 className="mb-lg">Spacing Rules</h4>
            <div className="grid md:grid-cols-2 gap-xl">
              <div className="p-(--space-xl) border border-(--color-text)/10 rounded-xl">
                <p className="text-label text-primary mb-lg">Label → Headline</p>
                <div className="mb-lg">
                  <p className="text-label text-primary mb-md">SECTION LABEL</p>
                  <h4>Headline Here</h4>
                </div>
                <p className="text-sm text-muted">
                  Gap: <code className="text-primary">--space-md</code> (13px)
                </p>
              </div>
              <div className="p-(--space-xl) border border-(--color-text)/10 rounded-xl">
                <p className="text-label text-primary mb-lg">Headline → Body</p>
                <div className="mb-lg">
                  <h4 className="mb-lg">Headline Here</h4>
                  <p className="text-base text-muted">Body copy sits here.</p>
                </div>
                <p className="text-sm text-muted">
                  Gap: <code className="text-primary">--space-lg</code> to{" "}
                  <code className="text-primary">--space-xl</code>
                </p>
              </div>
              <div className="p-(--space-xl) border border-(--color-text)/10 rounded-xl">
                <p className="text-label text-primary mb-lg">Body → CTA (Double!)</p>
                <div className="mb-lg">
                  <p className="text-base text-muted mb-2xl">Body copy sits here.</p>
                  <button className="btn btn-primary">Button</button>
                </div>
                <p className="text-sm text-muted">
                  Gap: <code className="text-primary">--space-2xl</code> (55px) - CTAs need room
                </p>
              </div>
              <div className="p-(--space-xl) border border-(--color-text)/10 rounded-xl">
                <p className="text-label text-primary mb-lg">Final CTA Spacing</p>
                <div className="mb-lg text-center">
                  <h4 className="mb-2xl">Headline</h4>
                  <button className="btn btn-primary">Button</button>
                </div>
                <p className="text-sm text-muted">
                  Gap: <code className="text-primary">mb-2xl md:mb-3xl</code> - generous!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Buttons */}
      <section id="buttons" className="section-padding-lg border-b border-(--color-text)/10">
        <div className="container">
          <p className="text-label text-primary mb-md">05</p>
          <h2 className="mb-xl">Buttons</h2>

          <div className="grid md:grid-cols-2 gap-xl mb-3xl">
            {/* Primary */}
            <div className="p-(--space-xl) border border-(--color-text)/10 rounded-xl">
              <p className="text-label text-muted mb-lg">Primary (Black)</p>
              <button className="btn btn-primary btn-lg mb-lg">
                Start a project
                <ArrowRight className="w-6 h-6" />
              </button>
              <div className="text-sm text-muted space-y-xs">
                <p>Use on white backgrounds</p>
                <p>
                  Class: <code className="text-primary">btn btn-primary btn-lg</code>
                </p>
              </div>
            </div>

            {/* Accent */}
            <div className="p-(--space-xl) bg-(--color-bg-dark) rounded-xl">
              <p className="text-label text-white/60 mb-lg">Accent (Pink)</p>
              <button className="btn btn-accent btn-lg mb-lg">
                Get your score
                <ArrowRight className="w-6 h-6" />
              </button>
              <div className="text-sm text-white/60 space-y-xs">
                <p>Use on dark backgrounds</p>
                <p>
                  Class: <code className="text-primary">btn btn-accent btn-lg</code>
                </p>
              </div>
            </div>

            {/* On Dark - White */}
            <div className="p-(--space-xl) bg-(--color-bg-dark) rounded-xl">
              <p className="text-label text-white/60 mb-lg">White (On Dark)</p>
              <button className="btn btn-lg bg-white text-(--color-text) mb-lg">
                Subscribe
                <ArrowRight className="w-5 h-5" />
              </button>
              <div className="text-sm text-white/60 space-y-xs">
                <p>Alternative for dark backgrounds</p>
                <p>
                  Class:{" "}
                  <code className="text-primary">btn btn-lg bg-white text-(--color-text)</code>
                </p>
              </div>
            </div>

            {/* Outline */}
            <div className="p-(--space-xl) border border-(--color-text)/10 rounded-xl">
              <p className="text-label text-muted mb-lg">Outline</p>
              <button className="btn btn-lg border-2 border-(--color-text) text-(--color-text) mb-lg">
                Secondary action
              </button>
              <div className="text-sm text-muted space-y-xs">
                <p>Secondary actions only</p>
                <p>
                  Class:{" "}
                  <code className="text-primary">btn btn-lg border-2 border-(--color-text)</code>
                </p>
              </div>
            </div>
          </div>

          {/* Button Specs */}
          <div>
            <h4 className="mb-lg">Button Specifications</h4>
            <div className="p-(--space-xl) border border-(--color-text)/10 rounded-xl">
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-lg text-sm">
                <div>
                  <p className="text-muted mb-xs">Padding</p>
                  <p className="font-bold">--space-lg × --space-2xl</p>
                </div>
                <div>
                  <p className="text-muted mb-xs">Border Radius</p>
                  <p className="font-bold">9999px (pill)</p>
                </div>
                <div>
                  <p className="text-muted mb-xs">Font Weight</p>
                  <p className="font-bold">700 (Bold)</p>
                </div>
                <div>
                  <p className="text-muted mb-xs">Hover</p>
                  <p className="font-bold">scale(1.05)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section id="cards" className="section-padding-lg border-b border-(--color-text)/10">
        <div className="container">
          <p className="text-label text-primary mb-md">06</p>
          <h2 className="mb-xl">Cards</h2>

          <div className="grid md:grid-cols-3 gap-xl mb-3xl">
            {/* Standard Card */}
            <div>
              <p className="text-label text-muted mb-md">Standard Card</p>
              <div className="card">
                <div className="icon-box icon-box-md rounded-2xl bg-(--color-primary)/10 mb-lg">
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
                <h5 className="mb-sm">Card Title</h5>
                <p className="text-base text-muted">Card description text goes here.</p>
              </div>
            </div>

            {/* Card with Border */}
            <div>
              <p className="text-label text-muted mb-md">Card with Border</p>
              <div className="card border border-(--color-text)/5">
                <div className="icon-box icon-box-md rounded-2xl bg-(--color-primary)/10 mb-lg">
                  <BookOpen className="w-6 h-6 text-primary" />
                </div>
                <h5 className="mb-sm">Card Title</h5>
                <p className="text-base text-muted">With subtle border for definition.</p>
              </div>
            </div>

            {/* Service Card */}
            <div>
              <p className="text-label text-muted mb-md">Service Card (with number)</p>
              <div className="card group relative overflow-hidden border border-(--color-text)/5">
                <span
                  className="absolute -top-4 -right-2 font-heading text-[5rem] leading-none pointer-events-none text-(--color-primary)"
                  style={{ opacity: 0.05 }}
                >
                  01
                </span>
                <div className="relative z-10">
                  <div className="icon-box icon-box-md rounded-2xl bg-(--color-primary)/10 mb-lg">
                    <Rocket className="w-6 h-6 text-primary" />
                  </div>
                  <h5 className="mb-sm">Implementation</h5>
                  <p className="text-base text-muted mb-md">End-to-end deployment</p>
                  <div className="flex items-center gap-sm text-base font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Learn more <ArrowUpRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Specs */}
          <div>
            <h4 className="mb-lg">Card Specifications</h4>
            <div className="p-(--space-xl) border border-(--color-text)/10 rounded-xl">
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-lg text-sm">
                <div>
                  <p className="text-muted mb-xs">Padding</p>
                  <p className="font-bold">--space-xl (34px)</p>
                </div>
                <div>
                  <p className="text-muted mb-xs">Border Radius</p>
                  <p className="font-bold">--space-lg (21px)</p>
                </div>
                <div>
                  <p className="text-muted mb-xs">Border</p>
                  <p className="font-bold">1px @ 5% opacity</p>
                </div>
                <div>
                  <p className="text-muted mb-xs">Hover</p>
                  <p className="font-bold">translateY(-8px)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Icons */}
      <section id="icons" className="section-padding-lg border-b border-(--color-text)/10">
        <div className="container">
          <p className="text-label text-primary mb-md">07</p>
          <h2 className="mb-xl">Icon Boxes</h2>

          <div className="grid sm:grid-cols-3 gap-xl mb-3xl">
            <div className="text-center">
              <p className="text-label text-muted mb-md">Small</p>
              <div className="icon-box icon-box-sm rounded-full bg-(--color-primary)/10 mx-auto mb-lg">
                <Check className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm text-muted">34px × 34px</p>
            </div>
            <div className="text-center">
              <p className="text-label text-muted mb-md">Medium</p>
              <div className="icon-box icon-box-md rounded-2xl bg-(--color-primary)/10 mx-auto mb-lg">
                <Rocket className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm text-muted">55px × 55px</p>
            </div>
            <div className="text-center">
              <p className="text-label text-muted mb-md">Large</p>
              <div className="icon-box icon-box-lg rounded-2xl bg-(--color-primary)/10 mx-auto mb-lg">
                <HeartHandshake className="w-10 h-10 text-primary" />
              </div>
              <p className="text-sm text-muted">89px × 89px</p>
            </div>
          </div>

          {/* Decorative Icons */}
          <div>
            <h4 className="mb-lg">Decorative Background Icons</h4>
            <div className="grid md:grid-cols-2 gap-xl">
              <div className="p-(--space-xl) border border-(--color-text)/10 rounded-xl relative overflow-hidden h-64">
                <AlertCircle
                  className="absolute right-0 bottom-0 w-48 h-48 text-(--color-primary) opacity-10 translate-x-6 translate-y-6"
                  strokeWidth={1}
                />
                <div className="relative z-10">
                  <p className="text-label text-primary mb-md">Background Icon</p>
                  <p className="text-base text-muted">Opacity: 10-15%, oversized, offset</p>
                </div>
              </div>
              <div className="p-(--space-xl) border border-(--color-text)/10 rounded-xl">
                <p className="text-label text-muted mb-md">Specifications</p>
                <div className="space-y-sm text-sm">
                  <p>
                    <span className="text-muted">Size:</span> 150-250px
                  </p>
                  <p>
                    <span className="text-muted">Opacity:</span> 10-15%
                  </p>
                  <p>
                    <span className="text-muted">Stroke:</span> 1 (thin)
                  </p>
                  <p>
                    <span className="text-muted">Position:</span> Absolute, corner
                  </p>
                  <p>
                    <span className="text-muted">Offset:</span> translate 20-30px outside
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <section id="sections" className="section-padding-lg">
        <div className="container">
          <p className="text-label text-primary mb-md">08</p>
          <h2 className="mb-xl">Section Patterns</h2>

          {/* Standard Section */}
          <div className="mb-3xl">
            <h4 className="mb-lg">Standard Content Section</h4>
            <div className="border-2 border-dashed border-(--color-text)/20 rounded-xl p-(--space-xl)">
              <div className="border border-(--color-text)/10 rounded-xl overflow-hidden">
                <div className="p-(--space-3xl) border-b border-dashed border-(--color-primary)/30">
                  <p className="text-sm text-primary mb-xs">↑ --space-3xl padding</p>
                </div>
                <div className="p-(--space-xl)">
                  <p className="text-label text-primary mb-md">LABEL</p>
                  <p className="text-sm text-muted mb-xs">↓ --space-md</p>
                  <h3 className="mb-xl">Section Headline</h3>
                  <p className="text-sm text-muted mb-xs">↓ --space-xl</p>
                  <p className="text-base text-muted mb-2xl">
                    Body copy sits here with comfortable reading line height.
                  </p>
                  <p className="text-sm text-muted mb-xs">↓ --space-2xl (double for CTA!)</p>
                  <button className="btn btn-primary">Call to Action</button>
                </div>
                <div className="p-(--space-3xl) border-t border-dashed border-(--color-primary)/30">
                  <p className="text-sm text-primary">↓ --space-3xl padding</p>
                </div>
              </div>
            </div>
          </div>

          {/* Dark CTA Box */}
          <div className="mb-3xl">
            <h4 className="mb-lg">Contained Dark CTA (NETscore style)</h4>
            <p className="text-base text-muted mb-lg">
              This is the ONLY place dark backgrounds appear. Always contained and rounded.
            </p>
            <div className="rounded-2xl md:rounded-[2rem] p-(--space-xl) md:p-12 lg:p-16 bg-(--color-bg-dark) relative overflow-hidden">
              <div
                className="absolute top-1/2 w-0 h-0 opacity-20 hidden md:block"
                style={{
                  right: "-50px",
                  transform: "translateY(-50%)",
                  borderLeft: "150px solid transparent",
                  borderRight: "150px solid transparent",
                  borderBottom: "250px solid white",
                }}
              />
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-lg">
                <div>
                  <h4 className="mb-sm text-(--color-text-on-dark)">Dark CTA Headline</h4>
                  <p className="text-base text-(--color-text-on-dark-muted)">
                    Supporting text in muted white.
                  </p>
                </div>
                <button className="btn btn-lg bg-white text-(--color-text) shrink-0">
                  White Button
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Final CTA */}
          <div>
            <h4 className="mb-lg">Final CTA Section</h4>
            <p className="text-base text-muted mb-lg">
              White background, massive headline, generous spacing, black button.
            </p>
            <div className="border border-(--color-text)/10 rounded-xl p-(--space-4xl) text-center">
              <h1 className="mb-2xl md:mb-3xl">
                Let's build
                <span className="block text-primary">something great.</span>
              </h1>
              <button className="btn btn-primary btn-lg">
                Start a project
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Don'ts */}
      <section className="section-padding-lg bg-(--color-text)">
        <div className="container">
          <p className="text-label text-primary mb-md">Remember</p>
          <h2 className="text-white mb-xl">Don'ts</h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-md">
            {[
              "Full-width dark sections",
              "Grey backgrounds for variety",
              "Accenting entire phrases",
              "Tight spacing before CTAs",
              "Multiple dark elements per page",
              "Purple anywhere except Aftercare",
              "Overriding heading sizes with classes",
              "Decorative elements above 25% opacity",
              "More than one triangle per page",
              "Safe, corporate, forgettable layouts",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-md p-(--space-md) rounded-lg bg-white/5"
              >
                <span className="text-red-500 text-xl">✕</span>
                <span className="text-white/80">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-(--space-2xl) border-t border-(--color-text)/10">
        <div className="container text-center">
          <p className="text-muted">ERP Experts Design Guide - Internal Use Only - Not Indexed</p>
        </div>
      </footer>
    </div>
  );
}
