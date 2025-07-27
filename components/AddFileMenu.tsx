import React, { useRef, useState } from "react";
import { Button } from "@/components/Button";
import { ManualEntryDialog } from "@/components/ManualEntryDialog";
import {
  FileTrigger,
  MenuTrigger,
  Menu,
  MenuItem,
  Popover,
  Key,
} from "react-aria-components";
import { acceptedFileTypes } from "@/utils/fileConstants";

interface AddFileMenuProps {
  isDisabled?: boolean;
  onSelectFiles: (fileList: FileList | null) => Promise<void>;
  onManualEntry: (
    name: string | undefined,
    content: string,
    addToTop: boolean
  ) => void;
}

export const AddFileMenu: React.FC<AddFileMenuProps> = ({
  isDisabled,
  onSelectFiles,
  onManualEntry,
}) => {
  const fileTriggerRef = useRef<HTMLButtonElement>(null);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState(false);

  const handleMenuAction = (key: Key) => {
    if (key === "select-file") {
      fileTriggerRef.current?.click();
    } else if (key === "enter-manually") {
      setIsManualEntryOpen(true);
    }
  };

  const handleManualEntryAdd = (
    name: string | undefined,
    content: string,
    addToTop: boolean
  ) => {
    onManualEntry(name, content, addToTop);
    setIsManualEntryOpen(false);
  };

  return (
    <>
      <MenuTrigger>
        <Button isDisabled={isDisabled}>Add</Button>
        <Popover className="min-w-[160px]">
          <Menu
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg p-1 outline-none"
            onAction={handleMenuAction}
          >
            <MenuItem
              id="select-file"
              className="px-3 py-2 text-sm hover:bg-gray-100 select-none dark:hover:bg-gray-700 rounded outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
            >
              Select File
            </MenuItem>
            <MenuItem
              id="enter-manually"
              className="px-3 py-2 text-sm hover:bg-gray-100 select-none dark:hover:bg-gray-700 rounded outline-none focus:bg-gray-100 dark:focus:bg-gray-700"
            >
              Enter Manually
            </MenuItem>
          </Menu>
        </Popover>
      </MenuTrigger>

      <FileTrigger
        ref={fileTriggerRef as React.RefObject<HTMLInputElement>}
        acceptedFileTypes={acceptedFileTypes}
        allowsMultiple
        onSelect={isDisabled ? undefined : onSelectFiles}
      >
        <Button className="hidden">Select File</Button>
      </FileTrigger>

      <ManualEntryDialog
        onAdd={handleManualEntryAdd}
        isOpen={isManualEntryOpen}
        onOpenChange={setIsManualEntryOpen}
      />
    </>
  );
};
