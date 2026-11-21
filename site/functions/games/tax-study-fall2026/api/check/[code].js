import { room, VALID } from "../../_lib.js";

export async function onRequestGet({ params, env }) {
  const code = String(params.code || "").toUpperCase();
  if (!VALID.test(code)) return Response.json({ ok: false });
  return room(env, code).fetch("https://room/info");
}
