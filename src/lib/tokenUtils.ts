import { createHash, randomBytes } from "crypto";

/**
 * Generate a random token and its hash
 * Store the hash in the database, use the raw token in the URL
 */
export function generateToken(length: number = 32) {
  const token = randomBytes(length).toString("hex");
  const hash = createHash("sha256").update(token).digest("hex");
  return { token, hash };
}

/**
 * Hash a token for comparison
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
