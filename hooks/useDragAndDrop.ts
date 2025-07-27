import { useRef } from "react";
import { useDragAndDrop as useRADragAndDrop } from "react-aria-components";
import { TextFile } from "./useFileProcessor";

export const useDragAndDrop = (
  files: TextFile[],
  onReorderFiles: (
    keys: Set<any>,
    target: any,
    position: "before" | "after"
  ) => void
) => {
  const isListDragging = useRef(false);

  const { dragAndDropHooks } = useRADragAndDrop({
    onDragStart: () => {
      isListDragging.current = true;
    },
    onDragEnd: () => {
      isListDragging.current = false;
    },
    getItems: (keys) =>
      files
        .filter((file) => keys.has(file.key))
        .map((file) => ({
          "text/plain":
            file.name ||
            file.content.replace(/\s+/g, " ").trim().substring(0, 50),
          "application/x-gridlist-key": String(file.key),
        })),
    onReorder(e) {
      if (e.target.dropPosition === "before") {
        onReorderFiles(e.keys, e.target, "before");
      } else if (e.target.dropPosition === "after") {
        onReorderFiles(e.keys, e.target, "after");
      }
    },
  });

  return {
    dragAndDropHooks,
    isListDragging,
  };
};
