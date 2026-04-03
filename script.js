const body = document.body;
const root = document.documentElement;
const header = document.getElementById("site-header");
const menuToggle = document.getElementById("menu-toggle");
const primaryNav = document.getElementById("primary-navigation");
const navLinks = Array.from(document.querySelectorAll(".nav-link"));
const menuLinks = Array.from(document.querySelectorAll("#primary-navigation a"));
const revealItems = Array.from(document.querySelectorAll(".reveal"));
const inquiryForm = document.getElementById("inquiry-form");
const formStatus = document.getElementById("form-status");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const getSectionTargets = () =>
  navLinks
    .map((link) => {
      const targetId = link.getAttribute("href");
      return targetId ? document.querySelector(targetId) : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.offsetTop - b.offsetTop);

let trackedSections = getSectionTargets();

const closeMenu = () => {
  if (!primaryNav || !menuToggle) return;
  primaryNav.classList.remove("is-open");
  menuToggle.classList.remove("is-active");
  menuToggle.setAttribute("aria-expanded", "false");
  body.classList.remove("menu-open");
};

const toggleMenu = () => {
  if (!primaryNav || !menuToggle) return;
  const isOpen = primaryNav.classList.toggle("is-open");
  menuToggle.classList.toggle("is-active", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  body.classList.toggle("menu-open", isOpen);
};

if (menuToggle) {
  menuToggle.addEventListener("click", toggleMenu);
}

document.addEventListener("click", (event) => {
  if (!primaryNav || !menuToggle) return;
  const clickedOutsideNav =
    primaryNav.classList.contains("is-open") &&
    !primaryNav.contains(event.target) &&
    !menuToggle.contains(event.target);

  if (clickedOutsideNav) {
    closeMenu();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

menuLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMenu();
  });
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 980) {
    closeMenu();
  }
  trackedSections = getSectionTargets();
});

const updateActiveNavigation = () => {
  if (!trackedSections.length) return;

  const offset = window.scrollY + (header ? header.offsetHeight : 0) + 120;
  let currentSectionId = trackedSections[0].id;

  trackedSections.forEach((section) => {
    if (offset >= section.offsetTop) {
      currentSectionId = section.id;
    }
  });

  navLinks.forEach((link) => {
    const isCurrent = link.getAttribute("href") === `#${currentSectionId}`;
    if (isCurrent) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const updateScrollState = () => {
  const scrollY = window.scrollY;

  if (header) {
    header.classList.toggle("is-condensed", scrollY > 18);
  }

  if (!reduceMotion) {
    const shift = Math.min(scrollY * 0.08, 40);
    root.style.setProperty("--hero-shift", `${shift.toFixed(2)}px`);
  }

  updateActiveNavigation();
};

let isTicking = false;
const onScroll = () => {
  if (isTicking) return;
  isTicking = true;
  window.requestAnimationFrame(() => {
    updateScrollState();
    isTicking = false;
  });
};

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("load", updateScrollState);

if (!reduceMotion && "IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -6% 0px",
    }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

if (inquiryForm && formStatus) {
  inquiryForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!inquiryForm.checkValidity()) {
      inquiryForm.reportValidity();
      return;
    }

    inquiryForm.reset();
    formStatus.textContent = "Thanks. Your inquiry has been noted and the team will reach out soon.";
    formStatus.classList.add("is-success");
  });
}
