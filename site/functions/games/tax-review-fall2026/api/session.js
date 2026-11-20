import { newCode, stub } from "../_lib.js";

// Host creates a new game session.
export async function onRequestPost({ request, env }) {
  const opts = await request.json().catch(() => ({}));
  for (let i = 0; i < 6; i++) {
    const code = newCode();
    const r = await stub(env, code).fetch("https://session/init", {
      method: "POST",
      body: JSON.stringify({ code, opts }),
    });
    const j = await r.json();
    if (j.ok) return Response.json({ code, hostKey: j.hostKey });
  }
  return new Response("Could not create a session", { status: 500 });
}
