import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { TextFile } from "./useFileProcessor";

export const useClipboard = (
  formattedOutput: string,
  files: TextFile[],
  selectedOptionLabel: string,
  autoCopy: boolean
) => {
  const lastFormattedOutputRef = useRef("");

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formattedOutput);
      toast(
        `Successfully copied prompt for ${files.length} files in ${selectedOptionLabel}!`
      );
    } catch (err) {
      console.error("Failed to copy files to clipboard:", err);
      toast.error("Failed to copy to clipboard");
    }
  }, [formattedOutput, files.length, selectedOptionLabel]);

  useEffect(() => {
    if (
      autoCopy &&
      files.length > 0 &&
      formattedOutput !== lastFormattedOutputRef.current
    ) {
      lastFormattedOutputRef.current = formattedOutput;
      copyToClipboard();
    }
  }, [autoCopy, files.length, formattedOutput, copyToClipboard]);

  return { copyToClipboard };
};
