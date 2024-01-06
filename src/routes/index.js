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
  // const medicinsArray = [
  //   { id: 3 },
  //   { id: 105 },
  //   { id: 18 },
  //   { id: 25 },
  //   { id: 66 },
  // ];
  try {
    // Fetch all data from Strapi concurrently
    const allData = await Promise.all(
      medicinsArray.map((medicin) => fetchDataFromStrapi(medicin.id))
    );
      // console.log(allData[0].ipp);
    // Set the headers for PDF response
    res.setHeader("Content-Type", "application/pdf; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=combined.pdf");

    const pdfBuffers = [];

    for (const data of allData) {
      // Create a separate PDF for each medicine
      const pdfBytes = await createPdf(data);
      pdfBuffers.push(pdfBytes);
    }

    const combinedPdfBytes = await combinePdfs(pdfBuffers);

    // Send the combined PDF to the client
    res.end(combinedPdfBytes);
    // res.status(200).send('Received POST request');
  } catch (error) {
    console.error("Error fetching data from Strapi:", error);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
