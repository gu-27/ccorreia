import { newCode, room } from "../_lib.js";

// A student turns on team mode: create a room and return its code.
export async function onRequestPost({ request, env }) {
  const body = await request.json().catch(() => null);
  if (!body) return new Response("Bad request", { status: 400 });
  for (let i = 0; i < 6; i++) {
    const code = newCode();
    const r = await room(env, code).fetch("https://room/init", {
      method: "POST",
      body: JSON.stringify({ ...body, code }),
    });
    const j = await r.json();
    if (j.ok) return Response.json({ code, hostKey: j.hostKey });
    if (j.error) return new Response(j.error, { status: 400 });
  }
  return new Response("Could not create a room", { status: 500 });
}
