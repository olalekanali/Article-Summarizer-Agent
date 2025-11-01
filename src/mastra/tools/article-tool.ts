import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import axios from 'axios';
import * as cheerio from 'cheerio';

export const articleTool = createTool({
  id: 'articleTool',
  description: 'Fetch and extract readable text from an article URL or summarize provided text directly.',
  inputSchema: z.object({
    urlOrText: z.string().describe('An article URL or plain text content'),
  }),
  outputSchema: z.object({
    content: z.string(),
  }),
  execute: async ({ context }) => {
    const input = context.urlOrText.trim();

    if (input.startsWith('http')) {
      try {
        const { data } = await axios.get(input);
        const $ = cheerio.load(data);
        const text = $('p').text().replace(/\s+/g, ' ').trim();
        return { content: text.slice(0, 8000) }; // limit text size
      } catch (err) {
        throw new Error(`Failed to fetch or parse the article at ${input}`);
      }
    }

    // If it's raw text
    return { content: input };
  },
});
