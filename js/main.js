const styles = getComputedStyle(document.documentElement);
const palette = {
  accent: styles.getPropertyValue("--accent").trim() || "#7c86ff",
  accentStrong: styles.getPropertyValue("--accent-strong").trim() || "#9a7bff",
  accentSoft:
    styles.getPropertyValue("--accent-soft").trim() ||
    "rgba(124, 134, 255, 0.18)",
  primary: styles.getPropertyValue("--primary-text").trim() || "#f5f7ff",
  secondary: styles.getPropertyValue("--secondary-text").trim() || "#b8bbd8",
  surface: styles.getPropertyValue("--surface-card").trim() || "#34345c",
  section: styles.getPropertyValue("--section-bg").trim() || "#1c1b2b",
};

const ctx = document.getElementById("radarChart");

if (ctx) {
  new Chart(ctx, {
    type: "radar",
    data: {
      labels: ["Game Dev", "Web Dev", "AI"],
      datasets: [
        {
          label: "",
          data: [7, 4, 5],
          fill: true,
          backgroundColor: palette.accentSoft,
          borderColor: palette.accentStrong,
          pointBackgroundColor: palette.primary,
          pointBorderColor: palette.accentStrong,
          pointHoverBackgroundColor: palette.accentStrong,
          pointHoverBorderColor: palette.primary,
        },
      ],
    },
    options: {
      scales: {
        r: {
          angleLines: {
            color: "#34345c",
          },
          grid: {
            color: "#34345c",
          },
          pointLabels: {
            color: palette.primary,
            font: {
              size: 14,
            },
          },
          suggestedMin: 0,
          suggestedMax: 10,
          ticks: {
            display: false,
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
}

const languageCharts = [
  { id: "urduChart", value: 90 },
  { id: "englishChart", value: 70 },
];

languageCharts.forEach(({ id, value }) => {
  const canvas = document.getElementById(id);
  if (!canvas) return;

  new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: ["Proficiency", "Remaining"],
      datasets: [
        {
          data: [value, 100 - value],
          backgroundColor: [palette.accentStrong, palette.surface],
          borderWidth: 0,
          hoverBackgroundColor: [palette.accent, palette.section],
          hoverOffset: 6,
        },
      ],
    },
    options: {
      cutout: "68%",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.label}: ${context.parsed}%`,
          },
        },
      },
    },
  });
});

// ------- Audio player integration (append to js/main.js) -------
document.addEventListener("DOMContentLoaded", () => {
  const audioEl = document.getElementById("audioElement"); // <audio>
  const playBtn = document.getElementById("audioPlayBtn"); // fixed player button
  const playerWrap = document.getElementById("fixed-audio-player");

  // music-card UI elements to sync with (if present)
  const cardPlayCheckbox = document.getElementById("playStatus"); // music card play toggle (checkbox)
  const seekInput = document.getElementById("seek"); // slider
  const timeLeft = document.getElementById("timeLeft"); // left time text
  const timeRight = document.getElementById("timeRight"); // right time text

  function formatTime(s) {
    s = Math.max(0, Math.floor(s || 0));
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return m + ":" + (sec < 10 ? "0" + sec : sec);
  }

  // Update UI when metadata is loaded
  audioEl.addEventListener("loadedmetadata", () => {
    if (seekInput) {
      seekInput.max = Math.floor(audioEl.duration);
    }
    if (timeRight)
      timeRight.textContent = formatTime(Math.floor(audioEl.duration));
  });

  // Update progress UI
  audioEl.addEventListener("timeupdate", () => {
    if (seekInput && !seekInput.matches(":active")) {
      // don't hijack while user is dragging
      seekInput.value = Math.floor(audioEl.currentTime);
    }
    if (timeLeft)
      timeLeft.textContent = formatTime(Math.floor(audioEl.currentTime));
  });

  // Play/Pause handlers to update button & wrapper state
  audioEl.addEventListener("play", () => {
    playBtn.textContent = "▮▮"; // pause icon
    playBtn.setAttribute("aria-pressed", "true");
    playerWrap.classList.add("playing");
    if (cardPlayCheckbox) {
      cardPlayCheckbox.checked = true;
      cardPlayCheckbox.dispatchEvent(new Event("change"));
    }
  });

  audioEl.addEventListener("pause", () => {
    playBtn.textContent = "▶"; // play icon
    playBtn.setAttribute("aria-pressed", "false");
    playerWrap.classList.remove("playing");
    if (cardPlayCheckbox) {
      cardPlayCheckbox.checked = false;
      cardPlayCheckbox.dispatchEvent(new Event("change"));
    }
  });

  audioEl.addEventListener("ended", () => {
    // reset UI when track ends
    playBtn.textContent = "▶";
    playBtn.setAttribute("aria-pressed", "false");
    playerWrap.classList.remove("playing");
    if (seekInput) seekInput.value = 0;
    if (timeLeft) timeLeft.textContent = "0:00";
    if (cardPlayCheckbox) {
      cardPlayCheckbox.checked = false;
      cardPlayCheckbox.dispatchEvent(new Event("change"));
    }
  });

  // Play/pause via fixed button
  playBtn.addEventListener("click", () => {
    if (audioEl.paused) {
      audioEl.play().catch((err) => {
        // Autoplay may be blocked; inform dev console only
        console.warn("Audio play blocked:", err);
      });
    } else {
      audioEl.pause();
    }
  });

  // If the music-card's play checkbox is toggled (user clicked that), control audio
  if (cardPlayCheckbox) {
    cardPlayCheckbox.addEventListener("change", (e) => {
      // if audio already playing and checkbox unchecked => pause
      if (e.target.checked) {
        audioEl.play().catch((err) => console.warn("Audio play blocked:", err));
      } else {
        audioEl.pause();
      }
    });
  }

  // Seek slider interaction (user moves the music-card's slider)
  if (seekInput) {
    seekInput.addEventListener("input", (e) => {
      const s = Number(e.target.value || 0);
      if (!isNaN(s)) {
        audioEl.currentTime = s;
        if (timeLeft) timeLeft.textContent = formatTime(Math.floor(s));
      }
    });
  }

  // Optional keyboard shortcut: Space toggles fixed player when focus is not in an input
  document.addEventListener("keydown", (ev) => {
    if (
      ev.code === "Space" &&
      !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
    ) {
      ev.preventDefault();
      if (audioEl.paused) audioEl.play().catch(() => {});
      else audioEl.pause();
    }
  });

  const contactForm = document.querySelector(".contact__form");
  const statusEl = document.querySelector(".contact__status");

  if (contactForm && statusEl) {
    const submitBtn = contactForm.querySelector(".contact__submit");
    const defaultBtnText = submitBtn ? submitBtn.textContent : "Send";
    const statusVariants = [
      "contact__status--pending",
      "contact__status--success",
      "contact__status--error",
    ];

    const setStatus = (message, variant) => {
      statusEl.textContent = message;
      statusEl.hidden = !message;
      statusEl.classList.remove(...statusVariants);
      if (variant) {
        statusEl.classList.add(`contact__status--${variant}`);
      }
    };

    const toggleSubmitting = (isSubmitting) => {
      if (!submitBtn) return;
      submitBtn.disabled = isSubmitting;
      submitBtn.textContent = isSubmitting ? "Sending..." : defaultBtnText;
    };

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      const formData = new FormData(contactForm);
      const payload = {
        name: (formData.get("name") || "").trim(),
        email: (formData.get("email") || "").trim(),
        message: (formData.get("message") || "").trim(),
      };

      if (!payload.name || !payload.email || !payload.message) {
        setStatus("Please fill in all fields before sending.", "error");
        contactForm.reportValidity();
        return;
      }

      try {
        toggleSubmitting(true);
        setStatus("Sending your message...", "pending");

        const response = await fetch("/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok || data.success !== true) {
          const errorMessage =
            data.error || "We couldn't send your message right now.";
          throw new Error(errorMessage);
        }

        setStatus("Thanks! Your message is on its way.", "success");
        contactForm.reset();
      } catch (error) {
        console.error("Contact form submission failed:", error);
        setStatus(
          error.message ||
            "We couldn't send your message. Please try again or email me directly.",
          "error"
        );
      } finally {
        toggleSubmitting(false);
      }
    });
  }
}); // DOMContentLoaded
