
"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const RENEWAL_INTERVAL = 5 * 60 * 1000;

export default function AdminSessionRenewal() {
  const pathname = usePathname();

  useEffect(() => {
    // The login page must remain accessible without a session.
    if (pathname === "/admin/login") return;

    let checking = false;

    async function renewSession() {
      if (checking || document.visibilityState === "hidden") {
        return;
      }

      checking = true;

      try {
        const response = await fetch("/api/admin/session", {
          method: "GET",
          cache: "no-store",
        });

        if (response.status === 401) {
          window.location.replace("/admin/login");
        }
      } catch (error) {
        // A temporary network failure should not log out the admin.
        console.error("Admin session renewal failed:", error);
      } finally {
        checking = false;
      }
    }

    const interval = window.setInterval(() => {
      void renewSession();
    }, RENEWAL_INTERVAL);

    return () => {
      window.clearInterval(interval);
    };
  }, [pathname]);

  return null;
}
