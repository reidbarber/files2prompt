"use client";

import { useCallback, useMemo, useState } from "react";
import { getEncoding } from "js-tiktoken";
import { formatMarkdown, formatXML } from "@/utils/outputUtils";
import { options } from "@/utils/fileConstants";
import { useSettings } from "@/hooks/useSettings";
import { useTokenCount } from "@/hooks/useTokenCount";
import { useFileProcessor, TextFile } from "@/hooks/useFileProcessor";
import { useFileOperations } from "@/hooks/useFileOperations";
import { useClipboard } from "@/hooks/useClipboard";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import { AppHeader } from "@/components/AppHeader";
import { AppFooter } from "@/components/AppFooter";
import { FileDropZone } from "@/components/FileDropZone";
import { FileListComponent } from "@/components/FileListComponent";

const convertFilesToString = (
  files: TextFile[],
  selectedOption: string,
  selectedMarkdownOption: string,
  selectedXmlOption: string
): string => {
  if (files.length === 0) return "";

  switch (selectedOption) {
    case "markdown":
      return formatMarkdown(files, selectedMarkdownOption);
    case "xml":
      return formatXML(files, selectedXmlOption);
    default:
      return "";
  }
};

export default function Home() {
  const [files, setFiles] = useState<TextFile[]>([]);
  const encoding = useMemo(() => getEncoding("cl100k_base"), []);
  const { settings, updateSettings } = useSettings();
  const { reorderFiles, removeFile, clearFiles } = useFileOperations();
  const { isProcessing, handleDrop, handleSelect } = useFileProcessor(
    settings.ignoreSystemFiles,
    settings.replaceOnDrop
  );

  const handleDropFiles = useCallback(
    async (e: any) => {
      const newFiles = await handleDrop(e);
      setFiles((prevFiles) =>
        settings.replaceOnDrop ? newFiles : [...prevFiles, ...newFiles]
      );
    },
    [handleDrop, settings.replaceOnDrop]
  );

  const handleSelectFiles = useCallback(
    async (fileList: FileList | null) => {
      const newFiles = await handleSelect(fileList);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    },
    [handleSelect]
  );

  const handleManualEntry = useCallback(
    (name: string | undefined, content: string, addToTop: boolean) => {
      const newFile: TextFile = {
        key: crypto.randomUUID(),
        name,
        content,
      };

      setFiles((prevFiles) =>
        addToTop ? [newFile, ...prevFiles] : [...prevFiles, newFile]
      );
    },
    []
  );

  const handleRemoveFile = useCallback(
    (fileKey: any) => {
      setFiles((prevFiles) => removeFile(prevFiles, fileKey));
    },
    [removeFile]
  );

  const handleClearFiles = useCallback(() => {
    setFiles(clearFiles());
  }, [clearFiles]);

  const handleReorderFiles = useCallback(
    (keys: Set<any>, target: any, position: "before" | "after") => {
      setFiles((prevFiles) => reorderFiles(prevFiles, keys, target, position));
    },
    [reorderFiles]
  );

  const { dragAndDropHooks } = useDragAndDrop(files, handleReorderFiles);

  const formattedOutput = useMemo(() => {
    return convertFilesToString(
      files,
      settings.selectedOption,
      settings.selectedMarkdownOption,
      settings.selectedXmlOption
    );
  }, [
    files,
    settings.selectedMarkdownOption,
    settings.selectedOption,
    settings.selectedXmlOption,
  ]);

  const { tokenCount, isCalculating } = useTokenCount(
    formattedOutput,
    encoding
  );

  const selectedOptionLabel = useMemo(
    () =>
      options.find((option) => option.id === settings.selectedOption)?.label ||
      "",
    [settings.selectedOption]
  );

  const { copyToClipboard } = useClipboard(
    formattedOutput,
    files,
    selectedOptionLabel,
    settings.autoCopy
  );

  return (
    <main className="h-dvh">
      <FileDropZone
        isProcessing={isProcessing}
        replaceOnDrop={settings.replaceOnDrop}
        files={files}
        onDrop={handleDropFiles}
        onSelect={handleSelectFiles}
        header={
          <AppHeader settings={settings} updateSettings={updateSettings} />
        }
        content={
          <div className="flex flex-col items-center justify-center p-20 gap-5 max-h-full overflow-auto">
            <FileListComponent
              files={files}
              formattedOutput={formattedOutput}
              tokenCount={tokenCount}
              isCalculating={isCalculating}
              isProcessing={isProcessing}
              dragAndDropHooks={dragAndDropHooks}
              encoding={encoding}
              onRemoveFile={handleRemoveFile}
              onClearFiles={handleClearFiles}
              onCopyToClipboard={copyToClipboard}
              onSelectFiles={handleSelectFiles}
              onManualEntry={handleManualEntry}
            />
          </div>
        }
        footer={
          <AppFooter
            autoCopy={settings.autoCopy}
            onAutoCopyChange={updateSettings.setAutoCopy}
          />
        }
      />
    </main>
  );
}
