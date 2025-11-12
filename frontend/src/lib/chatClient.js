import Ably from "ably/promises";
import { authFetch } from "./apiClient";

let clientPromise = null;

export const getChatClient = async () => {
  if (!clientPromise) {
    clientPromise = (async () => {
      const realtime = new Ably.Realtime.Promise({
        authCallback: (tokenParams, callback) => {
          authFetch("/api/chat/token")
            .then(({ tokenRequest }) => {
              callback(null, tokenRequest);
            })
            .catch((err) => {
              console.error("Ably auth error:", err);
              callback(err);
            });
        },
      });

      await realtime.connection.once("connected");
      return realtime;
    })();
  }

  return clientPromise;
};

export const releaseChatClient = async () => {
  if (!clientPromise) return;
  try {
    const realtime = await clientPromise;
    await realtime.close();
  } catch (err) {
    console.error("Failed to close Ably client:", err);
  } finally {
    clientPromise = null;
  }
};

