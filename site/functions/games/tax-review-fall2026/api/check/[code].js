import { stub, VALID } from "../../_lib.js";

// Players check a code before joining.
export async function onRequestGet({ params, env }) {
  const code = String(params.code || "").toUpperCase();
  if (!VALID.test(code)) return Response.json({ ok: false });
  return stub(env, code).fetch("https://session/info");
}
