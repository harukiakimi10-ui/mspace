import "server-only";

import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "crypto";

function getSecret(name: string): Buffer {
  const value = process.env[name];

  if (!value || !/^[a-f0-9]{64}$/i.test(value)) {
    throw new Error(`${name} must be a 64-character hexadecimal secret.`);
  }

  return Buffer.from(value, "hex");
}

export function generateRecoveryCode(): string {
  return randomInt(0, 10000).toString().padStart(4, "0");
}

export function normalizeRecoveryName(name: string): string {
  return name.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

export function encryptRecoveryCode(code: string): string {
  if (!/^\d{4}$/.test(code)) {
    throw new Error("Invalid recovery code.");
  }

  const key = getSecret("RECOVERY_ENCRYPTION_KEY");
  const iv = randomBytes(12);

  const cipher = createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([
    cipher.update(code, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return [
    iv.toString("hex"),
    authTag.toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
}

export function decryptRecoveryCode(value: string): string {
  const parts = value.split(":");

  if (parts.length !== 3) {
    throw new Error("Invalid encrypted recovery code.");
  }

  const [ivHex, tagHex, encryptedHex] = parts;

  if (
    !/^[a-f0-9]{24}$/i.test(ivHex) ||
    !/^[a-f0-9]{32}$/i.test(tagHex) ||
    !/^[a-f0-9]+$/i.test(encryptedHex)
  ) {
    throw new Error("Invalid encrypted recovery code.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getSecret("RECOVERY_ENCRYPTION_KEY"),
    Buffer.from(ivHex, "hex")
  );

  decipher.setAuthTag(Buffer.from(tagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]).toString("utf8");

  if (!/^\d{4}$/.test(decrypted)) {
    throw new Error("Invalid decrypted recovery code.");
  }

  return decrypted;
}

export function hashRecoveryCredentials(
  name: string,
  code: string
): string {
  if (!/^\d{4}$/.test(code)) {
    throw new Error("Invalid recovery code.");
  }

  const normalizedName = normalizeRecoveryName(name);

  if (!normalizedName || normalizedName.length > 200) {
    throw new Error("Invalid member name.");
  }

  return createHmac("sha256", getSecret("RECOVERY_HASH_SECRET"))
    .update(`${normalizedName}:${code}`, "utf8")
    .digest("hex");
}

export function verifyRecoveryHash(
  storedHash: string,
  name: string,
  code: string
): boolean {
  try {
    if (!/^[a-f0-9]{64}$/i.test(storedHash)) {
      return false;
    }

    const expected = Buffer.from(
      hashRecoveryCredentials(name, code),
      "hex"
    );

    const supplied = Buffer.from(storedHash, "hex");

    return (
      expected.length === supplied.length &&
      timingSafeEqual(expected, supplied)
    );
  } catch {
    return false;
  }
}

export function hashRecoveryAttemptBucket(value: string): string {
  if (!value || value.length > 1000) {
    throw new Error("Invalid recovery attempt identifier.");
  }

  return createHmac("sha256", getSecret("RECOVERY_HASH_SECRET"))
    .update(value, "utf8")
    .digest("hex");
}
