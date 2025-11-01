import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const summarizeText = createStep({
  id: 'summarize-text',
  description: 'Summarizes article text into concise, well-structured output.',
  inputSchema: z.object({
    text: z.string().describe('Raw text or extracted article content'),
    style: z.enum(['concise', 'detailed', 'action']).default('concise'),
  }),
  outputSchema: z.object({
    summary: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const agent = mastra?.getAgent('articleAgent');
    if (!agent) throw new Error('Article agent not found');

    const { text, style } = inputData;
    const prompt = `
      Summarize this text in ${style} style.
      Include:
      - Summary
      - Key Points
      ${style === 'action' ? '- Action Items' : ''}
      Text:
      ${text}
    `;

    const response = await agent.stream([{ role: 'user', content: prompt }]);
    let summary = '';

    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      summary += chunk;
    }

    return { summary };
  },
});

export const articleWorkflow = createWorkflow({
  id: 'article-workflow',
  inputSchema: z.object({
    urlOrText: z.string().describe('Article URL or raw text'),
    style: z.enum(['concise', 'detailed', 'action']).default('concise'),
  }),
  outputSchema: z.object({
    summary: z.string(),
  }),
})
  .then(async ({ inputData }) => ({
    text: inputData.urlOrText,
    style: inputData.style,
  }))
  .then(summarizeText);

articleWorkflow.commit();
