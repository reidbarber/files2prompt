import { TextFile } from "@/hooks/useFileProcessor";

const escapeXml = (unsafe: string): string => {
  if (typeof unsafe !== "string") {
    return String(unsafe);
  }
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
};

export const formatMarkdown = (
  files: TextFile[],
  selectedOption: string
): string => {
  if (!files || !Array.isArray(files)) {
    throw new Error("Invalid files parameter: expected array");
  }

  switch (selectedOption) {
    case "markdown1":
      return files
        .map(({ name, content }) =>
          name ? `## ${name}\n\n\`\`\`\n${content}\n\`\`\`` : content
        )
        .join("\n\n");
    case "markdown2":
      return files
        .map(({ name, content }) =>
          name ? `## ${name}\n\n${content}` : content
        )
        .join("\n\n");
    default:
      return "";
  }
};

export const formatXML = (
  files: TextFile[],
  selectedOption: string
): string => {
  if (!files || !Array.isArray(files)) {
    throw new Error("Invalid files parameter: expected array");
  }

  switch (selectedOption) {
    case "xml1":
      return `${files
        .map(({ name, content }) =>
          name
            ? `<file name="${escapeXml(name)}">\n${escapeXml(content)}\n</file>`
            : escapeXml(content)
        )
        .join("\n")}\n`;
    case "xml2":
      return `<files>\n${files
        .map(({ name, content }) =>
          name
            ? `<file>\n  <n>${escapeXml(name)}</n>\n  <content>${escapeXml(
                content
              )}</content>\n</file>`
            : `<file>\n  <content>${escapeXml(content)}</content>\n</file>`
        )
        .join("\n")}\n</files>`;
    default:
      return "";
  }
};
