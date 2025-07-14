import sharp from 'sharp';
import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import downloadsFolder from 'downloads-folder';
import { MEME_TEMPLATES } from './data.js';

export async function writeTextOnImage(imageUrl, texts, positions, fontSize = 32) {
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageBuffer = response.data;

    const image = sharp(imageBuffer);
    const metadata = await image.metadata();

    const compositeElements = texts.map((text, i) => {
      const { x, y } = positions[i];
      const svg = `
        <svg width="${metadata.width}" height="${metadata.height}">
          <style>
            .title { fill: #000; font-size: ${fontSize}px; font-family: Arial, sans-serif; }
          </style>
          <text x="${x}" y="${y}" class="title">${text}</text>
        </svg>
      `;
      return { input: Buffer.from(svg), top: 0, left: 0 };
    });

    const downloadsPath = downloadsFolder();
    if (!downloadsPath) {
      throw new Error('Could not find the downloads folder.');
    }
    const outputFileName = `output-${uuidv4()}.png`;
    const outputPath = path.join(downloadsPath, outputFileName);

    await image.composite(compositeElements).toFile(outputPath);

    return outputPath;
  } catch (err) {
    console.error('Error editing or saving image:', err);
    throw err;
  }
}

export function listMemes(limit) {
  return  {
    content: [{ type: "Meme Templates", text: JSON.stringify(MEME_TEMPLATES) }]
  };;
}