// Shared helpers: live connection, clock sync, music, sound effects, confetti.
(() => {
  const G = (window.Game = {});

  // ---------- connection ----------
  G.connect = (url, onMsg, onStatus) => {
    let ws, tries = 0, closed = false, pingId;
    const go = () => {
      ws = new WebSocket(url);
      ws.onopen = () => {
        tries = 0; onStatus && onStatus(true);
        clearInterval(pingId);
        pingId = setInterval(() => ws.readyState === 1 && ws.send('{"t":"ping"}'), 20000);
      };
      ws.onmessage = (e) => {
        let m; try { m = JSON.parse(e.data); } catch { return; }
        if (m.now) G.offset = m.now - Date.now();
        onMsg(m);
      };
      ws.onclose = (e) => {
        clearInterval(pingId);
        onStatus && onStatus(false);
        if (closed || e.code === 4000) return;
        setTimeout(go, Math.min(5000, 400 * 2 ** tries++));
      };
    };
    go();
    return {
      send: (o) => ws && ws.readyState === 1 && ws.send(JSON.stringify(o)),
      close: () => { closed = true; try { ws.close(); } catch {} },
    };
  };
  G.offset = 0;
  G.now = () => Date.now() + G.offset;
  G.esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  G.store = {
    get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };

  // ---------- audio ----------
  let ctx, master, muted = G.store.get("muted") === true;
  const ensure = () => {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.32;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  };
  const mtof = (m) => 440 * 2 ** ((m - 69) / 12);
  const tone = (m, t, dur, type = "square", vol = 0.1) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.value = mtof(m);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  };
  let noiseBuf;
  const noise = (t, dur, vol, freq = 7000) => {
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf; f.type = "highpass"; f.frequency.value = freq;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.02);
  };
  const kick = (t) => {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.15);
    g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.25);
  };

  // Original loops. Each track: bpm + a function scheduling one 16th-note step.
  const TRACKS = {
    lobby: {
      bpm: 104,
      chords: [[48, 52, 55], [45, 48, 52], [41, 45, 48], [43, 47, 50]],
      step(s, t, d) {
        const c = this.chords[Math.floor(s / 16) % 4], i = s % 16;
        if (i % 4 === 0) tone(c[0] - 12, t, d * 3.5, "triangle", 0.22);
        if (i % 2 === 0) tone(c[(i / 2) % 3] + 12, t, d * 1.6, "square", 0.035);
        if ([3, 7, 11, 15].includes(i)) tone(c[2] + 24, t, d * 0.8, "triangle", 0.03);
        if (i === 0 || i === 8) kick(t);
        if (i === 4 || i === 12) noise(t, 0.12, 0.12, 2500);
        if (i % 2 === 1) noise(t, 0.03, 0.04);
      },
    },
    question: {
      bpm: 148,
      chords: [[45, 48, 52], [41, 45, 48], [48, 52, 55], [43, 47, 50]],
      step(s, t, d) {
        const c = this.chords[Math.floor(s / 16) % 4], i = s % 16;
        if (i % 2 === 0) tone(c[0] - 12 + (i % 4 === 2 ? 12 : 0), t, d * 1.5, "sawtooth", 0.07);
        if ([0, 3, 6, 10, 12].includes(i)) tone(c[(i >> 2) % 3] + 12, t, d * 0.9, "square", 0.045);
        if (i % 4 === 0) kick(t);
        if (i === 4 || i === 12) noise(t, 0.1, 0.13, 2000);
        noise(t, 0.025, i % 2 ? 0.025 : 0.05);
      },
    },
  };
  let cur = null, step = 0, nextT = 0, timer = null;
  const schedule = () => {
    if (!cur) return;
    const tr = TRACKS[cur], d = 60 / tr.bpm / 4;
    while (nextT < ctx.currentTime + 0.12) { tr.step(step++, nextT, d); nextT += d; }
  };
  G.music = {
    play(name) {
      if (!ensure() || cur === name) return;
      cur = name; step = 0; nextT = ctx.currentTime + 0.05;
      clearInterval(timer); timer = setInterval(schedule, 25);
    },
    stop() { cur = null; clearInterval(timer); },
    get muted() { return muted; },
    toggle() {
      muted = !muted; G.store.set("muted", muted);
      if (ensure()) master.gain.setTargetAtTime(muted ? 0 : 0.32, ctx.currentTime, 0.05);
      return muted;
    },
  };
  G.sfx = {
    unlock: () => ensure(),
    click() { if (!ensure()) return; const t = ctx.currentTime; tone(84, t, 0.08, "square", 0.08); },
    tick(hi) { if (!ensure()) return; tone(hi ? 88 : 81, ctx.currentTime, 0.07, "square", 0.08); },
    right() { if (!ensure()) return; const t = ctx.currentTime; [72, 76, 79, 84].forEach((m, i) => tone(m, t + i * 0.08, 0.3, "square", 0.08)); },
    wrong() { if (!ensure()) return; const t = ctx.currentTime; tone(55, t, 0.25, "sawtooth", 0.1); tone(50, t + 0.2, 0.4, "sawtooth", 0.1); },
    reveal() { if (!ensure()) return; const t = ctx.currentTime; noise(t, 0.4, 0.15, 1200); [67, 74, 79].forEach((m, i) => tone(m, t + 0.1 + i * 0.06, 0.4, "triangle", 0.1)); },
    fanfare() {
      if (!ensure()) return;
      const t = ctx.currentTime;
      for (let i = 0; i < 16; i++) noise(t + i * 0.06, 0.05, 0.05 + i * 0.008, 1500); // drumroll
      const t0 = t + 1.1;
      [[67, 0, 0.18], [67, 0.2, 0.18], [67, 0.4, 0.18], [72, 0.6, 0.9], [76, 1.5, 0.3], [79, 1.85, 1.4]]
        .forEach(([m, o, d]) => { tone(m, t0 + o, d, "square", 0.1); tone(m - 12, t0 + o, d, "triangle", 0.15); });
      [[48, 52, 55, 60]].forEach((ch) => ch.forEach((m) => tone(m, t0 + 1.85, 1.6, "sawtooth", 0.035)));
      kick(t0); kick(t0 + 0.6); kick(t0 + 1.85);
    },
  };

  // ---------- confetti ----------
  G.confetti = (ms = 5000) => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const c = document.createElement("canvas");
    c.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:50";
    document.body.appendChild(c);
    const x = c.getContext("2d"), dpr = devicePixelRatio || 1;
    const W = (c.width = innerWidth * dpr), H = (c.height = innerHeight * dpr);
    const cols = ["#A6192E", "#ffffff", "#111111", "#d4a017", "#e8445e"];
    const ps = Array.from({ length: 180 }, () => ({
      x: Math.random() * W, y: -Math.random() * H * 0.6, vx: (Math.random() - 0.5) * 4 * dpr,
      vy: (2 + Math.random() * 4) * dpr, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
      w: (6 + Math.random() * 8) * dpr, h: (4 + Math.random() * 6) * dpr, c: cols[(Math.random() * cols.length) | 0],
    }));
    const end = performance.now() + ms;
    const f = (now) => {
      x.clearRect(0, 0, W, H);
      for (const p of ps) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.04 * dpr; p.r += p.vr;
        if (p.y > H && now < end) { p.y = -20; p.vy = (2 + Math.random() * 3) * dpr; }
        x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c;
        x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); x.restore();
      }
      if (now < end + 3000) requestAnimationFrame(f); else c.remove();
    };
    requestAnimationFrame(f);
  };
})();
