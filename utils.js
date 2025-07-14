import Jimp, { read, loadFont } from 'jimp';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MEME_TEMPLATES } from './data';


export async function writeTextOnImage(imageUrl, texts, positions, fontSize = '16') {
  try {
    const fontKey = `FONT_SANS_${fontSize}_BLACK`;
    const fontPath = Jimp[fontKey];

    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const tempFileName = `./temp-${uuidv4()}.jpg`;
    await fs.writeFile(tempFileName, response.data);

    const [image, font] = await Promise.all([
      Jimp.read(tempFileName),
      Jimp.loadFont(fontPath),
    ]);

    for (let i = 0; i < texts.length; i++) {
      const { x, y } = positions[i];
      const text = texts[i];
      image.print(font, x, y, text);
    }

    const outputFile = `./output-${uuidv4()}.jpg`;
    await image.writeAsync(outputFile);

    const uploadedUrl = await uploadToHackClubCDN(`file://${path.resolve(outputFile)}`);

    await fs.unlink(tempFileName);
    await fs.unlink(outputFile);

    return uploadedUrl;
  } catch (err) {
    console.error('Error editing or uploading image:', err);
    throw err;
  }
}

const CDN_ENDPOINT = 'https://cdn.hackclub.com/api/v3/new';


export const uploadToHackClubCDN = async (url) => {
  if (!url || typeof url !== 'string') {
    throw new Error('You must provide a valid image URL.');
  }


  try {
    const response = await axios.post(CDN_ENDPOINT, [url], {
      headers: {
        Authorization: `Bearer beans`,
        'Content-Type': 'application/json'
      }
    });

    return response.data[0]; 
  } catch (err) {
    console.error('CDN Upload failed:', err.response?.data || err.message);
    throw err;
  }
};

export function listMemes(limit) {
  return MEME_TEMPLATES;  
}

