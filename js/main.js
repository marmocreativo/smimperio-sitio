/* =========================================================
   SM Imperio — main.js
   Se carga ANTES de Alpine (Alpine va con `defer`), por eso
   todo se registra dentro del evento `alpine:init`.
   ========================================================= */

/* Configuración editable (ver también window.SM_CONFIG en index.html) */
const CFG = Object.assign(
  { whatsapp: "525532611966", formEndpoint: "" },
  window.SM_CONFIG || {}
);

/* Galería de proyectos: para agregar fotos, sube el .webp a img/p/ (y su miniatura a img/p/t/)
   y añade un objeto aquí. cat: "pci" | "bombeo" | "tableros" */
const GALLERY = [
  { src: "pci-cuarto-bombas",     cat: "pci",      title: "Cuarto de bombas contra incendio" },
  { src: "pci-panel-deteccion",   cat: "pci",      title: "Panel de detección y alarma de humo", tall: true },
  { src: "pci-bombas-rojas",      cat: "pci",      title: "Equipo de bombeo contra incendio" },
  { src: "pci-rociadores",        cat: "pci",      title: "Red de rociadores" },
  { src: "pci-soportes-1",        cat: "pci",      title: "Soportes antisísmicos en tubería" },
  { src: "bombeo-equipo",         cat: "bombeo",   title: "Equipo de bombeo hidráulico" },
  { src: "pci-mantenimiento",     cat: "pci",      title: "Mantenimiento preventivo: filtros y consumibles", tall: true },
  { src: "pci-soportes-2",        cat: "pci",      title: "Tubería y soportes antisísmicos" },
  { src: "bombeo-valvulas",       cat: "bombeo",   title: "Línea de bombeo con válvulas" },
  { src: "bombeo-hidroneumatico", cat: "bombeo",   title: "Sistema hidroneumático" },
  { src: "tablero-control-1",     cat: "tableros", title: "Tablero de control" },
  { src: "tablero-control-2",     cat: "tableros", title: "Cableado y control en tablero" },
  { src: "tableros-rojos",        cat: "tableros", title: "Tableros de control para bombas" },
];

const CATS = [
  { id: "all",      label: "Todos" },
  { id: "pci",      label: "Protección contra incendio" },
  { id: "bombeo",   label: "Bombeo e hidráulica" },
  { id: "tableros", label: "Tableros de control" },
];

const MVV = {
  mision:  "Desarrollar con la más alta calidad los proyectos que nos encomiendan nuestros clientes, cuidándolos como propios: servicio de calidad a precio competitivo, con el mejor provecho posible de su inversión y beneficios para clientes, colaboradores y sociedad.",
  vision:  "Ser una empresa líder, rentable y sustentable, que evoluciona constantemente en todos sus ámbitos y estructuras para ofrecer la más alta calidad a bajos costos, de modo que la ejecución del proyecto sea plenamente confortable para nuestros clientes.",
};

const SECTIONS = ["nosotros", "certificaciones", "proyectos", "suministros", "contacto"];

