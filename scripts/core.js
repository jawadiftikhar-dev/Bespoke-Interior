// bespoke-core.js
(function () {
    "use strict";

    // Create the global BespokeEngine object if it doesn't exist
    window.BespokeEngine = window.BespokeEngine || {};

    // Core Object with state, config, animation loop, event handlers, caching, and helpers
    const core = {
        // 1. Centralized State Management
        state: {
            scrollY: { target: window.scrollY, current: window.scrollY },
            mouse: { targetX: 0, targetY: 0, currentX: 0, currentY: 0 },
            ringPos: { x: 0, y: 0, targetX: 0, targetY: 0 },
            dotPos: { x: 0, y: 0 },
            viewport: { h: window.innerHeight, w: window.innerWidth },
            isLoopRunning: false,
            statsCounted: false,
            slider: {
                currentIndex: 0,
                isDragging: false,
                startX: 0,
                startTranslate: 0,
                currentTranslate: 0
            },
            cachedPositions: {
                sections: [],
                stages: [],
                textReveals: [],
                charReveals: [],
                stickyStory: null,
                horizontalScroll: null,
                statsBar: null
            }
        },

        // Constants and Configurations
        config: {
            scrollLerp: 0.075,
            mouseLerp: 0.055,
            accentWords: ["thoughtful", "space", "meaning", "silence", "walls", "light", "sanctuary", "soul", "comfort", "harmony"]
        },

        // Helper: Traverses offsetParents to find absolute document coordinate top
        getAbsoluteTop(el) {
            let top = 0;
            while (el) {
                top += el.offsetTop;
                el = el.offsetParent;
            }
            return top;
        },

        // Helper: Sanitize input
        sanitizeInput(val) {
            const temp = document.createElement("div");
            temp.textContent = val;
            return temp.innerHTML;
        },

        // Helper: Debounce
        debounce(fn, delay) {
            let timer = null;
            return function (...args) {
                clearTimeout(timer);
                timer = setTimeout(() => fn.apply(this, args), delay);
            };
        },

        // 3. High-Performance Position Cache Tree - Prevents Layout Thrashing
        cachePositions() {
            try {
                const state = this.state;

                state.cachedPositions.sections = Array.from(document.querySelectorAll(
                    "#intro, #about, #services, #showcase, #hotspot, #stage7, #offer, #features, #feactures, #team, #testimonials, #faq, #pricing, #contact, #spotlight"
                )).map(el => ({
                    id: el.id,
                    top: this.getAbsoluteTop(el),
                    height: el.offsetHeight
                }));

                state.cachedPositions.stages = Array.from(document.querySelectorAll(".parallax-stage")).map((el) => {
                    const layers = Array.from(el.querySelectorAll(".parallax-layer")).map((layerEl) => ({
                        el: layerEl,
                        z: parseFloat(layerEl.dataset.z || 0),
                        speed: parseFloat(layerEl.dataset.speed || 1),
                        tilt: parseFloat(layerEl.dataset.tilt || 35),
                        rot: parseFloat(layerEl.dataset.rot || 6),
                    }));
                    return {
                        el,
                        layers,
                        top: this.getAbsoluteTop(el),
                        height: el.offsetHeight,
                        currentProgress: 0
                    };
                });

                state.cachedPositions.textReveals = Array.from(document.querySelectorAll("[data-reveal-text]")).map((heading) => {
                    const section = heading.closest(".text-reveal-section");
                    return {
                        heading,
                        section,
                        wordEls: Array.from(heading.querySelectorAll(".word")),
                        top: section ? this.getAbsoluteTop(section) : 0,
                        height: section ? section.offsetHeight : 0
                    };
                });

                state.cachedPositions.charReveals = Array.from(document.querySelectorAll("[data-char-reveal]")).map((line) => {
                    const section = line.closest(".char-reveal-section");
                    return {
                        line,
                        section,
                        chars: Array.from(line.querySelectorAll(".char")),
                        top: section ? this.getAbsoluteTop(section) : 0,
                        height: section ? section.offsetHeight : 0
                    };
                });

                const stickyStoryEl = document.getElementById("sticky-story");
                if (stickyStoryEl) {
                    state.cachedPositions.stickyStory = {
                        el: stickyStoryEl,
                        chapters: Array.from(stickyStoryEl.querySelectorAll(".story-chapter")).map((ch) => ({
                            el: ch,
                            top: ch.offsetTop,
                            height: ch.offsetHeight
                        })),
                        scenes: Array.from(stickyStoryEl.querySelectorAll(".visual-scene")),
                        top: this.getAbsoluteTop(stickyStoryEl),
                        height: stickyStoryEl.offsetHeight
                    };
                }

                const hsSection = document.getElementById("h-scroll");
                const hsTrack = document.getElementById("hsTrack");
                if (hsSection && hsTrack) {
                    state.cachedPositions.horizontalScroll = {
                        el: hsSection,
                        track: hsTrack,
                        trackWidth: hsTrack.scrollWidth,
                        scrollHeight: hsSection.offsetHeight,
                        top: this.getAbsoluteTop(hsSection)
                    };
                }

                const statsBar = document.getElementById("statsBar");
                if (statsBar) {
                    state.cachedPositions.statsBar = {
                        el: statsBar,
                        cells: Array.from(statsBar.querySelectorAll(".stat-cell")),
                        top: this.getAbsoluteTop(statsBar)
                    };
                }
            } catch (err) {
                console.error("BespokeEngine: Metrics caching error.", err);
            }
        },

        onScroll() {
            this.state.scrollY.target = window.scrollY;
            const progressBar = document.getElementById("scrollProgress");
            if (progressBar) {
                const docH = document.documentElement.scrollHeight - this.state.viewport.h;
                if (docH > 0) {
                    progressBar.style.width = ((this.state.scrollY.target / docH) * 100).toFixed(3) + "%";
                }
            }
            this.wake();
        },

        onResize() {
            this.state.viewport.h = window.innerHeight;
            this.state.viewport.w = window.innerWidth;
            this.cachePositions();
            // These will be called via the init method from other files, but we keep the methods here.
            if (this.initHorizontalScroll) this.initHorizontalScroll();
            this.onScroll();
        },

        onMouseMove(e) {
            this.state.mouse.targetX = (e.clientX / this.state.viewport.w) * 2 - 1;
            this.state.mouse.targetY = (e.clientY / this.state.viewport.h) * 2 - 1;
            this.state.ringPos.targetX = e.clientX;
            this.state.ringPos.targetY = e.clientY;
            this.state.dotPos.x = e.clientX;
            this.state.dotPos.y = e.clientY;
            this.wake();
        },

        wake() {
            if (!this.state.isLoopRunning) {
                this.state.isLoopRunning = true;
                requestAnimationFrame(() => this.tick());
            }
        },

        // High-Frequency Kinetic Rendering Loop
        tick() {
            let needsRender = false;

            const scrollDelta = this.state.scrollY.target - this.state.scrollY.current;
            if (Math.abs(scrollDelta) > 0.05) {
                this.state.scrollY.current += scrollDelta * this.config.scrollLerp;
                needsRender = true;
            } else if (this.state.scrollY.current !== this.state.scrollY.target) {
                this.state.scrollY.current = this.state.scrollY.target;
            }

            const mDx = this.state.mouse.targetX - this.state.mouse.currentX;
            const mDy = this.state.mouse.targetY - this.state.mouse.currentY;
            if (Math.abs(mDx) > 0.0005 || Math.abs(mDy) > 0.0005) {
                this.state.mouse.currentX += mDx * this.config.mouseLerp;
                this.state.mouse.currentY += mDy * this.config.mouseLerp;
                needsRender = true;
            }

            const ringDx = this.state.ringPos.targetX - this.state.ringPos.x;
            const ringDy = this.state.ringPos.targetY - this.state.ringPos.y;
            if (Math.abs(ringDx) > 0.1 || Math.abs(ringDy) > 0.1) {
                this.state.ringPos.x += ringDx * 0.15;
                this.state.ringPos.y += ringDy * 0.15;
                needsRender = true;
            }

            const ringEl = document.getElementById("cursorRing");
            const dotEl = document.getElementById("cursorDot");
            if (ringEl && dotEl && this.state.viewport.w > 480) {
                ringEl.style.left = this.state.ringPos.x + "px";
                ringEl.style.top = this.state.ringPos.y + "px";
                dotEl.style.left = this.state.dotPos.x + "px";
                dotEl.style.top = this.state.dotPos.y + "px";
            }

            const vTop = this.state.scrollY.current;
            const vBottom = vTop + this.state.viewport.h;

            this.state.cachedPositions.stages.forEach((stage) => {
                const isVisible = stage.top < vBottom && stage.top + stage.height > vTop;
                if (!isVisible) return;

                const totalDist = stage.height + this.state.viewport.h;
                const traveled = vBottom - stage.top;
                stage.currentProgress = Math.max(0, Math.min(1, traveled / totalDist));

                stage.layers.forEach((layer) => {
                    const travelRange = layer.speed * this.state.viewport.h * 0.5;
                    const translateY = (0.5 - stage.currentProgress) * travelRange;
                    const mouseX = this.state.mouse.currentX * layer.tilt;
                    const mouseY = this.state.mouse.currentY * layer.tilt * -1;
                    const rotX = this.state.mouse.currentY * layer.rot * -1;
                    const rotY = this.state.mouse.currentX * layer.rot;

                    layer.el.style.transform = `translate3d(${mouseX.toFixed(2)}px, ${(translateY + mouseY).toFixed(2)}px, ${layer.z}px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`;
                });
                needsRender = true;
            });

            // These methods will be added by other files
            if (this.updateTextReveals) this.updateTextReveals();
            if (this.updateCharReveals) this.updateCharReveals();
            if (this.updateStickyStory) this.updateStickyStory();
            if (this.updateHorizontalScroll) this.updateHorizontalScroll();
            if (this.updateStats) this.updateStats();
            if (this.updateFloatingCards) this.updateFloatingCards();
            if (this.updateActiveHud) this.updateActiveHud();

            if (needsRender) {
                requestAnimationFrame(() => this.tick());
            } else {
                this.state.isLoopRunning = false;
            }
        },

        bindGlobalEvents() {
            window.addEventListener("scroll", () => this.onScroll(), { passive: true });
            window.addEventListener("resize", this.debounce(() => this.onResize(), 150));
            window.addEventListener("mousemove", (e) => this.onMouseMove(e), { passive: true });
        }
    };

    // Merge core into the global BespokeEngine
    Object.assign(window.BespokeEngine, core);
})();
