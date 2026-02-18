(() => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Mobile menu (hamburger)
  const burger = document.querySelector("[data-burger]");
  const mobile = document.querySelector("[data-mobile]");
  const closeBtn = document.querySelector("[data-close]");
  const backdrop = document.querySelector("[data-backdrop]");

  function setMobile(open) {
    if (!mobile || !burger) return;
    mobile.hidden = !open;
    burger.setAttribute("aria-expanded", String(open));
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (open) {
      // Focus first link
      const firstLink = mobile.querySelector("a");
      setTimeout(() => firstLink && firstLink.focus(), 0);
    } else {
      burger.focus();
    }
  }

  function toggleMobile() {
    const isOpen = burger.getAttribute("aria-expanded") === "true";
    setMobile(!isOpen);
  }

  if (burger && mobile) {
    burger.addEventListener("click", toggleMobile);
    closeBtn && closeBtn.addEventListener("click", () => setMobile(false));
    backdrop && backdrop.addEventListener("click", () => setMobile(false));

    // Close when clicking a link
    mobile.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (a) setMobile(false);
    });

    // Escape closes
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMobile(false);
    });

    // Close on resize to desktop
    window.addEventListener("resize", () => {
      if (window.matchMedia("(min-width: 1024px)").matches) setMobile(false);
    });
  }

  // IntersectionObserver reveals
  const revealEls = $$(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealEls.forEach((el) => io.observe(el));

  // Form validation
  const form = $("#contactForm");
  const status = $("#formStatus");

  const fields = {
    name: {
      el: $("#name"),
      msg: document.querySelector('[data-field-msg="name"]'),
      validate: (v) => v.trim().length >= 2 || "Escribe tu nombre (mínimo 2 caracteres).",
    },
    email: {
      el: $("#email"),
      msg: document.querySelector('[data-field-msg="email"]'),
      validate: (v) => {
        const value = v.trim();
        if (!value) return "Escribe tu email.";
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
        return ok || "Email inválido. Ej: nombre@correo.com";
      },
    },
    message: {
      el: $("#message"),
      msg: document.querySelector('[data-field-msg="message"]'),
      validate: (v) => v.trim().length >= 10 || "Cuéntanos un poco más (mínimo 10 caracteres).",
    },
  };

  function setFieldState(key, result) {
    const { msg, el } = fields[key];
    if (!msg || !el) return;
    msg.classList.remove("is-error", "is-ok");

    if (result === true) {
      msg.textContent = "Listo ✅";
      msg.classList.add("is-ok");
      el.setAttribute("aria-invalid", "false");
    } else {
      msg.textContent = String(result);
      msg.classList.add("is-error");
      el.setAttribute("aria-invalid", "true");
    }
  }

  function validateAll() {
    let ok = true;
    for (const key of Object.keys(fields)) {
      const value = fields[key].el?.value ?? "";
      const result = fields[key].validate(value);
      if (result !== true) ok = false;
      setFieldState(key, result === true ? true : result);
    }
    return ok;
  }

  if (form) {
    // Live validation on blur
    Object.keys(fields).forEach((key) => {
      const field = fields[key].el;
      if (!field) return;
      field.addEventListener("blur", () => {
        const res = fields[key].validate(field.value);
        setFieldState(key, res === true ? true : res);
      });
      field.addEventListener("input", () => {
        // Soft clear message while typing
        const msg = fields[key].msg;
        if (msg && msg.classList.contains("is-error")) {
          msg.textContent = "";
          msg.classList.remove("is-error");
          field.setAttribute("aria-invalid", "false");
        }
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (status) status.textContent = "";

      const ok = validateAll();
      if (!ok) {
        if (status) status.textContent = "Revisa los campos marcados en rojo.";
        const firstInvalid = Object.keys(fields)
          .map((k) => fields[k].el)
          .find((el) => el && el.getAttribute("aria-invalid") === "true");
        firstInvalid && firstInvalid.focus();
        return;
      }

      // Fake submit (starter kit)
      if (status) status.textContent = "Enviando...";
      setTimeout(() => {
        if (status) status.textContent = "¡Mensaje enviado! Te contactaremos pronto ✅";
        form.reset();
        Object.keys(fields).forEach((k) => {
          const m = fields[k].msg;
          if (m) {
            m.textContent = "";
            m.classList.remove("is-error", "is-ok");
          }
          fields[k].el && fields[k].el.setAttribute("aria-invalid", "false");
        });
      }, 700);
    });
  }
})();
