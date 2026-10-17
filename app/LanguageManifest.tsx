
"use client";

import { useEffect } from "react";

export default function LanguageManifest() {
  useEffect(() => {
    const language = navigator.language.toLowerCase();
    const manifestUrl = language.startsWith("zh")
      ? "/manifest-zh.json"
      : "/manifest-en.json";

    let manifestLink = document.querySelector(
      'link[rel="manifest"]'
    ) as HTMLLinkElement | null;

    if (!manifestLink) {
      manifestLink = document.createElement("link");
      manifestLink.rel = "manifest";
      document.head.appendChild(manifestLink);
    }

    manifestLink.href = manifestUrl;
  }, []);

  return null;
}
