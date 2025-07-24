import { useState } from "react";

export interface Settings {
  selectedOption: string;
  selectedMarkdownOption: string;
  selectedXmlOption: string;
  autoCopy: boolean;
  replaceOnDrop: boolean;
  ignoreSystemFiles: boolean;
}

export const useSettings = () => {
  const [selectedOption, setSelectedOption] = useState("markdown");
  const [selectedMarkdownOption, setSelectedMarkdownOption] =
    useState("markdown1");
  const [selectedXmlOption, setSelectedXmlOption] = useState("xml1");
  const [autoCopy, setAutoCopy] = useState(true);
  const [replaceOnDrop, setReplaceOnDrop] = useState(false);
  const [ignoreSystemFiles, setIgnoreSystemFiles] = useState(true);

  const settings: Settings = {
    selectedOption,
    selectedMarkdownOption,
    selectedXmlOption,
    autoCopy,
    replaceOnDrop,
    ignoreSystemFiles,
  };

  const updateSettings = {
    setSelectedOption,
    setSelectedMarkdownOption,
    setSelectedXmlOption,
    setAutoCopy,
    setReplaceOnDrop,
    setIgnoreSystemFiles,
  };

  return { settings, updateSettings };
};
