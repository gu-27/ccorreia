const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const newCode = () => {
  let s = "";
  for (const x of crypto.getRandomValues(new Uint8Array(5))) s += ALPHA[x % ALPHA.length];
  return s;
};
export const VALID = /^[A-Z0-9]{5}$/;
export const room = (env, code) => env.ROOM.get(env.ROOM.idFromName(code));
