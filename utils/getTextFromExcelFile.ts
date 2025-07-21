export const getTextFromExcelFile = async (file: File) => {
  const { read, utils } = await import("xlsx");

  const arrayBuffer = await file.arrayBuffer();
  const wb = read(arrayBuffer);
  let text = "";
  wb.SheetNames.forEach((name, i) => {
    const ws = wb.Sheets[name];
    text += `Sheet #${i + 1} (${name})\n`;
    text += utils.sheet_to_csv(ws) + "\n\n";
  });
  return text;
};
