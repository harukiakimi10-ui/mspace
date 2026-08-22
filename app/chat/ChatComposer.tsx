"use client";

import { useRef } from "react";
import MessageInput from "./MessageInput";
import ReplyPreview from "./ReplyPreview";
import VoiceRecorder from "./VoiceRecorder";


type ChatComposerProps = {
  placeholder: string;
  showComposer?: boolean;

  message: string;
  setMessage: (value: string) => void;

  currentUser: "member" | "admin";
  profileName: string;

  replyMessage: any;
  replyPreview: string;

  onCancelReply: () => void;

  messageInputRef: React.RefObject<HTMLTextAreaElement | null>;

  sendMessage: () => void;

  onAttach: () => void;


  uploading: boolean;

  recordingTime: number;

  playing: boolean;

  previewCurrentTime: number;

  recording: boolean;

  voiceState: "idle" | "recording" | "preview";

  voiceLevel: number;

  startRecording: () => void;

  stopRecording: () => void;



  onPlay: () => void;

  onPause: () => void;

  onDelete: () => void;

  onSend: (duration: number) => void | Promise<void>;


  // NEW
  stickerOpen: boolean;
  onToggleSticker: () => void;

  onCloseStickerPanel: () => void;

  fileInputRef: React.RefObject<HTMLInputElement | null>;

  onFileChange: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;

  onInput: (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => void;

  onKeyDown: (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => void;
};

export default function ChatComposer({
  placeholder,

  showComposer,

  message,
  setMessage,

  currentUser,
  profileName,

  replyMessage,
  replyPreview,

  onCancelReply,
  messageInputRef,

  sendMessage,

  onAttach,
  uploading,

  recordingTime,

previewCurrentTime,

recording,
playing,
voiceLevel,
voiceState,
  startRecording,
  stopRecording,
  onPlay,
  onPause,
  onDelete,
  onSend,
  // NEW
  stickerOpen,
  onToggleSticker,
  onCloseStickerPanel,

  fileInputRef,
  onFileChange,

  onInput,
  onKeyDown,
}: ChatComposerProps) {

const cameraInputRef = useRef<HTMLInputElement | null>(null);
  console.log("recording =", recording);
console.log("startRecording =", startRecording);
console.log("stopRecording =", stopRecording);
console.log("Passing onMicClick:", recording ? stopRecording : startRecording);

if (!showComposer) {
  return null;
}

  return (
    <div
      style={{
  position: "fixed",
  left: 0,
  right: 0,
  bottom: stickerOpen ? "38vh" : 0,

  zIndex: 5000,
        borderTop: "1px solid rgba(0,0,0,.08)",
        background: "#f8f7ff",

        paddingTop: "8px",
        paddingBottom:
          "max(8px, env(safe-area-inset-bottom))",

        boxShadow: "0 -2px 12px rgba(0,0,0,.06)",
      }}
    >
      <ReplyPreview
        replyMessage={replyMessage}
        replyPreview={replyPreview}
        currentUser={currentUser}
        profileName={profileName}
        onCancel={onCancelReply}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        hidden
        onChange={onFileChange}
      />

      <input
  id="mspace-camera-input"
  ref={cameraInputRef}
  type="file"
  accept="image/*"
  capture="environment"
  hidden
  onChange={onFileChange}
/>
    
      {voiceState === "idle" ? (
  <MessageInput
    placeholder={placeholder}
    message={message}
    messageInputRef={messageInputRef}
    sendMessage={sendMessage}
    onAttach={onAttach}
    uploading={uploading}
    recording={recording}
    onMicClick={recording ? stopRecording : startRecording}
    stickerOpen={stickerOpen}
    onToggleQuickEmoji={onToggleSticker}
    onFocusInput={onCloseStickerPanel}
    onInput={onInput}
    onKeyDown={onKeyDown}
  />
) : (
  <VoiceRecorder
  voiceState={voiceState}

  recordingTime={recordingTime}

  playing={playing}

  previewCurrentTime={previewCurrentTime}

  voiceLevel={voiceLevel}

  onStop={() => {
    stopRecording();
  }}

  onPlay={onPlay}

  onPause={onPause}

  onDelete={onDelete}

 onSend={async (duration) => {
  try {
    await onSend(duration);
    onCancelReply();
  } catch (error) {
    console.error("Voice send error:", error);
  }
}}
/>

)}
    </div>
  );
}