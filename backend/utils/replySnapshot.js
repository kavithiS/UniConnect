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
  if (!replyTo) return null;

  let normalizedReply = replyTo;
  if (typeof replyTo === "string") {
    const trimmedReply = replyTo.trim();
    if (!trimmedReply || trimmedReply === "null") return null;

    try {
      normalizedReply = JSON.parse(trimmedReply);
    } catch {
      return null;
    }
  }

  if (typeof normalizedReply !== "object") return null;

  return {
    messageId: normalizedReply.messageId || normalizedReply._id || null,
    senderName: normalizedReply.senderName || "",
    messageType: normalizedReply.messageType || "text",
    messageText:
      typeof normalizedReply.messageText === "string"
        ? normalizedReply.messageText.trim()
        : typeof normalizedReply.text === "string"
          ? normalizedReply.text.trim()
          : "",
    fileUrl: normalizedReply.fileUrl || null,
  };
};

module.exports = {
  buildReplySnapshot,
  inferMessageType,
  sanitizeReplySnapshot,
};
