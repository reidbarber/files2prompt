"use client";

import { useEffect, useState } from "react";
import { DropEvent } from "react-aria";
import {
  DropZone,
  Text,
  FileTrigger,
  FileDropItem,
  Button,
  RadioGroup,
  Radio,
  Switch,
  TextDropItem,
  DirectoryDropItem,
} from "react-aria-components";

async function filesToMarkdown(files: FileDropItem[]): Promise<string> {
  let markdownString = "";

  for (const file of files) {
    const { name, type } = file;
    const fileContent = await file.getText();

    markdownString += `## ${name}\n\n`;
    markdownString += `\`\`\`${getLanguageFromType(type)}\n`;
    markdownString += `${fileContent}\n`;
    markdownString += `\`\`\`\n\n`;
  }

  return markdownString;
}

async function filestoJSON(files: FileDropItem[]): Promise<string> {
  let jsonString = "{\n";
  files.forEach((file) => {
    jsonString += `"${file.name}": "${file.getText()}",\n`;
  });
  jsonString += "}";
  return jsonString;
}

async function filesToXML(files: FileDropItem[]): Promise<string> {
  let xmlString = "<files>\n";
  files.forEach((file) => {
    xmlString += `  <file>\n    <name>${
      file.name
    }</name>\n    <content>${file.getText()}</content>\n  </file>\n`;
  });
  xmlString += "</files>";
  return xmlString;
}

function getLanguageFromType(type: string): string {
  switch (type) {
    case "text/javascript":
    case "application/javascript":
      return "javascript";
    case "text/typescript":
    case "application/typescript":
      return "typescript";
    case "text/html":
      return "html";
    case "text/css":
      return "css";
    case "application/json":
      return "json";
    default:
      return "";
  }
}

let options = [
  {
    key: "markdown",
    title: "Markdown",
    description: "# file.py \n\n```\ncode\n```",
  },
  { key: "json", title: "JSON", description: '{\n"file.py": "code"\n}' },
  {
    key: "xml",
    title: "XML",
    description: "<name>\n  file.py\n</name>\n<code>\n  code\n</code>",
  },
];

function FormatOption({ value, title, description }) {
  return (
    <Radio
      value={value}
      className={({ isFocusVisible, isSelected, isPressed }) => `
      h-40 w-40 text-sm group relative flex flex-col cursor-default rounded-lg p-2 shadow-lg outline-none bg-clip-padding border border-solid
      ${isFocusVisible ? "outline-2 outline-blue-600 outline-offset-1" : ""}
      ${
        isSelected
          ? "bg-blue-600 border-white/30 text-white"
          : "border-transparent"
      }
      ${isPressed && !isSelected ? "bg-blue-50" : ""}
      ${!isSelected && !isPressed ? "bg-white" : ""}
    `}
    >
      <div className="text-xl text-center font-semibold text-gray-900 group-selected:text-white">
        {title}
      </div>
      <div className="text-xs whitespace-pre w-full not-sr-only">
        <code>{description}</code>
      </div>
    </Radio>
  );
}

function SettingsSwitch({ label, isSelected, onChange }) {
  return (
    <Switch
      isSelected={isSelected}
      onChange={onChange}
      className="group flex gap-2 items-center text-black font-semibold text-lg"
    >
      {label}
      <div className="flex h-[26px] w-[44px] shrink-0 cursor-default rounded-full shadow-inner bg-clip-padding border border-solid border-white/30 p-[3px] box-border transition duration-200 ease-in-out bg-slate-400 group-pressed:bg-slate-500 group-selected:bg-green-500 group-selected:group-pressed:bg-green-600 outline-none group-focus-visible:outline-blue-500 outline-2">
        <span className="h-[18px] w-[18px] transform rounded-full bg-white shadow transition duration-200 ease-in-out translate-x-0 group-selected:translate-x-[100%]" />
      </div>
    </Switch>
  );
}

interface TextFile {
  name: string;
  content: string;
}

export default function Home() {
  let [files, setFiles] = useState<TextFile[]>([]);
  let [output, setOutput] = useState("");
  let [selectedOption, setSelectedOption] = useState("markdown");
  let [autoCopy, setAutoCopy] = useState(true);
  let [replaceOnDrop, setReplaceOnDrop] = useState(false);

  useEffect(() => {
    console.log(files);
  }, [files]);

  const handleDrop = async (e: DropEvent) => {
    const newFiles: TextFile[] = [];

    const processEntry = async (entry: FileDropItem | DirectoryDropItem) => {
      if (entry.kind === "file") {
        const file = entry as FileDropItem;
        const content = await file.getText();
        newFiles.push({ name: file.name, content });
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
        newFiles.push({ name: "untitled.txt", content });
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
      newFiles.push({ name: file.name, content });
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

    setFiles((prevFiles) =>
      replaceOnDrop ? newFiles : [...prevFiles, ...newFiles]
    );
  };

  return (
    <main className="h-screen">
      <DropZone
        aria-label="Drop files here or click to select files."
        className="flex flex-col justify-center items-center gap-10 h-full"
        onDrop={handleDrop}
      >
        {({ isDropTarget }) => (
          <div className="p-2 sm:p-8 rounded-lg flex flex-col justify-center">
            <RadioGroup
              className="flex gap-2"
              aria-label="Options"
              value={selectedOption}
              onChange={(selectedOption) => setSelectedOption(selectedOption)}
            >
              {options.map((option) => (
                <FormatOption
                  key={option.key}
                  value={option.key}
                  title={option.title}
                  description={option.description}
                />
              ))}
            </RadioGroup>
            <div className="flex items-center justify-center p-16">
              <Text className="font-semibold text-xl inline mx-1" slot="label">
                Drop files
              </Text>
              <span className="mx-1">or</span>
              <FileTrigger allowsMultiple onSelect={handleSelect}>
                <Button className="bg-slate-700 mx-1 text-white px-2 py-1 inline-flex justify-center rounded-md border border-solid border-transparent font-semibold font-[inherit] text-xl transition-colors cursor-default outline-none focus-visible:ring-2 ring-blue-500 ring-offset-2">
                  Select
                </Button>
              </FileTrigger>
            </div>
            <div className="m-auto">
              <SettingsSwitch
                label="Auto-copy"
                isSelected={autoCopy}
                onChange={setAutoCopy}
              />
            </div>
          </div>
        )}
      </DropZone>
    </main>
  );
}
