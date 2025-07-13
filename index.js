#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({
    name: "mcp-weather-server",
    version: "1.0.0"
});



const inputSchema = {
    city: z.string().describe("The city to get the weather for. Needs to be a big city.")
};


async function getWeather({ city }) {
    const response = await fetch(`https://goweather.xyz/weather/${city.toLowerCase()}`);
    if (!response.ok) {
      throw new Error(`Couldn't get weather for ${city}`);
    }
  
    const data = await response.json();
  
    return {
      content: [{ type: "text", text: JSON.stringify(data) }]
    };
}

server.registerTool("weather", {
    title: "Weather Tool",
    description: "Get the weather for a city",
    inputSchema,
}, getWeather);


const transport = new StdioServerTransport();
await server.connect(transport);

