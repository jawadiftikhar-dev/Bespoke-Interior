# [Bespoke Interior](https://bespoke-interior.jawadiftikhar.com) — Luxury Residential Spatial Design Theme

Bespoke Interior is a luxury residential spatial design and architectural portfolio theme. Built entirely on a vanilla frontend stack consisting of semantic HTML5, highly structured CSS, and performance-optimized JavaScript, this theme uses browser-native APIs, custom design tokens, and modular components to deliver a modern, interactive sensory experience without importing external runtime libraries or heavy CSS frameworks.

Developed by [Jawad Iftikhar](https://jawadiftikhar.com).

---

## 🚀 Key Features & UX Modules

* **Trailing Interactive Cursor:** A smooth custom cursor ring and dot tracking coordinate movement via linear interpolation (Lerp) inside a high-frequency `requestAnimationFrame` loop.
* **HUD Navigation (Scroll-Spy):** A fixed right-hand navigation array that dynamically tracks active viewport boundaries and highlights coordinates.
* **Parallax Stages & Advanced Hover Tilt:** Interactive parallax layers calculating depth vectors paired with cards that tilt on mouse movement and showcase dynamic specular radial glare reflections.
* **Interactive Material & Concept Workstations:** Tactile choice selectors enabling real-time preview of premium materials (American Walnut, Travertine, Smoked Bronze) with smooth image cross-fading.
* **Sticky Storytelling System:** A split-scroll layout section where a fixed visual frame morphs and cross-fades image assets as textual chapters progress.
* **Horizontal Scroll Gallery:** A viewport-locked horizontal gallery track translating content on the horizontal axis calculated directly from vertical scroll progression.
* **Interactive Blueprint Hotspots:** Clean, blinking pulse coordinates overlaying a layout plan. Interacting reveals descriptive floating detail cards with close actions.
* **Lightweight Count-Up Metrics:** Intersecting metrics that animate numeric targets upward using a smooth, native quadratic ease-out function.
* **Interactive Spotlight Mask:** A radial-gradient spotlight mask tracking cursors over a targeted CTA block to reveal obscured background graphics.
* **Grab-to-Scroll Team Carousel:** A touch-friendly, drag-to-scroll slider tracking touch and mouse drag coordinates with manual fallback navigation controls.

---

## 📂 File & Directory Structure

To extend the single-file setup (`Bespoke Interior.html`) into a production-ready, modular repository, organize the project directory as follows:

```text
Bespoke-Interior/
├── index.html                   # Core single-page layout & semantic HTML5
├── LICENSE                      # Mozilla Public License 2.0 (MPL-2.0)
├── README.md                    # Project documentation & setup guide
├── assets/                      # Static assets and media files
│   └── images/                  # Performance-optimized portfolio imagery (WebP/SVG)
├── styles/                      # CSS stylesheets folder
│   ├── design-system.css        # Core palette , Typography & Spacing systems
│   ├── global.css               # Globals & Resets
│   ├── main.css                 # Core styling
│   ├── assessibility.css        # Assessibility & User preferences
│   ├── reveals.css              # Curtain reveals
│   └── responsive.css           # Responsive Styling
└── scripts/                     # Vanilla JS modular scripts
    ├── core.js                  # Core Object with state, config, animation loop, event handlers, caching, and helpers
    ├── init.js                  # Main Initilizer
    ├── interactive.js           # Web Interactions
    └── reveals.js               # Reveal animations & Affects

🛠️ Codebase Architecture

1. HTML Structure & Metadata Integrity

The document is authored with semantic HTML5 tags and accessibility attributes:

  - SEO Metadata & Open Graph Integration: Programmed with descriptive targets,
    canonical parameters, open graph variables, and performance-oriented
    preconnection hints.
  - Structured JSON-LD Schema: Embeds multiple structured JSON-LD schemas
    representing a ProfessionalService and an active FAQ outline to supply
    crawlable context to search indexers.
  - Accessible Summary Indicators: Uses native <details> and <summary> elements
    to create accessible and semantic FAQ disclosure panels.

2. Native CSS Tokenization & Specificity

Unlike common frameworks, this theme uses a native CSS layout system built with
distinct, structured code layers:

  - Design Token Configuration: Centrally managed variables inside the :root
    pseudo-class control spacing, color values, typography variables, box-shadow
    depth scales, and bezier curves.
  - Fluid Spacing Mechanics: Section padding, typographic headings, and gaps use
    native CSS clamp() functions to scale fluidly with viewport widths:
    --section-y: clamp(48px, 8vw, 112px);
    --section-x: clamp(20px, 6vw, 86px);
  - Bento Grid Architecture: Implements modern CSS grid layouts for features and
    project lists, using auto-fit controls to adjust columns without layout
    breaks on smaller screens.

3. JavaScript Execution Engine

Scripts are isolated in a self-executing modular structure (IIFE) that uses
centralized state management and dynamic element caching to prevent layout
thrashing:

(function () {
    "use strict";

    const BespokeEngine = {
        state: {
            scrollY: { target: window.scrollY, current: window.scrollY },
            mouse: { targetX: 0, targetY: 0, currentX: 0, currentY: 0 },
            ringPos: { x: 0, y: 0, targetX: 0, targetY: 0 },
            // ...
        }
    };
})();

Element Coordinate Caching

To minimize heavy DOM reads during scroll and pointer movements, the engine
pre-calculates and caches coordinate offsets inside a structural state tree:

cachePositions() {
    this.state.cachedPositions.stages = Array.from(document.querySelectorAll(".parallax-stage")).map((el) => {
        // Pre-calculates absolute coordinates & stores them to prevent layout thrashing
    });
}

Spring Dynamics & WAAPI Animations

  - Custom cursor tracking uses linear interpolation (Lerp) to smoothly match
    pointer coordinates at a stable frame rate.
  - Floating images and spot lights translate using hardware-accelerated CSS
    compositor layers via WAAPI, keeping transitions smooth under heavy mouse
    tracking:
    cursorLight.animate(
        [{ transform: `translate3d(${e.clientX - 210}px, ${e.clientY - 210}px, 0)` }],
        { duration: 650, fill: "forwards", easing: "cubic-bezier(.2, .8, .2, 1)" }
    );

💻 Getting Started & Local Setup

Quick Start

1.  Clone the repository to your local drive:
    git clone https://github.com/jawadiftikhar-dev/Bespoke-Interior.git
    cd Bespoke-Interior
2.  Rename the main template file to index.html if you want to deploy it as a
    single-file template:
    mv "Bespoke Interior.html" index.html
3.  Run the project locally using a basic HTTP server. For example, using
    Python's built-in module:
    python -m http.server 8000
4.  Open your web browser and navigate to: http://localhost:8000

🎨 Customization Guide

Designing Custom Color Palettes

To modify the theme's branding and color variables, edit the primary design
tokens inside your CSS variables:

:root {
    /* Base Color Tokens */
    --bg: #040406;                  /* Primary background color */
    --text: #f0efe8;                /* Primary text color */
    --accent: #c9a96e;              /* Core brand accent (Gold) */
    --accent-rgb: 201, 169, 110;    /* RGB format for transparent overlays */
}

Adding New Project Slides

To add custom slides to the Team carousel or Horizontal Scroll track, duplicate
the respective card templates (.team-card or .hs-card) and include WebP images
with semantic alt attributes. The engine will automatically recalculate track
widths on load.

♿ Accessibility & Performance Details

Accessibility Standards

  - Forced Contrast Adjustments: Supports operating system level high-contrast
    configurations (prefers-contrast: more), ensuring active text and borders
    remain legible.
  - Reduced Motion Compatibility: An embedded prefers-reduced-motion media block
    disables coordinate offsets, parallax scaling, custom cursors, and progress
    tracking for users sensitive to motion.
  - Keyboard Navigation: Includes keydown listeners (Enter, Space) on custom
    controls, uses correct aria-expanded and aria-hidden attributes, and retains
    native focus rings on focus-visible elements.

Performance Optimizations

  - Scroll Performance: Viewport and scroll event listeners are bound as {
    passive: true } to avoid lag during active navigation.
  - Input Sanitization: Uses a secure string escaping wrapper on contact inputs
    before executing the fake-submission Promise.

