import { promisify } from "node:util";
import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const scryptPromise = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = await scryptPromise(password, salt, 64);
  return `${salt}:${(key as Buffer).toString("hex")}` as const;
}

export async function verifyPassword(password: string, hashedPassword: string) {
  const [salt, key] = hashedPassword.split(":");
  const keyBuffer = Buffer.from(key!, "hex");
  const derivedKey = await scryptPromise(password, salt!, 64);
  return timingSafeEqual(keyBuffer, derivedKey as Buffer);
}
