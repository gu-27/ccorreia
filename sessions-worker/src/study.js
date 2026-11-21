import { DurableObject } from "cloudflare:workers";

// Team-mode study rooms. The host's browser sends the questions when it
// creates the room; this object runs the room and keeps everyone in sync.
// Games: "quiz" (points count down 1000 -> 0), "flash" (speed round: fastest
// correct answer takes the card), "jeopardy" (host picks tiles; fastest correct
// answer wins the tile's value; Final Jeopardy pays 1000 to everyone right).

const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const rand = (n) => {
  let s = "";
  for (const x of crypto.getRandomValues(new Uint8Array(n))) s += ALPHA[x % ALPHA.length];
  return s;
};
const str = (v, max = 600) => String(v ?? "").slice(0, max);
const cleanQ = (q) => {
  if (!q || !Array.isArray(q.options)) return null;
  const options = q.options.slice(0, 4).map((o) => str(o, 400));
  const answer = Number(q.answer);
  if (options.length < 2 || !(answer >= 0 && answer < options.length)) return null;
  return { kind: str(q.kind, 20), tag: str(q.tag, 80), prompt: str(q.prompt), options, answer, why: str(q.why), value: Math.max(0, Math.min(2000, Number(q.value) || 0)) };
};
const ROOM_TTL = 8 * 3600e3;

