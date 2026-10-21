(function () {
  "use strict";

  const C = window.CONTENT;
  const app = document.getElementById("app");
  const live = document.getElementById("live");

  // How much each cooling tool lowers the heat.
  const TOOLS = [
    { key: "breathe", emoji: "🌬️", drop: 2 },
    { key: "drink", emoji: "🥤", drop: 1 },
    { key: "wait", emoji: "⏳", drop: 2 },
    { key: "steamOut", emoji: "💨", drop: 1 },
    { key: "sauce", emoji: "🍯", drop: 1 },
  ];
  const PACES = { slow: [5, 7], normal: [4, 6], quick: [3, 5] };

  // Everything lives in memory only. Refreshing the page resets it all.
  const state = {
    screen: null,
    params: {},
    history: [],
    food: "nuggets",
    heat: 3,
    bodySpots: new Set(),
    used: new Set(),
    timers: [],
    cleanups: [],
    settings: {
      sound: false,
      reduceMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      largeText: false,
      waitSeconds: 60,
      breathRounds: 3,
      breathPace: "normal",
    },
  };

  /* ---------------- helpers ---------------- */

  const fmt = (s, vars = {}) => String(s).replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  const foodName = () => C.foods[state.food].name;
  const $ = (root, sel) => root.querySelector(sel);
  const $$ = (root, sel) => Array.from(root.querySelectorAll(sel));
  const later = (fn, ms) => state.timers.push(setTimeout(fn, ms));
  const every = (fn, ms) => {
    const id = setInterval(fn, ms);
    state.timers.push(id);
    return id;
  };
  const pick = (list, not) => {
    const options = list.length > 1 ? list.filter((x) => x !== not) : list;
    return options[Math.floor(Math.random() * options.length)];
  };
  const joinWords = (words) =>
    words.length <= 1 ? words.join("") : `${words.slice(0, -1).join(", ")} ${C.steamOut.and} ${words[words.length - 1]}`;

  function food(heat, cls = "", key = state.food) {
    return `<div class="food ${cls}">${window.drawFood(key, heat)}</div>`;
  }
  function setFood(wrap, heat) {
    wrap.innerHTML = window.drawFood(state.food, heat);
    restartAnim(wrap, "pop");
  }
  function restartAnim(node, cls) {
    node.classList.remove(cls);
    void node.offsetWidth;
    node.classList.add(cls);
  }

  /* ---------------- sound (generated, no files) ---------------- */

  let audioCtx = null;
  function audio() {
    if (!state.settings.sound) return null;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = audioCtx || new AC();
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }
  function tone(freq, dur, delay = 0, type = "sine", vol = 0.14) {
    const ctx = audio();
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(vol, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }
  const sfx = {
    tap: () => tone(560, 0.09, 0, "triangle", 0.08),
    chime: () => {
      tone(660, 0.3);
      tone(880, 0.45, 0.14);
      tone(1320, 0.5, 0.28, "sine", 0.06);
    },
    whoosh(seconds) {
      const ctx = audio();
      if (!ctx) return;
      const len = Math.floor(ctx.sampleRate * seconds);
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 700;
      const gain = ctx.createGain();
      const t = ctx.currentTime;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.12, t + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + seconds);
      src.connect(filter).connect(gain).connect(ctx.destination);
      src.start(t);
    },
  };

  /* ---------------- navigation ---------------- */

  function go(name, params = {}) {
    if (state.screen) state.history.push({ name: state.screen, params: state.params });
    show(name, params);
  }
  function back() {
    const prev = state.history.pop();
    if (prev) show(prev.name, prev.params, "slide-prev");
  }
  function goHome() {
    state.history = [];
    show("home");
  }
  function startTool() {
    state.heat = 3;
    state.bodySpots.clear();
    state.used.clear();
    go("pick");
  }

  function show(name, params = {}, anim = "") {
    state.timers.forEach((id) => {
      clearTimeout(id);
      clearInterval(id);
    });
    state.timers = [];
    state.cleanups.forEach((fn) => fn());
    state.cleanups = [];

    state.screen = name;
    state.params = params;
    const view = screens[name](params);
    app.innerHTML = `<section class="screen ${view.top ? "top" : ""} ${anim}">${view.html}</section>`;
    const root = app.firstElementChild;
    if (view.mount) view.mount(root);

    document.getElementById("btn-back").hidden = state.history.length === 0;
    document.getElementById("btn-home").hidden = name === "home";

    window.scrollTo(0, 0);
    const h1 = $(root, "h1");
    if (h1) {
      h1.setAttribute("tabindex", "-1");
      h1.focus({ preventScroll: true });
      live.textContent = h1.textContent;
    }
  }

  /* ---------------- shared pieces ---------------- */

  function meterHtml(selected) {
    return `<div class="meter" role="group" aria-label="${C.heat.title}">
      ${C.heat.levels
        .map((label, i) => {
          const n = i + 1;
          return `<button type="button" data-heat="${n}" aria-pressed="${n === selected}"
            style="--level:${window.HEAT_COLORS[n]}" aria-label="${n}: ${label}">
            <span class="num">${n}</span><span class="lbl">${label}</span></button>`;
        })
        .join("")}
    </div>`;
  }
  function mountMeter(root, onChange) {
    $$(root, ".meter button").forEach((btn) =>
      btn.addEventListener("click", () => {
        const n = Number(btn.dataset.heat);
        $$(root, ".meter button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
        state.heat = n;
        sfx.tap();
        onChange(n);
      })
    );
  }

  function finishTool(key) {
    state.used.add(key);
    const tool = TOOLS.find((t) => t.key === key);
    const from = state.heat;
    const to = Math.max(1, from - tool.drop);
    go("cooled", { from, to });
  }

  function ideaScreen(section, emoji, animCls) {
    const S = C[section];
    let current = pick(S.ideas);
    return {
      html: `
        <h1>${S.title}</h1>
        <span class="${animCls}" aria-hidden="true">${emoji}</span>
        <p class="subtitle">${S.subtitle}</p>
        <div class="idea" aria-live="polite">${current}</div>
        <div class="btn-row">
          <button type="button" class="btn ghost" data-act="new">🎲 ${S.newIdea}</button>
          <button type="button" class="btn cool" data-act="done">${S.done}</button>
        </div>`,
      mount(root) {
        const box = $(root, ".idea");
        $(root, '[data-act="new"]').addEventListener("click", () => {
          current = pick(S.ideas, current);
          box.textContent = current;
          restartAnim(box, "pop");
          sfx.tap();
        });
        $(root, '[data-act="done"]').addEventListener("click", () => finishTool(section));
      },
    };
  }

  /* ---------------- screens ---------------- */

  const screens = {
    home() {
      return {
        html: `
          ${food(4, "large bounce", "nuggets")}
          <h1 class="title-big">${C.appTitle}</h1>
          <p class="subtitle">${C.tagline}</p>
          <div class="btn-stack">
            <button type="button" class="btn big cool" data-act="tool">🔥 ${C.home.tool}</button>
            <button type="button" class="btn big" data-act="story">📖 ${C.home.story}</button>
          </div>`,
        mount(root) {
          $(root, '[data-act="story"]').addEventListener("click", () => go("story", { page: 0 }));
          $(root, '[data-act="tool"]').addEventListener("click", startTool);
        },
      };
    },

    story({ page = 0 }) {
      const p = C.story[page];
      const last = page === C.story.length - 1;
      const turn = (to) => {
        if (to < 0) return;
        if (to >= C.story.length) return startTool();
        sfx.tap();
        show("story", { page: to }, to > page ? "slide-next" : "slide-prev");
      };
      return {
        html: `
          <div class="dots" aria-hidden="true">${C.story.map((_, i) => `<i class="${i === page ? "on" : ""}"></i>`).join("")}</div>
          <div class="food ${p.heat === 1 ? "bounce" : ""}">${window.drawFood("nuggets", p.heat)}
            ${p.burst ? `<span class="burst">${p.burst}</span>` : ""}</div>
          <div class="props" aria-hidden="true">${(p.props || []).map((e) => `<span>${e}</span>`).join("")}</div>
          <div class="story-card"><h1>${p.title}</h1><p>${p.text}</p></div>
          <div class="btn-row">
            ${page > 0 ? `<button type="button" class="btn ghost" data-act="prev">← ${C.nav.back}</button>` : ""}
            <button type="button" class="btn ${last ? "cool big" : ""}" data-act="next">${last ? C.storyEnd : `${C.nav.next} →`}</button>
          </div>`,
        mount(root) {
          const prev = $(root, '[data-act="prev"]');
          if (prev) prev.addEventListener("click", () => turn(page - 1));
          $(root, '[data-act="next"]').addEventListener("click", () => turn(page + 1));

          let startX = null;
          root.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
          root.addEventListener("touchend", (e) => {
            if (startX === null) return;
            const dx = e.changedTouches[0].clientX - startX;
            startX = null;
            if (Math.abs(dx) > 60) turn(dx < 0 ? page + 1 : page - 1);
          });
          const onKey = (e) => {
            if (document.getElementById("settings").hidden === false) return;
            if (e.key === "ArrowRight") turn(page + 1);
            if (e.key === "ArrowLeft") turn(page - 1);
          };
          document.addEventListener("keydown", onKey);
          state.cleanups.push(() => document.removeEventListener("keydown", onKey));
        },
      };
    },

    pick() {
      return {
        html: `
          <h1>${C.pickFood.title}</h1>
          <p class="subtitle">${C.pickFood.subtitle}</p>
          <div class="grid two">
            ${Object.keys(window.FOODS)
              .filter((k) => C.foods[k])
              .map(
                (k) => `<button type="button" class="card food-card" data-food="${k}">
                  ${food(3, "", k)}<span class="name">${C.foods[k].name}</span></button>`
              )
              .join("")}
          </div>`,
        mount(root) {
          $$(root, "[data-food]").forEach((card) =>
            card.addEventListener("click", () => {
              state.food = card.dataset.food;
              card.setAttribute("aria-pressed", "true");
              restartAnim($(card, ".food"), "wiggle");
              sfx.tap();
              later(() => go("heat"), 500);
            })
          );
        },
      };
    },

    heat() {
      return {
        html: `
          <h1>${C.heat.title}</h1>
          <p class="subtitle">${C.heat.subtitle}</p>
          ${food(state.heat)}
          ${meterHtml(state.heat)}
          <button type="button" class="btn big cool" data-act="next">${C.nav.next} →</button>`,
        mount(root) {
          const wrap = $(root, ".food");
          mountMeter(root, (n) => setFood(wrap, n));
          $(root, '[data-act="next"]').addEventListener("click", () => go("body"));
        },
      };
    },

    body() {
      const B = C.body;
      const spots = {
        face: [[100, 58]],
        chest: [[100, 118]],
        tummy: [[100, 165]],
        hands: [[32, 196], [168, 196]],
        feet: [[78, 300], [122, 300]],
      };
      const fill = "#cdbdf0";
      const svg = `<svg class="body-svg" viewBox="0 0 200 320" aria-hidden="true">
        <g fill="${fill}" stroke="${fill}" stroke-linecap="round">
          <path d="M 64 112 L 32 192" stroke-width="26" fill="none"/>
          <path d="M 136 112 L 168 192" stroke-width="26" fill="none"/>
          <path d="M 84 196 L 80 296" stroke-width="30" fill="none"/>
          <path d="M 116 196 L 120 296" stroke-width="30" fill="none"/>
          <rect x="58" y="92" width="84" height="116" rx="36" stroke="none"/>
          <circle cx="100" cy="54" r="36" stroke="none"/>
        </g>
        <circle cx="88" cy="50" r="3.5" fill="#3b2a24"/><circle cx="112" cy="50" r="3.5" fill="#3b2a24"/>
        <path d="M 90 66 q 10 6 20 0" stroke="#3b2a24" stroke-width="3" fill="none" stroke-linecap="round"/>
        ${Object.entries(spots)
          .map(
            ([k, pts]) => `<g class="spot ${state.bodySpots.has(k) ? "on" : ""}" data-spot="${k}">
              ${pts.map(([x, y]) => `<circle class="glow" cx="${x}" cy="${y}" r="26"/><circle class="dot" cx="${x}" cy="${y}" r="11"/>`).join("")}
            </g>`
          )
          .join("")}
      </svg>`;
      return {
        top: true,
        html: `
          <h1>${B.title}</h1>
          <p class="subtitle">${B.subtitle}</p>
          <div class="body-wrap">
            ${svg}
            <div class="chips">
              ${Object.keys(spots)
                .map((k) => `<button type="button" class="chip" data-spot="${k}" aria-pressed="${state.bodySpots.has(k)}">${B.spots[k]}</button>`)
                .join("")}
            </div>
          </div>
          <div class="btn-row">
            <button type="button" class="btn ghost" data-act="skip">${B.skip}</button>
            <button type="button" class="btn cool" data-act="next">${B.next} →</button>
          </div>`,
        mount(root) {
          const toggle = (k) => {
            if (state.bodySpots.has(k)) state.bodySpots.delete(k);
            else state.bodySpots.add(k);
            const on = state.bodySpots.has(k);
            $$(root, `[data-spot="${k}"]`).forEach((n) => {
              if (n.classList.contains("chip")) n.setAttribute("aria-pressed", String(on));
              else n.classList.toggle("on", on);
            });
            sfx.tap();
          };
          $$(root, "[data-spot]").forEach((n) => n.addEventListener("click", () => toggle(n.dataset.spot)));
          $(root, '[data-act="skip"]').addEventListener("click", () => go("toolbox"));
          $(root, '[data-act="next"]').addEventListener("click", () => go("toolbox"));
        },
      };
    },

    toolbox() {
      const tools = C.toolbox.tools;
      return {
        top: true,
        html: `
          ${food(state.heat, "small")}
          <h1>${C.toolbox.title}</h1>
          <p class="subtitle">${fmt(C.toolbox.subtitle, { food: foodName().toLowerCase() })}</p>
          <div class="grid two tool-grid">
            ${TOOLS.map(
              (t) => `<button type="button" class="card" data-tool="${t.key}">
                <span class="emoji" aria-hidden="true">${t.emoji}</span>
                <span class="name">${tools[t.key].name}${state.used.has(t.key) ? " ✓" : ""}</span>
                <span class="desc">${tools[t.key].desc}</span></button>`
            ).join("")}
          </div>`,
        mount(root) {
          $$(root, "[data-tool]").forEach((card) =>
            card.addEventListener("click", () => {
              sfx.tap();
              go(card.dataset.tool);
            })
          );
        },
      };
    },

    breathe() {
      const S = C.breathe;
      const rounds = state.settings.breathRounds;
      const [inhale, exhale] = PACES[state.settings.breathPace];
      return {
        html: `
          <h1>${S.title}</h1>
          <p class="subtitle">${S.subtitle}</p>
          <div class="breathe-stage">
            ${food(state.heat, "small")}
            <div class="breath-circle"><span class="count" aria-hidden="true">🌬️</span></div>
          </div>
          <p class="breath-text" aria-live="polite">${S.ready}</p>
          <p class="round"></p>
          <button type="button" class="btn big cool" data-act="start">${S.start}</button>`,
        mount(root) {
          const wrap = $(root, ".food");
          const circle = $(root, ".breath-circle");
          const count = $(root, ".count");
          const text = $(root, ".breath-text");
          const roundText = $(root, ".round");
          const startBtn = $(root, '[data-act="start"]');
          let ticker = null;

          const countdown = (secs) => {
            clearInterval(ticker);
            let left = secs;
            count.textContent = left;
            ticker = every(() => {
              left -= 1;
              if (left > 0) count.textContent = left;
            }, 1000);
          };

          const runRound = (r) => {
            roundText.textContent = fmt(S.round, { n: r + 1, total: rounds });
            // breathe in
            text.textContent = S.inhale;
            wrap.classList.remove("blowing");
            circle.style.transitionDuration = `${inhale}s`;
            circle.classList.add("in");
            countdown(inhale);
            later(() => {
              // blow it out
              text.textContent = S.exhale;
              circle.style.transitionDuration = `${exhale}s`;
              circle.classList.remove("in");
              wrap.classList.add("blowing");
              sfx.whoosh(exhale);
              countdown(exhale);
              later(() => {
                wrap.style.setProperty("--steam", String(1 - 0.6 * ((r + 1) / rounds)));
                if (r + 1 < rounds) return runRound(r + 1);
                clearInterval(ticker);
                wrap.classList.remove("blowing");
                count.textContent = "✓";
                text.textContent = S.done;
                sfx.chime();
                later(() => finishTool("breathe"), 1200);
              }, exhale * 1000);
            }, inhale * 1000);
          };

          startBtn.addEventListener("click", () => {
            startBtn.hidden = true;
            runRound(0);
          });
        },
      };
    },

    drink: () => ideaScreen("drink", "🥤", "sip"),
    sauce: () => ideaScreen("sauce", "🍯", "sip"),

    wait() {
      const S = C.wait;
      const total = state.settings.waitSeconds;
      const R = 46;
      const CIRC = 2 * Math.PI * R;
      const clock = (s) => `${Math.floor(s / 60)}:${String(Math.ceil(s) % 60).padStart(2, "0")}`;
      return {
        html: `
          <h1>${S.title}</h1>
          <p class="subtitle">${S.subtitle}</p>
          <div class="timer-wrap">
            <svg class="ring" viewBox="0 0 100 100" aria-hidden="true">
              <circle class="track" cx="50" cy="50" r="${R}" fill="none" stroke-width="6"/>
              <circle class="bar" cx="50" cy="50" r="${R}" fill="none" stroke-width="6" stroke-linecap="round"
                stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC}"/>
            </svg>
            ${food(state.heat)}
          </div>
          <p class="time" role="timer">${clock(total)}</p>
          <div class="btn-row">
            <button type="button" class="btn big cool" data-act="toggle">${S.start}</button>
            <button type="button" class="btn ghost" data-act="early" hidden>${S.finishEarly}</button>
          </div>`,
        mount(root) {
          const bar = $(root, ".bar");
          const wrap = $(root, ".food");
          const time = $(root, ".time");
          const toggle = $(root, '[data-act="toggle"]');
          const early = $(root, '[data-act="early"]');
          let elapsed = 0;
          let running = false;
          let last = 0;
          let ticker = null;

          const draw = () => {
            const p = Math.min(1, elapsed / total);
            bar.setAttribute("stroke-dashoffset", String(CIRC * (1 - p)));
            wrap.style.setProperty("--steam", String(1 - 0.7 * p));
            time.textContent = clock(Math.max(0, total - elapsed));
          };
          const done = () => {
            clearInterval(ticker);
            time.textContent = S.timeUp;
            toggle.hidden = true;
            early.hidden = true;
            sfx.chime();
            later(() => finishTool("wait"), 1200);
          };

          toggle.addEventListener("click", () => {
            running = !running;
            toggle.textContent = running ? S.pause : S.resume;
            early.hidden = false;
            if (running) {
              last = performance.now();
              ticker = every(() => {
                const now = performance.now();
                elapsed += (now - last) / 1000;
                last = now;
                draw();
                if (elapsed >= total) done();
              }, 250);
            } else {
              clearInterval(ticker);
            }
          });
          early.addEventListener("click", () => {
            clearInterval(ticker);
            // Waiting less than half the time cools it a little less.
            if (elapsed < total / 2) {
              state.used.add("wait");
              go("cooled", { from: state.heat, to: Math.max(1, state.heat - 1) });
            } else {
              finishTool("wait");
            }
          });
        },
      };
    },

    steamOut() {
      const S = C.steamOut;
      const chosen = new Set();
      return {
        html: `
          <h1>${S.title}</h1>
          <p class="subtitle">${S.subtitle}</p>
          <div class="food small">${window.drawFood(state.food, state.heat)}<div class="puffs"><i></i><i></i><i></i><i></i><i></i></div></div>
          <div class="grid three">
            ${S.feelings
              .map(
                (f, i) => `<button type="button" class="card cool" data-i="${i}" aria-pressed="false">
                  <span class="emoji" aria-hidden="true">${f.emoji}</span><span class="name">${f.word}</span></button>`
              )
              .join("")}
          </div>
          <p class="prompt-label">${S.prompt}</p>
          <p class="sentence" aria-live="polite">${S.sentenceEmpty}</p>
          <button type="button" class="btn big cool" data-act="done">${S.done}</button>`,
        mount(root) {
          const sentence = $(root, ".sentence");
          $$(root, "[data-i]").forEach((card) =>
            card.addEventListener("click", () => {
              const i = Number(card.dataset.i);
              if (chosen.has(i)) chosen.delete(i);
              else chosen.add(i);
              card.setAttribute("aria-pressed", String(chosen.has(i)));
              const words = [...chosen].sort((a, b) => a - b).map((n) => S.feelings[n].word);
              sentence.textContent = words.length ? fmt(S.sentence, { feelings: joinWords(words) }) : S.sentenceEmpty;
              sfx.tap();
            })
          );
          $(root, '[data-act="done"]').addEventListener("click", () => finishTool("steamOut"));
        },
      };
    },

    cooled({ from, to }) {
      const S = C.cooled;
      return {
        html: `
          ${food(from, "large")}
          <h1>${S.cooling}</h1>
          <button type="button" class="btn big cool" data-act="next" hidden>${S.next} →</button>`,
        mount(root) {
          const wrap = $(root, ".food");
          const h1 = $(root, "h1");
          const next = $(root, '[data-act="next"]');
          state.heat = to;
          let h = from;
          const step = () => {
            if (h > to) {
              h -= 1;
              setFood(wrap, h);
              return later(step, 900);
            }
            h1.textContent = fmt(S.done, { food: foodName().toLowerCase() });
            live.textContent = h1.textContent;
            next.hidden = false;
            sfx.chime();
          };
          later(step, 900);
          next.addEventListener("click", () => go("check"));
        },
      };
    },

    check() {
      const S = C.check;
      return {
        html: `
          <h1>${S.title}</h1>
          <p class="subtitle">${S.subtitle}</p>
          ${food(state.heat)}
          ${meterHtml(state.heat)}
          <p class="note" hidden>${S.stillHot}</p>
          <div class="btn-row">
            <button type="button" class="btn big cool" data-act="next">${S.next} →</button>
            <button type="button" class="btn big" data-act="tools" hidden>${S.tryAnother}</button>
          </div>`,
        mount(root) {
          const wrap = $(root, ".food");
          const note = $(root, ".note");
          const next = $(root, '[data-act="next"]');
          const tools = $(root, '[data-act="tools"]');
          const reset = () => {
            note.hidden = true;
            tools.hidden = true;
            next.hidden = false;
          };
          mountMeter(root, (n) => {
            setFood(wrap, n);
            reset();
          });
          next.addEventListener("click", () => {
            if (state.heat >= 3) {
              note.hidden = false;
              tools.hidden = false;
              next.hidden = true;
              live.textContent = S.stillHot;
              tools.focus();
            } else {
              go("ready");
            }
          });
          tools.addEventListener("click", () => go("toolbox"));
        },
      };
    },

    ready() {
      const S = C.ready;
      return {
        top: true,
        html: `
          ${food(1, "small bounce")}
          <h1>${S.title}</h1>
          <p class="subtitle">${S.subtitle}</p>
          <div class="grid two">
            ${S.choices
              .map(
                (c) => `<button type="button" class="card cool" aria-pressed="false">
                  <span class="emoji" aria-hidden="true">${c.emoji}</span><span class="name">${c.text}</span></button>`
              )
              .join("")}
          </div>
          <button type="button" class="btn big cool" data-act="next">${S.next} →</button>`,
        mount(root) {
          $$(root, ".grid .card").forEach((card) =>
            card.addEventListener("click", () => {
              card.setAttribute("aria-pressed", String(card.getAttribute("aria-pressed") !== "true"));
              sfx.tap();
            })
          );
          $(root, '[data-act="next"]').addEventListener("click", () => go("celebrate"));
        },
      };
    },

    celebrate() {
      const S = C.celebrate;
      return {
        html: `
          ${food(1, "large bounce")}
          <h1 class="title-big">${S.title}</h1>
          <p class="subtitle">${S.text}</p>
          <div class="btn-row">
            <button type="button" class="btn big cool" data-act="again">🔁 ${S.again}</button>
            <button type="button" class="btn big ghost" data-act="story">📖 ${S.story}</button>
          </div>`,
        mount(root) {
          sfx.chime();
          confetti();
          $(root, '[data-act="again"]').addEventListener("click", startTool);
          $(root, '[data-act="story"]').addEventListener("click", () => go("story", { page: 0 }));
        },
      };
    },
  };

  function confetti() {
    if (state.settings.reduceMotion) return;
    const layer = document.getElementById("confetti");
    const colors = ["#ff7a59", "#ffc94d", "#3fa79c", "#8fd0f5", "#cdbdf0", "#ff9b8f"];
    layer.innerHTML = Array.from({ length: 70 }, () => {
      const left = Math.random() * 100;
      const dur = 2.4 + Math.random() * 2;
      const delay = Math.random() * 0.8;
      const color = colors[Math.floor(Math.random() * colors.length)];
      return `<i style="left:${left}%;background:${color};animation-duration:${dur}s;animation-delay:${delay}s"></i>`;
    }).join("");
    later(() => (layer.innerHTML = ""), 5500);
  }

  /* ---------------- settings ---------------- */

  const overlay = document.getElementById("settings");
  const panel = overlay.querySelector(".panel");
  const gear = document.getElementById("btn-settings");

  function applySettings() {
    const s = state.settings;
    document.documentElement.classList.toggle("reduce-motion", s.reduceMotion);
    document.documentElement.classList.toggle("large-text", s.largeText);
    const soundBtn = document.getElementById("btn-sound");
    soundBtn.setAttribute("aria-pressed", String(s.sound));
    soundBtn.setAttribute("aria-label", s.sound ? C.nav.soundOn : C.nav.soundOff);
    document.getElementById("sound-icon").textContent = s.sound ? "🔊" : "🔇";
  }

  function renderSettings() {
    const S = C.settings;
    const s = state.settings;
    const toggle = (key, label) => `<div class="setting"><span id="lbl-${key}">${label}</span>
      <button type="button" class="toggle" role="switch" aria-checked="${s[key]}" aria-labelledby="lbl-${key}" data-toggle="${key}"></button></div>`;
    const select = (key, label, options) => `<label class="setting">${label}
      <select data-select="${key}">${options
        .map(([v, text]) => `<option value="${v}" ${String(s[key]) === String(v) ? "selected" : ""}>${text}</option>`)
        .join("")}</select></label>`;
    panel.innerHTML = `
      <h2 id="settings-title">${S.title}</h2>
      ${toggle("sound", S.sound)}
      ${toggle("reduceMotion", S.reduceMotion)}
      ${toggle("largeText", S.largeText)}
      ${select("waitSeconds", S.waitLength, [
        [30, `30 ${S.seconds}`],
        [60, `1 ${S.minute}`],
        [120, `2 ${S.minutes}`],
        [180, `3 ${S.minutes}`],
      ])}
      ${select("breathRounds", S.breathRounds, [[3, "3"], [4, "4"], [5, "5"]])}
      ${select("breathPace", S.breathPace, Object.keys(PACES).map((k) => [k, S.paces[k]]))}
      <p class="small">${S.note}</p>
      <button type="button" class="btn cool" data-act="close">${S.close}</button>`;

    $$(panel, "[data-toggle]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const key = btn.dataset.toggle;
        s[key] = !s[key];
        btn.setAttribute("aria-checked", String(s[key]));
        applySettings();
        if (key === "sound" && s.sound) sfx.tap();
      })
    );
    $$(panel, "[data-select]").forEach((sel) =>
      sel.addEventListener("change", () => {
        const key = sel.dataset.select;
        s[key] = key === "breathPace" ? sel.value : Number(sel.value);
      })
    );
    $(panel, '[data-act="close"]').addEventListener("click", closeSettings);
  }

  function openSettings() {
    renderSettings();
    overlay.hidden = false;
    $(panel, "button, select").focus();
  }
  function closeSettings() {
    overlay.hidden = true;
    gear.focus();
  }

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeSettings();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) closeSettings();
  });

  /* ---------------- top bar ---------------- */

  $$(document, "[data-text]").forEach((n) => {
    n.textContent = n.dataset.text.split(".").reduce((o, k) => o[k], C);
  });
  document.getElementById("btn-back").setAttribute("aria-label", C.nav.back);
  document.getElementById("btn-home").setAttribute("aria-label", C.nav.home);
  gear.setAttribute("aria-label", C.nav.settings);
  document.getElementById("btn-back").addEventListener("click", back);
  document.getElementById("btn-home").addEventListener("click", goHome);
  gear.addEventListener("click", openSettings);
  document.getElementById("btn-sound").addEventListener("click", () => {
    state.settings.sound = !state.settings.sound;
    applySettings();
    if (state.settings.sound) sfx.tap();
  });

  document.title = C.appTitle;
  applySettings();
  show("home");

  // Lets the app keep working offline once it has been opened. Caches app files only.
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
})();
