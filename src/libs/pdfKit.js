import PDFDocument from "pdfkit";
import axios from "axios";
import PDFTable from "voilab-pdf-table";
import fitColumn from "voilab-pdf-table/plugins/fitcolumn.js";
import bwipjs from "bwip-js";
import stream from "stream";

async function createNewPage(doc, data, PrincipioActivo, logoSanferBuffer) {
  return new Promise(async (resolve, reject) => {
    doc.addPage();

    const centerX = (doc.page.width - 100) / 2;

    doc.image(logoSanferBuffer, centerX, 50, { width: 100 });

    const imagenSubProducto = async () => {
      try {
        const response = await axios.get(
          "https://sanferconecta.xyz" + data.Imagen_de_producto.url,
          { responseType: "arraybuffer" }
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching image:", error);
        throw error;
      }
    };

    const imagenSubProductoBuffer = await imagenSubProducto();

    doc.image(imagenSubProductoBuffer, 180, 100, { height: 250 });

    doc.font("Helvetica").fontSize(16);
    doc
      .fillColor("#f32d36")
      .moveDown(15)
      .text(PrincipioActivo, { align: "center" });

    doc.font("Helvetica-Bold").fontSize(18);
    doc.fillColor("#f32d36").moveDown(1).text(data.Nombre, { align: "center" });

    doc.font("Helvetica-Bold").fontSize(30);
    doc
      .fillColor("#222428")
      .text("____________________________", { align: "center" });

    // Create a new PDFTable instance
    const table = new PDFTable(doc, {
      bottomMargin: 30,
      margin: { bottom: 20 },
    });

    // Define columns
    table.addColumns([
      { id: "description", header: "", width: 40 },
      { id: "value", header: "", width: 360 },
    ]);

    doc.font("Helvetica").fontSize(12);
    doc.fillColor("#222428");
    // Add table data
    table.addPlugin(new fitColumn({ column: "description" }));

    const tableData = [
      {
        description: "Denominación genérica:",
        value: !data.PrincipioActivo ? "N/A" : data.PrincipioActivo,
      },
      {
        description: "________________",
        value: "_____________________________________________________",
      },
      {
        description: "Acción terapéutica:",
        value: !data.Descripcion ? "N/A" : data.Descripcion.normalize("NFKC"),
      },
      {
        description: "________________",
        value: "_____________________________________________________",
      },
      {
        description: "Concentración:",
        value: !data.Concentracion ? "N/A" : data.Concentracion,
      },
      {
        description: "________________",
        value: "_____________________________________________________",
      },
      {
        description: "Conenido:",
        value: !data.Contenido ? "N/A" : data.Contenido,
      },
      {
        description: "________________",
        value: "_____________________________________________________",
      },
      {
        description: "Tipo de producto:",
        value: !data.Tipo_de_producto
          ? "N/A"
          : data.Tipo_de_producto.replace(/_/g, " "),
      },
      {
        description: "________________",
        value: "_____________________________________________________",
      },
      {
        description: "Unidad de negocio:",
        value: !data.lineaNegocio ? "N/A" : data.lineaNegocio,
      },
      {
        description: "________________",
        value: "_____________________________________________________",
      },
      {
        description: "Registro Sanitario:",
        value: !data.Registro_sanitario ? "N/A" : data.Registro_sanitario,
      },
      {
        description: "________________",
        value: "_____________________________________________________",
      },
      {
        description: "EAN:",
        value: !data.SKU ? "N/A" : data.SKU,
      },
      {
        description: "________________",
        value: "_____________________________________________________",
      },
      {
        description: "Laboratorio:",
        value: !data.Laboratorio ? "N/A" : data.Laboratorio,
      },
    ];

    table.addBody(tableData);

    // Generate barcode
    if (data.SKU) {
      // try {
      //   const png = await bwipjs.toBuffer({
      //     bcid: "ean13",
      //     text: data.SKU,
      //     scale: 3,
      //     height: 10,
      //     includetext: true,
      //     textxalign: "center",
      //   });
      try {
        const png = await bwipjs.toBuffer({
          bcid: "code128", // Use code128 instead of ean13
          text: data.SKU,
          scale: 3,
          height: 10,
          includetext: true,
          textxalign: "center",
        });

        const pageWidth = doc.page.width;
        const barcodeWidth = 125;
        const barcodeX = (pageWidth - barcodeWidth) / 2;

        const pageHeight = doc.page.height;
        const barcodeHeight = 125;
        const barcodeY = pageHeight - barcodeHeight;

        doc.image(png, barcodeX, barcodeY, {
          fit: [barcodeWidth, barcodeHeight],
        });

        resolve(); // Resolve the promise when barcode generation is complete
      } catch (err) {
        console.log(err);
        reject(err); // Reject the promise if an error occurs
      }
    } else {
      resolve(); // Resolve the promise if there's no SKU
    }
  });
}

export async function createPdf(data) {
  return new Promise(async (resolve, reject) => {
    const chunks = []; // Define chunks here

    const writableStream = new stream.Writable({
      write(chunk, encoding, next) {
        chunks.push(chunk);
        next();
      },
    });

    // const stream = blobStream(); // Create blob stream

    const doc = new PDFDocument({ autoFirstPage: false });

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

    const imagenProducto = async () => {
      try {
        const response = await axios.get(
          "https://sanferconecta.xyz" + data.Imagen_de_producto[0].url,
          { responseType: "arraybuffer" }
        );
        return response.data;
      } catch (error) {
        console.error("Error fetching image:", error);
        throw error;
      }
    };

    const imagenProductoBuffer = await imagenProducto();

    doc.addPage();
    const centerX = (doc.page.width - 100) / 2;

    doc.image(logoSanferBuffer, centerX, 50, { width: 100 });

    doc.image(imagenProductoBuffer, 180, 100, { height: 250 });

    doc.font("Helvetica").fontSize(16);
    doc
      .fillColor("#f32d36")
      .moveDown(15)
      .text(data.PrincipioActivo, { align: "center" });

    doc.font("Helvetica").fontSize(12);
    doc
      .fillColor("#222428")
      .moveDown(1)
      .text(data.Descripcion, { align: "center" });

    doc.font("Helvetica-Bold").fontSize(18);
    doc.fillColor("#f32d36").moveDown(1).text(data.Nombre, { align: "center" });

    doc.font("Helvetica-Bold").fontSize(30);
    doc
      .fillColor("#222428")
      .text("____________________________", { align: "center" });

    // Create a new PDFTable instance
    const table = new PDFTable(doc, {
      bottomMargin: 30,
      margin: { bottom: 20 },
    });

    // Define columns
    table.addColumns([
      { id: "description", header: "", width: 40 },
      { id: "value", header: "", width: 360 },
    ]);

    doc.font("Helvetica").fontSize(12);
    doc.fillColor("#222428");
    // Add table data
    table.addPlugin(new fitColumn({ column: "description" }));

    const tableData = [
      {
        description: "Denominación genérica:",
        value: !data.PrincipioActivo ? "N/A" : data.PrincipioActivo,
      },
      {
        description: "________________",
        value: "_____________________________________________________",
      },
      {
        description: "Acción terapéutica:",
        value: !data.Descripcion ? "N/A" : data.Descripcion.normalize("NFKC"),
      },
      {
        description: "________________",
        value: "_____________________________________________________",
      },
      {
        description: "Concentración:",
        value: !data.Concentracion ? "N/A" : data.Concentracion,
      },
      {
        description: "________________",
        value: "_____________________________________________________",
      },
      {
        description: "Conenido:",
        value: !data.Contenido ? "N/A" : data.Contenido,
      },
      {
        description: "________________",
        value: "_____________________________________________________",
      },
      {
        description: "Tipo de producto:",
        value: !data.Tipo_de_producto
          ? "N/A"
          : data.Tipo_de_producto.replace(/_/g, " "),
      },
      {
        description: "________________",
        value: "_____________________________________________________",
      },
      {
        description: "Unidad de negocio:",
        value: !data.lineaNegocio ? "N/A" : data.lineaNegocio,
      },
      {
        description: "________________",
        value: "_____________________________________________________",
      },
      {
        description: "Registro Sanitario:",
        value: !data.Registro_sanitario ? "N/A" : data.Registro_sanitario,
      },
      {
        description: "________________",
        value: "_____________________________________________________",
      },
      {
        description: "EAN:",
        value: !data.SKU ? "N/A" : data.SKU,
      },
      {
        description: "________________",
        value: "_____________________________________________________",
      },
      {
        description: "Laboratorio:",
        value: !data.Laboratorio ? "N/A" : data.Laboratorio,
      },
    ];

    table.addBody(tableData);

    // Generate barcode
    if (data.SKU) {
      try {
        const png = await bwipjs.toBuffer({
          bcid: "ean13",
          text: data.SKU,
          scale: 3,
          height: 10,
          includetext: true,
          textxalign: "center",
        });

        const pageWidth = doc.page.width;
        const barcodeWidth = 125;
        const barcodeX = (pageWidth - barcodeWidth) / 2;

        const pageHeight = doc.page.height;
        const barcodeHeight = 125;
        const barcodeY = pageHeight - barcodeHeight;

        doc.image(png, barcodeX, barcodeY, {
          fit: [barcodeWidth, barcodeHeight],
        });
      } catch (err) {
        console.log(err);
      }
    }

    if (data.Presentacion && data.Presentacion.length > 0) {
      for (const presentacionItem of data.Presentacion) {
        await createNewPage(
          doc,
          presentacionItem,
          data.PrincipioActivo,
          logoSanferBuffer
        );
      }
    }

    // Move doc.end() to this position, after handling all asynchronous operations
    doc.pipe(writableStream);

    doc.end();

    writableStream.on("finish", async () => {
      const pdfBytes = Buffer.concat(chunks); // Use chunks here
      resolve(pdfBytes);
    });

    writableStream.on("error", (error) => {
      reject(error);
    });
  });
}
