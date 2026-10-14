"use client";

import { stickerPacks } from "./StickerData";
import { useEffect, useRef, useState } from "react";
import { Smile, Sticker, Image, Play } from "lucide-react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import zhI18n from "@emoji-mart/data/i18n/zh.json";

type StickerPanelProps = {
  open: boolean;
  isDesktop?: boolean;
  isAdmin?: boolean;
  composerHeight?: number;
  onClose: () => void;
  onStickerSelect: (sticker: string) => void;
  onEmojiSelect: (emoji: string) => void;
};

export default function StickerPanel({
  open,
  isDesktop = false,
  isAdmin = false,
  composerHeight = 70,
  onClose,
  onStickerSelect,
  onEmojiSelect,
}: StickerPanelProps) {
  const [panelTab, setPanelTab] = useState<"emoji" | "sticker">("emoji");

    const emojiContainerRef = useRef<HTMLDivElement>(null);
  const [emojiContainerWidth, setEmojiContainerWidth] = useState(0);

  useEffect(() => {
    const element = emojiContainerRef.current;
    if (!element) return;

    const observer = new ResizeObserver(([entry]) => {
      setEmojiContainerWidth(entry.contentRect.width);
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const userAgent =
    typeof navigator !== "undefined" ? navigator.userAgent : "";


  const isAndroidDevice = /Android/i.test(userAgent);

  const isIPhoneDevice = /iPhone|iPad|iPod/i.test(userAgent);


  const targetEmojiButtonSize = isDesktop
  ? 48
  : isIPhoneDevice
    ? 50
    : isAndroidDevice
      ? 42
      : 42;


const isTablet =
  /iPad/i.test(userAgent) ||
  (navigator.platform === "MacIntel" &&
    navigator.maxTouchPoints > 1) ||
  (/Android/i.test(userAgent) &&
    !/Mobile/i.test(userAgent));

const isSmallIPhone =
  /iPhone/i.test(userAgent) &&
  window.matchMedia("(max-width: 375px)").matches;

const emojiPerLine = isDesktop
  ? 14
  : isTablet
    ? 10
    : isSmallIPhone
      ? 7
      : 8;


  const emojiButtonSizeValue = isDesktop
  ? 48
  : isIPhoneDevice
    ? 50
    : emojiContainerWidth > 0
      ? Math.max(
          20,
          Math.min(
            targetEmojiButtonSize,
            Math.floor(emojiContainerWidth / emojiPerLine) - 2
          )
        )
      : isAndroidDevice
        ? 42
        : 42;

  const emojiSizeValue = isDesktop
    ? 36
    : isAndroidDevice
      ? Math.min(28, Math.floor(emojiButtonSizeValue * 0.75))
      : Math.min(36, Math.floor(emojiButtonSizeValue * 0.86));

  const panelHeight = isDesktop
    ? "58vh"
    : isAndroidDevice
      ? "38vh"
      : "38vh";



  const [stickerType, setStickerType] = useState<
    "static" | "animated"
  >("static");

  const [stickerCategory, setStickerCategory] = useState("all");

  const language =
  typeof navigator !== "undefined" &&
  navigator.language.startsWith("zh")
    ? "zh"
    : "en";

  const stickerCategories = [
  {
    id: "all",
    label: language === "zh" ? "全部" : "All",
  },
  {
    id: "greetings",
    label: language === "zh" ? "问候" : "Greetings",
  },
  {
    id: "love",
    label: language === "zh" ? "爱心" : "Love",
  },
  {
    id: "happy",
    label: language === "zh" ? "开心" : "Happy",
  },
  {
    id: "sad",
    label: language === "zh" ? "难过" : "Sad",
  },

  ...(isAdmin
    ? [
        {
          id: "extras",
          label: language === "zh" ? "更多" : "Extras",
        },
      ]
    : []),
];

  if (!open) return null;

  const currentPack = stickerPacks.find(
  (pack) =>
    pack.type === stickerType &&
    (
      stickerType === "animated" ||
      (
        stickerCategory === "extras"
          ? pack.id === "extras"
          : pack.id === "chinese"
      )
    )
);

  return (
    <>
      {/* Background */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "transparent",
          zIndex: 1998,
          pointerEvents: "none",
        }}
      />

      <div
        data-mspace-sticker-panel="true"
        style={{
          position: "fixed",

          left: isDesktop ? "50%" : 0,

          right: isDesktop ? "auto" : 0,

          bottom: isDesktop ? composerHeight + 20 : 0,

          transform: isDesktop
            ? "translateX(-50%)"
            : "none",

          width: isDesktop ? "700px" : "100%",

          maxWidth: isDesktop
            ? "min(700px, calc(100vw - 40px))"
            : "100%",

          background: "#fff",

          borderTopLeftRadius: isDesktop ? 18 : 0,
          borderTopRightRadius: isDesktop ? 18 : 0,

          boxShadow: isDesktop
            ? "0 -10px 30px rgba(0,0,0,0.14)"
            : "0 -8px 24px rgba(0,0,0,0.12)",

          padding: "8px 0 0 0",

          zIndex: isDesktop ? 6000 : 1999,

          height: panelHeight,

          display: "flex",
          flexDirection: "column",
        }}
      >

        {/* Emoji / Sticker tabs */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 40,
            marginBottom: 10,
          }}
        >
          {/* Emoji */}
          <button
            type="button"
            onClick={() => setPanelTab("emoji")}
            style={{
              border: "none",
              background: "transparent",
              padding: "6px 12px",
              cursor: "pointer",
              color:
                panelTab === "emoji"
                  ? "#6d28d9"
                  : "#777",
              borderBottom:
                panelTab === "emoji"
                  ? "3px solid #6d28d9"
                  : "3px solid transparent",
            }}
          >
            <Smile
              size={isDesktop ? 26 : 22}
              strokeWidth={2.2}
            />
          </button>

          {/* Sticker */}
          <button
            type="button"
            onClick={() => setPanelTab("sticker")}
            style={{
              border: "none",
              background: "transparent",
              padding: "6px 12px",
              cursor: "pointer",
              color:
                panelTab === "sticker"
                  ? "#6d28d9"
                  : "#777",
              borderBottom:
                panelTab === "sticker"
                  ? "3px solid #6d28d9"
                  : "3px solid transparent",
            }}
          >
            <Sticker
              size={isDesktop ? 26 : 22}
              strokeWidth={2.2}
            />
          </button>
        </div>

        {/* ========================= */}
        {/* EMOJI PANEL */}
        {/* ========================= */}

        {panelTab === "emoji" && (
          <div
           ref={emojiContainerRef}
            style={{
              flex: 1,
              width: "100%",
              minWidth: 0,
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
            <Picker
              data={data}
              locale={language}
              i18n={language === "zh" ? zhI18n : undefined}
              theme="light"
              onEmojiSelect={onEmojiSelect}
              searchPosition="none"
              previewPosition="none"
              skinTonePosition="none"
              dynamicWidth={false}
              perLine={emojiPerLine}
              emojiSize={emojiSizeValue}
              emojiButtonSize={emojiButtonSizeValue}
              style={{
                width: "100%",
                minWidth: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}

        {/* ========================= */}
        {/* STICKER PANEL */}
        {/* ========================= */}

        {panelTab === "sticker" && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >

            {/* ========================= */}
            {/* 静态 / 动态 */}
            {/* ========================= */}

            <div
              style={{
                display: "flex",
                width: "100%",
                borderBottom: "1px solid #eeeeee",
              }}
            >

              {/* Stationary Stickers */}
              <button
                type="button"
                onClick={() => {
  setStickerType("static");
  setStickerCategory("all");
}}
                style={{
                  flex: 1,
                  border: "none",
                  background:
                    stickerType === "static"
                      ? "#f3e8ff"
                      : "#fff",
                  color:
                    stickerType === "static"
                      ? "#6d28d9"
                      : "#777",
                  padding: isDesktop ? "12px 0" : "7px 0",
                  fontSize: isDesktop ? "15px" : "13px",
                  fontWeight:
                    stickerType === "static"
                      ? 700
                      : 500,
                  cursor: "pointer",
                  borderBottom:
                    stickerType === "static"
                      ? "3px solid #6d28d9"
                      : "3px solid transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                }}
              >
                <Image size={19} />

                {language === "zh" ? "静态贴纸" : "Stationary Stickers"}
              </button>

              {/* Animated Stickers */}
              <button
                type="button"
                onClick={() =>
                  setStickerType("animated")
                }
                style={{
                  flex: 1,
                  border: "none",
                  background:
                    stickerType === "animated"
                      ? "#f3e8ff"
                      : "#fff",
                  color:
                    stickerType === "animated"
                      ? "#6d28d9"
                      : "#777",
                  padding: isDesktop ? "12px 0" : "7px 0",
                  fontSize: isDesktop ? "15px" : "13px",
                  fontWeight:
                    stickerType === "animated"
                      ? 700
                      : 500,
                  cursor: "pointer",
                  borderBottom:
                    stickerType === "animated"
                      ? "3px solid #6d28d9"
                      : "3px solid transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 7,
                }}
              >
                <Play size={19} />

                {language === "zh" ? "动态贴纸" : "Animated Stickers"}
              </button>

            </div>

            <div
  style={{
  display: "grid",
  gridTemplateColumns: isAdmin
    ? "repeat(6, minmax(0, 1fr))"
    : "repeat(5, minmax(0, 1fr))",
  gap: 6,
  padding: "10px 8px",
  borderBottom: "1px solid #eeeeee",
  boxSizing: "border-box",
  width: "100%",
}}
>
  {stickerCategories.map((category) => {
    const active = stickerCategory === category.id;

    return (
      <button
        key={category.id}
        onClick={() => setStickerCategory(category.id)}
        style={{
  minWidth: 0,
  width: "100%",
  boxSizing: "border-box",
  border: "none",
  borderRadius: 18,
  padding: isDesktop ? "8px 6px" : "7px 3px",
  background: active ? "#6d28d9" : "#f3f3f5",
  color: active ? "#ffffff" : "#666666",
  fontSize: 13,
  fontWeight: active ? 600 : 500,
  cursor: "pointer",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
}}
      >
        {category.label}
      </button>
    );
  })}
</div>

            {/* ========================= */}
            {/* STICKER GRID */}
            {/* ========================= */}

            <div
              style={{
                flex: 1,
                overflowY: "auto",

                display: "grid",
gridTemplateColumns: "repeat(5, minmax(0, 1fr))",

                gap: 10,

                padding:
                  "12px 10px 20px",

                alignContent: "start",
              }}
            >

              {currentPack?.stickers
  .filter((sticker) => {
    if (stickerCategory === "all") return true;

    return sticker.categories.includes(stickerCategory);
  })
  .map((sticker) => {
  const src = `${currentPack.folder}/${sticker.file}`;

  return (
    <button
      key={sticker.file}
                      type="button"
                      onClick={() =>
                        onStickerSelect(src)
                      }
                      style={{
                        border: "none",
                        background:
                          "transparent",
                        padding: 0,
                        cursor: "pointer",
                        position:
                          "relative",
                      }}
                    >

                      <img
                        src={src}
                        alt={
                          stickerType ===
                          "static"
                            ? "静态贴纸"
                            : "动态贴纸"
                        }
                        style={{
                          width: "100%",
                          aspectRatio: "1",
                          objectFit:
                            "contain",
                          display: "block",
                        }}

                        onError={(e) => {
  e.currentTarget.style.display = "none";
}}
                      />

                      {/* Dynamic sticker play indicator */}
                      {stickerType ===
                        "animated" && (
                        <span
                          style={{
                            position:
                              "absolute",
                            right: 3,
                            bottom: 3,
                            width: 22,
                            height: 22,
                            borderRadius:
                              "50%",
                            background:
                              "rgba(0,0,0,0.55)",
                            color:
                              "#fff",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            fontSize: 10,
                            pointerEvents:
                              "none",
                          }}
                        >
                          ▶
                        </span>
                      )}

                    </button>
                  );
                }
              )}

              {/* Empty state */}
              {(!currentPack ||
                currentPack.stickers
                  .length === 0) && (
                <div
                  style={{
                    gridColumn:
                      "1 / -1",
                    textAlign:
                      "center",
                    color: "#999",
                    marginTop: 40,
                    fontSize: 14,
                  }}
                >
                  暂无贴纸
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </>
  );
}