document.addEventListener("alpine:init", () => {
  document.documentElement.classList.add("has-alpine");

  /* ---------- Directiva x-reveal="[retraso]" : aparece al entrar en pantalla ---------- */
  Alpine.directive("reveal", (el, { expression }, { cleanup }) => {
    el.classList.add("reveal");
    const d = parseInt(expression, 10);
    if (!Number.isNaN(d)) el.style.setProperty("--d", d);
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); } },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    io.observe(el);
    cleanup(() => io.disconnect());
  });

  /* ---------- Directiva x-count="numero" : contador animado ---------- */
  Alpine.directive("count", (el, { expression }, { evaluate, cleanup }) => {
    const to = Number(evaluate(expression));
    if (!Number.isFinite(to)) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.textContent = to; return; }
    el.textContent = "0";
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), dur = 1400;
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
    cleanup(() => io.disconnect());
  });

  /* ---------- Componente principal ---------- */
  Alpine.data("app", () => ({
    /* tema */
    theme: document.documentElement.dataset.theme || "light",
    /* navegación */
    menuOpen: false,
    scrolled: false,
    active: "",
    /* nosotros */
    mvvTab: "mision",
    mvv: MVV,
    /* proyectos */
    cats: CATS,
    items: GALLERY,
    filter: "all",
    lb: { open: false, i: 0 },
    _lbTrigger: null,
    _touchX: null,
    showAllClients: false,
    /* contacto */
    form: { nombre: "", telefono: "", servicio: "", mensaje: "", hp: "" },
    status: { text: "", error: false },
    sending: false,
    year: new Date().getFullYear(),

    init() {
      /* header con sombra al hacer scroll */
      const onScroll = () => { this.scrolled = window.scrollY > 8; };
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });

      /* scrollspy */
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) this.active = e.target.id; });
      }, { rootMargin: "-45% 0px -50% 0px" });
      SECTIONS.forEach((id) => { const s = document.getElementById(id); if (s) io.observe(s); });

      /* bloquear scroll del body con lightbox abierto */
      this.$watch("lb.open", (v) => { document.body.style.overflow = v ? "hidden" : ""; });
      /* cerrar menú móvil al pasar a escritorio */
      matchMedia("(min-width: 901px)").addEventListener("change", (e) => { if (e.matches) this.menuOpen = false; });
      /* seguir preferencia del sistema si el usuario no eligió tema */
      matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        let saved = null; try { saved = localStorage.getItem("sm-theme"); } catch (_) {}
        if (!saved) this.setTheme(e.matches ? "dark" : "light", false);
      });
    },

    /* ----- tema ----- */
    get isDark() { return this.theme === "dark"; },
    setTheme(t, persist = true) {
      this.theme = t;
      document.documentElement.dataset.theme = t;
      const m = document.querySelector('meta[name="theme-color"]');
      if (m) m.setAttribute("content", t === "dark" ? "#0a110d" : "#006633");
      if (persist) { try { localStorage.setItem("sm-theme", t); } catch (_) {} }
    },
    toggleTheme() { this.setTheme(this.isDark ? "light" : "dark"); },

    /* ----- nosotros ----- */
    get years() {
      const d = new Date(), f = new Date(2012, 2, 12);
      let y = d.getFullYear() - f.getFullYear();
      if (d < new Date(d.getFullYear(), 2, 12)) y -= 1;
      return y;
    },

    /* ----- proyectos ----- */
    count(cat) { return cat === "all" ? this.items.length : this.items.filter((i) => i.cat === cat).length; },
    matches(item) { return this.filter === "all" || item.cat === this.filter; },
    get visible() { return this.items.filter((i) => this.matches(i)); },
    catLabel(id) { const c = this.cats.find((c) => c.id === id); return c ? c.label : ""; },
    openLb(item, ev) {
      this._lbTrigger = ev && ev.currentTarget;
      this.lb.i = Math.max(0, this.visible.indexOf(item));
      this.lb.open = true;
      this.$nextTick(() => this.$refs.lbClose && this.$refs.lbClose.focus());
    },
    closeLb() {
      this.lb.open = false;
      this.$nextTick(() => this._lbTrigger && this._lbTrigger.focus && this._lbTrigger.focus());
    },
    stepLb(n) {
      const len = this.visible.length;
      if (!len) return;
      this.lb.i = (this.lb.i + n + len) % len;
    },
    get current() { return this.visible[this.lb.i] || this.items[0]; },
    onKey(e) {
      if (!this.lb.open) return;
      if (e.key === "Escape") this.closeLb();
      else if (e.key === "ArrowRight") this.stepLb(1);
      else if (e.key === "ArrowLeft") this.stepLb(-1);
    },
    touchStart(e) { this._touchX = e.changedTouches[0].clientX; },
    touchEnd(e) {
      if (this._touchX === null) return;
      const dx = e.changedTouches[0].clientX - this._touchX;
      if (Math.abs(dx) > 50) this.stepLb(dx < 0 ? 1 : -1);
      this._touchX = null;
    },

    /* ----- contacto ----- */
    quote(servicio) {
      this.form.servicio = servicio;
      this.menuOpen = false;
      const el = document.getElementById("contacto");
      if (el) el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      setTimeout(() => { const n = document.getElementById("f-nombre"); if (n) n.focus({ preventScroll: true }); }, 600);
    },
    waLink(text) { return `https://wa.me/${CFG.whatsapp}?text=${encodeURIComponent(text)}`; },
    buildMessage() {
      const f = this.form;
      return [
        `Hola, soy ${f.nombre.trim()}.`,
        f.servicio ? `Me interesa: ${f.servicio}.` : "",
        f.mensaje.trim() ? f.mensaje.trim().replace(/[.!?]*$/, ".") : "",
        `Mi teléfono: ${f.telefono.trim()}`,
      ].filter(Boolean).join(" ");
    },
    async submit() {
      if (this.form.hp) return; /* honeypot anti-spam */
      this.status = { text: "", error: false };
      const digits = this.form.telefono.replace(/\D/g, "");
      if (this.form.nombre.trim().length < 2) return this.fail("Escribe tu nombre para poder atenderte.", "f-nombre");
      if (digits.length < 10) return this.fail("Revisa tu teléfono: necesitamos 10 dígitos.", "f-telefono");

      const msg = this.buildMessage();
      if (CFG.formEndpoint) {
        this.sending = true;
        try {
          const r = await fetch(CFG.formEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...this.form, hp: undefined, mensajeCompleto: msg, origen: location.href, fecha: new Date().toISOString() }),
          });
          if (!r.ok) throw new Error(r.status);
          this.status = { text: "¡Listo! Recibimos tu solicitud y te contactaremos a la brevedad.", error: false };
          this.form = { nombre: "", telefono: "", servicio: "", mensaje: "", hp: "" };
        } catch (_) {
          this.status = { text: "No pudimos enviar el formulario. Escríbenos por WhatsApp o llámanos.", error: true };
        } finally { this.sending = false; }
      } else {
        /* Sin endpoint: abre WhatsApp con el mensaje ya redactado */
        window.open(this.waLink(msg), "_blank", "noopener");
        this.status = { text: "Abrimos WhatsApp con tu mensaje listo para enviar.", error: false };
      }
    },
    fail(text, id) {
      this.status = { text, error: true };
      const el = document.getElementById(id); if (el) el.focus();
    },
  }));
});
