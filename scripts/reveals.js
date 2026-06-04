// bespoke-reveals.js
(function () {
    "use strict";

    const engine = window.BespokeEngine;
    if (!engine) return;

    // ========== SCROLL REVEALS ==========
    engine.initScrollReveals = function() {
        try {
            const revealConfig = {
                threshold: 0.12,
                rootMargin: "0px 0px -60px 0px",
            };
            const io = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const el = entry.target;
                    const delay = parseInt(el.dataset.delay || 0);
                    setTimeout(() => el.classList.add("revealed"), delay);
                    io.unobserve(el);
                });
            }, revealConfig);

            const targets = ".banner-overline, .banner-title, .banner-sub, .team-card, .testi-card, .faq-item, .pricing-card, #contactInfo, #contactForm, .anim-fade-up";
            document.querySelectorAll(targets).forEach((el, idx) => {
                if (el.classList.contains("testi-card") && !el.dataset.delay) {
                    el.dataset.delay = String(idx * 80);
                }
                if (el.classList.contains("faq-item") && !el.dataset.delay) {
                    el.dataset.delay = String(idx * 60);
                }
                io.observe(el);
            });
        } catch (err) {
            console.error("BespokeEngine: Visual reveal initialization error.", err);
        }
    };

    // ========== FAQ ACCORDION ==========
    engine.initFaqAccordion = function() {
        try {
            document.body.addEventListener("click", (e) => {
                const btn = e.target.closest(".faq-question");
                if (!btn) return;
                const item = btn.closest(".faq-item");
                if (!item) return;
                const isDetails = item.tagName.toLowerCase() === "details";
                const isOpen = isDetails ? item.hasAttribute("open") : item.classList.contains("open");

                document.querySelectorAll(".faq-item").forEach((el) => {
                    if (el !== item) {
                        el.classList.remove("open");
                        if (el.tagName.toLowerCase() === "details") {
                            el.removeAttribute("open");
                        }
                    }
                });

                if (isDetails) {
                    requestAnimationFrame(() => {
                        const nowOpen = item.hasAttribute("open");
                        item.classList.toggle("open", nowOpen);
                    });
                } else {
                    e.preventDefault();
                    item.classList.toggle("open", !isOpen);
                }
            });
        } catch (err) {
            console.error("BespokeEngine: Accordion toggler initialization error.", err);
        }
    };

    // ========== WORD SPLITTING ENGINE ==========
    engine.initTextReveals = function() {
        document.querySelectorAll("[data-reveal-text]").forEach((heading) => {
            const text = heading.textContent.trim();
            heading.innerHTML = "";
            const words = text.split(/\s+/);
            words.forEach((w) => {
                const span = document.createElement("span");
                span.className = "word";
                if (this.config.accentWords.includes(w.toLowerCase().replace(/[^a-z]/g, ""))) {
                    span.classList.add("accent-word");
                }
                span.textContent = w + " ";
                heading.appendChild(span);
            });
        });
    };

    engine.updateTextReveals = function() {
        const reveals = this.state.cachedPositions.textReveals;
        const viewCenter = this.state.viewport.h * 0.5;
        const currentScroll = this.state.scrollY.current;

        reveals.forEach(({ section, wordEls, top, height }) => {
            if (!section) return;
            const sectionStart = top - currentScroll;
            const rawProgress = (viewCenter - sectionStart) / height;
            const progress = Math.max(0, Math.min(1, rawProgress));
            const totalWords = wordEls.length;
            const revealedCount = Math.floor(progress * totalWords * 1.3);
            wordEls.forEach((w, i) => {
                if (i < revealedCount) {
                    w.classList.add("revealed");
                } else {
                    w.classList.remove("revealed");
                }
            });
            if (revealedCount >= totalWords) {
                section.classList.add("fully-revealed");
            } else {
                section.classList.remove("fully-revealed");
            }
        });
    };

    // ========== CHARACTER SPLITTING ENGINE ==========
    engine.initCharReveals = function() {
        document.querySelectorAll("[data-char-reveal]").forEach((line) => {
            const text = line.textContent;
            line.innerHTML = "";
            for (let i = 0; i < text.length; i++) {
                const span = document.createElement("span");
                if (text[i] === " ") {
                    span.className = "char space";
                    span.innerHTML = "&nbsp;";
                } else {
                    span.className = "char";
                    span.textContent = text[i];
                }
                line.appendChild(span);
            }
        });
    };

    engine.updateCharReveals = function() {
        const reveals = this.state.cachedPositions.charReveals;
        const viewH = this.state.viewport.h;
        const currentScroll = this.state.scrollY.current;

        reveals.forEach(({ section, chars, top, height }) => {
            if (!section) return;
            const sectionStart = top - currentScroll;
            const progress = Math.max(0, Math.min(1, (viewH * 0.65 - sectionStart) / (height * 0.6)));
            const revealCount = Math.floor(progress * chars.length * 1.2);
            chars.forEach((c, i) => {
                if (i < revealCount) {
                    c.classList.add("revealed");
                    c.style.transitionDelay = (i * 0.025).toFixed(3) + "s";
                } else {
                    c.classList.remove("revealed");
                }
            });
            if (progress > 0.1) {
                section.classList.add("active");
            } else {
                section.classList.remove("active");
            }
        });
    };

    // ========== STICKY STORY ==========
    engine.initStickyStory = function() { /* evaluated dynamically via state positions */ };

    engine.updateStickyStory = function() {
        const story = this.state.cachedPositions.stickyStory;
        if (!story) return;
        const currentScroll = this.state.scrollY.current;
        const viewH = this.state.viewport.h;

        story.chapters.forEach((chapter, i) => {
            const rectTop = (story.top + chapter.top) - currentScroll;
            const center = rectTop + chapter.height / 2;
            if (center < viewH * 0.65 && center > viewH * 0.1) {
                story.scenes.forEach((s) => s.classList.remove("active"));
                if (story.scenes[i]) {
                    story.scenes[i].classList.add("active");
                }
            }
        });
    };

    // ========== HORIZONTAL SCROLL ==========
    engine.initHorizontalScroll = function() {
        const hsSection = document.getElementById("h-scroll");
        const hsTrack = document.getElementById("hsTrack");
        if (!hsSection || !hsTrack) return;
        if (this.state.viewport.w <= 280) {
            hsSection.style.height = "auto";
            hsTrack.style.transform = "none";
            return;
        }
        const trackWidth = hsTrack.scrollWidth;
        const extraScroll = trackWidth - this.state.viewport.w + 200;
        const scrollHeight = this.state.viewport.h + extraScroll;
        hsSection.style.height = scrollHeight + "px";
        if (this.state.cachedPositions.horizontalScroll) {
            this.state.cachedPositions.horizontalScroll.trackWidth = trackWidth;
            this.state.cachedPositions.horizontalScroll.scrollHeight = scrollHeight;
        }
    };

    engine.updateHorizontalScroll = function() {
        const hs = this.state.cachedPositions.horizontalScroll;
        if (!hs || this.state.viewport.w <= 280) return;
        const currentScroll = this.state.scrollY.current;
        const rectTop = hs.top - currentScroll;
        const progress = Math.max(0, Math.min(1, -rectTop / (hs.scrollHeight - this.state.viewport.h)));
        const maxTranslate = hs.trackWidth - this.state.viewport.w + 100;
        hs.track.style.transform = `translate3d(${-progress * maxTranslate}px, 0, 0)`;
    };

    // ========== STATS COUNTER ==========
    engine.updateStats = function() {
        const stats = this.state.cachedPositions.statsBar;
        if (!stats || this.state.statsCounted) return;
        const currentScroll = this.state.scrollY.current;
        const rectTop = stats.top - currentScroll;
        if (rectTop < this.state.viewport.h * 0.8) {
            this.state.statsCounted = true;
            stats.cells.forEach((cell) => {
                cell.classList.add("counted");
                const numEl = cell.querySelector(".stat-num");
                if (numEl) {
                    const targetValue = parseInt(numEl.dataset.count || 0);
                    this.animateCount(numEl, targetValue, 2200);
                }
            });
        }
    };

    engine.animateCount = function(el, target, duration) {
        const start = performance.now();
        const step = (now) => {
            const elapsed = now - start;
            const p = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.floor(ease * target);
            if (p < 1) {
                requestAnimationFrame(step);
            } else {
                el.textContent = target;
            }
        };
        requestAnimationFrame(step);
    };

    // ========== FLOATING CARDS ==========
    engine.updateFloatingCards = function() {
        document.querySelectorAll(".bento-card:not(.revealed)").forEach((card) => {
            const rect = card.getBoundingClientRect();
            if (rect.top < this.state.viewport.h * 0.85) {
                const delay = parseInt(card.dataset.delay || 0);
                setTimeout(() => card.classList.add("revealed"), delay);
            }
        });
    };

    // ========== ACTIVE HUD ==========
    engine.updateActiveHud = function() {
        if (this.state.viewport.w <= 480) return;
        const currentScroll = this.state.scrollY.current;
        const viewH = this.state.viewport.h;
        const mappings = [
            { id: "#about", targets: ["about", "stage1", "stage2", "text-reveal-1"] },
            { id: "#services", targets: ["services"] },
            { id: "#showcase", targets: ["showcase", "statsBar"] },
            { id: "#hotspot", targets: ["hotspot", "statsBar"] },
            { id: "#stage7", targets: ["stage7"] },
            { id: "#offer", targets: ["offer", "parallax-reveal"] },
            { id: "#features", targets: ["features", "feactures"] },
            { id: "#team", targets: ["team"] },
            { id: "#testimonials", targets: ["testimonials"] },
            { id: "#faq", targets: ["faq"] },
            { id: "#pricing", targets: ["pricing"] },
            { id: "#contact", targets: ["contact"] },
            { id: "#spotlight", targets: ["spotlight"] }
        ];
        let activeDot = null;
        for (let i = 0; i < mappings.length; i++) {
            const map = mappings[i];
            const isAnyActive = map.targets.some((targetId) => {
                const sec = this.state.cachedPositions.sections.find(s => s.id === targetId);
                if (sec) {
                    const top = sec.top;
                    const bottom = top + sec.height;
                    return currentScroll >= top - viewH * 0.5 && currentScroll < bottom - viewH * 0.5;
                }
                return false;
            });
            if (isAnyActive) {
                activeDot = map.id;
                break;
            }
        }
        const hudDots = document.querySelectorAll(".hud-dot");
        hudDots.forEach((dot) => {
            if (dot.getAttribute("href") === activeDot) {
                dot.classList.add("active");
                dot.setAttribute("aria-current", "page");
            } else {
                dot.classList.remove("active");
                dot.removeAttribute("aria-current");
            }
        });
    };
})();