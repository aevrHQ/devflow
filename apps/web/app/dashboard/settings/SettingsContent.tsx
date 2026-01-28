"use client";

import { useState } from "react";
import SettingsSection from "@/components/Settings/SettingsSection";
import SettingsItem from "@/components/Settings/SettingsItem";
import SettingsDrawer from "@/components/Settings/SettingsDrawer";
import CredentialsForm from "@/app/dashboard/settings/CredentialsForm";
import NotificationChannelsForm, {
  Channel,
} from "@/app/dashboard/settings/NotificationChannelsForm";
import PreferencesForm from "@/app/dashboard/settings/PreferencesForm";
import PinSettingsForm from "@/app/dashboard/settings/PinSettingsForm";
import WebhookInfo from "@/app/dashboard/settings/WebhookInfo";
import {
  ShieldSecurity,
  Key,
  Notification,
  Setting4,
  InfoCircle,
} from "iconsax-react";
interface SettingsContentProps {
  user: { userId: string; email?: string | null };
  channels: Channel[];
  preferences: { aiSummary: boolean; allowedSources: string[] };
  hasGithubToken: boolean;
  header: React.ReactNode;
}

export default function SettingsContent({
  user,
  channels,
  preferences,
  hasGithubToken,
  header,
}: SettingsContentProps) {
  const [openDrawer, setOpenDrawer] = useState<string | null>(null);

  return (
    <div className="max-w-md mx-auto pb-20">
      {header}

      <SettingsSection title="Profile & Account">
        <SettingsDrawer
          title="Credentials"
          open={openDrawer === "credentials"}
          onOpenChange={(open) => setOpenDrawer(open ? "credentials" : null)}
          trigger={
            <SettingsItem
              icon={<Key size={24} variant="TwoTone" className="text-black" />}
              label="Credentials"
              onClick={() => setOpenDrawer("credentials")}
            />
          }
        >
          <div className="overflow-y-auto max-h-[70vh] pb-8">
            <CredentialsForm initialHasGithubToken={hasGithubToken} />
          </div>
        </SettingsDrawer>

        <SettingsDrawer
          title="Security"
          open={openDrawer === "security"}
          onOpenChange={(open) => setOpenDrawer(open ? "security" : null)}
          trigger={
            <SettingsItem
              icon={
                <ShieldSecurity
                  size={24}
                  variant="TwoTone"
                  className="text-black"
                />
              }
              label="Security & PIN"
              onClick={() => setOpenDrawer("security")}
            />
          }
        >
          <div className="overflow-y-auto max-h-[70vh] pb-8">
            <PinSettingsForm />
          </div>
        </SettingsDrawer>
      </SettingsSection>

      <SettingsSection title="Preferences">
        <SettingsDrawer
          title="Notification Channels"
          open={openDrawer === "channels"}
          onOpenChange={(open) => setOpenDrawer(open ? "channels" : null)}
          trigger={
            <SettingsItem
              icon={
                <Notification
                  size={24}
                  variant="TwoTone"
                  className="text-black"
                />
              }
              label="Notification Channels"
              onClick={() => setOpenDrawer("channels")}
            />
          }
        >
          <div className="overflow-y-auto max-h-[70vh] pb-8">
            <NotificationChannelsForm
              initialChannels={channels}
              userId={user.userId.toString()}
            />
          </div>
        </SettingsDrawer>

        <SettingsDrawer
          title="General Preferences"
          open={openDrawer === "preferences"}
          onOpenChange={(open) => setOpenDrawer(open ? "preferences" : null)}
          trigger={
            <SettingsItem
              icon={
                <Setting4 size={24} variant="TwoTone" className="text-black" />
              }
              label="Preferences"
              onClick={() => setOpenDrawer("preferences")}
            />
          }
        >
          <div className="overflow-y-auto max-h-[70vh] pb-8">
            <PreferencesForm initialPreferences={preferences} />
          </div>
        </SettingsDrawer>

        <SettingsDrawer
          title="Webhook Information"
          open={openDrawer === "webhook"}
          onOpenChange={(open) => setOpenDrawer(open ? "webhook" : null)}
          trigger={
            <SettingsItem
              icon={
                <InfoCircle
                  size={24}
                  variant="TwoTone"
                  className="text-black"
                />
              }
              label="Webhook Info"
              onClick={() => setOpenDrawer("webhook")}
            />
          }
        >
          <div className="overflow-y-auto max-h-[70vh] pb-8">
            <WebhookInfo userId={user.userId.toString()} />
          </div>
        </SettingsDrawer>
      </SettingsSection>
    </div>
  );
}
