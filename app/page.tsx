"use client";

import { AnimatedRadioGroup } from "@/components/AnimatedRadioGroup";
import { Button } from "@/components/Button";
import { DetailedAnimatedRadioGroup } from "@/components/DetailedAnimatedRadioGroup";
import { Dialog } from "@/components/Dialog";
import { GridList, GridListItem } from "@/components/GridList";
import { Modal } from "@/components/Modal";
import { SettingsSwitch } from "@/components/SettingsSwitch";
import SignUpFormReact from "@/components/SignupForm";
import { formatMarkdown, formatXML } from "@/utils/outputUtils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { DropEvent } from "react-aria";
import {
  DropZone,
  Text,
  FileTrigger,
  FileDropItem,
  TextDropItem,
  DirectoryDropItem,
  useDragAndDrop,
  Button as RACButton,
  Key,
  DialogTrigger,
} from "react-aria-components";
import { toast } from "sonner";
import { getTextFromExcelFile } from "@/utils/getTextFromExcelFile";
import { BlobReader, BlobWriter, ZipReader } from "@zip.js/zip.js";
import { getEncoding } from "js-tiktoken";
import { NumberFormatter } from "@internationalized/number";

const options = [
  {
    id: "markdown",
    label: "Markdown",
    description: "## file.py \n\n```\ncode\n```",
  },
  {
    id: "xml",
    label: "XML",
    description: "<name>\n  file.py\n</name>\n<code>\n  code\n</code>",
  },
];

const markdownOptions = [
  {
    id: "markdown1",
    label: "Headings + Code Blocks",
    description: "## name \n\n```\ncontent\n```",
  },
  {
    id: "markdown2",
    label: "Headings",
    description: "## name \n\ncontent",
  },
];

const xmlOptions = [
  {
    id: "xml1",
    label: "Option 1",
    description: '<file name="name">content</file>',
  },
  {
    id: "xml2",
    label: "Option 2",
    description:
      "<file>\n  <name>name</name>\n  <content>content</content>\n</file>",
  },
];

// const acceptedFileTypes = [
//   "text/*",
//   "application/json,.py,.ts,.js,.html,.css,.xml,.md,.yaml,.",
// ];

// Maximum file sizes
const MAX_REGULAR_FILE_SIZE = 5 * 1024 * 1024; // 5MB for regular text files
const MAX_ZIP_FILE_SIZE = 50 * 1024 * 1024; // 50MB for ZIP files (can contain multiple files)

let isExcel = (file: { type: string }) =>
  file.type === "application/vnd.ms-excel" ||
  file.type ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
let isZip = (file: { type: string }) => file.type === "application/zip";

const validateFileSize = (
  file: { size: number; name: string },
  maxSize: number
): void => {
  if (file.size > maxSize) {
    throw new Error(
      `File "${file.name}" (${Math.round(
        file.size / 1024 / 1024
      )}MB) exceeds maximum allowed size of ${Math.round(
        maxSize / 1024 / 1024
      )}MB`
    );
  }
};

const shouldIgnoreFile = (filename: string): boolean => {
  const lowerName = filename.toLowerCase();

  // System files
  if (
    lowerName === ".ds_store" ||
    lowerName === "thumbs.db" ||
    lowerName === "ehthumbs.db" ||
    lowerName === "desktop.ini" ||
    lowerName === ".directory"
  ) {
    return true;
  }

  // System directories
  if (
    filename.startsWith("__MACOSX/") ||
    filename.startsWith("$RECYCLE.BIN/") ||
    filename.startsWith(".Trash-") ||
    filename.startsWith(".fuse_hidden")
  ) {
    return true;
  }

  // Version control
  if (
    filename.startsWith(".git/") ||
    filename.startsWith(".svn/") ||
    filename.startsWith(".hg/") ||
    filename.startsWith(".bzr/")
  ) {
    return true;
  }

  // IDE/Editor files
  if (
    filename.startsWith(".vscode/") ||
    filename.startsWith(".idea/") ||
    lowerName.endsWith(".swp") ||
    lowerName.endsWith(".swo") ||
    lowerName.endsWith("~")
  ) {
    return true;
  }

  // Package managers and build artifacts
  if (
    filename.startsWith("node_modules/") ||
    filename.startsWith("__pycache__/") ||
    filename.startsWith("vendor/") ||
    filename.startsWith("dist/") ||
    filename.startsWith("build/") ||
    lowerName.endsWith(".pyc") ||
    lowerName.endsWith(".class") ||
    lowerName.endsWith(".o")
  ) {
    return true;
  }

  return false;
};

