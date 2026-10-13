/* ==========================================================
   CiberShield Lab - Lógica
   JavaScript nativo, sin librerías
   ========================================================== */

(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ==========================================================
     1. INTRO: código binario azul y verde
     ========================================================== */
  function runIntro(onDone) {
    const overlay = $("intro");
    const canvas = $("introCanvas");
    const ctx = canvas.getContext("2d");
    const line = $("introLine");
    const fill = $("introFill");

    const W = window.innerWidth;
    const H = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const fontSize = W < 600 ? 15 : 18;
    ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
    ctx.textBaseline = "top";

    const cellW = ctx.measureText("0").width * 1.5;
    const cellH = fontSize * 1.3;
    const cols = Math.ceil(W / cellW);
    const rows = Math.ceil(H / cellH);
    const total = cols * rows;

    const COLORS = ["#2f8bff", "#5aa8ff", "#00f5a0", "#35ffb5"];
    const DURATION = 2800; // milisegundos que tarda en llenarse la pantalla

    let drawn = 0;
    let start = null;
    let finished = false;

    // Dibuja los números (0 y 1) uno por uno hasta la celda n
    function drawUpTo(n) {
      const limit = Math.min(n, total);
      for (; drawn < limit; drawn++) {
        const col = drawn % cols;
        const row = Math.floor(drawn / cols);
        ctx.fillStyle = COLORS[Math.floor(Math.random() * COLORS.length)];
        ctx.fillText(Math.random() < 0.5 ? "0" : "1", col * cellW, row * cellH);
      }
    }

    function finish() {
      if (finished) return;
      finished = true;
      overlay.classList.add("is-out");
      document.body.classList.remove("is-intro");
      setTimeout(() => {
        overlay.remove();
        onDone();
      }, 650);
    }

    function granted() {
      drawUpTo(total);
      fill.style.width = "100%";
      line.textContent = "> ACCESO CONCEDIDO ✔";
      overlay.classList.add("is-granted");
      setTimeout(finish, reduceMotion ? 500 : 1000);
    }

    function frame(t) {
      if (finished) return;
      if (start === null) start = t;
      const p = Math.min((t - start) / DURATION, 1);

      drawUpTo(Math.floor(total * p));
      fill.style.width = `${p * 100}%`;

      if (p < 0.35) line.textContent = "> Iniciando CiberShield...";
      else if (p < 0.7) line.textContent = "> Cifrando conexión segura...";
      else line.textContent = "> Descifrando protocolos...";

      if (p < 1) requestAnimationFrame(frame);
      else granted();
    }

    $("introSkip").addEventListener("click", finish);

    if (reduceMotion) granted();
    else requestAnimationFrame(frame);
  }

  /* ---------- Fondo: lluvia binaria suave (se adapta al tema) ---------- */
  function startRain() {
    if (reduceMotion) return;

    const canvas = $("rain");
    const ctx = canvas.getContext("2d");
    const fontSize = 16;
    let w, h, cols, drops, bg, blue, green;

    function setup() {
      const light = document.documentElement.getAttribute("data-theme") === "light";
      bg = getComputedStyle(document.documentElement).getPropertyValue("--bg-rgb").trim() || "5, 7, 13";
      blue = light ? "#1f6feb" : "#2f8bff";
      green = light ? "#00a870" : "#00f5a0";

      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      cols = Math.floor(w / fontSize);
      drops = Array.from({ length: cols }, () => Math.random() * -40);
      ctx.fillStyle = `rgb(${bg})`;
      ctx.fillRect(0, 0, w, h);
    }

    setup();
    window.addEventListener("resize", setup);

    let last = 0;
    function draw(t) {
      requestAnimationFrame(draw);
      if (t - last < 55) return; // limita los cuadros por segundo
      last = t;

      ctx.fillStyle = `rgba(${bg}, 0.14)`;
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < cols; i++) {
        ctx.fillStyle = i % 2 ? blue : green;
        ctx.fillText(Math.random() < 0.5 ? "0" : "1", i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }
    requestAnimationFrame(draw);
  }

  /* ==========================================================
     2. UTILIDADES COMUNES
     ========================================================== */
  function toast(message) {
    const node = document.createElement("div");
    node.className = "toast";
    node.textContent = message;
    $("toasts").appendChild(node);
    setTimeout(() => {
      node.classList.add("is-leaving");
      setTimeout(() => node.remove(), 320);
    }, 2000);
  }

  async function copyText(text) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Alternativa para navegadores sin acceso al portapapeles
      const area = document.createElement("textarea");
      area.value = text;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy");
      } catch (e) {
        toast("No se pudo copiar");
        area.remove();
        return;
      }
      area.remove();
    }
    toast("✔ Copiado al portapapeles");
  }

  /* Reloj del header */
  function startClock() {
    const clock = $("clock");
    const update = () => {
      clock.textContent = new Date().toLocaleTimeString("es-ES", { hour12: false });
    };
    update();
    setInterval(update, 1000);
  }

  /* Consejos */
  const TIPS = [
    "Usa una contraseña distinta para cada cuenta. Un gestor de contraseñas te lo hace fácil.",
    "Activa la verificación en dos pasos en tu correo y en tus redes sociales.",
    "Una frase larga y rara es mejor que una palabra corta con símbolos.",
    "Ningún banco te pedirá tu clave por correo, SMS o llamada.",
    "Antes de hacer clic, pasa el cursor sobre el enlace y revisa el dominio real.",
    "Actualiza tu sistema y tus apps: la mayoría de ataques usan fallos ya corregidos.",
    "Evita las redes Wi-Fi públicas para entrar a tu banca o a cuentas importantes.",
    "Haz copias de seguridad: es la mejor defensa contra el ransomware.",
  ];
  let lastTip = -1;

  function showTip() {
    let i;
    do {
      i = Math.floor(Math.random() * TIPS.length);
    } while (i === lastTip);
    lastTip = i;
    $("tipText").textContent = TIPS[i];
  }

  /* Aleatorio criptográfico sin sesgo */
  function randInt(max) {
    const buf = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / max) * max;
    do {
      crypto.getRandomValues(buf);
    } while (buf[0] >= limit);
    return buf[0] % max;
  }

  /* ==========================================================
     3. PESTAÑAS (Herramientas / Aprende)
     ========================================================== */
  function initTabs() {
    const groups = {};
    document.querySelectorAll(".tabs").forEach((list) => {
      const tabs = Array.from(list.querySelectorAll(".tab"));
      groups[list.dataset.group] = { list, tabs, active: tabs[0] };
    });
    const modeButtons = Array.from(document.querySelectorAll(".mode"));
    let mode = "tools";

    function render() {
      Object.entries(groups).forEach(([name, g]) => {
        g.list.hidden = name !== mode;
        g.tabs.forEach((t) => {
          const isActive = t === g.active;
          t.classList.toggle("is-active", isActive);
          t.setAttribute("aria-selected", String(isActive));
          t.tabIndex = isActive ? 0 : -1;
          $(t.getAttribute("aria-controls")).hidden = !(name === mode && isActive);
        });
      });
      modeButtons.forEach((b) => {
        const on = b.dataset.mode === mode;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
    }

    function select(tab, focus) {
      const g = groups[tab.closest(".tabs").dataset.group];
      g.active = tab;
      render();
      if (focus) tab.focus();
      tab.scrollIntoView({ block: "nearest", inline: "center", behavior: reduceMotion ? "auto" : "smooth" });
      if (tab.dataset.tab === "term") $("termInput").focus({ preventScroll: true });
    }

    Object.values(groups).forEach((g) => {
      g.tabs.forEach((tab, i) => {
        tab.addEventListener("click", () => select(tab, false));
        tab.addEventListener("keydown", (e) => {
          let next = null;
          if (e.key === "ArrowRight") next = g.tabs[(i + 1) % g.tabs.length];
          if (e.key === "ArrowLeft") next = g.tabs[(i - 1 + g.tabs.length) % g.tabs.length];
          if (e.key === "Home") next = g.tabs[0];
          if (e.key === "End") next = g.tabs[g.tabs.length - 1];
          if (next) {
            e.preventDefault();
            select(next, true);
          }
        });
      });
    });

    modeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        mode = btn.dataset.mode;
        render();
      });
    });

    render();
  }

  /* ==========================================================
     4. ANALIZADOR DE CONTRASEÑAS
     ========================================================== */
  const COMMON = [
    "123456", "12345678", "123456789", "password", "contrasena", "qwerty", "abc123",
    "admin", "letmein", "iloveyou", "welcome", "monkey", "dragon", "football",
    "111111", "000000", "login", "master", "hola123", "princesa", "futbol",
  ];

  const LEVELS = ["Muy débil", "Débil", "Aceptable", "Fuerte", "Muy fuerte"];

  function analyzePassword(pw) {
    const has = {
      lower: /[a-z]/.test(pw),
      upper: /[A-Z]/.test(pw),
      num: /\d/.test(pw),
      sym: /[^A-Za-z0-9]/.test(pw),
    };

    const base = pw.toLowerCase().replace(/\d+$/, "");
    const isCommon = COMMON.includes(pw.toLowerCase()) || COMMON.includes(base);
    const hasSequence = /(0123|1234|2345|3456|4567|5678|6789|abcd|bcde|cdef|qwer|asdf|zxcv)/i.test(pw);
    const hasRepeat = /(.)\1{2,}/.test(pw);

    const checks = {
      len: pw.length >= 12,
      lower: has.lower,
      upper: has.upper,
      num: has.num,
      sym: has.sym,
      common: !isCommon,
      pattern: !hasSequence && !hasRepeat,
    };

    const pool = (has.lower ? 26 : 0) + (has.upper ? 26 : 0) + (has.num ? 10 : 0) + (has.sym ? 33 : 0);
    let bits = pw.length * Math.log2(pool || 1);

    if (isCommon) bits = Math.min(bits, 12);
    else if (hasSequence || hasRepeat) bits *= 0.7;

    let level = 0;
    if (bits >= 80) level = 4;
    else if (bits >= 60) level = 3;
    else if (bits >= 40) level = 2;
    else if (bits >= 28) level = 1;

    // Estimación: 10 mil millones de intentos por segundo (ataque offline rápido)
    const seconds = Math.pow(2, Math.max(bits - 1, 0)) / 1e10;

    return { checks, bits, level, seconds };
  }

  function humanTime(s) {
    const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
    if (s < 1) return "instantáneo";
    if (s < 60) return plural(Math.round(s), "segundo", "segundos");
    if (s < 3600) return plural(Math.round(s / 60), "minuto", "minutos");
    if (s < 86400) return plural(Math.round(s / 3600), "hora", "horas");
    if (s < 31536000) return plural(Math.round(s / 86400), "día", "días");

    const years = s / 31536000;
    if (years < 1000) return plural(Math.round(years), "año", "años");
    if (years < 1e6) return "miles de años";
    if (years < 1e9) return "millones de años";
    return "miles de millones de años o más";
  }

  function setMeter(meterEl, labelEl, level) {
    meterEl.dataset.level = String(level);
    meterEl.setAttribute("aria-valuenow", String(level + 1));
    labelEl.textContent = level < 0 ? "—" : LEVELS[level];
  }

  function initPasswordAnalyzer() {
    const input = $("passInput");
    const toggle = $("passToggle");

    function update() {
      const pw = input.value;
      const items = document.querySelectorAll("#passChecks li");

      if (!pw) {
        setMeter($("passMeter"), $("passLevel"), -1);
        $("passBits").textContent = "0 bits";
        $("passTime").textContent = "—";
        items.forEach((li) => li.classList.remove("is-ok"));
        return;
      }

      const r = analyzePassword(pw);
      setMeter($("passMeter"), $("passLevel"), r.level);
      $("passBits").textContent = `${Math.round(r.bits)} bits`;
      $("passTime").textContent = humanTime(r.seconds);
      items.forEach((li) => li.classList.toggle("is-ok", r.checks[li.dataset.check]));
    }

    input.addEventListener("input", update);

    toggle.addEventListener("click", () => {
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      toggle.textContent = show ? "Ocultar" : "Mostrar";
      toggle.setAttribute("aria-pressed", String(show));
    });
  }

  /* ==========================================================
     5. GENERADOR DE CONTRASEÑAS
     ========================================================== */
  function initGenerator() {
    const out = $("genOutput");
    const lengthInput = $("genLength");
    const opts = {
      upper: $("genUpper"),
      lower: $("genLower"),
      num: $("genNum"),
      sym: $("genSym"),
      ambig: $("genAmbig"),
    };

    const SETS = {
      upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
      lower: "abcdefghijklmnopqrstuvwxyz",
      num: "0123456789",
      sym: "!@#$%^&*()-_=+[]{};:,.?",
    };
    const AMBIGUOUS = /[0Ol1I]/g;

    function generate() {
      const length = Number(lengthInput.value);
      $("genLengthVal").textContent = length;

      let selected = ["upper", "lower", "num", "sym"].filter((k) => opts[k].checked);
      $("genMsg").textContent = "";

      if (!selected.length) {
        opts.lower.checked = true;
        selected = ["lower"];
        $("genMsg").textContent = "Debes dejar al menos un tipo de carácter. Activé las minúsculas.";
      }

      const sets = selected.map((k) => (opts.ambig.checked ? SETS[k].replace(AMBIGUOUS, "") : SETS[k]));
      const all = sets.join("");

      // Garantiza al menos un carácter de cada tipo elegido
      const chars = sets.map((set) => set[randInt(set.length)]);
      while (chars.length < length) chars.push(all[randInt(all.length)]);

      // Mezcla (Fisher-Yates)
      for (let i = chars.length - 1; i > 0; i--) {
        const j = randInt(i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
      }

      out.value = chars.slice(0, length).join("");
      const r = analyzePassword(out.value);
      setMeter($("genMeter"), $("genLevel"), r.level);
    }

    lengthInput.addEventListener("input", generate);
    Object.values(opts).forEach((o) => o.addEventListener("change", generate));
    $("genRegen").addEventListener("click", generate);
    $("genCopy").addEventListener("click", () => copyText(out.value));

    generate();
  }

  /* ==========================================================
     6. HASHES
     ========================================================== */
  function initHash() {
    const input = $("hashInput");
    const verify = $("hashVerify");
    const algos = { "hash-sha1": "SHA-1", "hash-sha256": "SHA-256", "hash-sha512": "SHA-512" };
    let hashes = {};
    let token = 0;

    async function digest(algo, text) {
      const data = new TextEncoder().encode(text);
      const buf = await crypto.subtle.digest(algo, data);
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }

    async function update() {
      const current = ++token;
      const text = input.value;

      if (!window.crypto || !crypto.subtle) {
        Object.keys(algos).forEach((id) => ($(id).textContent = "No disponible en este navegador"));
        return;
      }

      for (const [id, algo] of Object.entries(algos)) {
        const value = text ? await digest(algo, text) : "";
        if (current !== token) return; // llegó una entrada más reciente
        hashes[id] = value;
        $(id).textContent = value || "—";
      }
      checkVerify();
    }

    function checkVerify() {
      const note = $("hashVerifyResult");
      const expected = verify.value.trim().toLowerCase();
      note.className = "note";

      if (!expected) {
        note.textContent = "";
        return;
      }
      if (!input.value) {
        note.textContent = "Escribe primero un texto de entrada.";
        return;
      }

      const match = Object.entries(hashes).find(([, v]) => v === expected);
      if (match) {
        note.textContent = `✔ Coincide con el ${algos[match[0]]}. El contenido es íntegro.`;
        note.classList.add("is-good");
      } else {
        note.textContent = "✘ No coincide con ningún hash. El contenido pudo ser modificado.";
        note.classList.add("is-bad");
      }
    }

    input.addEventListener("input", update);
    verify.addEventListener("input", checkVerify);

    document.querySelectorAll("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const value = hashes[btn.dataset.copy];
        if (value) copyText(value);
        else toast("Primero escribe un texto");
      });
    });

    // Valor inicial vacío
    Object.keys(algos).forEach((id) => ($(id).textContent = "—"));
  }

  /* ==========================================================
     7. CODIFICADOR
     ========================================================== */
  function initEncoder() {
    const input = $("encInput");
    const output = $("encOutput");
    const mode = $("encMode");
    const shift = $("encShift");
    const error = $("encError");

    const encoder = new TextEncoder();
    const decoder = new TextDecoder("utf-8", { fatal: true });

    const toBytes = (text) => Array.from(encoder.encode(text));
    const fromBytes = (bytes) => {
      try {
        return decoder.decode(new Uint8Array(bytes));
      } catch (e) {
        throw new Error("Los datos no forman un texto válido.");
      }
    };

    function caesar(text, n) {
      const k = ((n % 26) + 26) % 26;
      return text.replace(/[a-z]/gi, (ch) => {
        const base = ch <= "Z" ? 65 : 97;
        return String.fromCharCode(((ch.charCodeAt(0) - base + k) % 26) + base);
      });
    }

    const formats = {
      bin: {
        encode: (t) => toBytes(t).map((b) => b.toString(2).padStart(8, "0")).join(" "),
        decode: (t) => {
          let parts = t.trim().split(/\s+/);
          if (parts.length === 1 && parts[0].length > 8) parts = parts[0].match(/.{1,8}/g);
          if (!parts.every((p) => /^[01]{8}$/.test(p))) {
            throw new Error("El binario debe estar en grupos de 8 dígitos (0 y 1).");
          }
          return fromBytes(parts.map((p) => parseInt(p, 2)));
        },
      },
      hex: {
        encode: (t) => toBytes(t).map((b) => b.toString(16).padStart(2, "0")).join(" "),
        decode: (t) => {
          const clean = t.replace(/\s+/g, "");
          if (!/^([0-9a-f]{2})+$/i.test(clean)) {
            throw new Error("El hexadecimal debe tener pares de dígitos (0-9, A-F).");
          }
          return fromBytes(clean.match(/../g).map((h) => parseInt(h, 16)));
        },
      },
      b64: {
        encode: (t) => btoa(toBytes(t).map((b) => String.fromCharCode(b)).join("")),
        decode: (t) => {
          try {
            const bin = atob(t.trim());
            return fromBytes(Array.from(bin, (c) => c.charCodeAt(0)));
          } catch (e) {
            throw new Error("Base64 no válido.");
          }
        },
      },
      caesar: {
        encode: (t) => caesar(t, Number(shift.value)),
        decode: (t) => caesar(t, -Number(shift.value)),
      },
    };

    function run(action) {
      error.textContent = "";
      if (!input.value.trim()) {
        error.textContent = "Escribe un mensaje primero.";
        output.value = "";
        return;
      }
      try {
        output.value = formats[mode.value][action](input.value);
      } catch (err) {
        output.value = "";
        error.textContent = err.message;
      }
    }

    $("encEncode").addEventListener("click", () => run("encode"));
    $("encDecode").addEventListener("click", () => run("decode"));
    $("encCopy").addEventListener("click", () => {
      if (output.value) copyText(output.value);
      else toast("No hay resultado para copiar");
    });
    $("encSwap").addEventListener("click", () => {
      if (!output.value) return;
      input.value = output.value;
      output.value = "";
      error.textContent = "";
    });

    mode.addEventListener("change", () => {
      $("encShiftWrap").hidden = mode.value !== "caesar";
      error.textContent = "";
    });
    shift.addEventListener("input", () => ($("encShiftVal").textContent = shift.value));
  }

  /* ==========================================================
     8. QUIZ DE PHISHING
     ========================================================== */
  const QUIZ = [
    {
      from: "soporte@banconova-seguridad.co",
      subject: "URGENTE: tu cuenta será bloqueada en 2 horas",
      body: "Estimado cliente, detectamos actividad sospechosa. Verifica tus datos ahora para evitar el bloqueo:\nhttp://banconova-verifica.xyz/login",
      phish: true,
      explain: "Mezcla urgencia con un dominio raro (.xyz) que no es el del banco. Los bancos no bloquean cuentas por correo con plazos de horas.",
    },
    {
      from: "no-reply@nubedrive.com",
      subject: "Nuevo inicio de sesión en tu cuenta",
      body: "Detectamos un inicio de sesión desde Chrome en Windows. Si fuiste tú, no necesitas hacer nada. Si no, abre la app de NubeDrive y revisa tus dispositivos conectados.",
      phish: false,
      explain: "No te presiona ni te pide datos. Te dirige a abrir tu app, no a hacer clic en un enlace sospechoso.",
    },
    {
      from: "premios@sorteo-global-mx.net",
      subject: "¡Felicidades! Ganaste un smartphone de última generación",
      body: "Fuiste elegido entre 10.000 personas. Para recibir tu premio solo paga $2 de envío con tu tarjeta en este enlace:\nhttp://reclama-premio.top/pago",
      phish: true,
      explain: "Premios que no ganaste y pagos pequeños para \"envío\" son una forma clásica de robar datos de tarjeta.",
    },
    {
      from: "ti-soporte@tuempresa-ayuda.com",
      subject: "Actualización de tu buzón",
      body: "Hola, soy del equipo de TI. Para migrar tu correo necesito que me respondas con tu usuario y tu contraseña actual. Gracias por tu colaboración.",
      phish: true,
      explain: "Ningún equipo de TI legítimo te pide tu contraseña. Además el dominio imita al de tu empresa.",
    },
    {
      from: "facturacion@proveedor-envios.com",
      subject: "Factura pendiente #8842",
      body: "Adjuntamos tu factura vencida. Ábrela hoy para evitar recargos.\nArchivo adjunto: factura_8842.pdf.exe",
      phish: true,
      explain: "El archivo termina en .exe aunque parezca un PDF. Es un programa que puede instalar malware.",
    },
    {
      from: "recibos@tiendalibro.com",
      subject: "Recibo de tu compra #A-4471",
      body: "Gracias por tu compra de 1 libro. Total: $18,50. Si no reconoces esta compra, entra directamente a tiendalibro.com escribiendo la dirección en tu navegador y revisa tu historial.",
      phish: false,
      explain: "Es informativo, no pide datos y te aconseja entrar escribiendo la dirección tú mismo, que es lo más seguro.",
    },
    {
      from: "+52 55 0000 1234",
      subject: "SMS: Paquete retenido",
      body: "Tu paquete no pudo entregarse. Reprograma la entrega en 24 h o será devuelto: bit.ly/3xK9-envio",
      phish: true,
      explain: "Remitente desconocido, urgencia y un enlace acortado que oculta el destino real.",
    },
  ];

  function initQuiz() {
    let index = 0;
    let score = 0;
    let answered = false;

    const actions = $("quizActions");
    const feedback = $("quizFeedback");
    const next = $("quizNext");

    function show() {
      const q = QUIZ[index];
      answered = false;

      $("quizProgress").textContent = `Pregunta ${index + 1} de ${QUIZ.length}`;
      $("quizScore").textContent = `Aciertos: ${score}`;
      $("quizFill").style.width = `${(index / QUIZ.length) * 100}%`;
      $("quizFrom").textContent = q.from;
      $("quizSubject").textContent = q.subject;
      $("quizBody").textContent = q.body;

      feedback.hidden = true;
      feedback.className = "feedback";
      next.hidden = true;
      actions.querySelectorAll("button").forEach((b) => (b.disabled = false));
    }

    function answer(choice) {
      if (answered) return;
      answered = true;

      const q = QUIZ[index];
      const correct = (choice === "phish") === q.phish;
      if (correct) score++;

      feedback.hidden = false;
      feedback.classList.add(correct ? "is-good" : "is-bad");
      feedback.textContent = (correct ? "✔ ¡Correcto! " : "✘ Incorrecto. ") + q.explain;
      $("quizScore").textContent = `Aciertos: ${score}`;

      actions.querySelectorAll("button").forEach((b) => (b.disabled = true));
      next.textContent = index === QUIZ.length - 1 ? "Ver resultado" : "Siguiente";
      next.hidden = false;
      next.focus();
    }

    function result() {
      $("quizBox").hidden = true;
      $("quizResult").hidden = false;
      $("quizFinal").textContent = `${score} / ${QUIZ.length}`;

      let rank;
      if (score === QUIZ.length) rank = "🏆 Cazador de phishing: nada se te escapa.";
      else if (score >= 5) rank = "🛡️ Analista sólido: tienes buen ojo.";
      else if (score >= 3) rank = "👀 Aprendiz alerta: sigue practicando.";
      else rank = "⚠️ Cuidado: los estafadores podrían pescarte. Repasa las señales.";
      $("quizRank").textContent = rank;
    }

    actions.querySelectorAll("[data-answer]").forEach((btn) => {
      btn.addEventListener("click", () => answer(btn.dataset.answer));
    });

    next.addEventListener("click", () => {
      index++;
      if (index >= QUIZ.length) result();
      else show();
    });

    $("quizRestart").addEventListener("click", () => {
      index = 0;
      score = 0;
      $("quizResult").hidden = true;
      $("quizBox").hidden = false;
      show();
    });

    show();
  }

  /* ==========================================================
     9. TERMINAL SIMULADA
     ========================================================== */
  function initTerminal() {
    const out = $("termOut");
    const form = $("termForm");
    const input = $("termInput");
    const history = [];
    let historyPos = 0;
    let busy = false;

    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    function print(text, type = "cmd") {
      const div = document.createElement("div");
      div.className = `term__line term__line--${type}`;
      div.textContent = text;
      out.appendChild(div);
      out.scrollTop = out.scrollHeight;
    }

    function hashString(str) {
      let h = 2166136261;
      for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
      }
      return h >>> 0;
    }

    const PORTS = [
      [21, "FTP"],
      [22, "SSH"],
      [80, "HTTP"],
      [443, "HTTPS"],
      [3306, "MySQL"],
      [3389, "RDP"],
      [8080, "HTTP-alt"],
    ];

    function banner() {
      print("CiberShield Terminal v1.0  (modo simulación educativa)", "ok");
      print("Escribe 'ayuda' para ver los comandos disponibles.", "dim");
    }

    async function scan(domain) {
      if (!/^[a-z0-9]([a-z0-9.-]{1,58})[a-z0-9]$/i.test(domain)) {
        print("Dominio no válido. Ejemplo: escanear ejemplo.com", "err");
        return;
      }

      busy = true;
      print(`[SIMULACIÓN] Analizando ${domain}...`, "info");
      print("Este escaneo es ficticio: no se conecta a ningún servidor.", "dim");

      const seed = hashString(domain.toLowerCase());
      const risky = [];
      let open = 0;

      for (const [port, name] of PORTS) {
        await sleep(reduceMotion ? 0 : 320);
        const r = hashString(`${seed}:${port}`) % 100;

        let state;
        if (port === 80 || port === 443) state = "abierto";
        else if (r < 25) state = "abierto";
        else if (r < 60) state = "filtrado";
        else state = "cerrado";

        const label = `${String(port).padEnd(6)}${name.padEnd(10)}${state}`;
        if (state === "abierto") {
          open++;
          if ([21, 3306, 3389].includes(port)) {
            risky.push(`${port}/${name}`);
            print(label + "  ⚠", "warn");
          } else {
            print(label, "ok");
          }
        } else {
          print(label, "dim");
        }
      }

      await sleep(reduceMotion ? 0 : 300);
      print(`Puertos abiertos: ${open}`, "info");
      if (risky.length) {
        print(`Riesgo: servicios sensibles expuestos (${risky.join(", ")}). Ciérralos o protégelos con VPN y firewall.`, "warn");
      } else {
        print("Resultado: no se detectaron servicios sensibles expuestos.", "ok");
      }
      busy = false;
    }

    const COMMANDS = {
      ayuda() {
        print("Comandos disponibles:", "info");
        [
          "ayuda            muestra esta lista",
          "escanear <sitio> simula un escaneo de puertos",
          "puertos          explica los puertos más comunes",
          "consejo          muestra un consejo de seguridad",
          "whoami           te dice quién eres aquí",
          "fecha            muestra fecha y hora",
          "banner           muestra el mensaje de bienvenida",
          "limpiar          borra la pantalla",
        ].forEach((l) => print("  " + l, "dim"));
      },
      puertos() {
        print("Puertos comunes:", "info");
        [
          "21   FTP       transferencia de archivos (sin cifrar)",
          "22   SSH       acceso remoto seguro",
          "80   HTTP      web sin cifrar",
          "443  HTTPS     web cifrada",
          "3306 MySQL     base de datos, no debe estar expuesta",
          "3389 RDP       escritorio remoto, objetivo frecuente de ataques",
        ].forEach((l) => print("  " + l, "dim"));
      },
      consejo() {
        print(TIPS[Math.floor(Math.random() * TIPS.length)], "ok");
      },
      whoami() {
        print("guest: un aprendiz de ciberseguridad con mucho potencial.", "ok");
      },
      fecha() {
        print(new Date().toLocaleString("es-ES"), "info");
      },
      banner,
      limpiar() {
        out.textContent = "";
      },
      hackear() {
        print("Buen intento 😏. Aquí solo practicamos hacking ético.", "warn");
      },
    };

    async function execute(raw) {
      const text = raw.trim();
      if (!text) return;

      print(`$ ${text}`, "cmd");
      history.push(text);
      historyPos = history.length;

      const [cmdRaw, ...args] = text.split(/\s+/);
      const cmd = cmdRaw.toLowerCase();

      if (cmd === "escanear") {
        if (!args[0]) print("Uso: escanear <dominio>", "err");
        else await scan(args[0]);
      } else if (cmd === "clear") {
        COMMANDS.limpiar();
      } else if (Object.prototype.hasOwnProperty.call(COMMANDS, cmd)) {
        COMMANDS[cmd]();
      } else {
        print(`Comando no encontrado: ${cmd}. Escribe 'ayuda'.`, "err");
      }
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (busy) return;
      const value = input.value;
      input.value = "";
      await execute(value);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp" && history.length) {
        e.preventDefault();
        historyPos = Math.max(0, historyPos - 1);
        input.value = history[historyPos];
      } else if (e.key === "ArrowDown" && history.length) {
        e.preventDefault();
        historyPos = Math.min(history.length, historyPos + 1);
        input.value = history[historyPos] || "";
      }
    });

    $("term").addEventListener("click", () => input.focus({ preventScroll: true }));

    banner();
  }

  /* ==========================================================
     NUEVAS FUNCIONES: utilidades
     ========================================================== */
  const h = (tag, cls, text) => {
    const el = document.createElement(tag);
    if (cls) el.className = cls;
    if (text !== undefined) el.textContent = text;
    return el;
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const plain = (s) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  function fnv(str) {
    let x = 2166136261;
    for (let i = 0; i < str.length; i++) {
      x ^= str.charCodeAt(i);
      x = Math.imul(x, 16777619);
    }
    return x >>> 0;
  }

  function storageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      /* almacenamiento no disponible: se ignora */
    }
  }

  /* ==========================================================
     TEMA CLARO / OSCURO
     ========================================================== */
  function initTheme() {
    const btn = $("themeBtn");
    let theme = storageGet("cibershield-theme") === "light" ? "light" : "dark";

    function apply() {
      document.documentElement.setAttribute("data-theme", theme);
      btn.textContent = theme === "light" ? "🌙" : "☀️";
      btn.setAttribute("aria-label", theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro");
    }

    btn.addEventListener("click", () => {
      theme = theme === "light" ? "dark" : "light";
      apply();
      storageSet("cibershield-theme", theme);
      window.dispatchEvent(new Event("resize")); // la lluvia se recalcula con los nuevos colores
    });

    apply();
  }

  /* ==========================================================
     EFECTOS VISUALES
     ========================================================== */
  function typeTag() {
    const el = $("typeTag");
    if (reduceMotion) return;
    const text = el.dataset.text;
    el.textContent = "";
    let i = 0;
    const id = setInterval(() => {
      el.textContent = text.slice(0, ++i);
      if (i >= text.length) clearInterval(id);
    }, 55);
  }

  function countUp() {
    document.querySelectorAll("[data-count]").forEach((el) => {
      const target = Number(el.dataset.count);
      if (reduceMotion || !target) {
        el.textContent = target;
        return;
      }
      let start = null;
      const step = (t) => {
        if (start === null) start = t;
        const p = Math.min((t - start) / 900, 1);
        el.textContent = Math.round(target * p);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  function initEffects() {
    // Barra de progreso de lectura
    const bar = $("scrollBar");
    const updateBar = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    };
    window.addEventListener("scroll", updateBar, { passive: true });
    window.addEventListener("resize", updateBar);
    updateBar();

    // Foco de luz que sigue al cursor dentro de los paneles
    document.querySelectorAll(".panel").forEach((panel) => {
      panel.addEventListener("pointermove", (e) => {
        const r = panel.getBoundingClientRect();
        panel.style.setProperty("--mx", `${e.clientX - r.left}px`);
        panel.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    });
  }

  /* ==========================================================
     VERIFICADOR DE ENLACES
     ========================================================== */
  function initLinkChecker() {
    const input = $("linkInput");
    const out = $("linkResult");

    const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "is.gd", "cutt.ly", "ow.ly", "rebrand.ly", "shorturl.at", "tiny.cc"];
    const RISKY_TLDS = ["xyz", "top", "click", "zip", "mov", "tk", "gq", "cf", "ml", "ga", "work", "loan", "icu", "buzz", "rest"];
    const KEYWORDS = ["login", "signin", "verify", "verifica", "secure", "seguro", "account", "cuenta", "update", "actualiza", "banco", "bank", "pago", "payment", "wallet", "password", "clave", "soporte", "support"];
    const EXAMPLES = [
      "http://banconova-verifica.xyz/login",
      "https://www.wikipedia.org",
      "http://192.168.4.20/pago",
      "https://bit.ly/3xK9envio",
      "https://soporte.cuenta-segura.premio-gratis.com/verifica",
    ];
    let exampleIndex = 0;

    function registrable(host) {
      const parts = host.split(".");
      if (parts.length <= 2) return host;
      const last = parts[parts.length - 1];
      const second = parts[parts.length - 2];
      if (last.length === 2 && ["co", "com", "org", "net", "gov", "edu", "ac"].includes(second)) {
        return parts.slice(-3).join(".");
      }
      return parts.slice(-2).join(".");
    }

    function analyze(raw) {
      const text = raw.trim();
      const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(text);
      let url;
      try {
        url = new URL(hasScheme ? text : "https://" + text);
      } catch (e) {
        return { error: "Eso no parece una dirección web válida." };
      }
      if (!["http:", "https:"].includes(url.protocol)) {
        return { error: "Solo analizo enlaces web (http o https)." };
      }

      const host = url.hostname.toLowerCase();
      const findings = [];
      let score = 0;
      const add = (level, msg, points) => {
        findings.push({ level, msg });
        score += points;
      };

      // Protocolo
      if (url.protocol === "https:") add("ok", "Usa HTTPS: la conexión va cifrada (aunque eso no garantiza que el sitio sea honesto).", 0);
      else add("warn", "No usa HTTPS: los datos viajan sin cifrar.", 1);

      // Dirección IP en lugar de dominio
      const isIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.startsWith("[");
      if (isIp) add("bad", "Usa una dirección IP en lugar de un nombre de dominio.", 3);

      // Usuario o clave dentro del enlace (truco con @)
      if (url.username || url.password) add("bad", "Contiene un '@': lo que ves antes puede no ser el destino real.", 3);

      // Punycode (caracteres internacionales que imitan letras)
      if (host.includes("xn--")) add("bad", "Usa caracteres internacionales que pueden imitar a otro dominio (ataque homógrafo).", 3);

      // Acortadores
      if (SHORTENERS.some((s) => host === s || host.endsWith("." + s))) {
        add("warn", "Es un acortador de enlaces: oculta el destino real.", 2);
      }

      // Extensión de dominio
      const tld = host.split(".").pop();
      if (!isIp && RISKY_TLDS.includes(tld)) add("warn", `La terminación .${tld} se usa con frecuencia en estafas.`, 2);

      // Palabras que aparentan seguridad
      const found = KEYWORDS.filter((k) => host.includes(k));
      if (!isIp && found.length) {
        add("warn", `El dominio incluye palabras como "${found.slice(0, 3).join('", "')}", típicas de engaños.`, 2);
      }

      // Demasiados subdominios o guiones
      if (!isIp && host.split(".").length > 4) add("warn", "Tiene muchos subdominios: es una forma de camuflar el dominio real.", 1);
      if ((host.match(/-/g) || []).length >= 3) add("warn", "El dominio tiene muchos guiones, algo poco habitual en sitios legítimos.", 1);

      // Puerto raro y longitud
      if (url.port && !["80", "443"].includes(url.port)) add("warn", `Usa un puerto poco común (${url.port}).`, 1);
      if (text.length > 100) add("warn", "El enlace es muy largo, lo que dificulta revisarlo.", 1);

      if (!findings.some((f) => f.level !== "ok")) {
        add("ok", "No se detectaron señales de alerta evidentes en la estructura del enlace.", 0);
      }

      const level = findings.some((f) => f.level === "bad") || score >= 3 ? "bad" : score >= 1 ? "warn" : "ok";
      return { host, domain: isIp ? host : registrable(host), findings, level, score };
    }

    function render(result) {
      out.hidden = false;
      out.textContent = "";

      if (result.error) {
        out.appendChild(h("p", "note note--error", result.error));
        return;
      }

      const LABELS = {
        ok: ["✔", "Sin señales de alerta"],
        warn: ["⚠", "Precaución"],
        bad: ["✖", "Peligro probable"],
      };

      const head = h("div", `risk risk--${result.level}`);
      head.append(h("span", "risk__icon", LABELS[result.level][0]));
      const headText = h("div");
      headText.append(h("strong", "", LABELS[result.level][1]), h("span", "", `Puntaje de riesgo: ${result.score}`));
      head.appendChild(headText);

      const domain = h("p", "domainbox");
      domain.append(h("span", "", "Dominio real: "), h("code", "", result.domain));

      const list = h("ul", "findings");
      result.findings.forEach((f) => {
        const li = h("li", `finding finding--${f.level}`, f.msg);
        list.appendChild(li);
      });

      out.append(
        head,
        domain,
        list,
        h("p", "note", "Análisis heurístico y local: no consulta listas de sitios maliciosos. Ante la duda, no abras el enlace y entra al sitio escribiendo su dirección.")
      );
    }

    function run() {
      if (!input.value.trim()) {
        out.hidden = false;
        out.textContent = "";
        out.appendChild(h("p", "note note--error", "Pega primero un enlace para analizarlo."));
        return;
      }
      render(analyze(input.value));
    }

    $("linkCheck").addEventListener("click", run);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") run();
    });
    $("linkExample").addEventListener("click", () => {
      input.value = EXAMPLES[exampleIndex % EXAMPLES.length];
      exampleIndex++;
      run();
    });
  }

  /* ==========================================================
     PIN Y FRASES DE CONTRASEÑA
     ========================================================== */
  function initPinGenerator() {
    /* ---- PIN ---- */
    const pinOut = $("pinOutput");
    const pinLen = $("pinLength");

    function isWeakPin(p) {
      if (/^(\d)\1+$/.test(p)) return true; // todos iguales
      const d = Array.from(p, Number);
      if (d.every((v, i) => i === 0 || v === d[i - 1] + 1)) return true; // ascendente
      if (d.every((v, i) => i === 0 || v === d[i - 1] - 1)) return true; // descendente
      if (p.length % 2 === 0 && p.slice(0, p.length / 2).repeat(2) === p) return true; // 1212
      return ["2580", "1004", "6969", "2000"].includes(p);
    }

    function makePin() {
      const len = Number(pinLen.value);
      let pin;
      do {
        pin = Array.from({ length: len }, () => randInt(10)).join("");
      } while (isWeakPin(pin));
      pinOut.value = pin;
      const combos = Math.pow(10, len).toLocaleString("es-ES");
      $("pinInfo").textContent = `${combos} combinaciones posibles. Evitamos secuencias y repeticiones obvias. Úsalo solo donde haya bloqueo tras varios intentos fallidos.`;
    }

    pinLen.addEventListener("change", makePin);
    $("pinRegen").addEventListener("click", makePin);
    $("pinCopy").addEventListener("click", () => copyText(pinOut.value));

    /* ---- Frase ---- */
    const WORDS = [...new Set([
      "nube", "tigre", "cohete", "piedra", "bosque", "faro", "luna", "trigo", "puente", "delfin",
      "cafe", "viento", "lluvia", "rio", "monte", "isla", "fuego", "hielo", "sol", "estrella",
      "camino", "ventana", "jardin", "tormenta", "volcan", "planeta", "cometa", "mapa", "brujula", "tesoro",
      "castillo", "dragon", "caballo", "halcon", "lobo", "zorro", "oso", "ballena", "pulpo", "tortuga",
      "abeja", "mariposa", "girasol", "roble", "pino", "cactus", "helecho", "musgo", "arena", "playa",
      "ola", "coral", "perla", "ancla", "velero", "tren", "bicicleta", "motor", "reloj", "llave",
      "candado", "escudo", "espada", "flecha", "tambor", "guitarra", "piano", "violin", "pincel", "lienzo",
      "libro", "pluma", "tinta", "papel", "tijera", "martillo", "tornillo", "engranaje", "circuito", "pixel",
      "robot", "laser", "cristal", "diamante", "rubi", "jade", "ambar", "canela", "miel", "limon",
      "naranja", "manzana", "pera", "uva", "mango", "coco", "pimienta", "jengibre", "chocolate", "galleta",
    ])];

    const words = $("phraseWords");
    const sep = $("phraseSep");
    const cap = $("phraseCap");
    const num = $("phraseNum");
    const phraseOut = $("phraseOutput");

    function makePhrase() {
      const n = Number(words.value);
      $("phraseWordsVal").textContent = n;

      let parts = Array.from({ length: n }, () => WORDS[randInt(WORDS.length)]);
      if (cap.checked) parts = parts.map((w) => w[0].toUpperCase() + w.slice(1));

      let phrase = parts.join(sep.value);
      let bits = n * Math.log2(WORDS.length);

      if (num.checked) {
        phrase += sep.value + String(randInt(100)).padStart(2, "0");
        bits += Math.log2(100);
      }

      phraseOut.value = phrase;
      const secs = Math.pow(2, Math.max(bits - 1, 0)) / 1e10;
      $("phraseInfo").textContent = `≈ ${Math.round(bits)} bits de entropía con esta lista de ${WORDS.length} palabras · se tardaría ${humanTime(secs)} en descifrarla.`;
    }

    [words, sep, cap, num].forEach((el) => el.addEventListener("input", makePhrase));
    $("phraseRegen").addEventListener("click", makePhrase);
    $("phraseCopy").addEventListener("click", () => copyText(phraseOut.value));

    makePin();
    makePhrase();
  }

  /* ==========================================================
     DETECTOR DE FILTRACIONES (SIMULADO)
     ========================================================== */
  function initLeakDetector() {
    const input = $("leakEmail");
    const btn = $("leakBtn");
    const scan = $("leakScan");
    const scanText = $("leakScanText");
    const result = $("leakResult");
    let busy = false;

    const BREACHES = [
      { name: "MegaTienda", year: 2019, data: ["Correo", "Contraseña (hash)", "Nombre"] },
      { name: "RedSocialX", year: 2021, data: ["Correo", "Teléfono", "Fecha de nacimiento"] },
      { name: "AppFitness", year: 2022, data: ["Correo", "Contraseña", "Peso y estatura"] },
      { name: "JuegosOnlineYa", year: 2020, data: ["Correo", "Usuario", "Dirección IP"] },
      { name: "NubeNotas", year: 2023, data: ["Correo", "Notas privadas", "Contraseña (hash)"] },
    ];

    const ADVICE = [
      "Cambia la contraseña de las cuentas afectadas y de cualquiera donde la hayas repetido.",
      "Activa la verificación en dos pasos.",
      "Usa un gestor de contraseñas para tener una clave distinta en cada sitio.",
      "Desconfía de correos que mencionen datos tuyos: los atacantes los usan para sonar creíbles.",
    ];

    function showError(msg) {
      result.hidden = false;
      result.textContent = "";
      result.appendChild(h("p", "note note--error", msg));
    }

    function render(email) {
      const hash = fnv(email);
      const roll = hash % 100;
      result.hidden = false;
      result.textContent = "";

      if (roll < 30) {
        const ok = h("div", "risk risk--ok");
        ok.append(h("span", "risk__icon", "✔"));
        const t = h("div");
        t.append(h("strong", "", "Sin coincidencias"), h("span", "", "Tu correo no aparece en las bases ficticias de esta demo."));
        ok.appendChild(t);
        result.append(ok, h("p", "note", "Resultado simulado. Revisa también un servicio real y mantén tus buenas prácticas."));
        return;
      }

      const count = 1 + ((hash >>> 8) % 3);
      const first = (hash >>> 4) % BREACHES.length;
      const found = Array.from({ length: count }, (_, i) => BREACHES[(first + i) % BREACHES.length]);

      const head = h("div", "risk risk--bad");
      head.append(h("span", "risk__icon", "✖"));
      const t = h("div");
      t.append(
        h("strong", "", `Aparece en ${count} filtración${count === 1 ? "" : "es"} (simulado)`),
        h("span", "", "Estos datos son ficticios y se generan a partir de tu correo.")
      );
      head.appendChild(t);
      result.appendChild(head);

      const list = h("div", "breaches");
      found.forEach((b) => {
        const card = h("article", "breach");
        const top = h("div", "breach__top");
        top.append(h("strong", "", b.name), h("span", "breach__year", String(b.year)));
        const tags = h("div", "breach__tags");
        b.data.forEach((d) => {
          const risky = /contraseña/i.test(d);
          tags.appendChild(h("span", `tag${risky ? " tag--risk" : ""}`, d));
        });
        card.append(top, h("p", "breach__label", "Datos expuestos:"), tags);
        list.appendChild(card);
      });
      result.appendChild(list);

      result.appendChild(h("h3", "subtitle", "Qué hacer en un caso real"));
      const adv = h("ul", "advice");
      ADVICE.forEach((a) => adv.appendChild(h("li", "", a)));
      result.appendChild(adv);
    }

    async function check() {
      if (busy) return;
      const email = input.value.trim().toLowerCase();
      result.hidden = true;

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        showError("Escribe un correo válido, por ejemplo nombre@dominio.com.");
        return;
      }

      busy = true;
      btn.disabled = true;
      scan.hidden = false;

      const steps = ["Conectando con bases ficticias...", "Comparando huellas del correo...", "Analizando resultados..."];
      for (const step of steps) {
        scanText.textContent = step;
        await sleep(reduceMotion ? 0 : 600);
      }

      scan.hidden = true;
      busy = false;
      btn.disabled = false;
      render(email);
    }

    btn.addEventListener("click", check);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") check();
    });
  }

  /* ==========================================================
     GLOSARIO
     ========================================================== */
  function initGlossary() {
    const TERMS = [
      ["Phishing", "Mensajes falsos que imitan a una empresa o persona de confianza para que entregues contraseñas o datos."],
      ["Malware", "Cualquier programa diseñado para dañar, espiar o tomar control de un dispositivo."],
      ["Ransomware", "Malware que cifra tus archivos y exige un pago para devolverlos."],
      ["Spyware", "Software que espía lo que haces y envía esa información a un tercero."],
      ["Troyano", "Programa que parece legítimo pero oculta funciones maliciosas."],
      ["Virus", "Código malicioso que se copia a sí mismo al abrir archivos infectados."],
      ["Gusano", "Malware que se propaga solo por redes sin que nadie lo ejecute."],
      ["Botnet", "Red de dispositivos infectados controlados a distancia para lanzar ataques."],
      ["Firewall", "Cortafuegos: filtra el tráfico de red permitiendo o bloqueando conexiones según reglas."],
      ["VPN", "Red privada virtual: cifra tu conexión y oculta tu dirección real, útil en redes públicas."],
      ["2FA / MFA", "Verificación en dos o más pasos: además de la contraseña, pide un código o dispositivo."],
      ["Cifrado", "Proceso que convierte la información en un código ilegible sin la clave correcta."],
      ["Hash", "Huella digital de un dato: siempre da el mismo resultado y no se puede revertir fácilmente."],
      ["Salt", "Dato aleatorio que se añade a una contraseña antes de aplicar el hash para dificultar ataques."],
      ["Vulnerabilidad", "Fallo en un sistema o programa que puede ser aprovechado por un atacante."],
      ["Exploit", "Técnica o código que aprovecha una vulnerabilidad."],
      ["Zero-day", "Vulnerabilidad desconocida para el fabricante, sin parche disponible todavía."],
      ["Parche", "Actualización que corrige una vulnerabilidad o un error."],
      ["Ingeniería social", "Manipulación psicológica para que una persona revele información o realice una acción."],
      ["DDoS", "Ataque que satura un servicio con tráfico masivo para dejarlo fuera de línea."],
      ["Keylogger", "Programa o dispositivo que registra lo que escribes en el teclado."],
      ["Inyección SQL", "Ataque web que introduce instrucciones en un formulario para manipular la base de datos."],
      ["XSS", "Cross-site scripting: inserción de scripts maliciosos en páginas que otros usuarios visitan."],
      ["Man-in-the-middle", "Atacante que se coloca entre dos partes para espiar o alterar su comunicación."],
      ["Pentesting", "Prueba de penetración: simulación autorizada de ataques para encontrar fallos antes que un delincuente."],
      ["Hacker ético", "Profesional que busca vulnerabilidades con permiso para ayudar a corregirlas."],
      ["Honeypot", "Sistema señuelo que atrae atacantes para estudiar sus métodos."],
      ["Backdoor", "Puerta trasera: acceso oculto que evita los controles normales de seguridad."],
      ["HTTPS / TLS", "Protocolo que cifra la comunicación entre tu navegador y un sitio web."],
      ["Gestor de contraseñas", "Aplicación que guarda y genera claves únicas, protegidas por una sola contraseña maestra."],
    ].sort((a, b) => a[0].localeCompare(b[0], "es"));

    const list = $("glossList");
    const search = $("glossSearch");

    function render() {
      const q = plain(search.value.trim());
      const shown = TERMS.filter(([t, d]) => !q || plain(t).includes(q) || plain(d).includes(q));

      list.textContent = "";
      shown.forEach(([term, def]) => {
        const item = h("details", "gloss__item");
        item.appendChild(h("summary", "gloss__term", term));
        item.appendChild(h("p", "gloss__def", def));
        list.appendChild(item);
      });

      $("glossCount").textContent = `${shown.length} de ${TERMS.length} términos`;
      $("glossEmpty").hidden = shown.length > 0;
    }

    search.addEventListener("input", render);
    render();
  }

  /* ==========================================================
     TIPOS DE ATAQUES
     ========================================================== */
  function initAttacks() {
    const ATTACKS = [
      {
        icon: "🎣", name: "Phishing", target: "personas", risk: 3,
        what: "El atacante envía correos, SMS o mensajes que imitan a un banco, una tienda o un compañero para que entregues datos o hagas clic en un enlace falso.",
        defend: "Revisa el remitente y el dominio, desconfía de la urgencia, no abras adjuntos inesperados y entra a los sitios escribiendo tú la dirección.",
      },
      {
        icon: "🔒", name: "Ransomware", target: "personas", risk: 3,
        what: "Un programa cifra tus archivos y pide dinero a cambio de la clave. Suele entrar por adjuntos o descargas infectadas.",
        defend: "Haz copias de seguridad desconectadas del equipo, mantén todo actualizado y no ejecutes archivos de origen dudoso.",
      },
      {
        icon: "🧠", name: "Ingeniería social", target: "personas", risk: 3,
        what: "En lugar de atacar un sistema, se engaña a una persona con mentiras, presión o falsa autoridad para que ceda acceso.",
        defend: "Verifica la identidad por otro canal, no compartas claves con nadie y toma tu tiempo ante cualquier petición urgente.",
      },
      {
        icon: "🔑", name: "Fuerza bruta y credential stuffing", target: "personas", risk: 2,
        what: "Se prueban miles de contraseñas, o claves filtradas de otros sitios, hasta acertar con una cuenta.",
        defend: "Usa una clave única y larga por cuenta, activa la verificación en dos pasos y limita los intentos fallidos.",
      },
      {
        icon: "🕵️", name: "Spyware y keyloggers", target: "personas", risk: 2,
        what: "Programas ocultos que registran lo que escribes, ven tu pantalla o recopilan tus datos sin que lo notes.",
        defend: "Instala apps solo de fuentes oficiales, usa protección antimalware y revisa los permisos de tus aplicaciones.",
      },
      {
        icon: "💉", name: "Inyección SQL", target: "webs", risk: 3,
        what: "Un formulario web mal protegido deja que alguien introduzca instrucciones que la base de datos obedece, exponiendo o alterando información.",
        defend: "Usa consultas parametrizadas, valida y limpia toda entrada y da a la aplicación solo los permisos mínimos.",
      },
      {
        icon: "📜", name: "XSS (Cross-Site Scripting)", target: "webs", risk: 2,
        what: "Se logra que una página muestre código malicioso que luego se ejecuta en el navegador de otros visitantes.",
        defend: "Escapa siempre lo que se muestra, aplica una política CSP y nunca confíes en datos enviados por el usuario.",
      },
      {
        icon: "🌊", name: "DDoS", target: "redes", risk: 2,
        what: "Miles de dispositivos envían peticiones al mismo tiempo hasta saturar un servicio y dejarlo inaccesible.",
        defend: "Usa servicios de mitigación y CDN, limita la tasa de peticiones y ten capacidad de respuesta preparada.",
      },
      {
        icon: "📡", name: "Man-in-the-middle", target: "redes", risk: 2,
        what: "El atacante se interpone entre tú y un sitio, por ejemplo en una wifi pública, para leer o modificar lo que se envía.",
        defend: "Comprueba que la web use HTTPS, evita redes públicas para tareas sensibles y usa una VPN de confianza.",
      },
    ];

    const RISK = { 1: "Bajo", 2: "Alto", 3: "Crítico" };
    const list = $("attackList");
    let target = "todos";

    function render() {
      list.textContent = "";
      ATTACKS.filter((a) => target === "todos" || a.target === target).forEach((a) => {
        const card = h("details", "atk");

        const sum = h("summary", "atk__head");
        sum.append(h("span", "atk__icon", a.icon));
        const title = h("span", "atk__title");
        title.append(h("strong", "", a.name), h("small", "", `Objetivo: ${a.target}`));
        sum.appendChild(title);
        sum.appendChild(h("span", `atk__risk atk__risk--${a.risk}`, `Riesgo ${RISK[a.risk]}`));
        card.appendChild(sum);

        const body = h("div", "atk__body");
        body.append(
          h("h4", "", "Cómo funciona"),
          h("p", "", a.what),
          h("h4", "atk__defend", "Cómo defenderte"),
          h("p", "", a.defend)
        );
        card.appendChild(body);
        list.appendChild(card);
      });
    }

    document.querySelectorAll("[data-target]").forEach((chip) => {
      chip.addEventListener("click", () => {
        target = chip.dataset.target;
        document.querySelectorAll("[data-target]").forEach((c) => c.classList.toggle("is-active", c === chip));
        render();
      });
    });

    render();
  }

  /* ==========================================================
     GUÍA DE BUENAS PRÁCTICAS (checklist con progreso)
     ========================================================== */
  function initChecklist() {
    const KEY = "cibershield-checklist";
    const GROUPS = [
      ["🔑 Cuentas", [
        ["pass-unique", "Uso una contraseña distinta en cada cuenta"],
        ["pass-manager", "Guardo mis claves en un gestor de contraseñas"],
        ["twofa", "Tengo verificación en dos pasos en mi correo y mi banco"],
        ["sessions", "Reviso de vez en cuando las sesiones abiertas en mis cuentas"],
      ]],
      ["📱 Dispositivos", [
        ["updates", "Mantengo actualizado el sistema y mis aplicaciones"],
        ["lock", "Mi teléfono y mi computador tienen bloqueo de pantalla"],
        ["malware", "Tengo protección antimalware activa"],
        ["encrypt", "Mi disco o teléfono está cifrado"],
      ]],
      ["🌐 Navegación", [
        ["https", "Compruebo el candado y el dominio antes de dar datos"],
        ["links", "No hago clic en enlaces de mensajes inesperados"],
        ["downloads", "Descargo programas solo de sitios oficiales"],
      ]],
      ["📶 Red", [
        ["router", "Cambié la contraseña por defecto de mi router"],
        ["publicwifi", "Evito la wifi pública para banca y cuentas importantes"],
      ]],
      ["💾 Datos", [
        ["backup", "Hago copias de seguridad de lo importante (regla 3-2-1)"],
        ["permissions", "Reviso los permisos que piden mis aplicaciones"],
      ]],
    ];

    const total = GROUPS.reduce((n, g) => n + g[1].length, 0);
    let state = {};
    try {
      state = JSON.parse(storageGet(KEY) || "{}") || {};
    } catch (e) {
      state = {};
    }

    const listEl = $("bestList");

    function updateScore() {
      const done = GROUPS.flatMap((g) => g[1]).filter(([id]) => state[id]).length;
      const pct = Math.round((done / total) * 100);

      $("bestPct").textContent = `${pct}%`;
      $("bestRing").style.setProperty("--p", pct);
      $("bestCount").textContent = `${done} de ${total} hábitos`;

      let label = "Principiante";
      if (pct >= 90) label = "Blindado 🛡️";
      else if (pct >= 60) label = "Protegido";
      else if (pct >= 25) label = "En camino";
      $("bestLabel").textContent = label;
    }

    GROUPS.forEach(([title, items]) => {
      const group = h("div", "bp");
      group.appendChild(h("h3", "subtitle", title));
      const ul = h("ul", "bp__list");

      items.forEach(([id, text]) => {
        const li = h("li");
        const label = h("label", "check");
        const box = document.createElement("input");
        box.type = "checkbox";
        box.checked = Boolean(state[id]);
        box.addEventListener("change", () => {
          state[id] = box.checked;
          storageSet(KEY, JSON.stringify(state));
          updateScore();
        });
        label.append(box, h("span", "", text));
        li.appendChild(label);
        ul.appendChild(li);
      });

      group.appendChild(ul);
      listEl.appendChild(group);
    });

    $("bestReset").addEventListener("click", () => {
      state = {};
      storageSet(KEY, "{}");
      listEl.querySelectorAll("input[type=checkbox]").forEach((b) => (b.checked = false));
      updateScore();
      toast("Progreso reiniciado");
    });

    updateScore();
  }

  /* ==========================================================
     10. INICIO
     ========================================================== */
  initTheme();
  initTabs();
  initPasswordAnalyzer();
  initGenerator();
  initPinGenerator();
  initHash();
  initEncoder();
  initLinkChecker();
  initLeakDetector();
  initQuiz();
  initTerminal();
  initGlossary();
  initAttacks();
  initChecklist();
  initEffects();
  startClock();
  showTip();
  $("tipBtn").addEventListener("click", showTip);

  // El texto del hero se escribe solo cuando termina la intro
  if (!reduceMotion) $("typeTag").textContent = "";

  runIntro(() => {
    startRain();
    typeTag();
    countUp();
  });
})();
