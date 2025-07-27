import React from "react";
import { GridList, GridListItem } from "@/components/GridList";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { Modal } from "@/components/Modal";
import { AddFileMenu } from "@/components/AddFileMenu";
import { Button as RACButton, DialogTrigger, Key } from "react-aria-components";
import { NumberFormatter } from "@internationalized/number";
import { TextFile } from "@/hooks/useFileProcessor";

interface FileListComponentProps {
  files: TextFile[];
  formattedOutput: string;
  tokenCount: number;
  isCalculating: boolean;
  isProcessing: boolean;
  dragAndDropHooks: any;
  encoding: any;
  onRemoveFile: (fileKey: Key) => void;
  onClearFiles: () => void;
  onCopyToClipboard: () => void;
  onSelectFiles: (fileList: FileList | null) => Promise<void>;
  onManualEntry: (
    name: string | undefined,
    content: string,
    addToTop: boolean
  ) => void;
}

const formatter = new NumberFormatter("en-US");

const getDisplayName = (file: TextFile): string => {
  if (file.name) {
    return file.name;
  }
  // Show first 50 characters of content with ellipsis if no name
  const preview = file.content.replace(/\s+/g, " ").trim();
  return preview.length > 50 ? preview.substring(0, 50) + "..." : preview;
};

const getDialogTitle = (file: TextFile, tokenCount: number): string => {
  if (file.name) {
    return `${file.name} (${formatter.format(tokenCount)} tokens)`;
  }
  return `Text Entry (${formatter.format(tokenCount)} tokens)`;
};

export const FileListComponent = React.memo(function FileListComponent({
  files,
  formattedOutput,
  tokenCount,
  isCalculating,
  isProcessing,
  dragAndDropHooks,
  encoding,
  onRemoveFile,
  onClearFiles,
  onCopyToClipboard,
  onSelectFiles,
  onManualEntry,
}: FileListComponentProps) {
  if (files.length === 0) {
    return null;
  }

  return (
    <>
      <GridList
        className="group-drop-target:pointer-events-none group-drop-target:blur-xl transition duration-500 ease-in-out overflow-scroll w-auto rounded-lg m-auto border-none"
        items={files}
        dragAndDropHooks={dragAndDropHooks}
        aria-label="Files"
      >
        {(item) => (
          <GridListItem
            textValue={getDisplayName(item)}
            onRemove={() => onRemoveFile(item.key)}
            className="border-none"
          >
            {getDisplayName(item)}
            <DialogTrigger>
              <RACButton
                aria-label="Preview file"
                className="rounded-full p-1 cursor-default dark:text-slate-100 dark:hover:text-slate-300 text-slate-600 hover:text-slate-800 outline-none focus-visible:ring-2 ring-offset-1 ring-offset-white ring-slate-800 dark:ring-white dark:ring-offset-black transition duration-200 ease-in-out"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              </RACButton>
              <Modal isDismissable>
                <Dialog
                  title={getDialogTitle(
                    item,
                    encoding.encode(item.content).length
                  )}
                >
                  <pre className="overflow-scroll">{item.content}</pre>
                </Dialog>
              </Modal>
            </DialogTrigger>
          </GridListItem>
        )}
      </GridList>

      <div className="flex gap-2 justify-center group-drop-target:blur-xl transition duration-500 ease-in-out">
        <Button onPress={onClearFiles}>Clear</Button>
        <Button onPress={onCopyToClipboard}>Copy</Button>
        <DialogTrigger>
          <Button>Preview</Button>
          <Modal isDismissable>
            <Dialog
              title={`Output (${
                isCalculating ? "calculating..." : formatter.format(tokenCount)
              } tokens)`}
            >
              <pre className="overflow-scroll">{formattedOutput}</pre>
            </Dialog>
          </Modal>
        </DialogTrigger>
        <AddFileMenu
          isDisabled={isProcessing}
          onSelectFiles={onSelectFiles}
          onManualEntry={onManualEntry}
        />
      </div>
    </>
  );
});
