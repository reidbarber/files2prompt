import React, { useState, useEffect } from "react";
import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { Modal } from "@/components/Modal";
import {
  TextField,
  Label,
  Input,
  TextArea,
  RadioGroup,
  Radio,
} from "react-aria-components";

interface ManualEntryDialogProps {
  onAdd: (name: string | undefined, content: string, addToTop: boolean) => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const ManualEntryDialog: React.FC<ManualEntryDialogProps> = ({
  onAdd,
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
}) => {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [position, setPosition] = useState("top");
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  const isOpen =
    controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = controlledOnOpenChange || setInternalIsOpen;

  const handleAdd = () => {
    if (content.trim()) {
      onAdd(name.trim() || undefined, content, position === "top");
      setName("");
      setContent("");
      setIsOpen(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setName("");
      setContent("");
      setPosition("top");
    }
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setName("");
      setContent("");
      setPosition("top");
    }
  }, [isOpen]);

  return (
    <Modal isDismissable isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Dialog title="Enter Text Manually">
        <div className="flex flex-col gap-4">
          <TextField value={name} onChange={setName}>
            <Label className="block text-sm font-medium mb-1">
              Name (optional)
            </Label>
            <Input className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </TextField>

          <TextField value={content} onChange={setContent}>
            <Label className="block text-sm font-medium mb-1">Content</Label>
            <TextArea
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
            />
          </TextField>

          <RadioGroup value={position} onChange={setPosition}>
            <Label className="block text-sm font-medium mb-2">Add to</Label>
            <div className="flex gap-4">
              <Radio value="top" className="flex items-center gap-2 group">
                <div className="w-4 h-4 rounded-full border-2 border-gray-400 dark:border-gray-500 group-hover:border-blue-500 group-data-[selected]:border-blue-500 group-data-[selected]:bg-blue-500 transition-colors flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white opacity-0 group-data-[selected]:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                  Top of list
                </span>
              </Radio>
              <Radio value="bottom" className="flex items-center gap-2 group">
                <div className="w-4 h-4 rounded-full border-2 border-gray-400 dark:border-gray-500 group-hover:border-blue-500 group-data-[selected]:border-blue-500 group-data-[selected]:bg-blue-500 transition-colors flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white opacity-0 group-data-[selected]:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                  Bottom of list
                </span>
              </Radio>
            </div>
          </RadioGroup>

          <div className="flex gap-2 justify-end">
            <Button onPress={handleAdd} isDisabled={!content.trim()}>
              Add
            </Button>
          </div>
        </div>
      </Dialog>
    </Modal>
  );
};
