import PDFDocument from "pdfkit";
import axios from "axios";
import PDFTable from "voilab-pdf-table";
import fitColumn from "voilab-pdf-table/plugins/fitcolumn.js";

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

  // Calculate the center position for the image
  const centerX = (doc.page.width - 100) / 2; // Assuming the image width is 100

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

  // doc.addPage();

  doc.font("Helvetica-Bold").fontSize(18);
  doc.fillColor("#f32d36").moveDown(1).text(data.Nombre, { align: "center" });

  doc.font("Helvetica-Bold").fontSize(30);
  doc.fillColor("#222428").text("____________________________", { align: "center" });

  // Create a new PDFTable instance
  // const table = new PDFTable(doc, { bottomMargin: 30 });
  const table = new PDFTable(doc, { bottomMargin: 30, margin: { bottom: 20 } });

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
      value: (!data.PrincipioActivo) ? "N/A" : data.PrincipioActivo,
    },
    {
      description: "________________",
      value: "_____________________________________________________",
    },
    {
      description: "Acción terapéutica:",
      value: (!data.Descripcion) ? "N/A" : data.Descripcion.normalize('NFKC'),
    },
    {
      description: "________________",
      value: "_____________________________________________________",
    },
    {
      description: "Concentración:",
      value: (!data.Concentracion) ? "N/A" : data.Concentracion,
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
      value: (!data.Tipo_de_producto) ? "N/A" : data.Tipo_de_producto.replace(/_/g, " "),
    },
    {
      description: "________________",
      value: "_____________________________________________________",
    },
    {
      description: "Unidad de negocio:",
      value: (!data.lineaNegocio) ? "N/A" : data.lineaNegocio,
    },
    {
      description: "________________",
      value: "_____________________________________________________",
    },
    {
      description: "Registro Sanitario:",
      value: (!data.Registro_sanitario) ? "N/A" : data.Registro_sanitario,
    },
    {
      description: "________________",
      value: "_____________________________________________________",
    },
    {
      description: "EAN:",
      value: (!data.SKU) ? "N/A" : data.SKU,
    },
    {
      description: "________________",
      value: "_____________________________________________________",
    },
    {
      description: "Laboratorio:",
      value: (!data.Laboratorio) ? "N/A" : data.Laboratorio,
    },
  ];

  table.addBody(tableData);

  

  doc.end();
}
