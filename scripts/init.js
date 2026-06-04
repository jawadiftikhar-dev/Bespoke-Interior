// bespoke-init.js
(function () {
    "use strict";

    const engine = window.BespokeEngine;
    if (!engine) return;

    // ========== MAIN INITIALIZER ==========
    engine.init = function() {
        try {
            this.initTextReveals();
            this.initCharReveals();

            this.cachePositions();
            this.initHorizontalScroll();
            this.initStickyStory();
            this.cachePositions(); // re-cache after dynamic heights

            this.initAdvancedTilt();
            this.initInteractivePalette();
            this.initMagneticCursor();
            this.initHotspots();
            this.initTeamSlider();
            this.initContactForm();
            this.initAnchorScrolls();

            this.initScrollReveals();
            this.initFaqAccordion();

            this.bindGlobalEvents();
            this.onScroll();
            this.wake();
        } catch (err) {
            console.error("BespokeEngine: Structural initialization failure.", err);
        }
    };

    // Instantiate and execute Engine on DOM ready
    document.addEventListener("DOMContentLoaded", () => {
        engine.init();
    });
})();