let formatter = new NumberFormatter("en-US");

const useDebounceTokenCount = (
  formattedOutput: string,
  encoding: any,
  delay: number = 500
) => {
  const [tokenCount, setTokenCount] = useState(0);
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (!formattedOutput) {
      setTokenCount(0);
      return;
    }

    setIsCalculating(true);
    const timeoutId = setTimeout(() => {
      try {
        const count = encoding.encode(formattedOutput).length;
        setTokenCount(count);
      } catch (error) {
        console.error("Error calculating token count:", error);
        setTokenCount(0);
      } finally {
        setIsCalculating(false);
      }
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      setIsCalculating(false);
    };
  }, [formattedOutput, encoding, delay]);

  return { tokenCount, isCalculating };
};

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

const reorderFiles = (
  files: TextFile[],
  keys: Set<any>,
  target: any,
  position: "before" | "after"
): TextFile[] => {
  const newFiles = [...files];
  const targetIndex = newFiles.findIndex((file) => file.key === target.key);

  for (const key of keys) {
    const item = newFiles.find((file) => file.key === key);
    if (item !== undefined) {
      newFiles.splice(newFiles.indexOf(item), 1);
      const insertIndex = position === "before" ? targetIndex : targetIndex + 1;
      newFiles.splice(insertIndex, 0, item);
    }
  }

  return newFiles;
};

export interface TextFile {
  key: Key;
  name: string;
  content: string;
}

