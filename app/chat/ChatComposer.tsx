"use client";

import MessageInput from "./MessageInput";
import QuickEmojiBar from "./QuickEmojiBar";
import EmojiPanel from "./EmojiPanel";
import ReplyPreview from "./ReplyPreview";

type ChatComposerProps = {
  message: string;
  setMessage: (value: string) => void;

  currentUser: "member" | "admin";
profileName: string;

  replyMessage: any;
  replyPreview: string;

  onCancelReply: () => void;

  quickEmojis: string[];

  showQuickEmoji: boolean;
  setShowQuickEmoji: (value: boolean) => void;
  
  showEmojiPicker: boolean;
  setShowEmojiPicker: (value: boolean) => void;


  showFullEmojiPicker: boolean;
  setShowFullEmojiPicker: (value: boolean) => void;

  messageInputRef: React.RefObject<HTMLTextAreaElement | null>;

  sendMessage: () => void;

  onAttach: () => void;
 
  uploading: boolean;

  fileInputRef: React.RefObject<HTMLInputElement | null>;

  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  onInput: (
  e: React.ChangeEvent<HTMLTextAreaElement>
) => void;
onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
};

export default function ChatComposer({
  message,
  setMessage,

  currentUser,
  profileName,

  replyMessage,
  replyPreview,

  onCancelReply,

  quickEmojis,

  showQuickEmoji,
  setShowQuickEmoji,

  showEmojiPicker,
  setShowEmojiPicker,

  showFullEmojiPicker,
  setShowFullEmojiPicker,


  messageInputRef,

  sendMessage,

  onAttach,
  uploading,

  fileInputRef,
  onFileChange,

  onInput,
  onKeyDown,

}: ChatComposerProps) {
  return (
  <div
    style={{
      background: "#fff",
      borderTop: "1px solid #ddd",
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
      <MessageInput
        message={message}
        messageInputRef={messageInputRef}
        sendMessage={sendMessage}
        onAttach={onAttach}
        uploading={uploading}
        onInput={onInput}
        onKeyDown={onKeyDown}
        onToggleQuickEmoji={() => {
  setShowEmojiPicker(!showEmojiPicker);
  
}}
      />

      {showEmojiPicker && (
        <QuickEmojiBar
          quickEmojis={quickEmojis}
          onEmojiClick={(emoji) => {
            if (emoji === "➕") {
  setShowEmojiPicker(false);

  setShowFullEmojiPicker(true);

  return;
}

            setMessage(message + emoji);
          }}
        />
      )}

      <EmojiPanel
        open={showFullEmojiPicker}
        onEmojiSelect={(emoji: any) =>
          setMessage(message + emoji.native)
        }
      />
    </div>
  );
}