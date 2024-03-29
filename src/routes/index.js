import { createPdf } from "../libs/pdfKit.js";
import { PDFDocument } from "pdf-lib";
import { fetchDataFromStrapi } from "../services/strapi.js";
import express from "express";
import bodyParser from "body-parser";

const router = express.Router();

router.use(bodyParser.json());

async function combinePdfs(pdfBuffers) {
  const combinedPdf = await PDFDocument.create();
  
  for (const pdfBytes of pdfBuffers) {
    const pdf = await PDFDocument.load(pdfBytes);
    const pages = await combinedPdf.copyPages(pdf, pdf.getPageIndices());
    for (const page of pages) {
      combinedPdf.addPage(page);
    }
  }
  
  return await combinedPdf.save();
}

router.post("/pdf", async (req, res) => {
  const medicinsArray = req.body;
  try {
    const allData = await Promise.all(
      medicinsArray.map((medicin) => fetchDataFromStrapi(medicin.id))
    );
    // res.setHeader("Content-Type", "application/pdf; charset=utf-8");
    // res.setHeader("Content-Disposition", "attachment; filename=combined.pdf");

    const pdfBuffers = [];

    for (const data of allData) {
      // Create a separate PDF for each medicine
      const pdfBytes = await createPdf(data);
      pdfBuffers.push(pdfBytes);
    }

    const combinedPdfBytes = await combinePdfs(pdfBuffers);

    // res.end(combinedPdfBytes);
    console.log(combinedPdfBytes);
    console.log('-------------------');
    console.log(Buffer.from(combinedPdfBytes));
    res.end(Buffer.from(combinedPdfBytes));
    
  } catch (error) {
    console.error("Error fetching data from Strapi:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/pdf-blob", async (req, res) => {
  const medicinsArray = req.body;
  try {
    const allData = await Promise.all(
      medicinsArray.map((medicin) => fetchDataFromStrapi(medicin.id))
    );
    // res.setHeader("Content-Type", "application/pdf; charset=utf-8");
    // res.setHeader("Content-Disposition", "attachment; filename=combined.pdf");

    const pdfBuffers = [];

    for (const data of allData) {
      // Create a separate PDF for each medicine
      const pdfBytes = await createPdf(data);
      pdfBuffers.push(pdfBytes);
    }

    const combinedPdfBytes = await combinePdfs(pdfBuffers);

    res.end('Blob');
    res.end(Buffer.from(combinedPdfBytes));
    
  } catch (error) {
    console.error("Error fetching data from Strapi:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/pdf-64", async (req, res) => {
  const medicinsArray = req.body;
  try {
    const allData = await Promise.all(
      medicinsArray.map((medicin) => fetchDataFromStrapi(medicin.id))
    );
    // res.setHeader("Content-Type", "application/pdf; charset=utf-8");
    // res.setHeader("Content-Disposition", "attachment; filename=combined.pdf");

    const pdfBuffers = [];

    for (const data of allData) {
      // Create a separate PDF for each medicine
      const pdfBytes = await createPdf(data);
      pdfBuffers.push(pdfBytes);
    }

    const combinedPdfBytes = await combinePdfs(pdfBuffers);

    console.log(combinedPdfBytes);
    const base64String = Buffer.from(combinedPdfBytes).toString("base64");
    res.end(base64String);
    
  } catch (error) {
    console.error("Error fetching data from Strapi:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;