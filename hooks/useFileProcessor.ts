import { useCallback, useRef, useState } from "react";
import { DropEvent } from "react-aria";
import {
  FileDropItem,
  TextDropItem,
  DirectoryDropItem,
  Key,
} from "react-aria-components";
import { toast } from "sonner";
import { BlobReader, BlobWriter, ZipReader } from "@zip.js/zip.js";
import { getTextFromExcelFile } from "@/utils/getTextFromExcelFile";
import {
  isExcel,
  isZip,
  isTextFile,
  isSupportedFileType,
  validateFileSize,
  shouldIgnoreFile,
} from "@/utils/fileValidation";
import {
  MAX_REGULAR_FILE_SIZE,
  MAX_ZIP_FILE_SIZE,
} from "@/utils/fileConstants";

export interface TextFile {
  key: Key;
  name?: string;
  content: string;
}

export const useFileProcessor = (
  ignoreSystemFiles: boolean,
  replaceOnDrop: boolean
) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const processFileAsync = useCallback(
    async (entry: FileDropItem | DirectoryDropItem): Promise<TextFile[]> => {
      const results: TextFile[] = [];

      try {
        if (entry.kind === "file") {
          const file = entry as FileDropItem;
          if (ignoreSystemFiles && shouldIgnoreFile(file.name)) {
            return results;
          }

          if (!isSupportedFileType(file)) {
            return results;
          }

          const fileContent = await file.getFile();
          let newFile = { key: crypto.randomUUID(), name: file.name };

          if (isExcel(file)) {
            results.push({
              ...newFile,
              content: await getTextFromExcelFile(fileContent),
            });
          } else if (isZip(file)) {
            validateFileSize(fileContent, MAX_ZIP_FILE_SIZE);
            const zipReader = new ZipReader(new BlobReader(fileContent));

            try {
              const entries = await zipReader.getEntries();

              for (const entry of entries) {
                if (entry.directory) continue;
                if (shouldIgnoreFile(entry.filename)) continue;

                const mockFile = { type: "", name: entry.filename };
                if (!isTextFile(mockFile)) {
                  continue;
                }

                const entryFileContent = await entry.getData?.(
                  new BlobWriter()
                );
                if (entryFileContent) {
                  validateFileSize(
                    { size: entryFileContent.size, name: entry.filename },
                    MAX_REGULAR_FILE_SIZE
                  );

                  const fileText = await new Response(entryFileContent).text();
                  results.push({
                    key: crypto.randomUUID(),
                    name: entry.filename,
                    content: fileText,
                  });
                }
              }
            } finally {
              try {
                await zipReader.close();
              } catch (closeError) {
                console.error("Error closing ZIP reader:", closeError);
              }
            }
          } else if (isTextFile(file)) {
            validateFileSize(fileContent, MAX_REGULAR_FILE_SIZE);
            results.push({
              key: crypto.randomUUID(),
              name: file.name,
              content: await file.getText(),
            });
          }
        } else if (entry.kind === "directory") {
          const directory = entry as DirectoryDropItem;
          for await (const nestedEntry of directory.getEntries()) {
            const nestedResults = await processFileAsync(nestedEntry);
            results.push(...nestedResults);
          }
        }
        return results;
      } catch (error) {
        console.error(
          `Error processing file: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        toast.error(
          `Error processing file: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        return results;
      }
    },
    [ignoreSystemFiles]
  );

  const handleDrop = useCallback(
    async (e: DropEvent): Promise<TextFile[]> => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setIsProcessing(true);

      try {
        if (signal.aborted) {
          return [];
        }

        const processingPromises: Promise<TextFile[]>[] = [];

        for (const item of e.items) {
          if (item.kind === "text") {
            const textItem = item as TextDropItem;
            const promise = textItem
              .getText("application/x-gridlist-key")
              .then((keyData) => {
                if (keyData) {
                  return [];
                }
                return textItem.getText("text/plain").then((content) => [
                  {
                    key: crypto.randomUUID(),
                    content,
                  },
                ]);
              })
              .catch(() => {
                return textItem.getText("text/plain").then((content) => [
                  {
                    key: crypto.randomUUID(),
                    content,
                  },
                ]);
              });
            processingPromises.push(promise);
          } else if (item.kind === "file" || item.kind === "directory") {
            processingPromises.push(
              processFileAsync(item as FileDropItem | DirectoryDropItem)
            );
          }
        }

        const results = await Promise.all(processingPromises);

        if (signal.aborted) {
          return [];
        }

        return results.flat();
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("File drop operation was cancelled");
          toast.info("File processing was cancelled");
          return [];
        }
        throw error;
      } finally {
        setIsProcessing(false);
        if (abortControllerRef.current?.signal === signal) {
          abortControllerRef.current = null;
        }
      }
    },
    [processFileAsync, replaceOnDrop]
  );

  const handleSelect = useCallback(
    async (fileList: FileList | null): Promise<TextFile[]> => {
      if (!fileList) return [];

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setIsProcessing(true);

      try {
        if (signal.aborted) {
          return [];
        }

        const newFiles: TextFile[] = [];

        const processFile = async (file: File) => {
          try {
            if (ignoreSystemFiles && shouldIgnoreFile(file.name)) {
              return;
            }

            if (!isTextFile(file)) {
              return;
            }

            validateFileSize(file, MAX_REGULAR_FILE_SIZE);

            const content = await file.text();
            newFiles.push({
              key: crypto.randomUUID(),
              name: file.name,
              content,
            });
          } catch (error) {
            console.error(
              `Error processing file "${file.name}": ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            );
            toast.error(
              `Error processing file "${file.name}": ${
                error instanceof Error ? error.message : "Unknown error"
              }`
            );
          }
        };

        const files = Array.from(fileList);
        const processingPromises: Promise<void>[] = [];

        for (const file of files) {
          if (ignoreSystemFiles && shouldIgnoreFile(file.name)) {
            continue;
          }
          processingPromises.push(processFile(file));
        }

        await Promise.all(processingPromises);

        if (signal.aborted) {
          return [];
        }

        return newFiles;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          console.log("File selection operation was cancelled");
          toast.info("File processing was cancelled");
          return [];
        }
        throw error;
      } finally {
        setIsProcessing(false);
        if (abortControllerRef.current?.signal === signal) {
          abortControllerRef.current = null;
        }
      }
    },
    [ignoreSystemFiles]
  );

  return {
    isProcessing,
    handleDrop,
    handleSelect,
  };
};
