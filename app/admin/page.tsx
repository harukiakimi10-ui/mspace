"use client";

import { useEffect } from "react";

export default function AdminPage() {
  useEffect(() => {
    if (localStorage.getItem("mspace_admin") === "true") {
      window.location.replace("/admin/chats");
    } else {
      window.location.replace("/admin/login");
    }
  }, []);

  return null;
}