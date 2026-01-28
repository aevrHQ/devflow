"use client";

import { Drawer } from "vaul";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReactNode, useState, useEffect } from "react";
import { useMediaQuery } from "@/hooks/aevr/use-media-query";

interface SettingsDrawerProps {
  trigger: ReactNode;
  title: string;
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function SettingsDrawer({
  trigger,
  title,
  children,
  open,
  onOpenChange,
}: SettingsDrawerProps) {
  // Always start with false to match server-side rendering (mobile-first approach or safe default)
  // But wait for hydration to check media query to avoid hydration mismatch
  const [isDesktop, setIsDesktop] = useState(false);
  const isDesktopQuery = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    setIsDesktop(isDesktopQuery);
  }, [isDesktopQuery]);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="pt-2">{children}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="bg-gray-100 flex flex-col rounded-t-[10px] h-[96%] mt-24 fixed bottom-0 left-0 right-0 z-50 focus:outline-none">
          <div className="p-4 bg-white rounded-t-[10px] flex-1 overflow-y-auto">
            <div className="mx-auto w-12 h-1.5 shrink-0 rounded-full bg-gray-300 mb-8" />
            <div className="max-w-md mx-auto">
              <Drawer.Title className="font-bold text-xl mb-4">
                {title}
              </Drawer.Title>
              {children}
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
