import { config } from "dotenv";
import path from "path";

// Load env vars immediately
config({ path: path.resolve(process.cwd(), "apps/web/.env.local") });

async function debugUserLookup(chatId: string) {
  console.log(`🔍 Debugging user lookup for Chat ID: ${chatId}`);

  // Dynamic imports to ensure env vars are loaded
  const { default: connectToDatabase } = await import("./apps/web/lib/mongodb");
  const { default: User } = await import("./apps/web/models/User");
  const { default: Channel } = await import("./apps/web/models/Channel");

  await connectToDatabase();

  // 1. Direct Lookup
  const userDirect = await User.findOne({ telegramChatId: chatId });
  console.log(
    `1. Direct Lookup (telegramChatId):`,
    userDirect ? `Found User ${userDirect._id}` : "Not Found",
  );

  // 2. Channel Lookup
  // Check string match first
  const channel = await Channel.findOne({ "config.chatId": chatId });
  console.log(
    `2. Channel Lookup ("config.chatId"):`,
    channel
      ? `Found Channel ${channel._id} for User ${channel.userId}`
      : "Not Found",
  );

  if (channel) {
    const userChannel = await User.findById(channel.userId);
    console.log(
      `   -> User from Channel:`,
      userChannel ? `Found User ${userChannel._id}` : "Not Found",
    );
  } else {
    // Check if it might be stored as number?
    const channelNum = await Channel.findOne({
      "config.chatId": parseInt(chatId),
    });
    console.log(
      `3. Channel Lookup (numeric chatId):`,
      channelNum
        ? `Found Channel ${channelNum._id} for User ${channelNum.userId}`
        : "Not Found",
    );
  }

  process.exit(0);
}

const TEST_CHAT_ID = "888552489";
debugUserLookup(TEST_CHAT_ID);