export default function Home() {
  let [files, setFiles] = useState<TextFile[]>([]);
  let [isProcessing, setIsProcessing] = useState(false);
  let [selectedOption, setSelectedOption] = useState(options[0].id);

  // AbortController for cancelling async operations
  const abortControllerRef = useRef<AbortController | null>(null);
  let [selectedMarkdownOption, setSelectedMarkdownOption] = useState(
    markdownOptions[0].id
  );
  let [selectedXmlOption, setSelectedXmlOption] = useState(xmlOptions[0].id);
  let [autoCopy, setAutoCopy] = useState(true);
  let [replaceOnDrop, setReplaceOnDrop] = useState(false);
  let [ignoreSystemFiles, setIgnoreSystemFiles] = useState(true);
  const encoding = useMemo(() => getEncoding("cl100k_base"), []);

  const formattedOutput = useMemo(() => {
    return convertFilesToString(
      files,
      selectedOption,
      selectedMarkdownOption,
      selectedXmlOption
    );
  }, [files, selectedMarkdownOption, selectedOption, selectedXmlOption]);

  const { tokenCount, isCalculating } = useDebounceTokenCount(
    formattedOutput,
    encoding
  );

  const selectedOptionLabel = useMemo(
    () => options.find((option) => option.id === selectedOption)?.label || "",
    [selectedOption]
  );

  const copyOutoutToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formattedOutput);

      toast(
        `Successfully copied prompt for ${files.length} files in ${selectedOptionLabel}!`
      );
    } catch (err) {
      console.error("Failed to copy files to clipboard:", err);
    }
  }, [formattedOutput, files.length, selectedOptionLabel]);

  // Track the last formatted output to prevent excessive auto-copy triggers
  const lastFormattedOutputRef = useRef("");

  useEffect(() => {
    if (
      autoCopy &&
      files.length > 0 &&
      formattedOutput !== lastFormattedOutputRef.current
    ) {
      lastFormattedOutputRef.current = formattedOutput;
      copyOutoutToClipboard();
    }
  }, [autoCopy, files.length, formattedOutput, copyOutoutToClipboard]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Cancel any ongoing operations when component unmounts
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, []);

  const processFileAsync = useCallback(
    async (entry: FileDropItem | DirectoryDropItem): Promise<TextFile[]> => {
      const results: TextFile[] = [];

      try {
        if (entry.kind === "file") {
          const file = entry as FileDropItem;
          if (ignoreSystemFiles && shouldIgnoreFile(file.name)) {
            return results;
          }

          const fileContent = await file.getFile();
          let newFile = { key: crypto.randomUUID(), name: file.name };

          if (isExcel(file)) {
            // File size validation is handled inside getTextFromExcelFile
            results.push({
              ...newFile,
              content: await getTextFromExcelFile(fileContent),
            });
          } else if (isZip(file)) {
            // Validate ZIP file size
            validateFileSize(fileContent, MAX_ZIP_FILE_SIZE);

            const zipReader = new ZipReader(new BlobReader(fileContent));

            try {
              const entries = await zipReader.getEntries();

              for (const entry of entries) {
                if (entry.directory) continue;
                if (shouldIgnoreFile(entry.filename)) continue;

                const entryFileContent = await entry.getData?.(
                  new BlobWriter()
                );
                if (entryFileContent) {
                  // Validate individual file size within ZIP
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
              // Ensure ZIP reader is always closed, even if an error occurs
              try {
                await zipReader.close();
              } catch (closeError) {
                console.error("Error closing ZIP reader:", closeError);
              }
            }
          } else {
            // Validate regular file size
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
        // Log error for debugging but don't include file in results
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
        return results; // Return empty results for failed files
      }
    },
    [ignoreSystemFiles]
  );

  const handleDrop = useCallback(
    async (e: DropEvent) => {
      // Cancel any previous operation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController for this operation
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setIsProcessing(true);

      try {
        // Check if operation was cancelled before starting
        if (signal.aborted) {
          return;
        }
        const processingPromises: Promise<TextFile[]>[] = [];

        for (const item of e.items) {
          if (item.kind === "text") {
            const textItem = item as TextDropItem;
            const promise = textItem.getText("text/plain").then((content) => [
              {
                key: crypto.randomUUID(),
                name: "untitled.txt",
                content,
              },
            ]);
            processingPromises.push(promise);
          } else if (item.kind === "file" || item.kind === "directory") {
            processingPromises.push(
              processFileAsync(item as FileDropItem | DirectoryDropItem)
            );
          }
        }

        const results = await Promise.all(processingPromises);

        // Check if operation was cancelled after processing
        if (signal.aborted) {
          return;
        }

        const newFiles = results.flat();

        setFiles((prevFiles) =>
          replaceOnDrop ? newFiles : [...prevFiles, ...newFiles]
        );
      } catch (error) {
        // Handle AbortError specifically
        if (error instanceof Error && error.name === "AbortError") {
          console.log("File drop operation was cancelled");
          toast.info("File processing was cancelled");
          return;
        }
        // Re-throw other errors
        throw error;
      } finally {
        setIsProcessing(false);
        // Clear the abort controller reference when done
        if (abortControllerRef.current?.signal === signal) {
          abortControllerRef.current = null;
        }
      }
    },
    [processFileAsync, replaceOnDrop]
  );

  const handleSelect = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList) return;

      // Cancel any previous operation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new AbortController for this operation
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      setIsProcessing(true);

      try {
        // Check if operation was cancelled before starting
        if (signal.aborted) {
          return;
        }
        const newFiles: TextFile[] = [];

        const processFile = async (file: File) => {
          try {
            if (ignoreSystemFiles && shouldIgnoreFile(file.name)) {
              return;
            }

            // Validate file size
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

        const processDirectory = async (entry: FileSystemDirectoryEntry) => {
          const reader = entry.createReader();

          // Add timeout to prevent hanging operations
          const entries = await Promise.race([
            new Promise<FileSystemEntry[]>((resolve, reject) => {
              reader.readEntries(
                (entries) => resolve(entries),
                (error) => reject(error)
              );
            }),
            new Promise<never>((_, reject) =>
              setTimeout(
                () => reject(new Error("Directory read timeout")),
                30000
              )
            ),
          ]);

          const processingPromises: Promise<void>[] = [];

          for (const nestedEntry of entries) {
            if (nestedEntry.isFile) {
              const promise = new Promise<File>((resolve) => {
                (nestedEntry as FileSystemFileEntry).file(resolve);
              }).then(processFile);
              processingPromises.push(promise);
            } else if (nestedEntry.isDirectory) {
              processingPromises.push(
                processDirectory(nestedEntry as FileSystemDirectoryEntry)
              );
            }
          }

          await Promise.all(processingPromises);
        };

        const files = Array.from(fileList);
        const processingPromises: Promise<void>[] = [];

        for (const file of files) {
          if (ignoreSystemFiles && shouldIgnoreFile(file.name)) {
            continue;
          }
          if (file.webkitRelativePath) {
            const promise = new Promise<FileSystemDirectoryEntry>((resolve) => {
              (window as any).webkitResolveLocalFileSystemURL(
                file.webkitRelativePath,
                (entry: FileSystemDirectoryEntry) => resolve(entry)
              );
            }).then(processDirectory);
            processingPromises.push(promise);
          } else {
            processingPromises.push(processFile(file));
          }
        }

        await Promise.all(processingPromises);

        // Check if operation was cancelled after processing
        if (signal.aborted) {
          return;
        }

        setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      } catch (error) {
        // Handle AbortError specifically
        if (error instanceof Error && error.name === "AbortError") {
          console.log("File selection operation was cancelled");
          toast.info("File processing was cancelled");
          return;
        }
        // Re-throw other errors
        throw error;
      } finally {
        setIsProcessing(false);
        // Clear the abort controller reference when done
        if (abortControllerRef.current?.signal === signal) {
          abortControllerRef.current = null;
        }
      }
    },
    [ignoreSystemFiles]
  );

  let isListDragging = useRef(false);

  let { dragAndDropHooks } = useDragAndDrop({
    onDragStart: () => {
      isListDragging.current = true;
    },
    onDragEnd: () => {
      isListDragging.current = false;
    },
    getItems: (keys) =>
      files
        .filter((file) => keys.has(file.key))
        .map((file) => ({ "text/plain": file.name })),
    onReorder(e) {
      if (e.target.dropPosition === "before") {
        setFiles((prevFiles) =>
          reorderFiles(prevFiles, e.keys, e.target, "before")
        );
      } else if (e.target.dropPosition === "after") {
        setFiles((prevFiles) =>
          reorderFiles(prevFiles, e.keys, e.target, "after")
        );
      }
    },
  });

  return (
    <main className="h-dvh">
      <DropZone
        aria-label="Drop files here or click to select files."
        className="flex flex-col justify-center items-center gap-10 h-full group"
        onDrop={handleDrop}
      >
        {({ isDropTarget }) => (
          <div className="p-4 sm:p-8 rounded-lg flex flex-col justify-between h-full">
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
              !isListDragging.current &&
              !isProcessing &&
              ((files.length > 0 && !replaceOnDrop) || files.length === 0) && (
                <div className="absolute inset-0 z-10 rounded-lg h-dvh flex items-center justify-center">
                  <Text className="font-semibold text-5xl text-black dark:text-white drop-shadow-2xl">
                    Drop to add
                  </Text>
                </div>
              )}
            <div className="flex flex-col gap-5">
              <div className="flex justify-center gap-3">
                <h1 className="text-center text-xl font-mono">files2prompt</h1>
                <DialogTrigger>
                  <RACButton
                    className="rounded-full p-1 cursor-default dark:text-slate-100 dark:hover:text-slate-300 text-slate-600 hover:text-slate-800 outline-none focus-visible:ring-2 ring-offset-2 ring-offset-white ring-slate-800 dark:ring-white dark:ring-offset-black transition duration-200 ease-in-out group-drop-target:blur-xl"
                    aria-label="Settings"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M13.024 9.25c.47 0 .827-.433.637-.863a4 4 0 0 0-4.094-2.364c-.468.05-.665.576-.43.984l1.08 1.868a.75.75 0 0 0 .649.375h2.158ZM7.84 7.758c-.236-.408-.79-.5-1.068-.12A3.982 3.982 0 0 0 6 10c0 .884.287 1.7.772 2.363.278.38.832.287 1.068-.12l1.078-1.868a.75.75 0 0 0 0-.75L7.839 7.758ZM9.138 12.993c-.235.408-.039.934.43.984a4 4 0 0 0 4.094-2.364c.19-.43-.168-.863-.638-.863h-2.158a.75.75 0 0 0-.65.375l-1.078 1.868Z" />
                      <path
                        fillRule="evenodd"
                        d="m14.13 4.347.644-1.117a.75.75 0 0 0-1.299-.75l-.644 1.116a6.954 6.954 0 0 0-2.081-.556V1.75a.75.75 0 0 0-1.5 0v1.29a6.954 6.954 0 0 0-2.081.556L6.525 2.48a.75.75 0 1 0-1.3.75l.645 1.117A7.04 7.04 0 0 0 4.347 5.87L3.23 5.225a.75.75 0 1 0-.75 1.3l1.116.644A6.954 6.954 0 0 0 3.04 9.25H1.75a.75.75 0 0 0 0 1.5h1.29c.078.733.27 1.433.556 2.081l-1.116.645a.75.75 0 1 0 .75 1.298l1.117-.644a7.04 7.04 0 0 0 1.523 1.523l-.645 1.117a.75.75 0 1 0 1.3.75l.644-1.116a6.954 6.954 0 0 0 2.081.556v1.29a.75.75 0 0 0 1.5 0v-1.29a6.954 6.954 0 0 0 2.081-.556l.645 1.116a.75.75 0 0 0 1.299-.75l-.645-1.117a7.042 7.042 0 0 0 1.523-1.523l1.117.644a.75.75 0 0 0 .75-1.298l-1.116-.645a6.954 6.954 0 0 0 .556-2.081h1.29a.75.75 0 0 0 0-1.5h-1.29a6.954 6.954 0 0 0-.556-2.081l1.116-.644a.75.75 0 0 0-.75-1.3l-1.117.645a7.04 7.04 0 0 0-1.524-1.523ZM10 4.5a5.475 5.475 0 0 0-2.781.754A5.527 5.527 0 0 0 5.22 7.277 5.475 5.475 0 0 0 4.5 10a5.475 5.475 0 0 0 .752 2.777 5.527 5.527 0 0 0 2.028 2.004c.802.458 1.73.719 2.72.719a5.474 5.474 0 0 0 2.78-.753 5.527 5.527 0 0 0 2.001-2.027c.458-.802.719-1.73.719-2.72a5.475 5.475 0 0 0-.753-2.78 5.528 5.528 0 0 0-2.028-2.002A5.475 5.475 0 0 0 10 4.5Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </RACButton>
                  <Modal isDismissable>
                    <Dialog title="Settings">
                      <div className="group-drop-target:blur-xl transition duration-500 ease-in-out">
                        <div className="flex w-60 text-end mx-auto flex-col items-end gap-2 my-8">
                          <SettingsSwitch
                            label="Replace files on drop"
                            isSelected={replaceOnDrop}
                            onChange={setReplaceOnDrop}
                          />
                          <SettingsSwitch
                            label="Ignore system files"
                            isSelected={ignoreSystemFiles}
                            onChange={setIgnoreSystemFiles}
                          />
                        </div>
                        <div className="text-center flex flex-col gap-10">
                          <div>
                            <Text className="font-semibold text-lg">
                              Markdown
                            </Text>
                            <DetailedAnimatedRadioGroup
                              label="Markdown options"
                              className="group-drop-target:blur-xl transition duration-500 ease-in-out my-3"
                              options={markdownOptions}
                              selectedOption={selectedMarkdownOption}
                              setSelectedOption={setSelectedMarkdownOption}
                            />
                          </div>
                          <div>
                            <Text className="font-semibold text-lg">XML</Text>
                            <DetailedAnimatedRadioGroup
                              label="XML options"
                              className="group-drop-target:blur-xl transition duration-500 ease-in-out my-3"
                              options={xmlOptions}
                              selectedOption={selectedXmlOption}
                              setSelectedOption={setSelectedXmlOption}
                            />
                          </div>
                        </div>
                        <div className="p-10">
                          <div className="text-center">Features: </div>
                          <ul className="list-disc px-5 md:px-10 xl:px-28 pt-5">
                            <li>
                              Switching between prompt structures (
                              <b>Markdown</b> or <b>XML</b>)
                            </li>
                            <li>
                              Adding files nested in <b>directories</b>
                            </li>
                            <li>
                              Automatically unarchiving <b>zip files</b>
                            </li>
                            <li>
                              Parsing <b>Excel</b> files to comma-separated text
                            </li>
                            <li>Reordering dropped files for the prompt</li>
                            <li>
                              <b>Removing</b> individual files or the entire
                              prompt
                            </li>
                            <li>
                              <b>Previewing</b> individual files or the entire
                              prompt
                            </li>
                            <li>
                              <b>Auto-copying</b> when the file list or settings
                              are changed
                            </li>
                            <li>
                              Viewing the <b>token count</b> for individual
                              files and the entire prompt
                            </li>
                          </ul>
                        </div>
                        <div className="p-10">
                          <div className="text-center">Alternatives: </div>
                          <ul className="list-disc px-5 md:px-10 xl:px-28 pt-5">
                            <li>
                              Command-line:{" "}
                              <a
                                className="underline"
                                href="https://lib.rs/crates/code2prompt"
                                target="_blank"
                                rel="noreferrer"
                              >
                                code2prompt
                              </a>
                              ,{" "}
                              <a
                                className="underline"
                                href="https://github.com/simonw/files-to-prompt"
                                target="_blank"
                                rel="noreferrer"
                              >
                                files-to-prompt
                              </a>
                              ,{" "}
                              <a
                                className="underline"
                                href="https://github.com/3rd/promptpack"
                                target="_blank"
                                rel="noreferrer"
                              >
                                promptpack
                              </a>
                              ,{" "}
                              <a
                                className="underline"
                                href="https://github.com/jimmc414/1filellm"
                                target="_blank"
                                rel="noreferrer"
                              >
                                1filellm
                              </a>
                            </li>
                            <li>
                              MacOS:{" "}
                              <a
                                className="underline"
                                href="https://repoprompt.com/"
                                target="_blank"
                                rel="noreferrer"
                              >
                                RepoPrompt
                              </a>
                              ,{" "}
                              <a
                                className="underline"
                                href="https://github.com/banagale/FileKitty"
                                target="_blank"
                                rel="noreferrer"
                              >
                                FileKitty
                              </a>
                            </li>
                          </ul>
                        </div>
                        <SignUpFormReact />
                        <p className="text-center pt-8">
                          Made by{" "}
                          <a
                            className="underline"
                            href="https://www.reidbarber.com"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Reid Barber
                          </a>
                        </p>
                      </div>
                    </Dialog>
                  </Modal>
                </DialogTrigger>
              </div>
              <AnimatedRadioGroup
                label="Output format"
                className="group-drop-target:blur-xl transition duration-500 ease-in-out"
                options={options}
                selectedOption={selectedOption}
                setSelectedOption={setSelectedOption}
              />
            </div>
            <div className="flex flex-col items-center justify-center p-20 gap-5 max-h-full overflow-auto">
              {files.length > 0 ? (
                <>
                  <GridList
                    className="group-drop-target:pointer-events-none group-drop-target:blur-xl transition duration-500 ease-in-out overflow-scroll w-auto rounded-lg m-auto border-none"
                    items={files}
                    dragAndDropHooks={dragAndDropHooks}
                    aria-label="Files"
                  >
                    {(item) => (
                      <GridListItem
                        textValue={item.name}
                        onRemove={() =>
                          setFiles((prevFiles) =>
                            prevFiles.filter((file) => file.key !== item.key)
                          )
                        }
                        className="border-none justify-center"
                      >
                        {item.name}
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
                              title={`${item.name} (${formatter.format(
                                encoding.encode(item.content).length
                              )} tokens)`}
                            >
                              <pre className="overflow-scroll">
                                {item.content}
                              </pre>
                            </Dialog>
                          </Modal>
                        </DialogTrigger>
                      </GridListItem>
                    )}
                  </GridList>
                  {isDropTarget &&
                    !isListDragging.current &&
                    files.length > 0 &&
                    replaceOnDrop && (
                      <div className="absolute inset-0 z-10 rounded-lg h-dvh flex flex-col gap-3 items-center justify-center">
                        <Text className="font-semibold text-xl text-black drop-shadow-xl">
                          Drop to replace {files.length} files:
                        </Text>
                        <GridList
                          className="w-auto rounded-lg mx-auto border-none"
                          items={files}
                          aria-label="Files to replace"
                        >
                          {(item) => (
                            <GridListItem className="border-none justify-center">
                              {item.name}
                            </GridListItem>
                          )}
                        </GridList>
                      </div>
                    )}
                  <div className="flex gap-2 justify-center group-drop-target:blur-xl transition duration-500 ease-in-out">
                    <Button onPress={() => setFiles([])}>Clear</Button>
                    <Button onPress={copyOutoutToClipboard}>Copy</Button>
                    <DialogTrigger>
                      <Button>Preview</Button>
                      <Modal isDismissable>
                        <Dialog
                          title={`Output (${
                            isCalculating
                              ? "calculating..."
                              : formatter.format(tokenCount)
                          } tokens)`}
                        >
                          <pre className="overflow-scroll">
                            {formattedOutput}
                          </pre>
                        </Dialog>
                      </Modal>
                    </DialogTrigger>
                    <FileTrigger
                      // acceptedFileTypes={acceptedFileTypes}
                      allowsMultiple
                      onSelect={isProcessing ? undefined : handleSelect}
                    >
                      <Button isDisabled={isProcessing}>Add</Button>
                    </FileTrigger>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 group-drop-target:blur-xl transition duration-500 ease-in-out">
                  <Text
                    className={`font-semibold text-xl inline mx-1 relative`}
                    slot="label"
                  >
                    Drop files
                  </Text>
                  <div>or</div>
                  <div className="text-center">
                    <FileTrigger
                      // acceptedFileTypes={acceptedFileTypes}
                      allowsMultiple
                      onSelect={isProcessing ? undefined : handleSelect}
                    >
                      <RACButton
                        className="mt-1 rounded-md border border-slate-600 dark:border-slate-100 dark:hover:border-slate-300 px-2 py-1 cursor-default dark:text-slate-100 dark:hover:text-slate-300 text-slate-600 hover:text-slate-800 outline-none focus-visible:ring-2  ring-offset-white ring-slate-800 dark:ring-white dark:ring-offset-black transition duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                        isDisabled={isProcessing}
                      >
                        {isProcessing ? "Processing..." : "Select"}
                      </RACButton>
                    </FileTrigger>
                  </div>
                </div>
              )}
            </div>
            <div className="max-w-80 mx-auto text-sm text-center font-light font-mono group-drop-target:blur-xl transition duration-500 ease-in-out">
              <div className="flex justify-center m-4">
                <SettingsSwitch
                  label="Auto-copy"
                  isSelected={autoCopy}
                  onChange={setAutoCopy}
                />
              </div>
              Convert files to text prompts for ChatGPT, Claude, Gemini, etc.{" "}
              <u>in the browser</u>.
            </div>
          </div>
        )}
      </DropZone>
    </main>
  );
}
