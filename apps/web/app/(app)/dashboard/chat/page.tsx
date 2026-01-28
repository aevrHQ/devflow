import { Metadata } from "next";
import WebChatInterface from "@/components/channels/WebChatInterface";

export const metadata: Metadata = {
  title: "Chat - Devflow",
};

export default function ChatPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          DevFlow Chat
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Chat with your agents and receive real-time notifications.
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <WebChatInterface />
      </div>
    </div>
  );
}
