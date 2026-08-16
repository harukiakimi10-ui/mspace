"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {
        console.log("MSpace service worker registered");
        
      })
      .catch((error) => {
        console.error(
          "MSpace service worker registration failed:",
          error
        );
      });
  }, []);

  return null;
}