import React from "react";
import { SettingsSwitch } from "@/components/SettingsSwitch";

interface AppFooterProps {
  autoCopy: boolean;
  onAutoCopyChange: (value: boolean) => void;
}

export const AppFooter = React.memo(function AppFooter({
  autoCopy,
  onAutoCopyChange,
}: AppFooterProps) {
  return (
    <div className="max-w-80 mx-auto text-sm text-center font-light font-mono group-drop-target:blur-xl transition duration-500 ease-in-out">
      <div className="flex justify-center m-4">
        <SettingsSwitch
          label="Auto-copy"
          isSelected={autoCopy}
          onChange={onAutoCopyChange}
        />
      </div>
      Convert files to text prompts for ChatGPT, Claude, Gemini, etc.{" "}
      <u>in the browser</u>.
    </div>
  );
});
