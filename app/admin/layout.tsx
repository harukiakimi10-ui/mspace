import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MSpace Admin",
  description: "MSpace Administration",
  applicationName: "MSpace Admin",
  themeColor: "#5b21b6", // Purple
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}