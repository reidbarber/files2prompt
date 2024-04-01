"use client";

import { AnimatedRadioGroup } from "@/components/AnimatedRadioGroup";
import { GridList, GridListItem } from "@/components/GridList";
import { SettingsSwitch } from "@/components/SettingsSwitch";
import { useEffect, useState } from "react";
import { DropEvent } from "react-aria";
import {
  DropZone,
  Text,
  FileTrigger,
  FileDropItem,
  Button,
  TextDropItem,
  DirectoryDropItem,
  useDragAndDrop,
  Key,
} from "react-aria-components";
import { toast } from "sonner";

let options = [
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

interface TextFile {
  key: Key;
  name: string;
  content: string;
}

export default function Home() {
  let [files, setFiles] = useState<TextFile[]>([]);
  let [selectedOption, setSelectedOption] = useState("markdown");
  let [autoCopy, setAutoCopy] = useState(true);
  let [replaceOnDrop, setReplaceOnDrop] = useState(false);

  useEffect(() => {
    const convertFilesToString = () => {
      if (files.length === 0) return "";

      switch (selectedOption) {
        case "markdown":
          return files
            .map(
              ({ name, content }) => `## ${name}\n\n\`\`\`\n${content}\n\`\`\``
            )
            .join("\n\n");
        case "json":
          return JSON.stringify(
            files.map(({ name, content }) => ({ name, content })),
            null,
            2
          );
        case "xml":
          return `<?xml version="1.0" encoding="UTF-8"?>\n<files>\n${files
            .map(
              ({ name, content }) =>
                `  <file>\n    <name>${name}</name>\n    <content>${content}</content>\n  </file>`
            )
            .join("\n")}\n</files>`;
        default:
          return "";
      }
    };

    const copyToClipboard = async () => {
      const fileString = convertFilesToString();
      try {
        await navigator.clipboard.writeText(fileString);
        toast(
          `Successfully copied prompt for <b>${files.length}</b> files in <b>${
            options.find((option) => option.id === selectedOption)?.label
          }</b>!`
        );
      } catch (err) {
        console.error("Failed to copy files to clipboard:", err);
      }
    };

    if (files.length > 0 && autoCopy) {
      copyToClipboard();
    }
  }, [autoCopy, files, selectedOption]);

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

  let { dragAndDropHooks } = useDragAndDrop({
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
    <main className="h-screen">
      <DropZone
        aria-label="Drop files here or click to select files."
        className="flex flex-col justify-center items-center gap-10 h-full group"
        onDrop={handleDrop}
      >
        {({ isDropTarget }) => (
          <div className="p-2 sm:p-8 rounded-lg flex flex-col justify-between h-full">
            <h1 className="absolute top-5 left-0 right-0 w-full text-center text-xl font-mono">
              files2prompt
            </h1>
            {isDropTarget &&
              ((files.length > 0 && !replaceOnDrop) || files.length === 0) && (
                <div className="absolute inset-0 z-10 rounded-lg h-screen flex items-center justify-center">
                  <Text className="font-semibold text-5xl text-black drop-shadow-2xl">
                    Drop to add
                  </Text>
                </div>
              )}
            <AnimatedRadioGroup
              className="group-drop-target:blur-xl transition duration-500 ease-in-out mt-7"
              options={options}
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
            />
            <div className="flex flex-col items-center justify-center p-20 gap-5">
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
                        onRemove={() =>
                          setFiles((prevFiles) =>
                            prevFiles.filter((file) => file.key !== item.key)
                          )
                        }
                        className="border-none justify-center"
                      >
                        {item.name}
                      </GridListItem>
                    )}
                  </GridList>
                  {isDropTarget && files.length > 0 && replaceOnDrop && (
                    <div className="absolute inset-0 z-10 rounded-lg h-screen flex flex-col gap-3 items-center justify-center">
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
                  <div className="flex justify-center group-drop-target:blur-xl transition duration-500 ease-in-out">
                    <Button
                      onPress={() => setFiles([])}
                      className="bg-slate-700 mx-1 text-white px-2 py-1 inline-flex justify-center rounded-md border border-solid border-transparent font-semibold font-[inherit] text-sm transition-colors cursor-default outline-none focus-visible:ring-2 ring-blue-500 ring-offset-2"
                    >
                      Clear
                    </Button>
                    <FileTrigger allowsMultiple onSelect={handleSelect}>
                      <Button className="bg-slate-700 mx-1 text-white px-2 py-1 inline-flex justify-center rounded-md border border-solid border-transparent font-semibold font-[inherit] text-sm transition-colors cursor-default outline-none focus-visible:ring-2 ring-blue-500 ring-offset-2">
                        Add
                      </Button>
                    </FileTrigger>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center">
                  <Text
                    className={`font-semibold text-xl inline mx-1 relative group-drop-target:blur-xl transition duration-500 ease-in-out`}
                    slot="label"
                  >
                    Drop files
                  </Text>
                  <span className="group-drop-target:blur-xl transition duration-500 ease-in-out">
                    <span className="mx-1">or</span>
                    <FileTrigger allowsMultiple onSelect={handleSelect}>
                      <Button className="bg-slate-700 mx-1 text-white px-2 py-1 inline-flex justify-center rounded-md border border-solid border-transparent font-semibold font-[inherit] text-xl transition-colors cursor-default outline-none focus-visible:ring-2 ring-blue-500 ring-offset-2">
                        Select
                      </Button>
                    </FileTrigger>
                  </span>
                </div>
              )}
            </div>
            <div className="flex mx-auto flex-col items-end gap-2 group-drop-target:blur-xl transition duration-500 ease-in-out">
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
          </div>
        )}
      </DropZone>
    </main>
  );
}
