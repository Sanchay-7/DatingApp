import Ably from "ably";

let ablyClient = null;

const getAblyClient = () => {
  if (ablyClient) {
    return ablyClient;
  }

  if (!process.env.ABLY_API_KEY) {
    console.warn("⚠️ ABLY_API_KEY is not set. Realtime chat will not work.");
    return null;
  }

  try {
    ablyClient = new Ably.Rest({
      key: process.env.ABLY_API_KEY,
    });
    console.log("✅ Ably client initialized successfully");
    return ablyClient;
  } catch (err) {
    console.error("❌ Failed to initialize Ably client:", err.message);
    return null;
  }
};

export default getAblyClient;

