import React from "react";
import { Dialog } from "@/components/Dialog";
import { Modal } from "@/components/Modal";
import { SettingsSwitch } from "@/components/SettingsSwitch";
import { DetailedAnimatedRadioGroup } from "@/components/DetailedAnimatedRadioGroup";
import {
  Button as RACButton,
  DialogTrigger,
  Text,
} from "react-aria-components";
import { Settings } from "@/hooks/useSettings";
import { markdownOptions, xmlOptions } from "@/utils/fileConstants";

interface SettingsPanelProps {
  settings: Settings;
  updateSettings: {
    setSelectedMarkdownOption: (option: string) => void;
    setSelectedXmlOption: (option: string) => void;
    setReplaceOnDrop: (value: boolean) => void;
    setIgnoreSystemFiles: (value: boolean) => void;
  };
}

export const SettingsPanel = React.memo(function SettingsPanel({
  settings,
  updateSettings,
}: SettingsPanelProps) {
  return (
    <DialogTrigger>
      <RACButton
        className="rounded-full p-1 cursor-default dark:text-slate-100 dark:hover:text-slate-300 text-slate-600 hover:text-slate-800 outline-none focus-visible:ring-2 ring-offset-2 ring-offset-white ring-slate-800 dark:ring-white dark:ring-offset-black transition duration-200 ease-in-out group-drop-target:blur-xl"
        aria-label="Settings"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5"
        >
          <path d="M13.024 9.25c.47 0 .827-.433.637-.863a4 4 0 0 0-4.094-2.364c-.468.05-.665.576-.43.984l1.08 1.868a.75.75 0 0 0 .649.375h2.158ZM7.84 7.758c-.236-.408-.79-.5-1.068-.12A3.982 3.982 0 0 0 6 10c0 .884.287 1.7.772 2.363.278.38.832.287 1.068-.12l1.078-1.868a.75.75 0 0 0 0-.75L7.839 7.758ZM9.138 12.993c-.235.408-.039.934.43.984a4 4 0 0 0 4.094-2.364c.19-.43-.168-.863-.638-.863h-2.158a.75.75 0 0 0-.65.375l-1.078 1.868Z" />
          <path
            fillRule="evenodd"
            d="m14.13 4.347.644-1.117a.75.75 0 0 0-1.299-.75l-.644 1.116a6.954 6.954 0 0 0-2.081-.556V1.75a.75.75 0 0 0-1.5 0v1.29a6.954 6.954 0 0 0-2.081.556L6.525 2.48a.75.75 0 1 0-1.3.75l.645 1.117A7.04 7.04 0 0 0 4.347 5.87L3.23 5.225a.75.75 0 1 0-.75 1.3l1.116.644A6.954 6.954 0 0 0 3.04 9.25H1.75a.75.75 0 0 0 0 1.5h1.29c.078.733.27 1.433.556 2.081l-1.116.645a.75.75 0 1 0 .75 1.298l1.117-.644a7.04 7.04 0 0 0 1.523 1.523l-.645 1.117a.75.75 0 1 0 1.3.75l.644-1.116a6.954 6.954 0 0 0 2.081.556v1.29a.75.75 0 0 0 1.5 0v-1.29a6.954 6.954 0 0 0 2.081-.556l.645 1.116a.75.75 0 0 0 1.299-.75l-.645-1.117a7.042 7.042 0 0 0 1.523-1.523l1.117.644a.75.75 0 0 0 .75-1.298l-1.116-.645a6.954 6.954 0 0 0 .556-2.081h1.29a.75.75 0 0 0 0-1.5h-1.29a6.954 6.954 0 0 0-.556-2.081l1.116-.644a.75.75 0 0 0-.75-1.3l-1.117.645a7.04 7.04 0 0 0-1.524-1.523ZM10 4.5a5.475 5.475 0 0 0-2.781.754A5.527 5.527 0 0 0 5.22 7.277 5.475 5.475 0 0 0 4.5 10a5.475 5.475 0 0 0 .752 2.777 5.527 5.527 0 0 0 2.028 2.004c.802.458 1.73.719 2.72.719a5.474 5.474 0 0 0 2.78-.753 5.527 5.527 0 0 0 2.001-2.027c.458-.802.719-1.73.719-2.72a5.475 5.475 0 0 0-.753-2.78 5.528 5.528 0 0 0-2.028-2.002A5.475 5.475 0 0 0 10 4.5Z"
            clipRule="evenodd"
          />
        </svg>
      </RACButton>
      <Modal isDismissable>
        <Dialog title="Settings">
          <div className="group-drop-target:blur-xl transition duration-500 ease-in-out">
            <div className="flex w-60 text-end mx-auto flex-col items-end gap-2 my-8">
              <SettingsSwitch
                label="Replace files on drop"
                isSelected={settings.replaceOnDrop}
                onChange={updateSettings.setReplaceOnDrop}
              />
              <SettingsSwitch
                label="Ignore system files"
                isSelected={settings.ignoreSystemFiles}
                onChange={updateSettings.setIgnoreSystemFiles}
              />
            </div>
            <div className="text-center flex flex-col gap-10">
              <div>
                <Text className="font-semibold text-lg">Markdown</Text>
                <DetailedAnimatedRadioGroup
                  label="Markdown options"
                  className="group-drop-target:blur-xl transition duration-500 ease-in-out my-3"
                  options={markdownOptions}
                  selectedOption={settings.selectedMarkdownOption}
                  setSelectedOption={updateSettings.setSelectedMarkdownOption}
                />
              </div>
              <div>
                <Text className="font-semibold text-lg">XML</Text>
                <DetailedAnimatedRadioGroup
                  label="XML options"
                  className="group-drop-target:blur-xl transition duration-500 ease-in-out my-3"
                  options={xmlOptions}
                  selectedOption={settings.selectedXmlOption}
                  setSelectedOption={updateSettings.setSelectedXmlOption}
                />
              </div>
            </div>
            <div className="p-10">
              <div className="text-center">Features: </div>
              <ul className="list-disc px-5 md:px-10 xl:px-28 pt-5">
                <li>
                  Switching between prompt structures (<b>Markdown</b> or{" "}
                  <b>XML</b>)
                </li>
                <li>
                  Adding files nested in <b>directories</b>
                </li>
                <li>
                  Automatically unarchiving <b>zip files</b>
                </li>
                <li>
                  Parsing <b>Excel</b> files to comma-separated text
                </li>
                <li>Reordering dropped files for the prompt</li>
                <li>
                  <b>Removing</b> individual files or the entire prompt
                </li>
                <li>
                  <b>Previewing</b> individual files or the entire prompt
                </li>
                <li>
                  <b>Auto-copying</b> when the file list or settings are changed
                </li>
                <li>
                  Viewing the <b>token count</b> for individual files and the
                  entire prompt
                </li>
              </ul>
            </div>
            <div className="p-10">
              <div className="text-center">Alternatives: </div>
              <ul className="list-disc px-5 md:px-10 xl:px-28 pt-5">
                <li>
                  Command-line:{" "}
                  <a
                    className="underline"
                    href="https://lib.rs/crates/code2prompt"
                    target="_blank"
                    rel="noreferrer"
                  >
                    code2prompt
                  </a>
                  ,{" "}
                  <a
                    className="underline"
                    href="https://github.com/simonw/files-to-prompt"
                    target="_blank"
                    rel="noreferrer"
                  >
                    files-to-prompt
                  </a>
                  ,{" "}
                  <a
                    className="underline"
                    href="https://github.com/3rd/promptpack"
                    target="_blank"
                    rel="noreferrer"
                  >
                    promptpack
                  </a>
                  ,{" "}
                  <a
                    className="underline"
                    href="https://github.com/jimmc414/1filellm"
                    target="_blank"
                    rel="noreferrer"
                  >
                    1filellm
                  </a>
                </li>
                <li>
                  MacOS:{" "}
                  <a
                    className="underline"
                    href="https://repoprompt.com/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    RepoPrompt
                  </a>
                  ,{" "}
                  <a
                    className="underline"
                    href="https://github.com/banagale/FileKitty"
                    target="_blank"
                    rel="noreferrer"
                  >
                    FileKitty
                  </a>
                </li>
              </ul>
            </div>
            <p className="text-center pt-8">
              Made by{" "}
              <a
                className="underline"
                href="https://www.reidbarber.com"
                target="_blank"
                rel="noreferrer"
              >
                Reid Barber
              </a>
            </p>
          </div>
        </Dialog>
      </Modal>
    </DialogTrigger>
  );
});
