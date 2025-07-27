import React from "react";
import {
  DropZone,
  Text,
  FileTrigger,
  Button as RACButton,
} from "react-aria-components";
import { DropEvent } from "react-aria";
import { TextFile } from "@/hooks/useFileProcessor";
import { acceptedFileTypes } from "@/utils/fileConstants";

interface FileDropZoneProps {
  isProcessing: boolean;
  replaceOnDrop: boolean;
  files: TextFile[];
  onDrop: (e: DropEvent) => Promise<void>;
  onSelect: (fileList: FileList | null) => Promise<void>;
  header: React.ReactNode;
  content: React.ReactNode;
  footer: React.ReactNode;
}

export const FileDropZone = React.memo(function FileDropZone({
  isProcessing,
  replaceOnDrop,
  files,
  onDrop,
  onSelect,
  header,
  content,
  footer,
}: FileDropZoneProps) {
  return (
    <DropZone
      aria-label="Drop files here or click to select files."
      className="flex flex-col justify-center items-center gap-10 h-full group"
      onDrop={onDrop}
      getDropOperation={(types) => {
        // Can't drop items already in the list
        if (types.has("application/x-gridlist-key")) {
          return "cancel";
        }

        return "copy";
      }}
    >
      {({ isDropTarget }) => (
        <div className="p-4 sm:p-8 rounded-lg flex flex-col h-full">
          {isProcessing && (
            <div className="absolute inset-0 z-20 rounded-lg h-dvh flex items-center justify-center bg-white/80 dark:bg-black/80">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
                <Text className="font-semibold text-lg text-black dark:text-white">
                  Processing files...
                </Text>
              </div>
            </div>
          )}

          {isDropTarget &&
            !isProcessing &&
            ((files.length > 0 && !replaceOnDrop) || files.length === 0) && (
              <div className="absolute inset-0 z-20 rounded-lg h-dvh flex items-center justify-center backdrop-blur-sm bg-white/30 dark:bg-black/30">
                <Text className="font-semibold text-5xl text-black dark:text-white drop-shadow-2xl">
                  Drop to add
                </Text>
              </div>
            )}

          {isDropTarget && files.length > 0 && replaceOnDrop && (
            <div className="absolute inset-0 z-10 rounded-lg h-dvh flex flex-col gap-3 items-center justify-center">
              <Text className="font-semibold text-xl text-black drop-shadow-xl">
                Drop to replace {files.length} files
              </Text>
            </div>
          )}

          <div className="flex-shrink-0">{header}</div>

          {files.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center justify-center gap-2 group-drop-target:blur-xl transition duration-500 ease-in-out">
                <Text
                  className="font-semibold text-xl inline mx-1 relative"
                  slot="label"
                >
                  Drop files
                </Text>
                <div>or</div>
                <div className="text-center">
                  <FileTrigger
                    acceptedFileTypes={acceptedFileTypes}
                    allowsMultiple
                    onSelect={isProcessing ? undefined : onSelect}
                  >
                    <RACButton
                      className="mt-1 rounded-md border border-slate-600 dark:border-slate-100 dark:hover:border-slate-300 px-2 py-1 cursor-default dark:text-slate-100 dark:hover:text-slate-300 text-slate-600 hover:text-slate-800 outline-none focus-visible:ring-2 ring-offset-white ring-slate-800 dark:ring-white dark:ring-offset-black transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                      isDisabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Select"}
                    </RACButton>
                  </FileTrigger>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 overflow-auto">{content}</div>
          )}

          <div className="flex-shrink-0">{footer}</div>
        </div>
      )}
    </DropZone>
  );
});
