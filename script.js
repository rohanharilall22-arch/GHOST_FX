// GHOST_FX - Frontend interactions

document.addEventListener("DOMContentLoaded", () => {
  console.log("GHOST_FX loaded successfully.");

  // Smooth navigation
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      const target = document.querySelector(targetId);

      if (target) {
        event.preventDefault();
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });

  // Demo market cards
  const marketCards = document.querySelectorAll(".market-card");

  marketCards.forEach((card) => {
    card.addEventListener("click", () => {
      marketCards.forEach((item) => {
        item.style.borderColor = "#1d2331";
      });

      card.style.borderColor = "#7c5cff";

      const pair = card.querySelector(".market-name");

      if (pair) {
        console.log("Selected market:", pair.textContent);
      }
    });
  });

  // AI analysis demo button behaviour
  const aiBox = document.querySelector(".ai-box");

  if (aiBox) {
    aiBox.addEventListener("mouseenter", () => {
      aiBox.style.transition = "0.2s";
      aiBox.style.transform = "translateY(-2px)";
    });

    aiBox.addEventListener("mouseleave", () => {
      aiBox.style.transform = "translateY(0)";
    });
  }

  // Current year in footer
  const footer = document.querySelector("footer");

  if (footer) {
    footer.innerHTML = footer.innerHTML.replace(
      "© 2026",
      `© ${new Date().getFullYear()}`
    );
  }
});
