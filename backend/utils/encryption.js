import crypto from "crypto";

export const generateConversationKey = () => {
  return crypto.randomBytes(32).toString("base64");
};

export const encryptMessage = (base64Key, plaintext) => {
  const key = Buffer.from(base64Key, "base64");
  if (key.length !== 32) {
    throw new Error("Invalid encryption key length");
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return {
    ciphertext: encrypted.toString("base64"),
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64"),
  };
};


