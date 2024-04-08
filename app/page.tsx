"use client";

import { AnimatedRadioGroup } from "@/components/AnimatedRadioGroup";
import { Button } from "@/components/Button";
import { DetailedAnimatedRadioGroup } from "@/components/DetailedAnimatedRadioGroup";
import { Dialog } from "@/components/Dialog";
import { GridList, GridListItem } from "@/components/GridList";
import { Modal } from "@/components/Modal";
import { SettingsSwitch } from "@/components/SettingsSwitch";
import SignUpFormReact from "@/components/SignupForm";
import { formatJSON, formatMarkdown, formatXML } from "@/utils/outputUtils";
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

const options = [
  {
    id: "markdown",
    label: "Markdown",
    description: "## file.py \n\n```\ncode\n```",
  },
  { id: "json", label: "JSON", description: '{\n"file.py": "code"\n}' },
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

const jsonOptions = [
  {
    id: "json1",
    label: "Key-value",
    description: "{\n  name: content\n}",
  },
  {
    id: "json2",
    label: "Array of Objects",
    description: '[\n {\n  "name": name\n  "content": content  \n  }\n]',
  },
];

const xmlOptions = [
  {
    id: "xml1",
    label: "Option 1",
    description: "<name>name</name>\n<content>content</content>",
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

export interface TextFile {
  key: Key;
  name: string;
  content: string;
}

export default function Home() {
  let [files, setFiles] = useState<TextFile[]>([]);
  let [selectedOption, setSelectedOption] = useState(options[0].id);
  let [selectedMarkdownOption, setSelectedMarkdownOption] = useState(
    markdownOptions[0].id
  );
  let [selectedJsonOption, setSelectedJsonOption] = useState(jsonOptions[0].id);
  let [selectedXmlOption, setSelectedXmlOption] = useState(xmlOptions[0].id);
  let [autoCopy, setAutoCopy] = useState(true);
  let [replaceOnDrop, setReplaceOnDrop] = useState(false);
  let formattedOutput = useMemo(() => {
    const convertFilesToString = () => {
      if (files.length === 0) return "";

      switch (selectedOption) {
        case "markdown":
          return formatMarkdown(files, selectedMarkdownOption);
        case "json":
          return formatJSON(files, selectedJsonOption);
        case "xml":
          return formatXML(files, selectedXmlOption);
        default:
          return "";
      }
    };
    return convertFilesToString();
  }, [
    files,
    selectedJsonOption,
    selectedMarkdownOption,
    selectedOption,
    selectedXmlOption,
  ]);

  let copyOutoutToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(formattedOutput);
      toast(
        `Successfully copied prompt for <b>${files.length}</b> files in <b>${
          options.find((option) => option.id === selectedOption)?.label
        }</b>!`
      );
    } catch (err) {
      console.error("Failed to copy files to clipboard:", err);
    }
  }, [formattedOutput, files.length, selectedOption]);

  useEffect(() => {
    if (autoCopy && files.length > 0) {
      copyOutoutToClipboard();
    }
  }, [autoCopy, copyOutoutToClipboard, files.length, formattedOutput]);

  const handleDrop = async (e: DropEvent) => {
    const newFiles: TextFile[] = [];

    const processEntry = async (entry: FileDropItem | DirectoryDropItem) => {
      if (entry.kind === "file") {
        const file = entry as FileDropItem;
        const content = await file.getText();
        newFiles.push({ key: crypto.randomUUID(), name: file.name, content });
      } else if (entry.kind === "directory") {
        const directory = entry as DirectoryDropItem;
        for await (const nestedEntry of directory.getEntries()) {
          await processEntry(nestedEntry);
        }
      }
    };

    for (const item of e.items) {
      if (item.kind === "text") {
        const textItem = item as TextDropItem;
        const content = await textItem.getText("text/plain");
        newFiles.push({
          key: crypto.randomUUID(),
          name: "untitled.txt", // TODO: Can we auto-detect the format?
          content,
        });
      } else if (item.kind === "file" || item.kind === "directory") {
        await processEntry(item as FileDropItem | DirectoryDropItem);
      }
    }

    setFiles((prevFiles) =>
      replaceOnDrop ? newFiles : [...prevFiles, ...newFiles]
    );
  };

  const handleSelect = async (fileList: FileList | null) => {
    if (!fileList) return;
    const newFiles: TextFile[] = [];

    const processFile = async (file: File) => {
      const content = await file.text();
      newFiles.push({ key: crypto.randomUUID(), name: file.name, content });
    };

    const processDirectory = async (entry: FileSystemDirectoryEntry) => {
      const reader = entry.createReader();
      const entries = await new Promise<FileSystemEntry[]>((resolve) => {
        reader.readEntries((entries) => resolve(entries));
      });

      for (const nestedEntry of entries) {
        if (nestedEntry.isFile) {
          const file = await new Promise<File>((resolve) => {
            (nestedEntry as FileSystemFileEntry).file(resolve);
          });
          await processFile(file);
        } else if (nestedEntry.isDirectory) {
          await processDirectory(nestedEntry as FileSystemDirectoryEntry);
        }
      }
    };

    const files = Array.from(fileList);

    for (const file of files) {
      if (file.webkitRelativePath) {
        // Handle directory
        const entry = await new Promise<FileSystemDirectoryEntry>((resolve) => {
          (window as any).webkitResolveLocalFileSystemURL(
            file.webkitRelativePath,
            (entry: FileSystemDirectoryEntry) => resolve(entry)
          );
        });
        await processDirectory(entry);
      } else {
        // Handle regular file
        await processFile(file);
      }
    }

    // TODO: Should select obey replaceOnDrop?
    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

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
        setFiles((prevFiles) => {
          const newFiles = [...prevFiles];
          const targetIndex = newFiles.findIndex(
            (file) => file.key === e.target.key
          );
          for (const key of e.keys) {
            const item = newFiles.find((file) => file.key === key);
            if (item !== undefined) {
              newFiles.splice(newFiles.indexOf(item), 1);
              newFiles.splice(targetIndex, 0, item);
            }
          }
          return newFiles;
        });
      } else if (e.target.dropPosition === "after") {
        setFiles((prevFiles) => {
          const newFiles = [...prevFiles];
          const targetIndex = newFiles.findIndex(
            (file) => file.key === e.target.key
          );
          for (const key of e.keys) {
            const item = newFiles.find((file) => file.key === key);
            if (item !== undefined) {
              newFiles.splice(newFiles.indexOf(item), 1);
              newFiles.splice(targetIndex + 1, 0, item);
            }
          }
          return newFiles;
        });
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
            {isDropTarget &&
              !isListDragging.current &&
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
                        <div className="flex w-52 text-end mx-auto flex-col items-end gap-2 my-8">
                          <SettingsSwitch
                            label="Auto-copy"
                            isSelected={autoCopy}
                            onChange={setAutoCopy}
                          />
                          <SettingsSwitch
                            label="Replace on drop"
                            isSelected={replaceOnDrop}
                            onChange={setReplaceOnDrop}
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
                            <Text className="font-semibold text-lg">JSON</Text>
                            <DetailedAnimatedRadioGroup
                              label="JSON options"
                              className="group-drop-target:blur-xl transition duration-500 ease-in-out my-3"
                              options={jsonOptions}
                              selectedOption={selectedJsonOption}
                              setSelectedOption={setSelectedJsonOption}
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
                          <div className="text-center">Coming soon: </div>
                          <ul className="list-disc px-5 md:px-10 xl:px-28 pt-5">
                            <li>
                              Support for: PDFs, images, Word documents, Excel
                              spreadsheets, zip files, etc.
                            </li>
                            <li>Custom output formats</li>
                            <li>Preambles</li>
                            <li>Text editing</li>
                            <li>More...</li>
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
                          <Modal>
                            <Dialog title={item.name}>
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
                      <Modal>
                        <Dialog title="Output">
                          <pre className="overflow-scroll">
                            {formattedOutput}
                          </pre>
                        </Dialog>
                      </Modal>
                    </DialogTrigger>
                    <FileTrigger
                      // acceptedFileTypes={acceptedFileTypes}
                      allowsMultiple
                      onSelect={handleSelect}
                    >
                      <Button>Add</Button>
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
                      onSelect={handleSelect}
                    >
                      <RACButton className="mt-1 rounded-md border border-slate-600 dark:border-slate-100 dark:hover:border-slate-300 px-2 py-1 cursor-default dark:text-slate-100 dark:hover:text-slate-300 text-slate-600 hover:text-slate-800 outline-none focus-visible:ring-2  ring-offset-white ring-slate-800 dark:ring-white dark:ring-offset-black transition duration-200 ease-in-out">
                        Select
                      </RACButton>
                    </FileTrigger>
                  </div>
                </div>
              )}
            </div>
            <div className="max-w-80 mx-auto text-sm text-center font-light font-mono group-drop-target:blur-xl transition duration-500 ease-in-out">
              Convert files to text prompts for ChatGPT, Claude, etc.{" "}
              <u>in the browser</u>.
            </div>
          </div>
        )}
      </DropZone>
    </main>
  );
}
