import { stub, VALID } from "../_lib.js";

// Live connection for host and players, handed to the session's Durable Object.
export async function onRequest({ request, params, env }) {
  const code = String(params.code || "").toUpperCase();
  if (!VALID.test(code)) return new Response("Bad code", { status: 400 });
  if (request.headers.get("Upgrade") !== "websocket") return new Response("Expected websocket", { status: 426 });
  return stub(env, code).fetch(request);
}
