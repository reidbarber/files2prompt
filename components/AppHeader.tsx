import React from "react";
import { AnimatedRadioGroup } from "@/components/AnimatedRadioGroup";
import { SettingsPanel } from "@/components/SettingsPanel";
import { Settings } from "@/hooks/useSettings";
import { options } from "@/utils/fileConstants";

interface AppHeaderProps {
  settings: Settings;
  updateSettings: {
    setSelectedOption: (option: string) => void;
    setSelectedMarkdownOption: (option: string) => void;
    setSelectedXmlOption: (option: string) => void;
    setReplaceOnDrop: (value: boolean) => void;
    setIgnoreSystemFiles: (value: boolean) => void;
  };
}

export const AppHeader = React.memo(function AppHeader({
  settings,
  updateSettings,
}: AppHeaderProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex justify-center gap-3">
        <h1 className="text-center text-xl font-mono">files2prompt</h1>
        <SettingsPanel settings={settings} updateSettings={updateSettings} />
      </div>
      <AnimatedRadioGroup
        label="Output format"
        className="group-drop-target:blur-xl transition duration-500 ease-in-out"
        options={options}
        selectedOption={settings.selectedOption}
        setSelectedOption={updateSettings.setSelectedOption}
      />
    </div>
  );
});
