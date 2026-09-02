/**
 * INTELLIGENCE DESIGNED TO EVOLVE — MAIN.JS
 * Vanilla JS logic for stats count-up animations, mobile menu drawer, and video safety.
 */

document.addEventListener("DOMContentLoaded", () => {
  initStatsCountUp();
  initMobileMenu();
  initVideoPlayback();
});

/**
 * 1. Eased Count-Up Statistics Animation
 * Uses easeOutCubic with precise staggered start offsets and durations.
 */
function initStatsCountUp() {
  const statElements = document.querySelectorAll(".stat-item");
  if (!statElements.length) return;

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  let hasAnimated = false;

  const animateStat = (item, index) => {
    const target = parseFloat(item.dataset.target || "0");
    const suffix = item.dataset.suffix || "";
    const decimals = parseInt(item.dataset.decimals || "0", 10);
    const numberSpan = item.querySelector(".stat-number");
    if (!numberSpan) return;

    const duration = 1500 + index * 80;
    const startDelay = 480 + index * 90;

    setTimeout(() => {
      const startTime = performance.now();

      const updateCounter = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeOutCubic(progress);
        const currentValue = easedProgress * target;

        numberSpan.textContent = currentValue.toFixed(decimals);

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          numberSpan.textContent = target.toFixed(decimals);
        }
      };

      requestAnimationFrame(updateCounter);
    }, startDelay);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          statElements.forEach((item, index) => {
            animateStat(item, index);
          });
          observer.disconnect();
        }
      });
    },
    { threshold: 0.25 }
  );

  const footer = document.querySelector(".stats-footer");
  if (footer) {
    observer.observe(footer);
  }
}

/**
 * 2. Mobile Menu & Drawer Interaction
 */
function initMobileMenu() {
  const burgerBtn = document.querySelector(".burger-btn");
  const overlay = document.querySelector(".mobile-overlay");
  const menu = document.querySelector(".mobile-menu");
  const navLinks = document.querySelectorAll(".mobile-nav-link, .mobile-sign-in");

  if (!burgerBtn || !overlay || !menu) return;

  const toggleMenu = (isOpen) => {
    const open = typeof isOpen === "boolean" ? isOpen : !document.body.classList.contains("menu-open");
    burgerBtn.setAttribute("aria-expanded", String(open));
    burgerBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    overlay.setAttribute("aria-hidden", String(!open));
    menu.setAttribute("aria-hidden", String(!open));

    if (open) {
      document.body.classList.add("menu-open");
    } else {
      document.body.classList.remove("menu-open");
    }
  };

  burgerBtn.addEventListener("click", () => toggleMenu());
  overlay.addEventListener("click", () => toggleMenu(false));

  // Close on ESC key
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
      toggleMenu(false);
    }
  });

  // Close on link click
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      toggleMenu(false);
    });
  });

  // Close on viewport resize > 720px
  window.addEventListener("resize", () => {
    if (window.innerWidth > 720 && document.body.classList.contains("menu-open")) {
      toggleMenu(false);
    }
  });
}

/**
 * 3. Video Autoplay Assurance
 */
function initVideoPlayback() {
  const video = document.querySelector(".bg-video");
  if (!video) return;

  const playPromise = video.play();
  if (playPromise !== undefined) {
    playPromise.catch((error) => {
      console.warn("Autoplay was prevented by browser policy:", error);
    });
  }
}
