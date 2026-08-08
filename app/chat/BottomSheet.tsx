"use client";

import { ReactNode } from "react";

type BottomSheetProps = {
  open: boolean;
  children: ReactNode;
  onClose: () => void;
};

export default function BottomSheet({
  open,
  children,
  onClose,
}: BottomSheetProps) {
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,

          background: open
            ? "rgba(0,0,0,.12)"
            : "transparent",

          opacity: open ? 1 : 0,

          pointerEvents: open ? "auto" : "none",

          transition: "opacity .25s ease",

          zIndex: 1998,
        }}
      />

      <div
        style={{
          position: "fixed",

          left: 0,
          right: 0,
          bottom: 0,

          transform: open
            ? "translateY(0)"
            : "translateY(100%)",

          transition:
            "transform .28s cubic-bezier(.22,.61,.36,1)",

          willChange: "transform",

          background: "#fff",

          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,

          boxShadow:
            "0 -8px 30px rgba(0,0,0,.12)",

          zIndex: 1999,
        }}
      >
        {children}
      </div>
    </>
  );
}