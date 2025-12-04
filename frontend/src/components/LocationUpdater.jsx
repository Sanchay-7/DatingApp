"use client";
import { useEffect, useRef } from "react";

export default function LocationUpdater() {
  const timerRef = useRef(null);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token || typeof navigator === "undefined" || !("geolocation" in navigator)) {
      return;
    }

    const updateLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            await fetch("/api/v1/user/update-location", {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ location: `${latitude},${longitude}` }),
            });
          } catch (e) {
            // swallow errors; we'll try again next interval
          }
        },
        () => {
          // permission denied or error; stop further attempts
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        },
        { enableHighAccuracy: false, maximumAge: 60000, timeout: 10000 }
      );
    };

    // Initial attempt shortly after mount
    const initial = setTimeout(updateLocation, 2000);

    // Periodic updates every 15 minutes
    timerRef.current = setInterval(updateLocation, 15 * 60 * 1000);

    return () => {
      clearTimeout(initial);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return null;
}