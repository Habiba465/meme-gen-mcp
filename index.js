#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { MEME_TEMPLATES } from "./data.js";
import { listMemes, writeTextOnImage } from "./utils.js";

const server = new McpServer({
    name: "mcp-meme-generator",
    version: "1.0.0"
});



const memeGeneratorSchema = {
    memeName: z.string().describe("The meme name you will use, supported are: " + MEME_TEMPLATES.map(meme => meme.name).join(', ')), 
  texts: z.array(z.string().min(1, 'Text cannot be empty')).nonempty({ message: 'texts cannot be empty' }),
  positions: z.array(z.object({
      x: z.number(),
      y: z.number(),
    })).nonempty({ message: 'positions cannot be empty' }),

  fontSize: z.string().regex(/^\d+$/, { message: 'fontSize must be a numeric string' }).optional()
}

const listMemesSchema = {
  limit: z.number().optional().describe("The maximum number of memes to return.")
}

function getMemeUrlByName(memeName) {
    const meme = MEME_TEMPLATES.find(meme => meme.name === memeName);
    if (!meme) {
        throw new Error(`Meme "${memeName}" not found.`);
    }
    return meme.imageUrl;
}


async function GenerateMeme(memeName, texts, positions, fontSize) {
    const memeImage = getMemeUrlByName(memeName);
    

   const memeUrl = await writeTextOnImage(memeImage, texts, positions, fontSize);

   return memeUrl;

}

server.registerTool("listMemes", {
    title: "List memes",
    description: "List all supported memes with resolution and description",
    inputSchema: listMemesSchema, 
}, listMemes);

server.registerTool("GenerateMeme", {
  title: "Create a meme",
  description: "Create a meme by entering the name of it and the texts followed by the positions of the text",
  inputSchema: memeGeneratorSchema,
}, GenerateMeme);


const transport = new StdioServerTransport();
await server.connect(transport);
