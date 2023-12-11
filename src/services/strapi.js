import axios from 'axios';

async function fetchDataFromStrapi(idMedicine) {
  try {
    const response = await axios.get('https://sanferconecta.xyz/medicamentos/'+idMedicine); 
    return response.data;
  } catch (error) {
    console.error('Error fetching data from Strapi:', error);
    throw error;
  }
}

export { fetchDataFromStrapi };
