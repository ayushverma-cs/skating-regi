import PDFParser from "pdf2json";

export const extractDOB = (filePath) => {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (err) => {
      reject(err.parserError);
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      let text = "";

      pdfData.Pages.forEach((page) => {
        page.Texts.forEach((item) => {
          item.R.forEach((r) => {
            text += decodeURIComponent(r.T) + " ";
          });
        });
      });

      // Match: Date of Birth : 28-08-2018
      const dobRegex = /Date\s*of\s*Birth\s*:?\s*(\d{2}-\d{2}-\d{4})/i;

      const match = text.match(dobRegex);

      if (!match) {
        return reject(new Error("Date of Birth not found."));
      }

      resolve(match[1]);
    });

    pdfParser.loadPDF(filePath);
  });
};