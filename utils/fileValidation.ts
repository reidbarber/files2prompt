import { ACCEPTED_TEXT_TYPES, ACCEPTED_FILE_EXTENSIONS } from "./fileConstants";

export const isExcel = (file: { type: string }) =>
  file.type === "application/vnd.ms-excel" ||
  file.type ===
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const isZip = (file: { type: string }) =>
  file.type === "application/zip";

export const isTextFile = (file: { type: string; name: string }): boolean => {
  // Check MIME type
  if (ACCEPTED_TEXT_TYPES.some((type) => file.type.startsWith(type))) {
    return true;
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  if (ACCEPTED_FILE_EXTENSIONS.some((ext) => fileName.endsWith(ext))) {
    return true;
  }

  // Special case for files without extensions that are likely text
  if (!file.type && !fileName.includes(".")) {
    return true; // Files like "README", "LICENSE", etc.
  }

  return false;
};

export const isSupportedFileType = (file: {
  type: string;
  name: string;
}): boolean => {
  return isTextFile(file) || isExcel(file) || isZip(file);
};

export const validateFileSize = (
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

export const shouldIgnoreFile = (filename: string): boolean => {
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
