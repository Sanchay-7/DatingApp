const base64ToUint8Array = (base64) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const arrayBufferToString = (buffer) =>
  new TextDecoder().decode(buffer);

export const importAesKey = async (base64Key) => {
  const keyData = base64ToUint8Array(base64Key);
  return crypto.subtle.importKey("raw", keyData, "AES-GCM", false, [
    "decrypt",
  ]);
};

export const decryptPayload = async (base64Key, payload) => {
  if (!base64Key) {
    throw new Error("Missing encryption key");
  }
  if (!payload?.ciphertext || !payload?.iv || !payload?.authTag) {
    throw new Error("Invalid encrypted payload");
  }

  const key = await importAesKey(base64Key);
  const ciphertext = base64ToUint8Array(payload.ciphertext);
  const authTag = base64ToUint8Array(payload.authTag);
  const iv = base64ToUint8Array(payload.iv);

  const combined = new Uint8Array(ciphertext.length + authTag.length);
  combined.set(ciphertext, 0);
  combined.set(authTag, ciphertext.length);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
      tagLength: 128,
    },
    key,
    combined
  );

  return arrayBufferToString(decryptedBuffer);
};

