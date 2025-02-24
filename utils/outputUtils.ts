import { TextFile } from "@/app/page";

export const formatMarkdown = (files: TextFile[], selectedOption: string) => {
  switch (selectedOption) {
    case "markdown1":
      return files
        .map(({ name, content }) => `## ${name}\n\n\`\`\`\n${content}\n\`\`\``)
        .join("\n\n");
    case "markdown2":
      return files
        .map(({ name, content }) => `## ${name}\n\n${content}`)
        .join("\n\n");
    default:
      return "";
  }
};

export const formatXML = (files: TextFile[], selectedOption: string) => {
  switch (selectedOption) {
    case "xml1":
      return `${files
        .map(
          ({ name, content }) =>
            `<file name="${name}">\n${content}\n</file>`
        )
        .join("\n")}\n`;
    case "xml2":
      return `${files
        .map(
          ({ name, content }) =>
            `<file>\n  <name>${name}</name>\n  <content>${content}</content>\n</file>`
        )
        .join("\n")}\n</files>`;
    default:
      return "";
  }
};
