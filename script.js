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

  /* ---------- Fondo: lluvia binaria suave ---------- */
  function startRain() {
    if (reduceMotion) return;

    const canvas = $("rain");
    const ctx = canvas.getContext("2d");
    const fontSize = 16;
    let w, h, cols, drops;

    function setup() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      cols = Math.floor(w / fontSize);
      drops = Array.from({ length: cols }, () => Math.random() * -40);
      ctx.fillStyle = "#05070d";
      ctx.fillRect(0, 0, w, h);
    }

    setup();
    window.addEventListener("resize", setup);

    let last = 0;
    function draw(t) {
      requestAnimationFrame(draw);
      if (t - last < 55) return; // limita los cuadros por segundo
      last = t;

      ctx.fillStyle = "rgba(5, 7, 13, 0.14)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < cols; i++) {
        ctx.fillStyle = i % 2 ? "#2f8bff" : "#00f5a0";
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
     3. PESTAÑAS
     ========================================================== */
  function initTabs() {
    const tabs = Array.from(document.querySelectorAll(".tab"));

    function select(tab, focus) {
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle("is-active", active);
        t.setAttribute("aria-selected", String(active));
        t.tabIndex = active ? 0 : -1;
        $(t.getAttribute("aria-controls")).hidden = !active;
      });
      if (focus) tab.focus();
      tab.scrollIntoView({ block: "nearest", inline: "center", behavior: reduceMotion ? "auto" : "smooth" });
      if (tab.dataset.tab === "term") $("termInput").focus({ preventScroll: true });
    }

    tabs.forEach((tab, i) => {
      tab.addEventListener("click", () => select(tab, false));
      tab.addEventListener("keydown", (e) => {
        let next = null;
        if (e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
        if (e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === "Home") next = tabs[0];
        if (e.key === "End") next = tabs[tabs.length - 1];
        if (next) {
          e.preventDefault();
          select(next, true);
        }
      });
    });
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
     10. INICIO
     ========================================================== */
  initTabs();
  initPasswordAnalyzer();
  initGenerator();
  initHash();
  initEncoder();
  initQuiz();
  initTerminal();
  startClock();
  showTip();
  $("tipBtn").addEventListener("click", showTip);

  runIntro(startRain);
})();
