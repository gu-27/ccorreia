import { DurableObject } from "cloudflare:workers";
import { CARDS, LIES } from "./questions.js";
export { StudyRoom } from "./study.js";

const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const BUCKETS = ["Taxable", "Excluded", "Deductible", "Not deductible"];
const BUCKET_LABELS = ["Taxable income", "Excluded", "Deductible", "Not deductible"];

const rand = (n) => {
  let s = "";
  for (const x of crypto.getRandomValues(new Uint8Array(n))) s += ALPHA[x % ALPHA.length];
  return s;
};
const shuffle = (a) => {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

function buildQuestions(game, count) {
  const sort = CARDS.map(([type, item, ans, why]) => ({
    kind: "sort", tag: `${type} item`, prompt: item,
    options: BUCKET_LABELS, answer: BUCKETS.indexOf(ans), why,
  }));
  const lie = LIES.map(([topic, stmts, lieIdx, why]) => {
    const order = shuffle([0, 1, 2]);
    return {
      kind: "lie", tag: topic, prompt: "Which one is the lie?",
      options: order.map((i) => stmts[i]), answer: order.indexOf(lieIdx), why,
    };
  });
  let pool = game === "sort" ? shuffle(sort) : game === "lie" ? shuffle(lie) : shuffle([...sort, ...lie]);
  if (count && count < pool.length) pool = pool.slice(0, count);
  return pool;
}

// The public site (ccorreia.pages.dev) talks to this Worker through a
// Durable Object binding. Nothing is served from this Worker directly.
export default {
  fetch() {
    return new Response("Tax Review Live sessions service", { status: 200 });
  },
};

export class Session extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.s = null;
  }

  async load() {
    if (!this.s) this.s = (await this.ctx.storage.get("s")) || null;
    return this.s;
  }
  async save() {
    await this.ctx.storage.put("s", this.s);
  }

  async init(code, opts) {
    if (await this.load()) return { ok: false };
    const game = ["sort", "lie", "mix"].includes(opts.game) ? opts.game : "sort";
    const count = Math.max(0, Math.min(100, Number(opts.count) || 0));
    const secs = Math.max(5, Math.min(120, Number(opts.secs) || 20));
    this.s = {
      code, hostKey: rand(16), game, secs, created: Date.now(),
      phase: "lobby", qs: buildQuestions(game, count), qi: -1,
      qStart: 0, deadline: 0, players: {}, answers: {},
    };
    await this.save();
    // Clean up after 6 hours.
    await this.ctx.storage.setAlarm(Date.now() + 6 * 3600e3);
    return { ok: true, hostKey: this.s.hostKey };
  }

  async info() {
    const s = await this.load();
    return s ? { ok: true, phase: s.phase } : { ok: false };
  }

  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/init" && req.method === "POST") {
      const { code, opts } = await req.json();
      return Response.json(await this.init(code, opts || {}));
    }
    if (url.pathname === "/info") return Response.json(await this.info());
    if (req.headers.get("Upgrade") !== "websocket") return new Response("Expected websocket", { status: 426 });
    const s = await this.load();
    if (!s) return new Response("No such session", { status: 404 });
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    let att;
    if (url.searchParams.get("host")) {
      if (url.searchParams.get("host") !== s.hostKey) return new Response("Bad host key", { status: 403 });
      att = { role: "host" };
    } else {
      const pid = (url.searchParams.get("pid") || "").slice(0, 40);
      let name = (url.searchParams.get("name") || "").trim().replace(/\s+/g, " ").slice(0, 20);
      if (!pid || !name) return new Response("Name required", { status: 400 });
      if (!s.players[pid]) {
        const taken = new Set(Object.values(s.players).map((p) => p.name.toLowerCase()));
        let base = name, n = 2;
        while (taken.has(name.toLowerCase())) name = `${base} ${n++}`;
        s.players[pid] = { name, correct: 0, ms: 0, points: 0, last: 0, joined: Date.now() };
        await this.save();
      }
      att = { role: "player", pid };
    }
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment(att);
    this.broadcast();
    return new Response(null, { status: 101, webSocket: client });
  }

  async webSocketMessage(ws, raw) {
    const s = await this.load();
    if (!s) return;
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    const att = ws.deserializeAttachment() || {};
    if (msg.t === "ping") return ws.send(JSON.stringify({ t: "pong", now: Date.now() }));

    if (att.role === "host") {
      if (msg.t === "start" && s.phase === "lobby") await this.ask(0);
      else if (msg.t === "reveal" && s.phase === "question") await this.reveal();
      else if (msg.t === "next" && s.phase === "reveal") {
        if (s.qi + 1 < s.qs.length) await this.ask(s.qi + 1);
        else await this.finish();
      } else if (msg.t === "end" && s.phase !== "end") await this.finish();
      else if (msg.t === "kick" && s.players[msg.pid]) {
        delete s.players[msg.pid];
        for (const w of this.ctx.getWebSockets()) {
          const a = w.deserializeAttachment();
          if (a?.pid === msg.pid) { try { w.send(JSON.stringify({ t: "kicked" })); w.close(4000, "removed"); } catch {} }
        }
        await this.save();
        this.broadcast();
      }
      return;
    }

    if (att.role === "player" && msg.t === "answer" && s.phase === "question") {
      const p = s.players[att.pid];
      const i = Number(msg.i);
      if (!p || s.answers[att.pid] || !(i >= 0 && i < s.qs[s.qi].options.length)) return;
      const now = Date.now();
      if (now > s.deadline + 500) return;
      s.answers[att.pid] = { i, ms: Math.max(0, now - s.qStart) };
      await this.save();
      const live = Object.keys(this.connectedPlayers()).length || Object.keys(s.players).length;
      if (Object.keys(s.answers).length >= live) await this.reveal();
      else this.broadcast();
    }
  }

  async webSocketClose(ws) {
    try { ws.close(); } catch {}
    this.broadcast();
  }
  async webSocketError() { this.broadcast(); }

  connectedPlayers() {
    const out = {};
    for (const w of this.ctx.getWebSockets()) {
      const a = w.deserializeAttachment();
      if (a?.role === "player" && this.s.players[a.pid]) out[a.pid] = true;
    }
    return out;
  }

  async ask(qi) {
    const s = this.s;
    s.phase = "question"; s.qi = qi; s.answers = {};
    s.qStart = Date.now() + 1500; // short "get ready" beat
    s.deadline = s.qStart + s.secs * 1000;
    await this.save();
    await this.ctx.storage.setAlarm(s.deadline + 200);
    this.broadcast();
  }

  async reveal() {
    const s = this.s;
    if (s.phase !== "question") return;
    const q = s.qs[s.qi];
    const total = s.secs * 1000;
    for (const p of Object.values(s.players)) p.last = 0;
    for (const [pid, a] of Object.entries(s.answers)) {
      const p = s.players[pid];
      if (p && a.i === q.answer) {
        // Points count down with the clock: 1000 for an instant answer, 0 at the buzzer.
        const gain = Math.round(1000 * Math.max(0, 1 - a.ms / total));
        p.correct++; p.ms += a.ms; p.points = (p.points || 0) + gain; p.last = gain;
      }
    }
    s.phase = "reveal";
    await this.save();
    await this.ctx.storage.setAlarm(Date.now() + 6 * 3600e3);
    this.broadcast();
  }

  async finish() {
    if (this.s.phase === "question") await this.reveal();
    this.s.phase = "end";
    await this.save();
    this.broadcast();
  }

  async alarm() {
    const s = await this.load();
    if (!s) return;
    if (s.phase === "question" && Date.now() >= s.deadline) return this.reveal();
    if (Date.now() - s.created > 6 * 3600e3) {
      for (const w of this.ctx.getWebSockets()) { try { w.close(1000, "expired"); } catch {} }
      await this.ctx.storage.deleteAll();
      this.s = null;
    }
  }

  board() {
    return Object.entries(this.s.players)
      .map(([id, p]) => ({ id, name: p.name, correct: p.correct, ms: p.ms, points: p.points || 0, last: p.last || 0 }))
      .sort((a, b) => b.points - a.points || b.correct - a.correct || a.ms - b.ms || a.name.localeCompare(b.name))
      .map((p, i) => ({ ...p, rank: i + 1 }));
  }

  view(att) {
    const s = this.s;
    const live = this.connectedPlayers();
    const board = this.board();
    const v = {
      t: "state", phase: s.phase, code: s.code, now: Date.now(),
      qi: s.qi, total: s.qs.length, secs: s.secs,
      players: board.map((p) => ({ id: p.id, name: p.name, online: !!live[p.id] })),
    };
    const q = s.qs[s.qi];
    if (q && (s.phase === "question" || s.phase === "reveal")) {
      v.q = { kind: q.kind, tag: q.tag, prompt: q.prompt, options: q.options };
      v.qStart = s.qStart; v.deadline = s.deadline;
      v.answered = Object.keys(s.answers).length;
    }
    if (s.phase === "reveal" && q) {
      const dist = q.options.map(() => 0);
      for (const a of Object.values(s.answers)) dist[a.i]++;
      v.reveal = { answer: q.answer, why: q.why, dist };
    }
    if (s.phase === "reveal" || s.phase === "end") {
      v.board = (att.role === "host" ? board : board.slice(0, 5)).map(({ id, name, correct, points, rank }) => ({ id, name, correct, points, rank }));
    }
    if (att.role === "player") {
      const me = board.find((p) => p.id === att.pid);
      if (me) {
        const a = s.answers[att.pid];
        v.you = { name: me.name, correct: me.correct, points: me.points, last: me.last, rank: me.rank, of: board.length, answered: a ? a.i : null };
        if (s.phase === "reveal" && q) v.you.right = !!a && a.i === q.answer;
      } else v.you = null;
    }
    return v;
  }

  broadcast() {
    if (!this.s) return;
    for (const w of this.ctx.getWebSockets()) {
      try { w.send(JSON.stringify(this.view(w.deserializeAttachment() || {}))); } catch {}
    }
  }
}
