import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

export const getTextFromPDF = async (file: File) => {
  const arrayBuffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({
    data: arrayBuffer,
  }).promise;
  let text = "";
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    // TODO: Detect if PDF is image-based. If so, use Tesseract.js to extract text
    const textContent = await page.getTextContent();
    text += textContent.items.map((item) => ("str" in item ? item.str : ""));
    text += "\n\n";
  }
  return text;
};
