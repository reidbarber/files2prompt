const MAX_EXCEL_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const getTextFromExcelFile = async (file: File): Promise<string> => {
  if (file.size > MAX_EXCEL_FILE_SIZE) {
    throw new Error(
      `Excel file size (${Math.round(
        file.size / 1024 / 1024
      )}MB) exceeds maximum allowed size of ${Math.round(
        MAX_EXCEL_FILE_SIZE / 1024 / 1024
      )}MB`
    );
  }

  // Validate file type
  if (!file.type.includes("excel") && !file.type.includes("spreadsheet")) {
    throw new Error(`Invalid Excel file type: ${file.type}`);
  }

  try {
    const { read, utils } = await import("xlsx");

    const arrayBuffer = await file.arrayBuffer();
    const wb = read(arrayBuffer);

    // Validate workbook was parsed successfully
    if (!wb || !wb.SheetNames || wb.SheetNames.length === 0) {
      throw new Error("Unable to parse Excel file or file contains no sheets");
    }

    let text = "";
    wb.SheetNames.forEach((name, i) => {
      const ws = wb.Sheets[name];
      if (ws) {
        text += `Sheet #${i + 1} (${name})\n`;
        try {
          text += utils.sheet_to_csv(ws) + "\n\n";
        } catch (sheetError) {
          text += `Error processing sheet: ${
            sheetError instanceof Error ? sheetError.message : "Unknown error"
          }\n\n`;
        }
      }
    });

    return text;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to process Excel file: ${error.message}`);
    }
    throw new Error("Failed to process Excel file: Unknown error occurred");
  }
};
