// Password hashing for Better Auth, sized to fit Cloudflare Workers' free-tier
// 10ms CPU budget. Uses PBKDF2-SHA256 via Web Crypto (native to Workers — no
// nodejs_compat shim, faster than Better Auth's default scrypt which blew the
// budget on sign-up).
//
// Iteration count is intentionally lower than OWASP's 2023 recommendation
// (600k for SHA-256). 100k still gives meaningful brute-force resistance and
// fits comfortably in 10ms on Workers; bump it (and re-deploy) when this
// project moves to Workers Paid — verify() reads iterations out of the stored
// hash, so old + new hashes coexist without a migration.

const ITERATIONS = 100_000;
const SALT_BYTES = 16;
const HASH_BYTES = 32;
const ALGO = 'pbkdf2_sha256';

function toBase64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function fromBase64(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function pbkdf2(
  password: string,
  salt: Uint8Array,
  iterations: number,
  bytes: number,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: salt as BufferSource, iterations, hash: 'SHA-256' },
    key,
    bytes * 8,
  );
  return new Uint8Array(bits);
}

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await pbkdf2(password, salt, ITERATIONS, HASH_BYTES);
  return `${ALGO}$${ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
}

export async function verifyPassword({
  hash: stored,
  password,
}: {
  hash: string;
  password: string;
}): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== ALGO) return false;
  const iterations = parseInt(parts[1], 10);
  if (!Number.isFinite(iterations) || iterations < 1) return false;
  const salt = fromBase64(parts[2]);
  const expected = fromBase64(parts[3]);
  const actual = await pbkdf2(password, salt, iterations, expected.length);
  return timingSafeEqual(expected, actual);
}
