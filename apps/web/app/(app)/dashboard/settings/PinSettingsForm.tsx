"use client";

import Loader from "@/components/ui/aevr/loader";
import { Button } from "@/components/ui/aevr/button";
import { Lock1 } from "iconsax-react";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldSet,
  FieldLegend,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function PinSettingsForm() {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pin.length !== 4) {
      setMessage("Error: PIN must be 4 digits");
      return;
    }

    if (pin !== confirmPin) {
      setMessage("Error: PINs do not match");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/pin/set", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to set PIN");
      }

      setMessage("PIN set successfully!");
      setPin("");
      setConfirmPin("");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setMessage("Error setting PIN: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div className="space-y-4">
        <div className="space-y-4">
          <FieldSet>
            <FieldLegend>Set Login PIN</FieldLegend>
            <FieldDescription className="mb-3">
              Create a 4-digit PIN for faster login on trusted devices.
            </FieldDescription>

            <FieldGroup className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel className="sr-only">New PIN</FieldLabel>
                <Input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="New PIN"
                />
              </Field>
              <Field>
                <FieldLabel className="sr-only">Confirm PIN</FieldLabel>
                <Input
                  type="password"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) =>
                    setConfirmPin(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Confirm PIN"
                />
              </Field>
            </FieldGroup>
          </FieldSet>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          type="submit"
          disabled={isLoading || !pin}
          variant="default"
          className="bg-gray-900 text-white hover:bg-gray-800 transition-colors"
        >
          {isLoading ? (
            <Loader loading className="w-4 h-4 animate-spin" />
          ) : (
            <Lock1 size={16} color="currentColor" variant="Bulk" />
          )}
          Update PIN
        </Button>
        {message && (
          <span
            className={
              message.includes("Error") ? "text-red-600" : "text-green-600"
            }
          >
            {message}
          </span>
        )}
      </div>
    </form>
  );
}
