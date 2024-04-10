import { pdfjs } from "react-pdf";
import Tesseract from "tesseract.js";

pdfjs.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

export const getTextFromImage = async (file: File) => {
  // TODO: support multiple languages
  // TODO: provide loading state
  const result = await Tesseract.recognize(file, "eng");
  return result.data.text;
};