export class StudyRoom extends DurableObject {
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

  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/init" && req.method === "POST") {
      const body = await req.json().catch(() => ({}));
      return Response.json(await this.init(body));
    }
    if (url.pathname === "/info") {
      const s = await this.load();
      return Response.json(s ? { ok: true, game: s.game, phase: s.phase } : { ok: false });
    }
    if (req.headers.get("Upgrade") !== "websocket") return new Response("Expected websocket", { status: 426 });
    const s = await this.load();
    if (!s) return new Response("No such room", { status: 404 });

    const pid = str(url.searchParams.get("pid"), 40);
    let name = str(url.searchParams.get("name"), 20).trim().replace(/\s+/g, " ");
    if (!pid || !name) return new Response("Name required", { status: 400 });
    const hostKey = url.searchParams.get("host");
    if (hostKey && hostKey !== s.hostKey) return new Response("Bad host key", { status: 403 });
    if (!s.players[pid]) {
      const taken = new Set(Object.values(s.players).map((p) => p.name.toLowerCase()));
      const base = name;
      let n = 2;
      while (taken.has(name.toLowerCase())) name = `${base} ${n++}`;
      s.players[pid] = { name, points: 0, correct: 0, last: 0 };
      await this.save();
    }
    if (hostKey) { s.hostPid = pid; await this.save(); }

    const [client, server] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);
    server.serializeAttachment({ pid, host: !!hostKey });
    this.broadcast();
    return new Response(null, { status: 101, webSocket: client });
  }

  async init(body) {
    if (await this.load()) return { ok: false };
    const game = ["quiz", "flash", "jeopardy"].includes(body.game) ? body.game : "quiz";
    const secs = Math.max(5, Math.min(90, Number(body.secs) || 20));
    let qs = [], board = null;
    if (game === "jeopardy") {
      const b = body.board || {};
      const cats = (Array.isArray(b.cats) ? b.cats : []).slice(0, 6).map((c) => ({
        name: str(c.name, 60),
        clues: (Array.isArray(c.clues) ? c.clues : []).slice(0, 5).map(cleanQ).filter(Boolean),
      }));
      const final = cleanQ(b.final);
      if (!cats.length) return { ok: false, error: "No board" };
      board = { cats, final, used: [] };
    } else {
      qs = (Array.isArray(body.questions) ? body.questions : []).slice(0, 150).map(cleanQ).filter(Boolean);
      if (!qs.length) return { ok: false, error: "No questions" };
    }
    this.s = {
      code: str(body.code, 5), hostKey: rand(16), hostPid: null, game, secs, created: Date.now(),
      phase: "lobby", qs, board, qi: -1, cur: null, curKey: null,
      qStart: 0, deadline: 0, players: {}, answers: {}, winner: null,
    };
    await this.save();
    await this.ctx.storage.setAlarm(Date.now() + ROOM_TTL);
    return { ok: true, hostKey: this.s.hostKey };
  }

  async webSocketMessage(ws, raw) {
    const s = await this.load();
    if (!s) return;
    let m;
    try { m = JSON.parse(raw); } catch { return; }
    if (m.t === "ping") return ws.send(JSON.stringify({ t: "pong", now: Date.now() }));
    const att = ws.deserializeAttachment() || {};

    if (m.t === "answer" && s.phase === "question") {
      const p = s.players[att.pid];
      const i = Number(m.i);
      if (!p || s.answers[att.pid] || !s.cur || !(i >= 0 && i < s.cur.options.length)) return;
      const now = Date.now();
      if (now > s.deadline + 500) return;
      s.answers[att.pid] = { i, ms: Math.max(0, now - s.qStart) };
      await this.save();
      const online = Object.keys(this.online()).length || Object.keys(s.players).length;
      if (Object.keys(s.answers).length >= online) await this.reveal();
      else this.broadcast();
      return;
    }

    if (!att.host) return;
    if (m.t === "start" && s.phase === "lobby") {
      if (s.game === "jeopardy") { s.phase = "board"; await this.save(); this.broadcast(); }
      else await this.ask(0);
    } else if (m.t === "pick" && s.phase === "board" && s.game === "jeopardy") {
      const c = Number(m.c), r = Number(m.r), key = `${c}-${r}`;
      const clue = s.board.cats[c]?.clues[r];
      if (!clue || s.board.used.includes(key)) return;
      s.board.used.push(key);
      await this.askQ(clue, key);
    } else if (m.t === "final" && s.phase === "board" && s.board?.final) {
      await this.askQ({ ...s.board.final, value: 1000 }, "final");
    } else if (m.t === "reveal" && s.phase === "question") await this.reveal();
    else if (m.t === "next" && s.phase === "reveal") {
      if (s.game === "jeopardy") {
        if (s.curKey === "final") await this.finish();
        else { s.phase = "board"; s.cur = null; await this.save(); this.broadcast(); }
      } else if (s.qi + 1 < s.qs.length) await this.ask(s.qi + 1);
      else await this.finish();
    } else if (m.t === "end" && s.phase !== "end") await this.finish();
    else if (m.t === "kick" && s.players[m.pid] && m.pid !== s.hostPid) {
      delete s.players[m.pid];
      for (const w of this.ctx.getWebSockets()) {
        if (w.deserializeAttachment()?.pid === m.pid) {
          try { w.send(JSON.stringify({ t: "kicked" })); w.close(4000, "removed"); } catch {}
        }
      }
      await this.save();
      this.broadcast();
    }
  }

  async webSocketClose(ws) {
    try { ws.close(); } catch {}
    this.broadcast();
  }
  async webSocketError() { this.broadcast(); }

  online() {
    const out = {};
    for (const w of this.ctx.getWebSockets()) {
      const a = w.deserializeAttachment();
      if (a?.pid && this.s.players[a.pid]) out[a.pid] = true;
    }
    return out;
  }

  async ask(qi) {
    this.s.qi = qi;
    await this.askQ(this.s.qs[qi], `q${qi}`);
  }
  async askQ(q, key) {
    const s = this.s;
    const secs = s.game === "flash" ? Math.min(s.secs, 15) : s.secs;
    s.phase = "question"; s.cur = q; s.curKey = key; s.answers = {}; s.winner = null;
    s.qStart = Date.now() + 1500;
    s.deadline = s.qStart + secs * 1000;
    await this.save();
    await this.ctx.storage.setAlarm(s.deadline + 200);
    this.broadcast();
  }

  async reveal() {
    const s = this.s;
    if (s.phase !== "question" || !s.cur) return;
    const q = s.cur, total = s.deadline - s.qStart;
    for (const p of Object.values(s.players)) p.last = 0;
    const right = Object.entries(s.answers).filter(([pid, a]) => a.i === q.answer && s.players[pid]).sort((a, b) => a[1].ms - b[1].ms);
    for (const [pid] of right) s.players[pid].correct++;
    if (s.game === "quiz") {
      for (const [pid, a] of right) {
        const gain = Math.round(1000 * Math.max(0, 1 - a.ms / total));
        s.players[pid].points += gain; s.players[pid].last = gain;
      }
    } else if (s.curKey === "final") {
      for (const [pid] of right) { s.players[pid].points += 1000; s.players[pid].last = 1000; }
    } else if (right.length) {
      const [pid] = right[0];
      const gain = s.game === "jeopardy" ? q.value : 1000;
      s.players[pid].points += gain; s.players[pid].last = gain;
      s.winner = pid;
    }
    s.phase = "reveal";
    await this.save();
    await this.ctx.storage.setAlarm(s.created + ROOM_TTL);
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
    if (Date.now() - s.created >= ROOM_TTL) {
      for (const w of this.ctx.getWebSockets()) { try { w.close(1000, "expired"); } catch {} }
      await this.ctx.storage.deleteAll();
      this.s = null;
    }
  }

  board() {
    return Object.entries(this.s.players)
      .map(([id, p]) => ({ id, name: p.name, points: p.points, correct: p.correct, last: p.last }))
      .sort((a, b) => b.points - a.points || b.correct - a.correct || a.name.localeCompare(b.name))
      .map((p, i) => ({ ...p, rank: i + 1 }));
  }

  view(att) {
    const s = this.s, online = this.online(), board = this.board();
    const v = {
      t: "state", now: Date.now(), code: s.code, game: s.game, phase: s.phase,
      host: !!att.host, hostName: s.players[s.hostPid]?.name || "",
      qi: s.qi, total: s.qs.length,
      players: board.map((p) => ({ id: p.id, name: p.name, online: !!online[p.id], host: p.id === s.hostPid })),
      board: board.map(({ id, name, points, correct, rank }) => ({ id, name, points, correct, rank })),
    };
    if (s.game === "jeopardy") {
      v.jb = {
        cats: s.board.cats.map((c) => ({ name: c.name, values: c.clues.map((q) => q.value) })),
        used: s.board.used, hasFinal: !!s.board.final, finalDone: s.curKey === "final" && s.phase !== "question",
      };
    }
    if (s.cur && (s.phase === "question" || s.phase === "reveal")) {
      v.q = { kind: s.cur.kind, tag: s.cur.tag, prompt: s.cur.prompt, options: s.cur.options, value: s.cur.value, final: s.curKey === "final" };
      v.qStart = s.qStart; v.deadline = s.deadline;
      v.answered = Object.keys(s.answers).length;
    }
    if (s.phase === "reveal" && s.cur) {
      const dist = s.cur.options.map(() => 0);
      for (const a of Object.values(s.answers)) dist[a.i]++;
      v.reveal = { answer: s.cur.answer, why: s.cur.why, dist, winner: s.winner ? s.players[s.winner]?.name : null };
    }
    const me = board.find((p) => p.id === att.pid);
    if (me) {
      const a = s.answers[att.pid];
      v.you = { id: me.id, name: me.name, points: me.points, correct: me.correct, last: me.last, rank: me.rank, of: board.length, answered: a ? a.i : null };
      if (s.phase === "reveal" && s.cur) { v.you.right = !!a && a.i === s.cur.answer; v.you.won = s.winner === att.pid; }
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
