# Design System Strategy: High-Fidelity Command

## 1. Overview & Creative North Star
**The Creative North Star: "The Obsidian Lens"**

This design system is engineered for the elite tier of B2B consultancy—a space where clarity is the ultimate luxury. We are moving away from the "SaaS-standard" look of rounded corners and playful accents. Instead, we embrace **The Obsidian Lens**: a high-fidelity, data-dense environment that feels like a precision instrument. 

By utilizing intentional asymmetry and deep tonal layering, we create a "Command Center" aesthetic. The interface doesn't just display data; it curates it. We break the grid through "Editorial Offsets"—where critical KPIs break the vertical alignment of secondary data—creating a sense of professional urgency and bespoke craftsmanship.

---

## 2. Colors & Surface Architecture

The palette is anchored in an ultra-dark Obsidian (#050505), designed to make high-contrast "Project Health" indicators vibrate with importance.

### The "No-Line" Rule
Explicitly prohibit the use of 1px solid borders for structural sectioning. Boundaries must be defined solely through:
- **Tonal Shifts:** Moving from `surface-container-lowest` (#0E0E0E) to `surface-container` (#201F1F).
- **Luminance Steps:** Using the difference between `surface` (#131313) and `surface-bright` (#3A3939) to denote hierarchy.

### The Glass & Gradient Rule
Standard containers are forbidden. To achieve the "Command Center" feel:
- **Floating Panels:** Use `surface-variant` (#353534) at 40% opacity with a `backdrop-filter: blur(12px)`.
- **Signature Accents:** Apply a subtle linear gradient (Top-Left to Bottom-Right) from `primary` (#75FF9E) to `primary-container` (#00E676) at 10% opacity for hero backgrounds to provide "visual soul."

### Color Roles
- **Primary (Growth/Success):** `#75FF9E` (Primary) & `#00E676` (Container). Use for "On-Track" project status.
- **Secondary (Caution/Warning):** `#FFF3D2` (Secondary) & `#FDD400` (Container). Use for "At-Risk" alerts.
- **Tertiary (Critical):** `#FFDDDC` (Tertiary) & `#FFB6B6` (Container). Reserved for "Failing" metrics.
- **Surface (The Void):** `#131313`. The foundation of the obsidian experience.

---

## 3. Typography: Sora & Space Grotesk

We utilize a dual-scale system to balance technical precision with editorial authority.

*   **Display & Headlines (Space Grotesk):** This typeface provides the "High-Fidelity" edge. Its geometric, slightly technical terminals convey a sense of architectural planning.
    *   *Display-LG (3.5rem):* Reserved for high-level portfolio totals.
    *   *Headline-MD (1.75rem):* For primary section headers.
*   **Body & Labels (Inter/Sora):** Sora is our primary utility font, providing exceptional legibility at high data densities.
    *   *Title-SM (1rem):* Bolded for data labels.
    *   *Label-SM (0.6875rem):* For micro-metadata and status timestamps.

**Hierarchy Note:** Use `on-surface-variant` (#BACBB9) for secondary text to maintain a high-contrast ratio without the vibration of pure white on black.

---

## 4. Elevation & Depth: Tonal Layering

Depth is achieved through the **Layering Principle** rather than structural shadows.

1.  **Level 0 (The Floor):** `surface-container-lowest` (#0E0E0E). Used for the global background.
2.  **Level 1 (The Deck):** `surface` (#131313). Used for main content areas.
3.  **Level 2 (The Console):** `surface-container-high` (#2A2A2A). For interactive cards.
4.  **Ambient Shadows:** For floating modals, use an extra-diffused shadow: `box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5)`.
5.  **The "Ghost Border":** Where accessibility requires a container edge, use `outline-variant` (#3B4A3D) at 20% opacity. This mimics a faint light reflection on a glass edge.

---

## 5. Components

### Buttons & Interaction
- **Primary:** High-contrast `primary` (#75FF9E) background. Sharp 4px corners (`DEFAULT`). No gradients on buttons—only flat, authoritative color.
- **Tertiary (Ghost):** No background, no border. Use `primary-fixed` (#62FF96) text with a subtle underline on hover.

### High-Density Data Cards
- **Construction:** No dividers. Use `spacing-8` (1.75rem) to separate internal data groups.
- **Header:** Use `surface-container-highest` (#353534) for a subtle header strip to distinguish the card title from the body.
- **Glassmorphism:** Apply to global navigation sidebars and top-level filters to keep the "Command Center" feeling integrated.

### Input Fields
- **State:** Active inputs use a `primary` (#75FF9E) 1px bottom-border only. Avoid full-box outlines to keep the interface feeling "unboxed" and editorial.
- **Error:** Utilize `error` (#FFB4AB) text with a `surface-container-highest` background fill for high visibility.

### Strategic Addition: "The Pulse" Indicator
A custom component for this system: A 4px glowing dot using `primary-container` with a CSS pulse animation. Place this next to "Live" consultancy data to signify real-time updates.

---

## 6. Do’s and Don’ts

### Do
- **Do** use strict 8px spacing increments (1.75rem, 2.25rem, etc.) to maintain a mathematical, "engineered" feel.
- **Do** prioritize sharp 4px corners for buttons and 8px for cards. Anything larger is too "consumer."
- **Do** allow content to bleed to the edges of glass containers to emphasize the material effect.

### Don't
- **Don't** use pure white (#FFFFFF) for body text; it causes "haloing" on obsidian backgrounds. Use `on-surface` (#E5E2E1).
- **Don't** use standard 1px borders to separate list items. Use background-color toggles (Zebra striping using `surface-container-low` and `lowest`).
- **Don't** use "Bubbly" or rounded UI elements. If it’s not a sharp angle, it doesn't belong in the Command Center.