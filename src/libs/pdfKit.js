import PDFDocument from "pdfkit";
import axios from "axios";

export async function createPdf(data, dataCallback, endCallback) {
  const doc = new PDFDocument();

  doc.on("data", dataCallback);

  doc.on("end", endCallback);

  const logoSanfer = async () => {
    try {
      const response = await axios.get(
        "https://sanferconecta.com/assets/images/logo-1-2.png",
        { responseType: "arraybuffer" }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching image:", error);
      throw error;
    }
  };

  const logoSanferBuffer = await logoSanfer();

  // Calculate the center position for the image
  const centerX = (doc.page.width - 100) / 2; // Assuming the image width is 100
  const centerY = 50; // Adjust this value based on your layout

  doc.image(logoSanferBuffer, centerX, centerY, { width: 100 });

  doc.fontSize(16).text(data.Nombre, { align: "center" });

  // Add key-value pairs to the PDF
  doc.moveDown();
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      const value = data[key];
      if (typeof value === "object" && value !== null) {
        // Handle nested objects (like Presentacion array)
        doc.text(`${key}:`);
        doc.moveDown();
        for (const subKey in value) {
          if (value.hasOwnProperty(subKey)) {
            const subValue = value[subKey];
            doc.text(`${subKey}: ${subValue}`);
            doc.moveDown();
          }
        }
      } else {
        // Handle regular key-value pairs
        doc.text(`${key}: ${value}`);
        doc.moveDown();
      }
    }
  }

  doc.end();
}
