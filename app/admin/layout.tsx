import type { Metadata } from "next";
import AdminSessionRenewal from "./components/AdminSessionRenewal";

export const metadata: Metadata = {
  title: "MSpace Admin",
  description: "MSpace Administration",
  applicationName: "MSpace Admin",
  manifest: "/admin/manifest.webmanifest",
  themeColor: "#5b21b6",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
  <>
    <AdminSessionRenewal />
    {children}
  </>
);
}