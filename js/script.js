// Lógica de Cursor Morado-Lila
(function () {
  const cursor = document.querySelector(".custom-cursor");
  if (!cursor) return;

  document.addEventListener("mousemove", (e) => {
    // Movimiento fluido por coordenadas
    cursor.style.left = e.clientX + "px";
    cursor.style.top = e.clientY + "px";
  });

  // Lista de elementos que activan el crecimiento del cursor
  const hoverables = document.querySelectorAll("a, button, .btn-primary, .btn-ghost, input, textarea, .testimonial-card, .stack-icon, .brand-logo img, .filter-btn");

  hoverables.forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
  });
})();

    // Efecto scroll en el nav
    (function () {
      const shell = document.querySelector(".nav-shell");
      if (!shell) return;

      const updateGradient = () => {
        const y = window.scrollY || window.pageYOffset || 0;
        const offset = y * 0.08;
        shell.style.backgroundPosition = `0px ${-offset}px`;
      };

      updateGradient();
      window.addEventListener("scroll", updateGradient);
    })();

    // Copiar email con tecla C + toast
    (function () {
      const email = "taniadeazevedoribeiro@gmail.com";
      const toast = document.getElementById("copyToast");
      let toastTimeout = null;

      const showToast = () => {
        if (!toast) return;
        toast.classList.add("is-visible");
        if (toastTimeout) clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => toast.classList.remove("is-visible"), 2200);
      };

      document.addEventListener("keydown", (e) => {
        const target = e.target;
        const typing = target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
        if (!typing && e.key.toLowerCase() === "c" && !e.metaKey && !e.ctrlKey && !e.altKey) {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(email).then(showToast).catch(showToast);
          } else {
            showToast();
          }
        }
      });
    })();

    // Carrusel de testimonios
    (function () {
      const carousel = document.querySelector(".testimonials-carousel");
      const cards = document.querySelectorAll(".testimonial-card");
      if (!carousel || !cards.length) return;

      const activate = (card) => {
        cards.forEach((c) => c.classList.remove("is-active"));
        card.classList.add("is-active");
        const left = card.offsetLeft - (carousel.clientWidth - card.clientWidth) / 2;
        carousel.scrollTo({ left, behavior: "smooth" });
      };

      cards.forEach((card) => {
        card.addEventListener("click", () => activate(card));
        card.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            activate(card);
          }
        });
        card.setAttribute("tabindex", "0");
      });
    })();

    // Filtros de proyectos: por defecto se ve la mezcla (diseño gráfico y web); al pulsar un botón se filtra y al volver a pulsarlo se vuelve a la mezcla
    (function () {
      const buttons = document.querySelectorAll(".filter-btn");
      const cards = document.querySelectorAll(".work-card");
      const grid = document.querySelector(".work-grid");
      if (!buttons.length || !cards.length || !grid) return;

      // Iguala la altura de los títulos y de las descripciones visibles para que todas las tarjetas tengan las mismas líneas y todo quede alineado
      const equalizeDescriptions = () => {
        ["work-title", "work-desc"].forEach((cls) => {
          const els = [...cards].filter((c) => c.style.display !== "none").map((c) => c.querySelector("." + cls)).filter(Boolean);
          els.forEach((el) => { el.style.minHeight = ""; });
          const tallest = Math.max(0, ...els.map((el) => el.getBoundingClientRect().height));
          if (tallest) els.forEach((el) => { el.style.minHeight = tallest + "px"; });
        });
      };

      // type = "graphic" | "digital" | null (null = todos, en el orden en que están en el HTML)
      const applyFilter = (type) => {
        cards.forEach((card) => {
          const matches = !type || card.dataset.type === type;
          card.style.display = matches ? "flex" : "none";
        });
        equalizeDescriptions();
        // al cambiar de filtro vuelve al inicio del carrusel
        grid.scrollTo({ left: 0, behavior: "smooth" });
      };

      applyFilter(null);
      window.addEventListener("resize", equalizeDescriptions);
      window.addEventListener("load", equalizeDescriptions);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(equalizeDescriptions);

      buttons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const wasActive = btn.classList.contains("is-active");
          buttons.forEach((b) => b.classList.remove("is-active"));
          if (wasActive) {
            applyFilter(null);
          } else {
            btn.classList.add("is-active");
            applyFilter(btn.dataset.filter);
          }
        });
      });
    })();

    // Modal easter egg (ojos)
    (function () {
      const btn = document.getElementById("egEyesBtn");
      const modal = document.getElementById("egModal");
      const closeBtn = document.getElementById("egClose");
      if (!btn || !modal || !closeBtn) return;

      const open = () => {
        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      };

      const close = () => {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
      };

      btn.addEventListener("click", open);
      closeBtn.addEventListener("click", close);

      modal.addEventListener("click", (e) => {
        if (e.target === modal) close();
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal.classList.contains("is-open")) close();
      });
    })();

    // Formulario de contacto con FormSubmit (AJAX)
    (function () {
      const form = document.getElementById("contactForm");
      if (!form) return;

      const statusEl = document.getElementById("contactStatus");
      const submitBtn = form.querySelector(".contact-submit");

      form.addEventListener("submit", function (e) {
        e.preventDefault();

        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Enviando...";

        if (statusEl) statusEl.textContent = "";

        const formData = new FormData(form);

        fetch("https://formsubmit.co/ajax/taniadeazevedoribeiro@gmail.com", {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        })
          .then((response) => {
            if (!response.ok) throw new Error("Network response was not ok");
            return response.json();
          })
          .then(() => {
            form.reset();
            if (statusEl) statusEl.textContent = "Tu mensaje ya está en mi radar. Te escribo pronto. ✦";
          })
          .catch(() => {
            if (statusEl) statusEl.textContent = "Ha habido un error. Puedes escribirme directamente a taniadeazevedoribeiro@gmail.com";
          })
          .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
          });
      });
    })();
