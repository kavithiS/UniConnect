const inferMessageType = (message) => {
  if (!message) return "text";

  const fileType = String(message.fileType || "").toLowerCase();

  if (message.fileUrl) {
    if (fileType.startsWith("image/")) {
      return "image";
    }

    return "file";
  }

  return "text";
};

const buildReplySnapshot = (message) => {
  if (!message) return null;

  return {
    messageId: message._id || message.messageId || null,
    senderName: message.senderName || "",
    messageType: inferMessageType(message),
    messageText: typeof message.text === "string" ? message.text.trim() : "",
    fileUrl: message.fileUrl || null,
  };
};

const sanitizeReplySnapshot = (replyTo) => {
  if (!replyTo || typeof replyTo !== "object") return null;

  return {
    messageId: replyTo.messageId || replyTo._id || null,
    senderName: replyTo.senderName || "",
    messageType: replyTo.messageType || "text",
    messageText:
      typeof replyTo.messageText === "string"
        ? replyTo.messageText.trim()
        : typeof replyTo.text === "string"
          ? replyTo.text.trim()
          : "",
    fileUrl: replyTo.fileUrl || null,
  };
};

module.exports = {
  buildReplySnapshot,
  inferMessageType,
  sanitizeReplySnapshot,
};
