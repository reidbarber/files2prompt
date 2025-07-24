import { useCallback } from "react";
import { Key } from "react-aria-components";
import { TextFile } from "./useFileProcessor";

export const useFileOperations = () => {
  const reorderFiles = useCallback(
    (
      files: TextFile[],
      keys: Set<Key>,
      target: any,
      position: "before" | "after"
    ): TextFile[] => {
      const newFiles = [...files];
      const targetIndex = newFiles.findIndex((file) => file.key === target.key);

      for (const key of keys) {
        const item = newFiles.find((file) => file.key === key);
        if (item !== undefined) {
          newFiles.splice(newFiles.indexOf(item), 1);
          const insertIndex =
            position === "before" ? targetIndex : targetIndex + 1;
          newFiles.splice(insertIndex, 0, item);
        }
      }

      return newFiles;
    },
    []
  );

  const removeFile = useCallback(
    (files: TextFile[], fileKey: Key): TextFile[] => {
      return files.filter((file) => file.key !== fileKey);
    },
    []
  );

  const clearFiles = useCallback((): TextFile[] => {
    return [];
  }, []);

  return {
    reorderFiles,
    removeFile,
    clearFiles,
  };
};
