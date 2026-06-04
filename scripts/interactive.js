// bespoke-interactive.js
(function () {
    "use strict";

    const engine = window.BespokeEngine;
    if (!engine) return;

    // ========== ADVANCED TILT ==========
    engine.initAdvancedTilt = function() {
        if (this.state.viewport.w <= 480) return;
        document.querySelectorAll("[data-hover-tilt]").forEach((el) => {
            let rAfFrame = null;
            el.addEventListener("mousemove", (e) => {
                if (rAfFrame) cancelAnimationFrame(rAfFrame);
                rAfFrame = requestAnimationFrame(() => {
                    const rect = el.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const px = (x / rect.width) * 2 - 1;
                    const py = (y / rect.height) * 2 - 1;
                    const maxTilt = parseFloat(el.dataset.tiltMax || 15);
                    const rx = -py * maxTilt;
                    const ry = px * maxTilt;
                    el.style.transform = `perspective(1000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;
                    const glare = el.querySelector(".card-glare");
                    if (glare) {
                        glare.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 50%, transparent 80%)`;
                    }
                });
            });
            el.addEventListener("mouseleave", () => {
                if (rAfFrame) cancelAnimationFrame(rAfFrame);
                el.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
                const glare = el.querySelector(".card-glare");
                if (glare) glare.style.background = "none";
            });
        });
    };

    // ========== MAGNETIC CURSOR ==========
    engine.initMagneticCursor = function() {
        const ring = document.getElementById("cursorRing");
        if (!ring) return;
        const interactiveTargets = "a, button, [role='button'], .special, .tactile-chip, .fg-card, .hud-dot";
        document.body.addEventListener("mouseover", (e) => {
            if (e.target.closest(interactiveTargets)) {
                ring.classList.add("cursor-hovered");
            }
        });
        document.body.addEventListener("mouseout", (e) => {
            if (e.target.closest(interactiveTargets)) {
                ring.classList.remove("cursor-hovered");
            }
        });
    };

    // ========== INTERACTIVE PALETTE (Stage 1 & 2) ==========
    engine.initInteractivePalette = function() {
        const configureWorkspace = (chipSelector, displayId) => {
            const chips = document.querySelectorAll(chipSelector);
            const display = document.getElementById(displayId);
            if (!chips.length || !display) return;
            const panel = display.closest(".parallax-stage").querySelector(".panel-text-wrapper");
            chips.forEach((chip) => {
                chip.addEventListener("click", (e) => {
                    e.preventDefault();
                });
                chip.addEventListener("mouseenter", () => {
                    chips.forEach((c) => {
                        c.classList.remove("active");
                        c.setAttribute("aria-selected", "false");
                    });
                    chip.classList.add("active");
                    chip.setAttribute("aria-selected", "true");
                    const targetId = chip.dataset.targetPhil || chip.dataset.targetTex;
                    display.querySelectorAll(".card-inner").forEach((img) => {
                        if (img.id === targetId) {
                            img.style.opacity = "1";
                            img.style.transform = "scale(1.05)";
                            img.setAttribute("aria-hidden", "false");
                        } else {
                            img.style.opacity = "0";
                            img.style.transform = "scale(1)";
                            img.setAttribute("aria-hidden", "true");
                        }
                    });
                    if (panel) {
                        panel.querySelectorAll(".panel-content").forEach((txt) => {
                            if (txt.id === `text-${targetId}`) {
                                txt.classList.add("active");
                                txt.setAttribute("aria-hidden", "false");
                            } else {
                                txt.classList.remove("active");
                                txt.setAttribute("aria-hidden", "true");
                            }
                        });
                    }
                });
            });
        };
        configureWorkspace("[data-target-phil]", "philosophyDisplay");
        configureWorkspace("[data-target-tex]", "materialDisplay");
    };

    // ========== HOTSPOTS & SPOTLIGHT ==========
    engine.initHotspots = function() {
        try {
            const mask = document.getElementById("spotlightMask");
            const section = document.getElementById("spotlight");
            if (mask && section) {
                section.addEventListener("mousemove", (e) => {
                    const rect = section.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    mask.style.background = `radial-gradient(circle at ${x}px ${y}px, transparent 100px, rgba(2,2,3,0.97) 240px)`;
                });
                section.addEventListener("mouseleave", () => {
                    mask.style.background = `radial-gradient(circle at 50% 50%, transparent 80px, rgba(2,2,3,0.95) 220px)`;
                });
            }
            document.body.addEventListener("click", (e) => {
                const dot = e.target.closest(".hotspot-dot");
                if (dot) {
                    e.stopPropagation();
                    const targetCardNum = dot.dataset.hotspot;
                    const card = document.querySelector(`.hotspot-card[data-card="${targetCardNum}"]`);
                    if (!card) return;
                    const isCardActive = card.classList.contains("active");
                    document.querySelectorAll(".hotspot-card.active").forEach((openCard) => {
                        openCard.classList.remove("active");
                        openCard.setAttribute("aria-hidden", "true");
                        const matchingDot = document.querySelector(`.hotspot-dot[data-hotspot="${openCard.dataset.card}"]`);
                        if (matchingDot) matchingDot.setAttribute("aria-expanded", "false");
                    });
                    if (!isCardActive) {
                        card.classList.add("active");
                        card.setAttribute("aria-hidden", "false");
                        dot.setAttribute("aria-expanded", "true");
                        const closeBtn = card.querySelector(".card-close");
                        if (closeBtn) closeBtn.focus();
                    }
                    return;
                }
                const closeButton = e.target.closest(".card-close");
                if (closeButton) {
                    e.stopPropagation();
                    const card = closeButton.closest(".hotspot-card");
                    if (card) {
                        card.classList.remove("active");
                        card.setAttribute("aria-hidden", "true");
                        const matchingDot = document.querySelector(`.hotspot-dot[data-hotspot="${card.dataset.card}"]`);
                        if (matchingDot) {
                            matchingDot.setAttribute("aria-expanded", "false");
                            matchingDot.focus();
                        }
                    }
                    return;
                }
                if (!e.target.closest(".hotspot-card")) {
                    document.querySelectorAll(".hotspot-card.active").forEach((activeCard) => {
                        activeCard.classList.remove("active");
                        activeCard.setAttribute("aria-hidden", "true");
                        const matchingDot = document.querySelector(`.hotspot-dot[data-hotspot="${activeCard.dataset.card}"]`);
                        if (matchingDot) matchingDot.setAttribute("aria-expanded", "false");
                    });
                }
            });
        } catch (err) {
            console.error("BespokeEngine: Hotspots initiation failure.", err);
        }
    };

    // ========== TEAM SLIDER (DRAG & DOTS) ==========
    engine.initTeamSlider = function() {
        try {
            const track = document.getElementById("teamTrack");
            const outer = document.getElementById("teamTrackOuter");
            const prevBtn = document.getElementById("teamPrev");
            const nextBtn = document.getElementById("teamNext");
            const dotsWrap = document.getElementById("teamDots");
            if (!track || !outer) return;
            const cards = track.querySelectorAll(".team-card");
            const CARD_WIDTH = 335;
            const sliderState = this.state.slider;
            const self = this;

            const visibleCount = () => Math.max(1, Math.floor(outer.offsetWidth / CARD_WIDTH));
            const maxIndex = () => Math.max(0, cards.length - visibleCount());

            const buildDots = () => {
                dotsWrap.innerHTML = "";
                const count = maxIndex() + 1;
                for (let i = 0; i < count; i++) {
                    const d = document.createElement("button");
                    d.type = "button";
                    d.className = "slider-dot" + (i === 0 ? " active" : "");
                    d.setAttribute("aria-label", `Navigate to page ${i + 1}`);
                    d.addEventListener("click", () => goTo(i));
                    dotsWrap.appendChild(d);
                }
            };

            const updateDots = () => {
                dotsWrap.querySelectorAll(".slider-dot").forEach((d, i) => {
                    const isActive = i === sliderState.currentIndex;
                    d.classList.toggle("active", isActive);
                    d.setAttribute("aria-selected", isActive ? "true" : "false");
                });
            };

            const setTransform = (x, animated) => {
                track.style.transition = animated ? "transform .6s cubic-bezier(.22,1,.36,1)" : "none";
                track.style.transform = `translate3d(${x}px, 0, 0)`;
            };

            const goTo = (index) => {
                sliderState.currentIndex = Math.max(0, Math.min(index, maxIndex()));
                sliderState.currentTranslate = -sliderState.currentIndex * CARD_WIDTH;
                setTransform(sliderState.currentTranslate, true);
                updateDots();
                cards.forEach((card, idx) => {
                    const isVisible = idx >= sliderState.currentIndex && idx < sliderState.currentIndex + visibleCount();
                    card.setAttribute("aria-hidden", isVisible ? "false" : "true");
                });
            };

            const onDragStart = (clientX) => {
                sliderState.isDragging = true;
                sliderState.startX = clientX;
                sliderState.startTranslate = sliderState.currentTranslate;
                track.style.transition = "none";
                window.addEventListener("mousemove", onDragMove, { passive: true });
                window.addEventListener("mouseup", onDragEnd);
                window.addEventListener("touchmove", onTouchMove, { passive: true });
                window.addEventListener("touchend", onTouchEnd);
            };

            const onDragMove = (e) => {
                if (!sliderState.isDragging) return;
                const dx = e.clientX - sliderState.startX;
                sliderState.currentTranslate = sliderState.startTranslate + dx;
                setTransform(sliderState.currentTranslate, false);
            };

            const onDragEnd = () => {
                if (!sliderState.isDragging) return;
                sliderState.isDragging = false;
                window.removeEventListener("mousemove", onDragMove);
                window.removeEventListener("mouseup", onDragEnd);
                const dx = sliderState.currentTranslate - sliderState.startTranslate;
                if (dx < -60) {
                    goTo(sliderState.currentIndex + 1);
                } else if (dx > 60) {
                    goTo(sliderState.currentIndex - 1);
                } else {
                    goTo(sliderState.currentIndex);
                }
            };

            const onTouchStart = (e) => {
                onDragStart(e.touches[0].clientX);
            };
            const onTouchMove = (e) => {
                if (!sliderState.isDragging) return;
                const dx = e.touches[0].clientX - sliderState.startX;
                sliderState.currentTranslate = sliderState.startTranslate + dx;
                setTransform(sliderState.currentTranslate, false);
            };
            const onTouchEnd = () => {
                if (!sliderState.isDragging) return;
                sliderState.isDragging = false;
                window.removeEventListener("touchmove", onTouchMove);
                window.removeEventListener("touchend", onTouchEnd);
                const dx = sliderState.currentTranslate - sliderState.startTranslate;
                if (dx < -50) {
                    goTo(sliderState.currentIndex + 1);
                } else if (dx > 50) {
                    goTo(sliderState.currentIndex - 1);
                } else {
                    goTo(sliderState.currentIndex);
                }
            };

            outer.addEventListener("mousedown", (e) => {
                if (e.button !== 0) return;
                onDragStart(e.clientX);
            });
            outer.addEventListener("touchstart", onTouchStart, { passive: true });
            prevBtn.addEventListener("click", () => goTo(sliderState.currentIndex - 1));
            nextBtn.addEventListener("click", () => goTo(sliderState.currentIndex + 1));

            buildDots();
            goTo(0);
            window.addEventListener("resize", this.debounce(() => {
                buildDots();
                goTo(Math.min(sliderState.currentIndex, maxIndex()));
            }, 150));
        } catch (err) {
            console.error("BespokeEngine: Slider initiation failure.", err);
        }
    };

    // ========== CONTACT FORM ==========
    engine.initContactForm = function() {
        try {
            const form = document.querySelector("form");
            if (!form) return;
            const self = this;
            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                const btn = form.querySelector(".cf-submit");
                if (!btn) return;
                const originalText = btn.innerHTML;
                btn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="animation: spin 1s linear infinite;" aria-hidden="true">
                        <circle cx="8" cy="8" r="7" stroke="rgba(201,169,110,.3)" stroke-width="2" fill="none" />
                        <path d="M8 1a7 7 0 0 1 7 7" stroke="#c9a96e" stroke-width="2" stroke-linecap="round" fill="none" />
                    </svg>
                    Sending...
                `;
                btn.style.pointerEvents = "none";
                try {
                    const name = self.sanitizeInput(document.getElementById("cf-name")?.value || "");
                    const email = self.sanitizeInput(document.getElementById("cf-email")?.value || "");
                    const budget = self.sanitizeInput(document.getElementById("cf-budget")?.value || "");
                    const timeline = self.sanitizeInput(document.getElementById("cf-timeline")?.value || "");
                    const message = self.sanitizeInput(document.getElementById("cf-message")?.value || "");
                    await new Promise((resolve) => {
                        setTimeout(() => {
                            resolve({ status: 200, message: "OK" });
                        }, 1800);
                    });
                    btn.innerHTML = `
                        <svg viewBox="0 0 14 14" fill="none" width="14" height="14" aria-hidden="true">
                            <path d="M2 7l4 4 6-7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                        Enquiry Sent — We'll be in touch
                    `;
                    btn.style.borderColor = "rgba(201,169,110,.5)";
                    form.reset();
                } catch (submitError) {
                    btn.innerHTML = originalText;
                    btn.style.pointerEvents = "auto";
                    console.error("BespokeEngine: Form transmission failure.", submitError);
                }
            });
        } catch (err) {
            console.error("BespokeEngine: Form setup failure.", err);
        }
    };

    // ========== ANCHOR SCROLLS ==========
    engine.initAnchorScrolls = function() {
        document.body.addEventListener("click", (e) => {
            const anchor = e.target.closest('a[href^="#"]');
            if (!anchor) return;
            let targetHref = anchor.getAttribute("href");
            if (targetHref === "#features") {
                targetHref = "#features, #feactures";
            }
            const targetEl = document.querySelector(targetHref);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: "smooth" });
            }
        });
    };
})();