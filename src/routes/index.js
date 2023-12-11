import { Router } from 'express';
import { createPdf } from '../libs/pdfKit.js';
import { fetchDataFromStrapi } from '../services/strapi.js';

const router = Router();

router.get('/invoice', async (req, res) => {
    try {
        // Fetch data from the Strapi API
        const data = await fetchDataFromStrapi(58); // Implement this function based on your Strapi API
        console.log(data.Nombre.replace(/ /g, '-'));
        // Set the headers for PDF response
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=' + data.Nombre.replace(/ /g, '-') + '.pdf');

        // Pass the response stream to createPdf function
        createPdf(data, (pdfData) => res.write(pdfData), () => res.end());

    } catch (error) {
        console.error('Error fetching data from Strapi:', error);
        res.status(500).send('Internal Server Error');
    }
});

export default router;