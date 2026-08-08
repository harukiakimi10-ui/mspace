"use client";

import MessageInput from "./MessageInput";
import ReplyPreview from "./ReplyPreview";
import VoiceRecorder from "./VoiceRecorder";


type ChatComposerProps = {
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

  fileInputRef,
  onFileChange,

  onInput,
  onKeyDown,
}: ChatComposerProps) {

  console.log("recording =", recording);
console.log("startRecording =", startRecording);
console.log("stopRecording =", stopRecording);
console.log("Passing onMicClick:", recording ? stopRecording : startRecording);

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,

        zIndex: 1000,

        background: "#fff",

        borderTop: "1px solid rgba(0,0,0,.08)",

        paddingTop: "0px",
        paddingBottom:
          "max(2px, env(safe-area-inset-bottom))",

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

    
      {voiceState === "idle" ? (
  <MessageInput
    message={message}
    messageInputRef={messageInputRef}
    sendMessage={sendMessage}
    onAttach={onAttach}
    uploading={uploading}
    recording={recording}
    onMicClick={recording ? stopRecording : startRecording}
    stickerOpen={stickerOpen}
    onToggleQuickEmoji={onToggleSticker}
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
    await onSend(duration);
    onCancelReply();
  }}
/>

)}
    </div>
  );
}